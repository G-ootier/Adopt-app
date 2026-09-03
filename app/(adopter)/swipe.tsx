import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SlidersHorizontal } from 'lucide-react-native';
import { AdoptLogo } from '../../components/AdoptLogo';
import BottomSheet from '@gorhom/bottom-sheet';
import { SwipeDeck } from '../../components/SwipeDeck';
import { ActionFabs } from '../../components/ActionFabs';
import { AdCard } from '../../components/AdCard';
import { MatchOverlay } from '../../components/MatchOverlay';
import { FilterSheet, type FilterValues } from '../../components/FilterSheet';
import { IconButton } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { fetchDeck } from '../../lib/deck';
import {
  loadFilters,
  saveFilters,
  syncFiltersToSupabase,
  loadFiltersFromSupabase,
  DEFAULT_FILTERS,
} from '../../lib/filters';
import { getCurrentLocation } from '../../lib/location';
import type { Pet, SwipeDirection } from '../../lib/types';

// Fallback when location permission is denied
const FALLBACK_LAT = 48.8566;
const FALLBACK_LNG = 2.3522;

export default function SwipeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const sheetRef = useRef<BottomSheet>(null);

  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSwiped, setLastSwiped] = useState<{
    pet: Pet;
    direction: SwipeDirection;
    swipeId?: string;
  } | null>(null);
  const lastSwipedRef = useRef(lastSwiped);
  lastSwipedRef.current = lastSwiped;
  const [matchPet, setMatchPet] = useState<Pet | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [deckError, setDeckError] = useState<string | null>(null);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showAd, setShowAd] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<Omit<typeof DEFAULT_FILTERS, never>>(
    () => ({ ...DEFAULT_FILTERS }),
  );
  const [filtersReady, setFiltersReady] = useState(false);

  // ── Load saved filters + location on mount ────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // 1. Load persisted filters quickly
      let saved = user?.id
        ? await loadFiltersFromSupabase(user.id)
        : null;
      if (!saved) {
        saved = await loadFilters();
      }

      // Start loading deck with saved/default filters immediately
      if (!cancelled) {
        setFilters(saved!);
        setFiltersReady(true);
      }

      // 2. Try device location in background, update if found
      const loc = await getCurrentLocation();
      if (cancelled) return;
      if (loc) {
        setFilters((prev) => ({ ...prev, latitude: loc.latitude, longitude: loc.longitude }));
      } else {
        setLocationDenied(true);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // ── Fetch deck when filters are ready or change ───────────
  const loadDeck = useCallback(async () => {
    setIsLoading(true);
    const { pets: data, error } = await fetchDeck({
      adopterId: user?.id,
      latitude: filters.latitude,
      longitude: filters.longitude,
      radiusKm: filters.radius_km,
      species: filters.species,
      sizes: filters.sizes,
      ageMin: filters.age_min,
      ageMax: filters.age_max,
    });
    setDeckError(error);

    // Prefetch first two card images so they don't flash grey
    const prefetchUrls = data
      .slice(0, 2)
      .map((p) => p.photos?.[0])
      .filter(Boolean) as string[];
    await Promise.all(prefetchUrls.map((url) => Image.prefetch(url)));

    setPets(data);
    setIsLoading(false);
  }, [user?.id, filters]);

  useEffect(() => {
    if (filtersReady) {
      loadDeck();
    }
  }, [filtersReady, loadDeck]);

  // ── Record swipe to Supabase ──────────────────────────────
  const recordSwipe = useCallback(
    async (petId: string, direction: SwipeDirection): Promise<string | undefined> => {
      if (!user) return undefined;
      const { data, error } = await supabase
        .from('swipes')
        .insert({
          adopter_id: user.id,
          pet_id: petId,
          direction,
        })
        .select('id')
        .single();

      if (error) {
        console.warn('recordSwipe error:', error.message);
        return undefined;
      }
      return data?.id;
    },
    [user],
  );

  // ── Swipe handlers ────────────────────────────────────────
  const handleSwipeRight = useCallback(
    async (pet: Pet) => {
      setPets((prev) => prev.filter((p) => p.id !== pet.id));
      let swipeId: string | undefined;
      if (user) {
        swipeId = await recordSwipe(pet.id, 'right');
      }
      setLastSwiped({ pet, direction: 'right', swipeId });
      setMatchPet(pet);

      const newCount = swipeCount + 1;
      setSwipeCount(newCount);
      if (newCount > 0 && newCount % 10 === 0) setShowAd(true);
    },
    [user, recordSwipe, swipeCount],
  );

  const handleSwipeLeft = useCallback(
    async (pet: Pet) => {
      setPets((prev) => prev.filter((p) => p.id !== pet.id));
      let swipeId: string | undefined;
      if (user) {
        swipeId = await recordSwipe(pet.id, 'left');
      }
      setLastSwiped({ pet, direction: 'left', swipeId });

      const newCount = swipeCount + 1;
      setSwipeCount(newCount);
      if (newCount > 0 && newCount % 10 === 0) setShowAd(true);
    },
    [user, recordSwipe, swipeCount],
  );

  // ── Rewind ────────────────────────────────────────────────
  const handleRewind = useCallback(async () => {
    const last = lastSwipedRef.current;
    if (!last) return;
    const { pet, swipeId } = last;
    setPets((prev) => [pet, ...prev]);

    if (swipeId) {
      const { error } = await supabase
        .from('swipes')
        .delete()
        .eq('id', swipeId);
      if (error) {
        console.warn('rewind delete error:', error.message);
      }
    }
    setLastSwiped(null);
  }, []);

  // ── FAB actions ───────────────────────────────────────────
  const handleFabLater = useCallback(() => {
    if (pets.length === 0) return;
    handleSwipeLeft(pets[0]);
  }, [pets, handleSwipeLeft]);

  const handleFabCrush = useCallback(() => {
    if (pets.length === 0) return;
    handleSwipeRight(pets[0]);
  }, [pets, handleSwipeRight]);

  // ── Expand radius ─────────────────────────────────────────
  // Open the filter sheet so the user can set the search radius directly,
  // rather than silently bumping it (which looks like nothing happened when
  // there are still no animals in range).
  const handleExpandRadius = useCallback(() => {
    sheetRef.current?.snapToIndex(0);
  }, []);

  // ── Match overlay ─────────────────────────────────────────
  const handleSayHi = useCallback(() => {
    const pet = matchPet;
    setMatchPet(null);
    if (pet) router.push(`/(adopter)/pet/${pet.id}`);
  }, [matchPet, router]);

  const handleKeepSwiping = useCallback(() => {
    setMatchPet(null);
  }, []);

  const handleCreateAccount = useCallback(() => {
    setMatchPet(null);
    router.push('/(auth)/sign-up');
  }, [router]);

  // ── Filter sheet ──────────────────────────────────────────
  const handleFilter = useCallback(() => {
    sheetRef.current?.snapToIndex(0);
  }, []);

  const handleApplyFilters = useCallback(
    async (values: FilterValues) => {
      sheetRef.current?.close();

      const updated = {
        ...filters,
        species: values.species,
        sizes: values.sizes,
        age_min: values.age_min,
        age_max: values.age_max,
        radius_km: values.radius_km,
      };

      setFilters(updated);

      // Persist
      await saveFilters(updated);
      if (user?.id) {
        syncFiltersToSupabase(updated, user.id);
      }
    },
    [filters, user?.id],
  );

  const handleInfo = useCallback(() => {
    if (pets.length === 0) return;
    router.push(`/(adopter)/pet/${pets[0].id}`);
  }, [pets, router]);

  const handleTapDetail = useCallback(
    (pet: Pet) => {
      router.push(`/(adopter)/pet/${pet.id}`);
    },
    [router],
  );

  // ── Filter values for the sheet ───────────────────────────
  const filterValues: FilterValues = {
    species: filters.species,
    sizes: filters.sizes,
    age_min: filters.age_min,
    age_max: filters.age_max,
    radius_km: filters.radius_km,
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#FFF6E9',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#FF7A4F" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#FFF6E9' }}>
      {/* Top bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 60,
          paddingBottom: 8,
        }}
      >
        {/* Logo */}
        <AdoptLogo height={32} />

        {/* Filter button */}
        <IconButton onPress={handleFilter} size={40}>
          <SlidersHorizontal size={20} color="#1F1B2E" />
        </IconButton>
      </View>

      {/* Location denied notice */}
      {locationDenied && (
        <View
          style={{
            backgroundColor: '#FFF0E0',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            marginHorizontal: 16,
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontFamily: 'DMSans-Medium',
              fontSize: 12,
              color: '#9490A3',
              textAlign: 'center',
            }}
          >
            Location unavailable — showing animals near Paris
          </Text>
        </View>
      )}

      {/* Deck error notice — distinguishes a broken query from an empty deck */}
      {deckError && (
        <View
          style={{
            backgroundColor: '#F9E0E0',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            marginHorizontal: 16,
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontFamily: 'DMSans-Medium',
              fontSize: 12,
              color: '#C84D4D',
              textAlign: 'center',
            }}
          >
            Couldn’t load animals: {deckError}
          </Text>
        </View>
      )}

      {/* Ad card overlay */}
      {showAd && (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AdCard onDismiss={() => setShowAd(false)} />
        </View>
      )}

      {/* Swipe deck */}
      {!showAd && (
        <SwipeDeck
          pets={pets}
          onSwipeRight={handleSwipeRight}
          onSwipeLeft={handleSwipeLeft}
          onExpandRadius={handleExpandRadius}
          onTapDetail={handleTapDetail}
        />
      )}

      {/* Action FABs */}
      {pets.length > 0 && (
        <View style={{ paddingBottom: 112 }}>
          <ActionFabs
            onRewind={handleRewind}
            onLater={handleFabLater}
            onCrush={handleFabCrush}
            onInfo={handleInfo}
          />
        </View>
      )}

      {/* Match overlay */}
      {matchPet && (
        <MatchOverlay
          pet={matchPet}
          isAuthenticated={!!user}
          onSayHi={handleSayHi}
          onKeepSwiping={handleKeepSwiping}
          onCreateAccount={handleCreateAccount}
        />
      )}

      {/* Filter bottom sheet */}
      <FilterSheet
        ref={sheetRef}
        initialValues={filterValues}
        onApply={handleApplyFilters}
      />
    </GestureHandlerRootView>
  );
}

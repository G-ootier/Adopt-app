import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Linking,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
} from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';
import { formatAge, formatDistance } from '../../../lib/deck';
import type { Pet } from '../../../lib/types';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { width: screenWidth } = useWindowDimensions();

  const [pet, setPet] = useState<Pet | null>(null);
  const [shelterPets, setShelterPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [crushed, setCrushed] = useState(false);

  useEffect(() => {
    async function load() {
      setCrushed(false);
      setPhotoIndex(0);

      const { data } = await supabase
        .from('pets')
        .select('*, shelters(*)')
        .eq('id', id)
        .single();

      if (data) {
        const s = data.shelters as any;
        const mapped: Pet = {
          ...data,
          shelter_name: s?.shelter_name,
          shelter_address: s?.address,
          shelter_latitude: s?.latitude,
          shelter_longitude: s?.longitude,
          shelter_is_verified: s?.is_verified,
          shelter_phone: s?.phone,
          shelter_email: s?.email,
          shelter_website: s?.website,
        };
        setPet(mapped);

        const { data: others } = await supabase
          .from('pets')
          .select('*')
          .eq('shelter_id', data.shelter_id)
          .eq('status', 'available')
          .neq('id', id)
          .limit(6);

        if (others) setShelterPets(others as Pet[]);
      }
      if (user) {
        const { data: swipeData } = await supabase
          .from('swipes')
          .select('id')
          .eq('adopter_id', user.id)
          .eq('pet_id', id)
          .eq('direction', 'right')
          .maybeSingle();
        if (swipeData) setCrushed(true);
      }

      setLoading(false);
    }

    load();
  }, [id, user]);

  const handleToggleCrush = useCallback(async () => {
    if (!user) {
      router.push('/(auth)/sign-up');
      return;
    }

    if (crushed) {
      const { error } = await supabase
        .from('swipes')
        .delete()
        .eq('adopter_id', user.id)
        .eq('pet_id', id);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setCrushed(false);
      }
    } else {
      const { error } = await supabase
        .from('swipes')
        .upsert(
          { adopter_id: user.id, pet_id: id, direction: 'right' },
          { onConflict: 'adopter_id,pet_id' },
        );

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setCrushed(true);
      }
    }
  }, [user, id, crushed, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF6E9', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#FF7A4F" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF6E9', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'DMSans', fontSize: 16, color: '#9490A3' }}>Pet not found</Text>
      </View>
    );
  }

  const photos = pet.photos?.length > 0
    ? pet.photos
    : ['https://placehold.co/400x540/FFF6E9/FF7A4F?text=No+Photo'];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF6E9' }} showsVerticalScrollIndicator={false}>
      {/* Photo carousel */}
      <View style={{ width: screenWidth, height: screenWidth * 1.2, position: 'relative' }}>
        <Image
          source={{ uri: photos[photoIndex] }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={['rgba(31,27,46,0.3)', 'transparent', 'rgba(255,246,233,1)']}
          locations={[0, 0.5, 1]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />

        {/* Photo nav */}
        {photos.length > 1 && (
          <>
            <Pressable
              onPress={() => setPhotoIndex((i) => Math.max(0, i - 1))}
              style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: screenWidth * 0.3, justifyContent: 'center', paddingLeft: 12 }}
            >
              {photoIndex > 0 && <ChevronLeft size={28} color="rgba(255,255,255,0.8)" />}
            </Pressable>
            <Pressable
              onPress={() => setPhotoIndex((i) => Math.min(photos.length - 1, i + 1))}
              style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: screenWidth * 0.3, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 12 }}
            >
              {photoIndex < photos.length - 1 && <ChevronRight size={28} color="rgba(255,255,255,0.8)" />}
            </Pressable>
            {/* Dots */}
            <View style={{ position: 'absolute', top: 60, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
              {photos.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === photoIndex ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: i === photoIndex ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                  }}
                />
              ))}
            </View>
          </>
        )}

        {/* Crush overlay — subtle orange tint fading down with label */}
        {crushed && (
          <>
            <LinearGradient
              colors={['rgba(255,122,79,0.45)', 'rgba(255,122,79,0)']}
              locations={[0, 0.5]}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              pointerEvents="none"
            />
            <View
              style={{
                position: 'absolute',
                top: 60,
                right: 16,
              }}
              pointerEvents="none"
            >
              <Text
                style={{
                  fontFamily: 'Sora-Bold',
                  fontSize: 14,
                  color: '#FFFFFF',
                  letterSpacing: 1,
                  textShadowColor: 'rgba(0,0,0,0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 4,
                }}
              >
                Crush
              </Text>
            </View>
          </>
        )}

        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          style={{
            position: 'absolute',
            top: 54,
            left: 16,
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.9)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={20} color="#1F1B2E" />
        </Pressable>
      </View>

      {/* Info */}
      <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
        {/* Name + age */}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
          <Text style={{ fontFamily: 'Sora-ExtraBold', fontSize: 32, color: '#1F1B2E', letterSpacing: -0.64 }}>
            {pet.name}
          </Text>
          <Text style={{ fontFamily: 'Sora-SemiBold', fontSize: 18, color: '#9490A3' }}>
            {formatAge(pet.age_months)}
          </Text>
        </View>

        {/* Traits */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {pet.breed && <TraitChip label={pet.breed} />}
          {pet.gender && <TraitChip label={pet.gender === 'male' ? 'Male' : 'Female'} />}
          {pet.size && <TraitChip label={pet.size.charAt(0).toUpperCase() + pet.size.slice(1)} />}
          {pet.species && <TraitChip label={pet.species === 'dog' ? 'Dog' : 'Cat'} />}
        </View>

        {/* Description */}
        {pet.description && (
          <Text style={{ fontFamily: 'DMSans', fontSize: 15, color: '#4D4458', lineHeight: 22, marginTop: 16 }}>
            {pet.description}
          </Text>
        )}

        {/* Crush / Remove crush CTA */}
        <Pressable
          onPress={handleToggleCrush}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginTop: 20,
            paddingVertical: 16,
            borderRadius: 16,
            backgroundColor: crushed ? '#FFFFFF' : '#FF7A4F',
            borderWidth: crushed ? 1.5 : 0,
            borderColor: '#E5E3EA',
            shadowColor: crushed ? '#1F1B2E' : '#FF7A4F',
            shadowOffset: { width: 0, height: crushed ? 2 : 6 },
            shadowOpacity: crushed ? 0.08 : 0.3,
            shadowRadius: crushed ? 8 : 16,
            elevation: crushed ? 2 : 6,
          }}
        >
          <Heart
            size={22}
            color={crushed ? '#9490A3' : '#FFFFFF'}
            fill={crushed ? 'none' : 'none'}
          />
          <Text
            style={{
              fontFamily: 'Sora-Bold',
              fontSize: 17,
              color: crushed ? '#9490A3' : '#FFFFFF',
              letterSpacing: 0.5,
            }}
          >
            {crushed ? 'Remove crush' : 'Crush!'}
          </Text>
        </Pressable>

        {/* Shelter section */}
        <View style={{ marginTop: 28, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontFamily: 'Sora-Bold', fontSize: 16, color: '#1F1B2E', flex: 1 }}>
              {pet.shelter_name}
            </Text>
            {pet.shelter_is_verified && <CheckCircle size={18} color="#7EB08A" fill="#7EB08A" />}
          </View>

          {pet.shelter_address && (
            <Pressable
              onPress={() => {
                const addr = encodeURIComponent(pet.shelter_address!);
                Linking.openURL(`https://maps.apple.com/?daddr=${addr}`);
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}
            >
              <MapPin size={14} color="#FF7A4F" />
              <Text style={{ fontFamily: 'DMSans', fontSize: 13, color: '#4D4458', flex: 1, textDecorationLine: 'underline' }}>
                {pet.shelter_address}
              </Text>
            </Pressable>
          )}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
            {pet.shelter_phone && (
              <Pressable
                onPress={() => Linking.openURL(`tel:${pet.shelter_phone}`)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F5F3F8', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}
              >
                <Phone size={14} color="#FF7A4F" />
                <Text style={{ fontFamily: 'DMSans-Medium', fontSize: 12, color: '#1F1B2E' }}>Call</Text>
              </Pressable>
            )}
            {pet.shelter_email && (
              <Pressable
                onPress={() => Linking.openURL(`mailto:${pet.shelter_email}`)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F5F3F8', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}
              >
                <Mail size={14} color="#FF7A4F" />
                <Text style={{ fontFamily: 'DMSans-Medium', fontSize: 12, color: '#1F1B2E' }}>Email</Text>
              </Pressable>
            )}
            {pet.shelter_website && (
              <Pressable
                onPress={() => Linking.openURL(pet.shelter_website!.startsWith('http') ? pet.shelter_website! : `https://${pet.shelter_website}`)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F5F3F8', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}
              >
                <Globe size={14} color="#FF7A4F" />
                <Text style={{ fontFamily: 'DMSans-Medium', fontSize: 12, color: '#1F1B2E' }}>Website</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Other pets from this shelter */}
        {shelterPets.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontFamily: 'Sora-Bold', fontSize: 16, color: '#1F1B2E', marginBottom: 12 }}>
              More from {pet.shelter_name}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {shelterPets.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => router.push(`/(adopter)/pet/${p.id}`)}
                    style={{ width: 120 }}
                  >
                    <Image
                      source={{ uri: p.photos?.[0] ?? 'https://placehold.co/120x120/FFF6E9/FF7A4F?text=🐾' }}
                      style={{ width: 120, height: 120, borderRadius: 12 }}
                      contentFit="cover"
                    />
                    <Text style={{ fontFamily: 'DMSans-SemiBold', fontSize: 13, color: '#1F1B2E', marginTop: 6 }}>
                      {p.name}
                    </Text>
                    <Text style={{ fontFamily: 'DMSans', fontSize: 11, color: '#9490A3' }}>
                      {formatAge(p.age_months)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <View style={{ height: 120 }} />
      </View>
    </ScrollView>
  );
}

function TraitChip({ label }: { label: string }) {
  return (
    <View style={{ backgroundColor: '#F5F3F8', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
      <Text style={{ fontFamily: 'DMSans-SemiBold', fontSize: 12, color: '#4D4458' }}>{label}</Text>
    </View>
  );
}

import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Chip } from './ui/Chip';
import { Button } from './ui/Button';
import type { Species, PetSize } from '../lib/types';
import { DEFAULT_FILTERS } from '../lib/filters';

/* ── Age preset helpers ───────────────────────────────────── */
type AgePreset = 'baby' | 'young' | 'adult' | 'senior';

const AGE_PRESETS: { key: AgePreset; label: string; min: number; max: number }[] = [
  { key: 'baby', label: 'Baby (< 1 yr)', min: 0, max: 11 },
  { key: 'young', label: 'Young (1-3 yr)', min: 12, max: 36 },
  { key: 'adult', label: 'Adult (3-7 yr)', min: 37, max: 84 },
  { key: 'senior', label: 'Senior (7+ yr)', min: 85, max: 999 },
];

function ageToPresets(min: number | null, max: number | null): AgePreset[] {
  if (min == null && max == null) return [];
  const selected: AgePreset[] = [];
  for (const p of AGE_PRESETS) {
    // A preset is selected if its range overlaps with [min, max]
    const lo = min ?? 0;
    const hi = max ?? 999;
    if (p.min <= hi && p.max >= lo) {
      selected.push(p.key);
    }
  }
  return selected;
}

function presetsToAge(presets: AgePreset[]): { min: number | null; max: number | null } {
  if (presets.length === 0) return { min: null, max: null };
  let lo = Infinity;
  let hi = -Infinity;
  for (const key of presets) {
    const p = AGE_PRESETS.find((a) => a.key === key)!;
    if (p.min < lo) lo = p.min;
    if (p.max > hi) hi = p.max;
  }
  return {
    min: lo === 0 ? null : lo,
    max: hi >= 999 ? null : hi,
  };
}

/* ── Distance presets ─────────────────────────────────────── */
const DISTANCE_PRESETS = [
  { km: 50, label: '50 km' },
  { km: 200, label: '200 km' },
  { km: 500, label: '500 km' },
  { km: 1000, label: '1000 km' },
  { km: 5000, label: 'All of Europe' },
] as const;

/* ── Types ────────────────────────────────────────────────── */
export interface FilterValues {
  species: Species | null;
  sizes: PetSize[] | null;
  age_min: number | null;
  age_max: number | null;
  radius_km: number;
}

interface FilterSheetProps {
  initialValues: FilterValues;
  onApply: (values: FilterValues) => void;
}

/* ── Section label ────────────────────────────────────────── */
function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontFamily: 'DMSans-SemiBold',
        fontSize: 11,
        color: '#9490A3',
        textTransform: 'uppercase',
        letterSpacing: 1.1,
        marginBottom: 10,
      }}
    >
      {children}
    </Text>
  );
}

/* ── Component ────────────────────────────────────────────── */
export const FilterSheet = forwardRef<BottomSheet, FilterSheetProps>(
  function FilterSheet({ initialValues, onApply }, ref) {
    const snapPoints = useMemo(() => ['75%'], []);

    // Local state mirrors initialValues until user hits Apply
    const [species, setSpecies] = useState<Species | null>(initialValues.species);
    const [sizes, setSizes] = useState<PetSize[]>(initialValues.sizes ?? []);
    const [agePresets, setAgePresets] = useState<AgePreset[]>(
      ageToPresets(initialValues.age_min, initialValues.age_max),
    );
    const [radiusKm, setRadiusKm] = useState(initialValues.radius_km);

    // Sync local state when sheet opens with new initialValues
    const handleSheetChange = useCallback(
      (index: number) => {
        if (index >= 0) {
          setSpecies(initialValues.species);
          setSizes(initialValues.sizes ?? []);
          setAgePresets(ageToPresets(initialValues.age_min, initialValues.age_max));
          setRadiusKm(initialValues.radius_km);
        }
      },
      [initialValues],
    );

    /* ── Handlers ────────────────────────────────────────── */
    const handleSpecies = useCallback((s: Species | null) => {
      setSpecies(s);
      // Clear sizes when switching to cats-only
      if (s === 'cat') setSizes([]);
    }, []);

    const toggleSize = useCallback((size: PetSize) => {
      setSizes((prev) =>
        prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
      );
    }, []);

    const toggleAge = useCallback((key: AgePreset) => {
      setAgePresets((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
      );
    }, []);

    const handleApply = useCallback(() => {
      const { min, max } = presetsToAge(agePresets);
      onApply({
        species,
        sizes: sizes.length > 0 ? sizes : null,
        age_min: min,
        age_max: max,
        radius_km: radiusKm,
      });
    }, [species, sizes, agePresets, radiusKm, onApply]);

    const handleReset = useCallback(() => {
      setSpecies(DEFAULT_FILTERS.species);
      setSizes([]);
      setAgePresets([]);
      setRadiusKm(DEFAULT_FILTERS.radius_km);
    }, []);

    const showSizes = species === 'dog' || species === null;

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={handleSheetChange}
        backgroundStyle={{ backgroundColor: '#FFF6E9', borderRadius: 24 }}
        handleIndicatorStyle={{
          backgroundColor: '#D2CFDB',
          width: 36,
          height: 4,
          borderRadius: 2,
        }}
      >
        <BottomSheetScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 40,
          }}
        >
          {/* Title */}
          <Text
            style={{
              fontFamily: 'Sora-Bold',
              fontSize: 22,
              color: '#1F1B2E',
              marginBottom: 24,
              letterSpacing: -0.44,
            }}
          >
            Filters
          </Text>

          {/* ── Animal type ───────────────────────────────── */}
          <SectionLabel>Animal type</SectionLabel>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            <Chip active={species === 'dog'} onPress={() => handleSpecies('dog')}>
              Dogs
            </Chip>
            <Chip active={species === 'cat'} onPress={() => handleSpecies('cat')}>
              Cats
            </Chip>
            <Chip active={species === null} onPress={() => handleSpecies(null)}>
              Both
            </Chip>
          </View>

          {/* ── Size (dogs or both) ──────────────────────── */}
          {showSizes && (
            <>
              <SectionLabel>Size</SectionLabel>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                {(['small', 'medium', 'large'] as PetSize[]).map((s) => (
                  <Chip key={s} active={sizes.includes(s)} onPress={() => toggleSize(s)}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Chip>
                ))}
              </View>
            </>
          )}

          {/* ── Age range ────────────────────────────────── */}
          <SectionLabel>Age range</SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {AGE_PRESETS.map((p) => (
              <Chip
                key={p.key}
                active={agePresets.includes(p.key)}
                onPress={() => toggleAge(p.key)}
              >
                {p.label}
              </Chip>
            ))}
          </View>

          {/* ── Distance ─────────────────────────────────── */}
          <SectionLabel>Distance</SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {DISTANCE_PRESETS.map((p) => (
              <Chip
                key={p.km}
                active={radiusKm === p.km}
                onPress={() => setRadiusKm(p.km)}
              >
                {p.label}
              </Chip>
            ))}
          </View>

          {/* ── Apply ────────────────────────────────────── */}
          <Button onPress={handleApply} size="lg" style={{ marginBottom: 12 }}>
            Show animals
          </Button>

          {/* ── Reset ────────────────────────────────────── */}
          <Button variant="ghost" onPress={handleReset} size="sm">
            Reset filters
          </Button>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

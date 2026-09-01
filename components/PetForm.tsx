import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { Camera, X } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Button, Chip, Input } from './ui';
import type { Pet, Species, PetGender, PetSize, PetStatus } from '../lib/types';

interface PetFormValues {
  name: string;
  species: Species;
  breed: string;
  size: PetSize;
  age_years: string;
  age_months: string;
  gender: PetGender;
  description: string;
  photos: string[]; // URLs or local URIs
  status: PetStatus;
}

interface PetFormProps {
  initialValues?: Partial<Pet>;
  onSubmit: (data: {
    name: string;
    species: Species;
    breed: string | null;
    size: PetSize | null;
    age_months: number;
    gender: PetGender;
    description: string | null;
    photos: string[];
    status: PetStatus;
  }) => Promise<void>;
  isLoading?: boolean;
}

const OVERLINE = {
  fontFamily: 'DMSans-SemiBold' as const,
  fontSize: 11,
  color: '#9490A3',
  letterSpacing: 1,
  textTransform: 'uppercase' as const,
  marginBottom: 8,
  marginTop: 24,
};

export function PetForm({ initialValues, onSubmit, isLoading }: PetFormProps) {
  const { user } = useAuth();

  const [values, setValues] = useState<PetFormValues>({
    name: initialValues?.name ?? '',
    species: initialValues?.species ?? 'dog',
    breed: initialValues?.breed ?? '',
    size: initialValues?.size ?? 'medium',
    age_years: initialValues?.age_months ? Math.floor(initialValues.age_months / 12).toString() : '',
    age_months: initialValues?.age_months ? (initialValues.age_months % 12).toString() : '',
    gender: initialValues?.gender ?? 'male',
    description: initialValues?.description ?? '',
    photos: initialValues?.photos ?? [],
    status: initialValues?.status ?? 'available',
  });

  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof PetFormValues>(key: K, val: PetFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  }

  async function pickImage() {
    if (values.photos.length >= 5) {
      Alert.alert('Limit reached', 'You can add up to 5 photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5 - values.photos.length,
    });

    if (result.canceled || !result.assets.length) return;

    setUploading(true);
    try {
      const shelterId = user?.id ?? 'unknown';
      const timestamp = Date.now();
      const uploaded: string[] = [];

      for (let i = 0; i < result.assets.length; i++) {
        const asset = result.assets[i];
        const base64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: 'base64',
        });
        const path = `${shelterId}/${timestamp}-${i}.jpg`;
        const { error } = await supabase.storage
          .from('pet-photos')
          .upload(path, decode(base64), {
            contentType: 'image/jpeg',
          });
        if (error) throw error;
        const { data: urlData } = supabase.storage
          .from('pet-photos')
          .getPublicUrl(path);
        uploaded.push(urlData.publicUrl);
      }

      update('photos', [...values.photos, ...uploaded].slice(0, 5));
    } catch (err: any) {
      Alert.alert('Upload failed', err.message ?? 'Could not upload photo.');
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(index: number) {
    update(
      'photos',
      values.photos.filter((_, i) => i !== index),
    );
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!values.name.trim()) e.name = 'Name is required';
    const yrs = values.age_years.trim() ? Number(values.age_years) : 0;
    const mos = values.age_months.trim() ? Number(values.age_months) : 0;
    if ((isNaN(yrs) || yrs < 0) || (isNaN(mos) || mos < 0) || (yrs === 0 && mos === 0))
      e.age_months = 'Enter a valid age';
    if (values.photos.length === 0) e.photos = 'Add at least one photo';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    await onSubmit({
      name: values.name.trim(),
      species: values.species,
      breed: values.breed.trim() || null,
      size: values.species === 'dog' ? values.size : null,
      age_months: (parseInt(values.age_years || '0', 10) * 12) + parseInt(values.age_months || '0', 10),
      gender: values.gender,
      description: values.description.trim() || null,
      photos: values.photos,
      status: values.status,
    });
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      automaticallyAdjustKeyboardInsets
    >
      {/* Photos */}
      <Text style={OVERLINE}>Photos</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {values.photos.map((uri, i) => (
          <View key={uri + i} style={{ position: 'relative' }}>
            <Image
              source={{ uri }}
              style={{ width: 88, height: 88, borderRadius: 12 }}
            />
            <Pressable
              onPress={() => removePhoto(i)}
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#C84D4D',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={14} color="#FFFFFF" />
            </Pressable>
          </View>
        ))}
        {values.photos.length < 5 && (
          <Pressable
            onPress={pickImage}
            style={{
              width: 88,
              height: 88,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: errors.photos ? '#C84D4D' : '#E5E3EA',
              borderStyle: 'dashed',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FFFFFF',
            }}
          >
            {uploading ? (
              <ActivityIndicator color="#FF7A4F" />
            ) : (
              <Camera size={24} color="#9490A3" />
            )}
          </Pressable>
        )}
      </View>
      {errors.photos ? (
        <Text style={{ fontFamily: 'DMSans', fontSize: 13, color: '#C84D4D', marginTop: 4 }}>
          {errors.photos}
        </Text>
      ) : null}

      {/* Name */}
      <Text style={OVERLINE}>Name</Text>
      <Input
        value={values.name}
        onChangeText={(v) => update('name', v)}
        placeholder="Pet's name"
        error={errors.name}
      />

      {/* Species */}
      <Text style={OVERLINE}>Species</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chip active={values.species === 'dog'} onPress={() => update('species', 'dog')}>
          Dog
        </Chip>
        <Chip active={values.species === 'cat'} onPress={() => update('species', 'cat')}>
          Cat
        </Chip>
      </View>

      {/* Breed */}
      <Text style={OVERLINE}>Breed</Text>
      <Input
        value={values.breed}
        onChangeText={(v) => update('breed', v)}
        placeholder="e.g. Labrador, Siamese"
      />

      {/* Size (dogs only) */}
      {values.species === 'dog' && (
        <>
          <Text style={OVERLINE}>Size</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['small', 'medium', 'large'] as PetSize[]).map((s) => (
              <Chip key={s} active={values.size === s} onPress={() => update('size', s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Chip>
            ))}
          </View>
        </>
      )}

      {/* Age */}
      <Text style={OVERLINE}>Age</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Input
            value={values.age_years}
            onChangeText={(v) => update('age_years', v)}
            placeholder="0"
            keyboardType="numeric"
            error={errors.age_months ? ' ' : undefined}
          />
          <Text style={{ fontFamily: 'DMSans', fontSize: 12, color: '#9490A3', marginTop: 4 }}>
            Years
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Input
            value={values.age_months}
            onChangeText={(v) => update('age_months', v)}
            placeholder="0"
            keyboardType="numeric"
            error={errors.age_months ? ' ' : undefined}
          />
          <Text style={{ fontFamily: 'DMSans', fontSize: 12, color: '#9490A3', marginTop: 4 }}>
            Months
          </Text>
        </View>
      </View>
      {errors.age_months && errors.age_months !== ' ' ? (
        <Text style={{ fontFamily: 'DMSans', fontSize: 13, color: '#C84D4D', marginTop: 4 }}>
          {errors.age_months}
        </Text>
      ) : null}

      {/* Gender */}
      <Text style={OVERLINE}>Gender</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chip active={values.gender === 'male'} onPress={() => update('gender', 'male')}>
          Male
        </Chip>
        <Chip active={values.gender === 'female'} onPress={() => update('gender', 'female')}>
          Female
        </Chip>
      </View>

      {/* Description */}
      <Text style={OVERLINE}>Description</Text>
      <TextInput
        value={values.description}
        onChangeText={(v) => update('description', v)}
        placeholder="Tell adopters about this pet..."
        placeholderTextColor="#A8A4B5"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={{
          height: 110,
          padding: 16,
          borderWidth: 1,
          borderColor: '#E5E3EA',
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          fontFamily: 'DMSans',
          fontSize: 15,
          color: '#1F1B2E',
        }}
      />

      {/* Status */}
      <Text style={OVERLINE}>Status</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['available', 'reserved', 'adopted'] as PetStatus[]).map((s) => (
          <Chip key={s} active={values.status === s} onPress={() => update('status', s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Chip>
        ))}
      </View>

      {/* Submit */}
      <View style={{ marginTop: 32 }}>
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          disabled={isLoading || uploading}
          style={{ width: '100%' }}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </View>
    </ScrollView>
  );
}

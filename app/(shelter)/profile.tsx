import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { CheckCircle, LogOut } from 'lucide-react-native';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function ShelterProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, shelter, signOut } = useAuth();

  const [shelterName, setShelterName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill form when shelter data is available
  useEffect(() => {
    if (shelter) {
      setShelterName(shelter.shelter_name ?? '');
      setDescription(shelter.description ?? '');
      setAddress(shelter.address ?? '');
      setPhone(shelter.phone ?? '');
      setEmail(shelter.email ?? '');
      setWebsite(shelter.website ?? '');
      setFacebook(shelter.social_links?.facebook ?? '');
      setInstagram(shelter.social_links?.instagram ?? '');
      setTwitter(shelter.social_links?.twitter ?? '');
    } else if (user) {
      // Pre-fill email from user account
      setEmail(user.email ?? '');
    }
  }, [shelter, user]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!shelterName.trim()) newErrors.shelterName = 'Shelter name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate() || !user) return;

    setSaving(true);

    try {
      // Geocode address if provided
      let latitude = shelter?.latitude ?? 0;
      let longitude = shelter?.longitude ?? 0;

      if (address.trim()) {
        try {
          const results = await Location.geocodeAsync(address.trim());
          if (results.length > 0) {
            latitude = results[0].latitude;
            longitude = results[0].longitude;
          }
        } catch {
          // Keep existing coords if geocoding fails
        }
      }

      const shelterData = {
        id: user.id,
        shelter_name: shelterName.trim(),
        description: description.trim() || null,
        address: address.trim(),
        latitude,
        longitude,
        phone: phone.trim() || null,
        email: email.trim(),
        website: website.trim() || null,
        social_links: {
          facebook: facebook.trim() || undefined,
          instagram: instagram.trim() || undefined,
          twitter: twitter.trim() || undefined,
        },
      };

      const { error } = await supabase
        .from('shelters')
        .upsert(shelterData, { onConflict: 'id' });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      Alert.alert('Success', 'Your profile has been saved.');
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFF6E9' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <Text
            style={{
              fontFamily: 'Sora-ExtraBold',
              fontSize: 32,
              color: '#1F1B2E',
            }}
          >
            My profile
          </Text>

          {shelter?.is_verified && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: '#EEF5F0',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
              }}
            >
              <CheckCircle size={14} color="#4A7560" />
              <Text
                style={{
                  fontFamily: 'DMSans-SemiBold',
                  fontSize: 12,
                  color: '#4A7560',
                }}
              >
                Verified
              </Text>
            </View>
          )}
        </View>

        {/* General section */}
        <SectionLabel>General</SectionLabel>
        <View style={{ gap: 16, marginBottom: 28 }}>
          <Input
            label="Shelter name"
            value={shelterName}
            onChangeText={setShelterName}
            placeholder="Your shelter name"
            error={errors.shelterName}
          />
          <View>
            <Text
              style={{
                fontFamily: 'DMSans-Medium',
                fontSize: 13,
                color: '#1F1B2E',
                marginBottom: 6,
              }}
            >
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Tell adopters about your shelter..."
              placeholderTextColor="#A8A4B5"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{
                minHeight: 100,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: '#E5E3EA',
                borderRadius: 12,
                backgroundColor: '#FFFFFF',
                fontFamily: 'DMSans',
                fontSize: 15,
                color: '#1F1B2E',
              }}
            />
          </View>
          <Input
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="123 Main Street, City, Country"
          />
        </View>

        {/* Contact section */}
        <SectionLabel>Contact</SectionLabel>
        <View style={{ gap: 16, marginBottom: 28 }}>
          <Input
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="+33 6 12 34 56 78"
            keyboardType="phone-pad"
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="contact@shelter.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <Input
            label="Website"
            value={website}
            onChangeText={setWebsite}
            placeholder="https://www.your-shelter.com"
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        {/* Social links section */}
        <SectionLabel>Social links</SectionLabel>
        <View style={{ gap: 16, marginBottom: 36 }}>
          <Input
            label="Facebook URL"
            value={facebook}
            onChangeText={setFacebook}
            placeholder="https://facebook.com/your-page"
            keyboardType="url"
            autoCapitalize="none"
          />
          <Input
            label="Instagram URL"
            value={instagram}
            onChangeText={setInstagram}
            placeholder="https://instagram.com/your-handle"
            keyboardType="url"
            autoCapitalize="none"
          />
          <Input
            label="Twitter URL"
            value={twitter}
            onChangeText={setTwitter}
            placeholder="https://twitter.com/your-handle"
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        {/* Save button */}
        <Button
          variant="primary"
          size="lg"
          onPress={handleSave}
          disabled={saving}
          style={{ width: '100%' }}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>

        {/* Log out button */}
        <Pressable
          onPress={handleLogout}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 32,
            paddingVertical: 12,
          }}
        >
          <LogOut size={18} color="#C84D4D" />
          <Text
            style={{
              fontFamily: 'DMSans-SemiBold',
              fontSize: 15,
              color: '#C84D4D',
            }}
          >
            Log out
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Section label component — overline style */
function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontFamily: 'DMSans-SemiBold',
        fontSize: 11,
        color: '#9490A3',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
      }}
    >
      {children}
    </Text>
  );
}

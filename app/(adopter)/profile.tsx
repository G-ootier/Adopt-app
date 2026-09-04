import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, HelpCircle, LogOut } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { loadFilters, DEFAULT_FILTERS } from '../../lib/filters';
import type { AdopterFilters } from '../../lib/types';

function formatMonth(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export default function AdopterProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [filters, setFilters] = useState<Omit<AdopterFilters, 'adopter_id'>>(
    () => ({ ...DEFAULT_FILTERS }),
  );

  useEffect(() => {
    loadFilters().then(setFilters);
  }, []);

  // Not logged in
  if (!user || !profile) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#FFF6E9',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#FFEBE4',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontFamily: 'Sora-Bold',
              fontSize: 26,
              color: '#FF7A4F',
            }}
          >
            ?
          </Text>
        </View>
        <Text
          style={{
            fontFamily: 'Sora-Bold',
            fontSize: 20,
            color: '#1F1B2E',
            textAlign: 'center',
          }}
        >
          Sign in to see your profile
        </Text>
        <Text
          style={{
            fontFamily: 'DMSans',
            fontSize: 14,
            color: '#9490A3',
            marginTop: 8,
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          Create an account or sign in to manage your preferences.
        </Text>
        <Button
          variant="primary"
          size="lg"
          onPress={() => router.push('/(auth)/sign-in')}
        >
          Sign in
        </Button>
      </View>
    );
  }

  const initial = (profile.display_name ?? 'A').charAt(0).toUpperCase();

  // Build filter display values
  const speciesLabel = filters.species
    ? filters.species === 'dog'
      ? 'Dogs'
      : 'Cats'
    : 'All animals';

  const ageLabel =
    filters.age_min || filters.age_max
      ? `${filters.age_min ?? 0} – ${filters.age_max ?? '∞'} months`
      : 'Any age';

  const distanceLabel = `${filters.radius_km} km`;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#FFF6E9' }}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 20,
        paddingBottom: 120,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header card */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: 24,
          alignItems: 'center',
          shadowColor: '#1F1B2E',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 3,
        }}
      >
        {/* Avatar */}
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#FFEBE4',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontFamily: 'Sora-Bold',
              fontSize: 26,
              color: '#FF7A4F',
            }}
          >
            {initial}
          </Text>
        </View>

        <Text
          style={{
            fontFamily: 'Sora-Bold',
            fontSize: 20,
            color: '#1F1B2E',
          }}
        >
          {profile.display_name}
        </Text>
        <Text
          style={{
            fontFamily: 'DMSans',
            fontSize: 13,
            color: '#9490A3',
            marginTop: 4,
          }}
        >
          Joined {formatMonth(profile.created_at)}
        </Text>
      </View>

      {/* Looking for section */}
      <Text
        style={{
          fontFamily: 'DMSans-SemiBold',
          fontSize: 11,
          color: '#9490A3',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginTop: 28,
          marginBottom: 10,
          marginLeft: 4,
        }}
      >
        Looking for
      </Text>
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          overflow: 'hidden',
          shadowColor: '#1F1B2E',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <FilterRow label="Animals" value={speciesLabel} />
        <View
          style={{ height: 1, backgroundColor: '#F5F3F0', marginLeft: 16 }}
        />
        <FilterRow label="Age" value={ageLabel} />
        <View
          style={{ height: 1, backgroundColor: '#F5F3F0', marginLeft: 16 }}
        />
        <FilterRow label="Distance" value={distanceLabel} />
      </View>

      {/* Settings section */}
      <Text
        style={{
          fontFamily: 'DMSans-SemiBold',
          fontSize: 11,
          color: '#9490A3',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginTop: 28,
          marginBottom: 10,
          marginLeft: 4,
        }}
      >
        Settings
      </Text>
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          overflow: 'hidden',
          shadowColor: '#1F1B2E',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <Pressable
          onPress={() => {
            Linking.openURL('mailto:support@getadopt.eu?subject=Help%20%26%20Support');
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            paddingHorizontal: 16,
          }}
        >
          <HelpCircle size={20} color="#1F1B2E" />
          <Text
            style={{
              fontFamily: 'DMSans-Medium',
              fontSize: 14,
              color: '#1F1B2E',
              flex: 1,
              marginLeft: 12,
            }}
          >
            Help and contact
          </Text>
          <ChevronRight size={18} color="#9490A3" />
        </Pressable>

        <View
          style={{ height: 1, backgroundColor: '#F5F3F0', marginLeft: 16 }}
        />

        <Pressable
          onPress={signOut}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            paddingHorizontal: 16,
          }}
        >
          <LogOut size={20} color="#E54D2E" />
          <Text
            style={{
              fontFamily: 'DMSans-Medium',
              fontSize: 14,
              color: '#E54D2E',
              flex: 1,
              marginLeft: 12,
            }}
          >
            Log out
          </Text>
        </Pressable>
      </View>

      {/* Footer */}
      <Text
        style={{
          fontFamily: 'DMSans',
          fontSize: 11,
          color: '#B0ACBB',
          textAlign: 'center',
          marginTop: 32,
        }}
      >
        Adopt Beta · getadopt.eu
      </Text>
    </ScrollView>
  );
}

function FilterRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
      }}
    >
      <Text
        style={{
          fontFamily: 'DMSans-Medium',
          fontSize: 14,
          color: '#1F1B2E',
          flex: 1,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: 'DMSans',
          fontSize: 13,
          color: '#9490A3',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

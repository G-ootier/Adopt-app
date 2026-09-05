import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Heart, PawPrint } from 'lucide-react-native';
import { fetchShelterInterest, type ShelterInterest } from '../../lib/interest';

const STATUS_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  available: { bg: '#EEF5F0', fg: '#4A7560', label: 'Available' },
  reserved: { bg: '#FBF0DA', fg: '#B98629', label: 'Reserved' },
  adopted: { bg: '#F9E0E0', fg: '#C84D4D', label: 'Adopted' },
};

export default function InterestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [rows, setRows] = useState<ShelterInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await fetchShelterInterest();
    setRows(data);
  }, []);

  // Refetch on focus (no polling) so counts are fresh when the shelter returns.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      load().finally(() => {
        if (active) setLoading(false);
      });
      return () => {
        active = false;
      };
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF6E9', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#FF7A4F" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF6E9' }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7A4F" />}
      >
        <Text style={{ fontFamily: 'Sora-Bold', fontSize: 26, color: '#1F1B2E' }}>Interest</Text>
        <Text style={{ fontFamily: 'DMSans', fontSize: 14, color: '#4D4458', marginTop: 4, marginBottom: 20 }}>
          Your animals, ranked by how many adopters crushed on them.
        </Text>

        {rows.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 64 }}>
            <PawPrint size={64} color="#FF9F73" strokeWidth={1.5} />
            <Text style={{ fontFamily: 'Sora-Bold', fontSize: 18, color: '#1F1B2E', marginTop: 20, textAlign: 'center' }}>
              No animals yet
            </Text>
            <Text style={{ fontFamily: 'DMSans', fontSize: 14, color: '#4D4458', marginTop: 6, textAlign: 'center', maxWidth: 260 }}>
              Add animals from the My animals tab and interest will show up here.
            </Text>
          </View>
        ) : (
          rows.map((row) => {
            const badge = STATUS_STYLE[row.status] ?? STATUS_STYLE.available;
            const photo = row.photos?.[0];
            return (
              <Pressable
                key={row.pet_id}
                onPress={() => router.push(`/(shelter)/edit-pet/${row.pet_id}`)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  padding: 12,
                  marginBottom: 12,
                  gap: 14,
                  shadowColor: '#1F1B2E',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.06,
                  shadowRadius: 14,
                }}
              >
                {photo ? (
                  <Image
                    source={{ uri: photo }}
                    style={{ width: 64, height: 64, borderRadius: 14, backgroundColor: '#FAEAD0' }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <View style={{ width: 64, height: 64, borderRadius: 14, backgroundColor: '#FAEAD0', alignItems: 'center', justifyContent: 'center' }}>
                    <PawPrint size={26} color="#FF9F73" />
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontFamily: 'Sora-Bold', fontSize: 17, color: '#1F1B2E' }}>{row.name}</Text>
                    <View style={{ backgroundColor: badge.bg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ fontFamily: 'DMSans-SemiBold', fontSize: 10, color: badge.fg }}>{badge.label}</Text>
                    </View>
                  </View>
                  <Text style={{ fontFamily: 'DMSans', fontSize: 12, color: '#9490A3', marginTop: 4 }}>
                    Listed {row.days_listed} {row.days_listed === 1 ? 'day' : 'days'} ago
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Heart size={16} color="#FF7A4F" fill="#FF7A4F" />
                    <Text style={{ fontFamily: 'Sora-Bold', fontSize: 18, color: '#1F1B2E' }}>{row.crush_total}</Text>
                  </View>
                  <Text style={{ fontFamily: 'DMMono', fontSize: 11, color: '#5E8C73', marginTop: 2 }}>
                    +{row.crush_7d} this week
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Globe,
  ExternalLink,
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { formatAge, formatDistance } from '../../lib/deck';
import { IconButton, Badge } from '../../components/ui';
import type { Pet, Shelter } from '../../lib/types';

const PLACEHOLDER = 'https://placehold.co/300x400/FFF6E9/FF7A4F?text=No+Photo';

export default function ShelterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tileWidth = (width - 48) / 2;
  const tileHeight = tileWidth * (4 / 3);

  useEffect(() => {
    if (!id) return;

    async function load() {
      const [shelterRes, petsRes] = await Promise.all([
        supabase.from('shelters').select('*').eq('id', id).single(),
        supabase
          .from('pets')
          .select('*')
          .eq('shelter_id', id)
          .eq('status', 'available')
          .order('created_at', { ascending: false }),
      ]);

      if (!shelterRes.error && shelterRes.data) {
        setShelter(shelterRes.data as Shelter);
      }
      if (!petsRes.error && petsRes.data) {
        setPets(petsRes.data as Pet[]);
      }
      setIsLoading(false);
    }

    load();
  }, [id]);

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

  if (!shelter) {
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
        <Text
          style={{
            fontFamily: 'Sora-Bold',
            fontSize: 20,
            color: '#1F1B2E',
            textAlign: 'center',
          }}
        >
          Shelter not found
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text
            style={{
              fontFamily: 'DMSans-SemiBold',
              fontSize: 15,
              color: '#FF7A4F',
            }}
          >
            Go back
          </Text>
        </Pressable>
      </View>
    );
  }

  const social = shelter.social_links;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF6E9' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          gap: 12,
        }}
      >
        <IconButton onPress={() => router.back()} size={40}>
          <ChevronLeft size={22} color="#1F1B2E" />
        </IconButton>
        <Text
          style={{
            fontFamily: 'Sora-Bold',
            fontSize: 18,
            color: '#1F1B2E',
            flex: 1,
          }}
          numberOfLines={1}
        >
          {shelter.shelter_name}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Shelter info */}
        <View style={{ paddingHorizontal: 20 }}>
          {/* Name + verified badge */}
          <Text
            style={{
              fontFamily: 'Sora-ExtraBold',
              fontSize: 32,
              color: '#1F1B2E',
              letterSpacing: -0.64,
            }}
          >
            {shelter.shelter_name}
          </Text>

          {shelter.is_verified && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                marginTop: 8,
                backgroundColor: '#EEF5F0',
                alignSelf: 'flex-start',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
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
                Verified shelter
              </Text>
            </View>
          )}

          {/* Address */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginTop: 12,
            }}
          >
            <MapPin size={16} color="#9490A3" />
            <Text
              style={{
                fontFamily: 'DMSans',
                fontSize: 14,
                color: '#4D4458',
                flex: 1,
              }}
            >
              {shelter.address}
            </Text>
          </View>

          {/* Description */}
          {shelter.description && (
            <Text
              style={{
                fontFamily: 'DMSans',
                fontSize: 14,
                color: '#4D4458',
                lineHeight: 14 * 1.55,
                marginTop: 16,
              }}
            >
              {shelter.description}
            </Text>
          )}

          {/* Contact section */}
          <Text
            style={{
              fontFamily: 'DMSans-SemiBold',
              fontSize: 11,
              color: '#9490A3',
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginTop: 28,
              marginBottom: 12,
            }}
          >
            Contact
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
            {/* Phone */}
            {shelter.phone && (
              <ContactRow
                icon={<Phone size={18} color="#FF7A4F" />}
                label={shelter.phone}
                onPress={() => Linking.openURL(`tel:${shelter.phone}`)}
              />
            )}

            {/* Email */}
            <ContactRow
              icon={<Mail size={18} color="#FF7A4F" />}
              label={shelter.email}
              onPress={() => Linking.openURL(`mailto:${shelter.email}`)}
              hasBorder={!!shelter.phone}
            />

            {/* Website */}
            {shelter.website && (
              <ContactRow
                icon={<Globe size={18} color="#FF7A4F" />}
                label={shelter.website.replace(/^https?:\/\//, '')}
                onPress={() =>
                  Linking.openURL(
                    shelter.website!.startsWith('http')
                      ? shelter.website!
                      : `https://${shelter.website}`,
                  )
                }
                hasBorder
              />
            )}

            {/* Social links */}
            {social?.facebook && (
              <ContactRow
                icon={<ExternalLink size={18} color="#FF7A4F" />}
                label="Facebook"
                onPress={() => Linking.openURL(social.facebook!)}
                hasBorder
              />
            )}
            {social?.instagram && (
              <ContactRow
                icon={<ExternalLink size={18} color="#FF7A4F" />}
                label="Instagram"
                onPress={() => Linking.openURL(social.instagram!)}
                hasBorder
              />
            )}
            {social?.twitter && (
              <ContactRow
                icon={<ExternalLink size={18} color="#FF7A4F" />}
                label="Twitter"
                onPress={() => Linking.openURL(social.twitter!)}
                hasBorder
              />
            )}
          </View>
        </View>

        {/* Available animals */}
        <View style={{ marginTop: 32, paddingHorizontal: 20 }}>
          <Text
            style={{
              fontFamily: 'Sora-Bold',
              fontSize: 18,
              color: '#1F1B2E',
              marginBottom: 16,
            }}
          >
            Available animals{' '}
            <Text style={{ fontFamily: 'DMSans', fontSize: 14, color: '#9490A3' }}>
              ({pets.length})
            </Text>
          </Text>

          {pets.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text
                style={{
                  fontFamily: 'DMSans',
                  fontSize: 14,
                  color: '#9490A3',
                  textAlign: 'center',
                }}
              >
                No available animals at the moment.
              </Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              {pets.map((pet) => {
                const photo =
                  pet.photos && pet.photos.length > 0
                    ? pet.photos[0]
                    : PLACEHOLDER;

                return (
                  <Pressable
                    key={pet.id}
                    onPress={() => router.push(`/pet/${pet.id}`)}
                    style={{
                      width: tileWidth,
                      height: tileHeight,
                      borderRadius: 20,
                      overflow: 'hidden',
                      backgroundColor: '#FFF6E9',
                      shadowColor: '#1F1B2E',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.08,
                      shadowRadius: 12,
                      elevation: 4,
                    }}
                  >
                    <Image
                      source={{ uri: photo }}
                      style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                      }}
                      contentFit="cover"
                      transition={200}
                    />

                    <LinearGradient
                      colors={['transparent', 'rgba(31,27,46,0.7)']}
                      locations={[0.4, 1]}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '50%',
                      }}
                    />

                    <View
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        paddingHorizontal: 12,
                        paddingBottom: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'Sora-Bold',
                          fontSize: 18,
                          color: '#FFFFFF',
                        }}
                        numberOfLines={1}
                      >
                        {pet.name}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'DMSans',
                          fontSize: 11,
                          color: 'rgba(255,255,255,0.75)',
                          marginTop: 2,
                        }}
                        numberOfLines={1}
                      >
                        {formatAge(pet.age_months)}
                        {pet.breed ? ` · ${pet.breed}` : ''}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function ContactRow({
  icon,
  label,
  onPress,
  hasBorder = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  hasBorder?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 12,
        ...(hasBorder
          ? { borderTopWidth: 1, borderTopColor: '#F5F3F8' }
          : {}),
      }}
    >
      {icon}
      <Text
        style={{
          fontFamily: 'DMSans-Medium',
          fontSize: 14,
          color: '#1F1B2E',
          flex: 1,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
      <ExternalLink size={14} color="#B0ACBB" />
    </Pressable>
  );
}

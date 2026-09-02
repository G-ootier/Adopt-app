import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, PawPrint, Heart } from 'lucide-react-native';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui';

type Slide = {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  tint: string;
  title: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    icon: PawPrint,
    tint: '#FF7A4F',
    title: 'Find your future bestie',
    body: 'Swipe through real animals from real shelters. Right to crush, left to keep looking.',
  },
  {
    icon: MapPin,
    tint: '#5E8C73',
    title: 'Rescues near you',
    body: 'Every profile is a real animal waiting at a nearby shelter — not a photo from a catalogue.',
  },
  {
    icon: Heart,
    tint: '#C84D4D',
    title: 'Crush, then connect',
    body: 'Like an animal and the shelter gets the message. Meet them, and take your bestie home.',
  },
];

export default function WelcomeScreen() {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (isLoading) return;
    if (user && profile) {
      if (profile.role === 'shelter') {
        router.replace('/(shelter)/animals');
      } else {
        router.replace('/(adopter)/swipe');
      }
    }
  }, [user, profile, isLoading]);

  if (isLoading) return null;
  if (user && profile) return null;

  // Cap the carousel width so slides stay centered on wide/desktop screens.
  const slideWidth = Math.min(width, 480);

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
    if (next !== index) setIndex(next);
  }

  function goTo(i: number) {
    scrollRef.current?.scrollTo({ x: i * slideWidth, animated: true });
    setIndex(i);
  }

  return (
    <View className="flex-1 bg-butter-100">
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: slideWidth, flex: 1 }}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            style={{ flex: 1 }}
          >
            {SLIDES.map((slide, i) => {
              const Icon = slide.icon;
              return (
                <View
                  key={i}
                  style={{
                    width: slideWidth,
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 32,
                  }}
                >
                  <View
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 28,
                      backgroundColor: slide.tint,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 28,
                      shadowColor: slide.tint,
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.3,
                      shadowRadius: 26,
                      elevation: 8,
                    }}
                  >
                    <Icon size={44} color="#FFFFFF" strokeWidth={2.2} />
                  </View>

                  <Text
                    style={{
                      fontFamily: 'Sora-Bold',
                      fontSize: 28,
                      color: '#1F1B2E',
                      textAlign: 'center',
                      marginBottom: 12,
                    }}
                  >
                    {slide.title}
                  </Text>

                  <Text
                    style={{
                      fontFamily: 'DMSans',
                      fontSize: 16,
                      color: '#4D4458',
                      textAlign: 'center',
                      maxWidth: 320,
                      lineHeight: 24,
                    }}
                  >
                    {slide.body}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Pagination dots */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              paddingVertical: 20,
            }}
          >
            {SLIDES.map((_, i) => (
              <Pressable
                key={i}
                onPress={() => goTo(i)}
                hitSlop={8}
                style={{
                  width: i === index ? 22 : 8,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: i === index ? '#FF7A4F' : '#F2D9AC',
                }}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Actions — always visible */}
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingBottom: 40,
        }}
      >
        <View style={{ width: '100%', maxWidth: 480, gap: 12 }}>
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.push('/(adopter)/swipe')}
            style={{ width: '100%' }}
          >
            Start swiping
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onPress={() => router.push('/(auth)/sign-up?role=shelter')}
            style={{ width: '100%' }}
          >
            I'm a shelter
          </Button>
        </View>

        <Text
          onPress={() => router.push('/(auth)/sign-in')}
          style={{
            fontFamily: 'DMSans-Medium',
            fontSize: 14,
            color: '#4D4458',
            marginTop: 20,
            textDecorationLine: 'underline',
          }}
        >
          Already have an account? Sign in
        </Text>
      </View>
    </View>
  );
}

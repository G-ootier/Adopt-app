import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { AdoptLogo } from './AdoptLogo';

const SITE_URL =
  typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://getadopt.eu';

/**
 * Shown to desktop/computer visitors instead of the app. Adopt is built for
 * phones, so this one-screen page explains what it does with a swipe-stack
 * visual (echoing the landing page) and a QR code to open it on mobile.
 */
export function DesktopLanding({ onContinue }: { onContinue: () => void }) {
  return (
    <View className="flex-1 bg-butter-100" style={{ alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 56,
          maxWidth: 1000,
          width: '100%',
        }}
      >
        {/* Left: copy + scan block */}
        <View style={{ flex: 1, maxWidth: 480 }}>
          <AdoptLogo height={34} />

          <Text
            style={{
              fontFamily: 'Sora-Bold',
              fontSize: 42,
              lineHeight: 46,
              color: '#1F1B2E',
              marginTop: 26,
              letterSpacing: -0.6,
            }}
          >
            Find your future bestie.
          </Text>

          <Text
            style={{
              fontFamily: 'DMSans',
              fontSize: 17,
              lineHeight: 26,
              color: '#4D4458',
              marginTop: 14,
            }}
          >
            Swipe through real rescue animals from shelters near you. Right to crush, left to keep looking. Scan the code to open Adopt on your phone.
          </Text>

          {/* Scan block */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 30 }}>
            <View
              style={{
                padding: 12,
                backgroundColor: '#FFFFFF',
                borderRadius: 18,
                shadowColor: '#1F1B2E',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 20,
              }}
            >
              <QRCode value={SITE_URL} size={116} color="#1F1B2E" backgroundColor="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Sora-SemiBold', fontSize: 16, color: '#1F1B2E' }}>
                Scan to open on your phone
              </Text>
              <Text style={{ fontFamily: 'DMSans', fontSize: 13, color: '#9490A3', marginTop: 4 }}>
                Point your camera at the code
              </Text>
            </View>
          </View>

          <Pressable onPress={onContinue} style={{ marginTop: 28 }}>
            <Text
              style={{
                fontFamily: 'DMSans-Medium',
                fontSize: 14,
                color: '#4D4458',
                textDecorationLine: 'underline',
              }}
            >
              Continue in your browser
            </Text>
          </Pressable>
        </View>

        {/* Right: overlapping swipe-stack cards */}
        <View style={{ width: 400, height: 480, alignItems: 'center', justifyContent: 'center' }}>
          <StackCard
            photo="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=75"
            name="Minette"
            age="2 yr"
            distance="1.2 km"
            shelter="Refuge des Amis de Paris"
            style={{ left: 22, top: 46, transform: [{ rotate: '-6deg' }], zIndex: 1 }}
          />
          <StackCard
            photo="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=75"
            name="Milou"
            age="18 mo"
            distance="0.8 km"
            shelter="Refuge des Amis de Paris"
            style={{ left: 120, top: 96, transform: [{ rotate: '5deg' }], zIndex: 2 }}
          />
        </View>
      </View>
    </View>
  );
}

function StackCard({
  photo,
  name,
  age,
  distance,
  shelter,
  style,
}: {
  photo: string;
  name: string;
  age: string;
  distance: string;
  shelter: string;
  style: any;
}) {
  return (
    <View
      style={[
        {
          position: 'absolute',
          width: 250,
          height: 344,
          borderRadius: 32,
          borderWidth: 6,
          borderColor: '#FFFFFF',
          overflow: 'hidden',
          backgroundColor: '#FAEAD0',
          shadowColor: '#1F1B2E',
          shadowOffset: { width: 0, height: 24 },
          shadowOpacity: 0.18,
          shadowRadius: 40,
        },
        style,
      ]}
    >
      <Image
        source={{ uri: photo }}
        style={{ width: '100%', height: '100%', position: 'absolute' }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <LinearGradient
        colors={['transparent', 'rgba(31,27,46,0.78)']}
        locations={[0.45, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Verified pill */}
      <View
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          backgroundColor: 'rgba(255,246,233,0.92)',
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 4,
        }}
      >
        <Text style={{ fontFamily: 'DMSans-SemiBold', fontSize: 10, color: '#4A7560' }}>
          ✓ Verified shelter
        </Text>
      </View>

      {/* Name / age / shelter */}
      <View style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text style={{ fontFamily: 'Sora-ExtraBold', fontSize: 26, color: '#FFFFFF', letterSpacing: -0.5 }}>
            {name}
          </Text>
          <Text style={{ fontFamily: 'DMSans-Medium', fontSize: 14, color: 'rgba(255,255,255,0.92)' }}>
            {age}
          </Text>
        </View>
        <Text style={{ fontFamily: 'DMMono', fontSize: 11, color: 'rgba(255,255,255,0.92)', marginTop: 2 }}>
          {distance} · {shelter}
        </Text>
      </View>
    </View>
  );
}

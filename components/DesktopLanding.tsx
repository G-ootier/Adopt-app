import { View, Text, Pressable } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { PawPrint, MapPin, Heart } from 'lucide-react-native';
import { AdoptLogo } from './AdoptLogo';

const SITE_URL =
  typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://getadopt.eu';

const POINTS: { icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>; tint: string; text: string }[] = [
  { icon: PawPrint, tint: '#FF7A4F', text: 'Swipe through real rescue animals near you.' },
  { icon: MapPin, tint: '#5E8C73', text: 'Every profile is a real animal from a nearby shelter.' },
  { icon: Heart, tint: '#C84D4D', text: 'Crush on the ones you love and the shelter hears about it.' },
];

/**
 * Shown to desktop/computer visitors instead of the app. Adopt is built for
 * phones, so this one-screen page explains what it does and offers a QR code
 * to open the same site on a mobile device.
 */
export function DesktopLanding({ onContinue }: { onContinue: () => void }) {
  return (
    <View className="flex-1 bg-butter-100" style={{ alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 64,
          maxWidth: 920,
          width: '100%',
        }}
      >
        {/* Left: what the app does */}
        <View style={{ flex: 1 }}>
          <AdoptLogo height={34} />

          <Text
            style={{
              fontFamily: 'Sora-Bold',
              fontSize: 40,
              lineHeight: 46,
              color: '#1F1B2E',
              marginTop: 28,
              letterSpacing: -0.5,
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
              maxWidth: 460,
            }}
          >
            Adopt is a mobile app for meeting real rescue animals from shelters near you. Scan the code to open it on your phone.
          </Text>

          <View style={{ marginTop: 28, gap: 16 }}>
            {POINTS.map((p, i) => {
              const Icon = p.icon;
              return (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: p.tint,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} color="#FFFFFF" strokeWidth={2.2} />
                  </View>
                  <Text style={{ fontFamily: 'DMSans-Medium', fontSize: 15, color: '#1F1B2E', flex: 1 }}>
                    {p.text}
                  </Text>
                </View>
              );
            })}
          </View>

          <Pressable onPress={onContinue} style={{ marginTop: 32 }}>
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

        {/* Right: QR card */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 28,
            padding: 32,
            alignItems: 'center',
            shadowColor: '#1F1B2E',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.1,
            shadowRadius: 32,
          }}
        >
          <View style={{ padding: 12, backgroundColor: '#FFFFFF', borderRadius: 16 }}>
            <QRCode value={SITE_URL} size={196} color="#1F1B2E" backgroundColor="#FFFFFF" />
          </View>
          <Text
            style={{
              fontFamily: 'Sora-SemiBold',
              fontSize: 16,
              color: '#1F1B2E',
              marginTop: 20,
              textAlign: 'center',
            }}
          >
            Scan to open on your phone
          </Text>
          <Text
            style={{
              fontFamily: 'DMSans',
              fontSize: 13,
              color: '#9490A3',
              marginTop: 6,
              textAlign: 'center',
            }}
          >
            Point your camera at the code
          </Text>
        </View>
      </View>
    </View>
  );
}

import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { PawPrint } from 'lucide-react-native';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui';

export default function WelcomeScreen() {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();

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

  return (
    <View className="flex-1 bg-butter-100 items-center justify-center px-6">
      <View className="items-center mb-10">
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            backgroundColor: '#FF7A4F',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            shadowColor: '#FF7A4F',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.32,
            shadowRadius: 24,
            elevation: 8,
          }}
        >
          <PawPrint size={40} color="#FFFFFF" strokeWidth={2.2} />
        </View>

        <Text
          style={{
            fontFamily: 'Sora-Bold',
            fontSize: 30,
            color: '#1F1B2E',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Find your future bestie
        </Text>

        <Text
          style={{
            fontFamily: 'DMSans',
            fontSize: 16,
            color: '#4D4458',
            textAlign: 'center',
            maxWidth: 280,
            lineHeight: 24,
          }}
        >
          Swipe through real animals from real shelters near you.
        </Text>
      </View>

      <View style={{ width: '100%', gap: 12 }}>
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
          marginTop: 24,
          textDecorationLine: 'underline',
        }}
      >
        Already have an account? Sign in
      </Text>
    </View>
  );
}

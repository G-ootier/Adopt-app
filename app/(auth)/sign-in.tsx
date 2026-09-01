import { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../lib/auth';
import { signInWithGoogle } from '../../lib/google-auth';
import { Button, Input } from '../../components/ui';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSignIn() {
    setError(null);
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const { error: authError } = await signIn(email.trim(), password);
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    // Auth state change listener in AuthProvider will update user/profile.
    // We wait briefly for profile to load, then redirect.
    // The welcome screen auto-redirect handles this, but we also redirect here.
    // A small delay ensures onAuthStateChange fires and profile loads.
    setTimeout(() => {
      // Profile may not be loaded yet, so go to index which handles routing.
      router.replace('/');
    }, 100);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="bg-butter-100"
      >
        <View className="flex-1 px-6 pt-16 pb-8">
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 32,
            }}
          >
            <ArrowLeft size={20} color="#1F1B2E" />
          </Pressable>

          <Text
            style={{
              fontFamily: 'Sora-Bold',
              fontSize: 24,
              color: '#1F1B2E',
              marginBottom: 8,
            }}
          >
            Welcome back
          </Text>

          <Text
            style={{
              fontFamily: 'DMSans',
              fontSize: 15,
              color: '#4D4458',
              marginBottom: 32,
            }}
          >
            Sign in to continue where you left off.
          </Text>

          <View style={{ gap: 16 }}>
            <Input
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />

            <Input
              label="Password"
              placeholder="Your password"
              secureTextEntry
              autoComplete="password"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Text
            onPress={() => router.push('/(auth)/forgot-password')}
            style={{
              fontFamily: 'DMSans-Medium',
              fontSize: 13,
              color: '#FF7A4F',
              textAlign: 'right',
              marginTop: 8,
            }}
          >
            Forgot password?
          </Text>

          {error && (
            <Text
              style={{
                fontFamily: 'DMSans',
                fontSize: 14,
                color: '#C84D4D',
                marginTop: 16,
              }}
            >
              {error}
            </Text>
          )}

          <View style={{ marginTop: 24, gap: 12 }}>
            <Button
              variant="primary"
              size="lg"
              onPress={handleSignIn}
              disabled={loading || googleLoading}
              style={{ width: '100%' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#E5E3EA' }} />
              <Text style={{ fontFamily: 'DMSans', fontSize: 12, color: '#9490A3' }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#E5E3EA' }} />
            </View>

            <Button
              variant="tertiary"
              size="lg"
              onPress={async () => {
                setGoogleLoading(true);
                setError(null);
                const { error: gErr } = await signInWithGoogle();
                setGoogleLoading(false);
                if (gErr) {
                  setError(gErr);
                } else {
                  router.replace('/');
                }
              }}
              disabled={loading || googleLoading}
              style={{ width: '100%' }}
            >
              {googleLoading ? 'Connecting...' : 'Continue with Google'}
            </Button>
          </View>

          <Text
            onPress={() => router.replace('/(auth)/sign-up')}
            style={{
              fontFamily: 'DMSans-Medium',
              fontSize: 14,
              color: '#4D4458',
              textAlign: 'center',
              marginTop: 20,
              textDecorationLine: 'underline',
            }}
          >
            No account yet? Sign up
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

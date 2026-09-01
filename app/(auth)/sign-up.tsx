import { useEffect, useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../lib/auth';
import { signInWithGoogle } from '../../lib/google-auth';
import { Button, Chip, Input } from '../../components/ui';
import type { UserRole } from '../../lib/types';

export default function SignUpScreen() {
  const router = useRouter();
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const { signUp, user, profile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(
    roleParam === 'shelter' ? 'shelter' : 'adopter',
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [waitingForAuth, setWaitingForAuth] = useState(false);

  useEffect(() => {
    if (waitingForAuth && user && profile) {
      router.replace('/');
    }
  }, [waitingForAuth, user, profile]);

  async function handleSignUp() {
    setError(null);
    if (!displayName.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { error: authError } = await signUp(
      email.trim(),
      password,
      displayName.trim(),
      role,
    );
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setWaitingForAuth(true);
  }

  const buttonLabel =
    role === 'shelter' ? 'Set up your shelter' : 'Start swiping';

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
            Create your account
          </Text>

          <Text
            style={{
              fontFamily: 'DMSans',
              fontSize: 15,
              color: '#4D4458',
              marginBottom: 32,
            }}
          >
            Tell us a bit about yourself to get started.
          </Text>

          <View style={{ gap: 16 }}>
            <Input
              label="Display name"
              placeholder="How should we call you?"
              autoCapitalize="words"
              value={displayName}
              onChangeText={setDisplayName}
            />

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
              placeholder="At least 6 characters"
              secureTextEntry
              autoComplete="new-password"
              value={password}
              onChangeText={setPassword}
            />

            <View>
              <Text
                style={{
                  fontFamily: 'DMSans-Medium',
                  fontSize: 13,
                  color: '#1F1B2E',
                  marginBottom: 8,
                }}
              >
                I am...
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Chip
                  active={role === 'adopter'}
                  onPress={() => setRole('adopter')}
                >
                  I want to adopt
                </Chip>
                <Chip
                  active={role === 'shelter'}
                  onPress={() => setRole('shelter')}
                >
                  I'm a shelter
                </Chip>
              </View>
            </View>
          </View>

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
              onPress={handleSignUp}
              disabled={loading || googleLoading}
              style={{ width: '100%' }}
            >
              {loading ? 'Creating account...' : buttonLabel}
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
            onPress={() => router.replace('/(auth)/sign-in')}
            style={{
              fontFamily: 'DMSans-Medium',
              fontSize: 14,
              color: '#4D4458',
              textAlign: 'center',
              marginTop: 20,
              textDecorationLine: 'underline',
            }}
          >
            Already have an account? Sign in
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

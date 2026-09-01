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
import * as Linking from 'expo-linking';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { Button, Input } from '../../components/ui';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);

    const redirectTo = Linking.createURL('/(auth)/reset-password');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo },
    );
    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
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
            Reset password
          </Text>

          <Text
            style={{
              fontFamily: 'DMSans',
              fontSize: 15,
              color: '#4D4458',
              marginBottom: 32,
            }}
          >
            {sent
              ? "We've sent you a reset link. Check your inbox and tap the link to set a new password."
              : "Enter the email address you signed up with and we'll send you a link to reset your password."}
          </Text>

          {!sent ? (
            <>
              <Input
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />

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

              <View style={{ marginTop: 24 }}>
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleReset}
                  disabled={loading}
                  style={{ width: '100%' }}
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </Button>
              </View>
            </>
          ) : (
            <View style={{ marginTop: 8 }}>
              <Button
                variant="tertiary"
                size="lg"
                onPress={() => router.replace('/(auth)/sign-in')}
                style={{ width: '100%' }}
              >
                Back to sign in
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

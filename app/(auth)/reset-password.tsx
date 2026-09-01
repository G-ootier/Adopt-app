import { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Button, Input } from '../../components/ui';

export default function ResetPasswordScreen() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    setError(null);

    if (!password) {
      setError('Please enter a new password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    Alert.alert('Done', 'Your password has been updated.', [
      { text: 'OK', onPress: () => router.replace('/') },
    ]);
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
          <Text
            style={{
              fontFamily: 'Sora-Bold',
              fontSize: 24,
              color: '#1F1B2E',
              marginBottom: 8,
            }}
          >
            New password
          </Text>

          <Text
            style={{
              fontFamily: 'DMSans',
              fontSize: 15,
              color: '#4D4458',
              marginBottom: 32,
            }}
          >
            Choose a new password for your account.
          </Text>

          <View style={{ gap: 16 }}>
            <Input
              label="New password"
              placeholder="At least 6 characters"
              secureTextEntry
              autoComplete="new-password"
              value={password}
              onChangeText={setPassword}
            />

            <Input
              label="Confirm password"
              placeholder="Type it again"
              secureTextEntry
              autoComplete="new-password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
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

          <View style={{ marginTop: 24 }}>
            <Button
              variant="primary"
              size="lg"
              onPress={handleUpdate}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Updating...' : 'Set new password'}
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

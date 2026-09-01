import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const isWeb = Platform.OS === 'web';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // On web, AsyncStorage falls back to localStorage automatically.
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // On web, OAuth and password-recovery redirects return the session in the
    // URL, so Supabase must parse it. On native we handle tokens manually.
    detectSessionInUrl: isWeb,
  },
});

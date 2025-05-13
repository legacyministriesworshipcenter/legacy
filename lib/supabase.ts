import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Exact env-var names from the guide */
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL!;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY!;

/**
 * Only React-Native has AsyncStorage. During Expo-Router’s
 * Node prerender (and on the Web) we fall back to a
 * no-op in-memory adapter supplied by Supabase.
 */
const isReactNative =
  typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isReactNative ? AsyncStorage : undefined, // ← key change
    autoRefreshToken: true,
    persistSession:  isReactNative,   // persist only where storage exists
    detectSessionInUrl: false,
  },
});

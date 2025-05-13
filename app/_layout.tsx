import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '@/lib/supabase';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  /* ─── 1. fonts (runs every render) ─── */
  const [fontsReady] = Font.useFonts(Ionicons.font);

  /* ─── 2. auth session state ─── */
  const [initialSessionChecked, setChecked] = useState(false);
  const [signedIn, setSignedIn]             = useState(false);

  useEffect(() => {
    const session = supabase.auth.session();
    setSignedIn(!!session);
    setChecked(true);

    const { data: subscription } =
      supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));

    return () => subscription?.unsubscribe();
  }, []);

  /* ─── 3. theme hook (order fixed) ─── */
  const colorScheme = useColorScheme();

  /* ─── 4. render guard ─── */
  if (!fontsReady || !initialSessionChecked) {
    return null;               // Hooks order is stable; safe to early-return JSX
  }

  /* ─── 5. normal tree ─── */
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {signedIn ? <Stack.Screen name="(tabs)" /> : <Stack.Screen name="(auth)" />}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

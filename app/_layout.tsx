import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '@/lib/supabase';
import { useColorScheme } from '@/hooks/useColorScheme';

// React Query imports
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function RootLayout() {
  const [fontsReady] = Font.useFonts(Ionicons.font);
  const [initialSessionChecked, setChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    console.log('Fonts ready:', fontsReady);
    const session = supabase.auth.session();
    setSignedIn(!!session);
    setChecked(true);

    const { data: subscription } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => subscription?.unsubscribe();
  }, []);

  // Move useColorScheme after render guard to ensure consistent hook order
  if (!fontsReady || !initialSessionChecked) {
    return null;
  }

  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {signedIn ? <Stack.Screen name="(tabs)" /> : <Stack.Screen name="(auth)" />}
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
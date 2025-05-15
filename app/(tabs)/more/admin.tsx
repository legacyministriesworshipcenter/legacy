import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { supabase } from '@/lib/supabase';

export default function AdminDashboardScreen() {
  const scheme = useColorScheme();
  const tint = Colors[scheme ?? 'light'].tint;

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      const user = supabase.auth.user(); // Use user() instead of getUser()
      if (!user) {
        router.replace('/(auth)/login');
      }
      // TODO: Check user role for admin access
    };
    checkAuth();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: scheme === 'dark' ? '#151718' : '#f5f5f5' }]}>
      <ThemedText type="title" style={[styles.title, { color: tint }]}>
        Admin Dashboard
      </ThemedText>
      <ThemedText type="default" style={{ color: scheme === 'dark' ? '#ccc' : '#666' }}>
        This section will include administrative tools and dashboards.
      </ThemedText>
      {/* TODO: Add dashboard UI (e.g., user management, analytics) */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
});
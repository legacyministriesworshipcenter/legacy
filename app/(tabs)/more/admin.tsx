import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function AdminDashboardScreen() {
  console.log('AdminDashboardScreen: Rendering');
  const scheme = useColorScheme();
  const tint = Colors[scheme ?? 'light'].tint;
  const buttonBackground = Colors[scheme ?? 'light'].buttonBackground;
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = supabase.auth.user();
      if (!user) {
        Alert.alert('Not Logged In', 'Please log in to access the admin dashboard.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log In', onPress: () => router.replace('/(auth)/login') },
        ]);
        return;
      }

      // Verify admin status
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setLoading(false);

      if (error || data?.role !== 'admin') {
        console.log('Admin access check failed:', error?.message || 'Not an admin');
        Alert.alert('Access Denied', 'You are not authorized to access this page.');
        router.replace('/(tabs)/more');
        return;
      }

      setIsAdmin(true);
    };

    checkAuth();
  }, []);

  if (loading) return <ActivityIndicator size="large" color={tint} style={styles.loader} />;
  if (!isAdmin) return null;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={[styles.title, { color: tint }]}>
        Admin Dashboard
      </ThemedText>
      <ThemedText style={[styles.subheader, { color: scheme === 'dark' ? '#ccc' : '#555' }]}>
        Manage church activities and member requests.
      </ThemedText>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonBackground }]}
        onPress={() => router.push('/(tabs)/more/admin/prayer-requests')}
        accessibilityLabel="Review prayer requests"
        accessibilityHint="Navigates to the prayer requests management page"
      >
        <ThemedText style={styles.buttonText}>Review Prayer Requests</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonBackground }]}
        onPress={() => router.push('/(tabs)/more/admin/group-memberships')}
        accessibilityLabel="Manage group memberships"
        accessibilityHint="Navigates to the group memberships management page"
      >
        <ThemedText style={styles.buttonText}>Manage Group Memberships</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonBackground }]}
        onPress={() => router.push('/(tabs)/more/admin/check-ins')}
        accessibilityLabel="View check-ins"
        accessibilityHint="Navigates to the check-ins management page"
      >
        <ThemedText style={styles.buttonText}>View Check-Ins</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonBackground }]}
        onPress={() => router.push('/(tabs)/more/admin/events')}
        accessibilityLabel="Manage events"
        accessibilityHint="Navigates to the events management page"
      >
        <ThemedText style={styles.buttonText}>Manage Events</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subheader: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  button: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
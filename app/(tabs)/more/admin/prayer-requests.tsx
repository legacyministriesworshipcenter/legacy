import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function PrayerRequestsScreen() {
  console.log('PrayerRequestsScreen: Rendering');
  const scheme = useColorScheme();
  const tint = Colors[scheme ?? 'light'].tint;
  const buttonBackground = Colors[scheme ?? 'light'].buttonBackground;
  const bgCard = scheme === 'dark' ? '#1e1e1e' : '#fff';
  const textColor = scheme === 'dark' ? '#fff' : '#000';

  const fetchPrayerRequests = async () => {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('id, user_id, request, created_at, status')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  };

  const { data: requests, isLoading, error, refetch } = useQuery({
    queryKey: ['prayer_requests_admin'],
    queryFn: fetchPrayerRequests,
  });

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const { data, error } = await supabase
      .from('prayer_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.log(`Error ${action}ing prayer request:`, error);
      Alert.alert('Error', `Failed to ${action} prayer request: ${error.message}`);
      return;
    }

    if (!data || data.length === 0) {
      console.log(`No rows updated when ${action}ing prayer request with id ${id}`);
      Alert.alert('Error', `Failed to ${action} prayer request: No matching request found.`);
      return;
    }

    console.log(`Prayer request ${action}ed successfully:`, data);
    Alert.alert('Success', `Prayer request ${action}ed successfully.`);
    refetch();
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color={tint} style={styles.loader} />;
  }

  if (error) {
    return (
      <ThemedText style={[styles.error, { color: scheme === 'dark' ? '#f88' : 'red' }]}>
        Error loading prayer requests: {error.message}
      </ThemedText>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <ThemedText style={[styles.empty, { color: scheme === 'dark' ? '#ccc' : '#666' }]}>
        No prayer requests found.
      </ThemedText>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: scheme === 'dark' ? '#151718' : '#f5f5f5' }]}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: bgCard }]}>
            <ThemedText style={[styles.request, { color: textColor }]}>
              {item.request}
            </ThemedText>
            <ThemedText style={styles.details}>
              Submitted: {new Date(item.created_at).toLocaleDateString()}
            </ThemedText>
            <ThemedText style={styles.details}>
              Status: {item.status || 'Pending'}
            </ThemedText>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: buttonBackground }]}
                onPress={() => handleAction(item.id, 'approve')}
                disabled={item.status === 'approved'}
                accessibilityLabel="Approve prayer request"
                accessibilityHint="Marks this prayer request as approved"
              >
                <ThemedText style={styles.buttonText}>Approve</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: scheme === 'dark' ? '#f88' : 'red' }]}
                onPress={() => handleAction(item.id, 'reject')}
                disabled={item.status === 'rejected'}
                accessibilityLabel="Reject prayer request"
                accessibilityHint="Marks this prayer request as rejected"
              >
                <ThemedText style={styles.buttonText}>Reject</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { padding: 16, fontSize: 16, textAlign: 'center' },
  empty: { padding: 16, fontSize: 16, textAlign: 'center' },
  card: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  request: { fontSize: 16, marginBottom: 8 },
  details: { fontSize: 14, color: '#555', marginBottom: 4 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
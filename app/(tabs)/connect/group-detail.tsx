import React from 'react';
import { View, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function GroupDetailScreen() {
  console.log('GroupDetailScreen: Rendering');
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const tint = Colors[scheme ?? 'light'].tint;

  const fetchGroupDetail = async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  };

  const { data: group, isLoading, error } = useQuery({
    queryKey: ['group', id],
    queryFn: fetchGroupDetail,
  });

  const requestJoin = async () => {
    // Check if user is authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      Alert.alert('Error', 'You must be logged in to join a group.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    const { error } = await supabase.from('group_memberships').insert({
      group_id: id,
      user_id: userData.user.id,
      status: 'pending',
    });

    if (error) {
      Alert.alert('Error', `Failed to request join: ${error.message}`);
    } else {
      Alert.alert('Success', 'Your request to join has been sent!');
    }
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color={tint} style={styles.loader} />;
  }

  if (error || !group) {
    return (
      <ThemedText style={[styles.error, { color: scheme === 'dark' ? '#f88' : 'red' }]}>
        Error loading group: {error?.message || 'Group not found'}
      </ThemedText>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={[styles.title, { color: tint }]}>
          {group.name}
        </ThemedText>
        <ThemedText style={styles.description}>{group.description || 'No description available'}</ThemedText>
        <ThemedText style={styles.details}>Leader: {group.leader}</ThemedText>
        <ThemedText style={styles.details}>Location: {group.location}</ThemedText>
        <ThemedText style={styles.details}>Time: {group.meeting_time}</ThemedText>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: tint }]}
          onPress={requestJoin}
          accessibilityLabel="Request to join this group"
          accessibilityHint="Submits a request to join the group"
        >
          <ThemedText style={styles.buttonText}>Request to Join</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { padding: 16, fontSize: 16, textAlign: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, marginBottom: 16 },
  details: { fontSize: 16, marginVertical: 4, color: '#555' },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
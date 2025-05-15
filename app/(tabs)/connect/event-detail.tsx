import React from 'react';
import { View, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const tint = Colors[scheme ?? 'light'].tint;
  const buttonBackground = Colors[scheme ?? 'light'].buttonBackground;

  const fetchEventDetail = async () => {
    const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    return data;
  };

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: fetchEventDetail,
  });

  if (isLoading) {
    return <ActivityIndicator size="large" color={tint} style={styles.loader} />;
  }

  if (error || !event) {
    return (
      <ThemedText style={[styles.error, { color: scheme === 'dark' ? '#f88' : 'red' }]}>
        Error loading event: {error?.message || 'Event not found'}
      </ThemedText>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={[styles.title, { color: tint }]}>
          {event.title}
        </ThemedText>
        <ThemedText style={styles.date}>
          {new Date(event.event_date).toLocaleString()}
        </ThemedText>
        <ThemedText style={styles.description}>{event.description || 'No description'}</ThemedText>
        <ThemedText style={styles.location}>Location: {event.location || 'TBD'}</ThemedText>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonBackground }]}
          onPress={() => Alert.alert('RSVP functionality to be implemented')}
          accessibilityLabel="RSVP for the event"
          accessibilityHint="Submits your RSVP for this event"
        >
          <ThemedText style={styles.buttonText}>RSVP</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { padding: 16, fontSize: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  date: { fontSize: 16, color: '#555', marginBottom: 8 },
  description: { fontSize: 16, marginBottom: 8 },
  location: { fontSize: 16, fontStyle: 'italic', marginBottom: 16 },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
import React from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function EventsScreen() {
  console.log('EventsScreen: Rendering');
  const scheme = useColorScheme();
  const tint = Colors[scheme ?? 'light'].tint;
  const bgCard = scheme === 'dark' ? '#1e1e1e' : '#fff';
  const textColor = scheme === 'dark' ? '#fff' : '#000';

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  };

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events_admin'],
    queryFn: fetchEvents,
  });

  if (isLoading) {
    return <ActivityIndicator size="large" color={tint} style={styles.loader} />;
  }

  if (error) {
    return (
      <ThemedText style={[styles.error, { color: scheme === 'dark' ? '#f88' : 'red' }]}>
        Error loading events: {error.message}
      </ThemedText>
    );
  }

  if (!events || events.length === 0) {
    return (
      <ThemedText style={[styles.empty, { color: scheme === 'dark' ? '#ccc' : '#666' }]}>
        No events found.
      </ThemedText>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: scheme === 'dark' ? '#151718' : '#f5f5f5' }]}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: bgCard }]}>
            <ThemedText style={[styles.eventTitle, { color: tint }]}>
              {item.title}
            </ThemedText>
            <ThemedText style={styles.details}>
              Date: {new Date(item.event_date).toLocaleDateString()}
            </ThemedText>
            <ThemedText style={styles.details}>
              Location: {item.location || 'TBD'}
            </ThemedText>
            <ThemedText style={styles.description}>
              {item.description || 'No description'}
            </ThemedText>
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
  eventTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  details: { fontSize: 14, color: '#555', marginBottom: 4 },
  description: { fontSize: 14, color: '#555', marginTop: 4 },
});
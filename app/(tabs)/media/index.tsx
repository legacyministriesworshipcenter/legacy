import React from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function MediaScreen() {
  console.log('MediaScreen: Rendering');
  const scheme = useColorScheme();
  const tint = Colors[scheme ?? 'light'].tint;
  const bgCard = scheme === 'dark' ? '#1e1e1e' : '#fff';

  const fetchSermons = async () => {
    const { data, error } = await supabase
      .from('sermons')
      .select('*, series(name)')
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  };

  const { data: sermons, isLoading, error } = useQuery({
    queryKey: ['sermons'],
    queryFn: fetchSermons,
  });

  if (isLoading) {
    return <ActivityIndicator size="large" color={tint} style={styles.loader} />;
  }

  if (error) {
    return (
      <ThemedText style={[styles.error, { color: scheme === 'dark' ? '#f88' : 'red' }]}>
        Error loading sermons: {error.message}
      </ThemedText>
    );
  }

  if (!sermons || sermons.length === 0) {
    return (
      <ThemedText style={[styles.empty, { color: scheme === 'dark' ? '#ccc' : '#666' }]}>
        No sermons found.
      </ThemedText>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: scheme === 'dark' ? '#151718' : '#f5f5f5' }]}>
      <FlatList
        data={sermons}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: bgCard }]}
            onPress={() => router.push({ pathname: '/(tabs)/media/sermon-detail', params: { id: item.id } })}
          >
            <ThemedText style={[styles.title, { color: tint }]}>{item.title}</ThemedText>
            <ThemedText style={styles.subtitle}>
              {item.speaker} | {item.series?.name || 'No Series'}
            </ThemedText>
            <ThemedText style={styles.date}>
              {new Date(item.date).toLocaleDateString()}
            </ThemedText>
          </TouchableOpacity>
        )}
      />
    </View>
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
  title: { fontSize: 16, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#555', marginTop: 4 },
  date: { fontSize: 14, color: '#555', marginTop: 4 },
});
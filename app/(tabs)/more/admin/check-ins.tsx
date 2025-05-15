import React from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function CheckInsScreen() {
  console.log('CheckInsScreen: Rendering');
  const scheme = useColorScheme();
  const tint = Colors[scheme ?? 'light'].tint;
  const bgCard = scheme === 'dark' ? '#1e1e1e' : '#fff';
  const textColor = scheme === 'dark' ? '#fff' : '#000';

  const fetchCheckIns = async () => {
    const { data: checkInsData, error: checkInsError } = await supabase
      .from('check_ins')
      .select('*')
      .order('check_in_time', { ascending: false });

    if (checkInsError) throw new Error(checkInsError.message);

    return checkInsData || [];
  };

  const { data: checkIns, isLoading, error } = useQuery({
    queryKey: ['check_ins_admin'],
    queryFn: fetchCheckIns,
  });

  if (isLoading) {
    return <ActivityIndicator size="large" color={tint} style={styles.loader} />;
  }

  if (error) {
    return (
      <ThemedText style={[styles.error, { color: scheme === 'dark' ? '#f88' : 'red' }]}>
        Error loading check-ins: {error.message}
      </ThemedText>
    );
  }

  if (!checkIns || checkIns.length === 0) {
    return (
      <ThemedText style={[styles.empty, { color: scheme === 'dark' ? '#ccc' : '#666' }]}>
        No check-ins found.
      </ThemedText>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: scheme === 'dark' ? '#151718' : '#f5f5f5' }]}>
      <FlatList
        data={checkIns}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: bgCard }]}>
            <ThemedText style={[styles.user, { color: textColor }]}>
              User ID: {item.user_id}
            </ThemedText>
            <ThemedText style={styles.details}>
              Check-In Time: {new Date(item.check_in_time).toLocaleString()}
            </ThemedText>
            {item.event_id && (
              <ThemedText style={styles.details}>
                Event ID: {item.event_id}
              </ThemedText>
            )}
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
  user: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  details: { fontSize: 14, color: '#555', marginBottom: 4 },
});
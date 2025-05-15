import React from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function GroupsScreen() {
  console.log('GroupsScreen: Rendering');
  const scheme = useColorScheme();
  const tint = Colors[scheme ?? 'light'].tint;
  const bgCard = scheme === 'dark' ? '#1e1e1e' : '#fff';

  const fetchGroups = async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('name');

    if (error) throw new Error(error.message);
    return data || [];
  };

  const { data: groups, isLoading, error } = useQuery({
    queryKey: ['groups'],
    queryFn: fetchGroups,
  });

  if (isLoading) {
    return <ActivityIndicator size="large" color={tint} style={styles.loader} />;
  }

  if (error) {
    return (
      <ThemedText style={[styles.error, { color: scheme === 'dark' ? '#f88' : 'red' }]}>
        Error loading groups: {error.message}
      </ThemedText>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <ThemedText style={[styles.empty, { color: scheme === 'dark' ? '#ccc' : '#666' }]}>
        No groups found.
      </ThemedText>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: scheme === 'dark' ? '#151718' : '#f5f5f5' }]}>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.groupCard, { backgroundColor: bgCard }]}
            onPress={() => router.push({ pathname: '/(tabs)/connect/group-detail', params: { id: item.id } })}
            accessibilityLabel={`View details for ${item.name} group`}
            accessibilityHint="Navigates to group detail screen"
          >
            <ThemedText style={[styles.groupName, { color: tint }]}>{item.name}</ThemedText>
            <ThemedText style={styles.groupTime}>{item.meeting_time}</ThemedText>
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
  groupCard: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  groupName: { fontSize: 18, fontWeight: 'bold' },
  groupTime: { fontSize: 14, color: '#555', marginTop: 4 },
});
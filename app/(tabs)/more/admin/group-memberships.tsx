import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function GroupMembershipsScreen() {
  console.log('GroupMembershipsScreen: Rendering');
  const scheme = useColorScheme();
  const tint = Colors[scheme ?? 'light'].tint;
  const buttonBackground = Colors[scheme ?? 'light'].buttonBackground;
  const bgCard = scheme === 'dark' ? '#1e1e1e' : '#fff';
  const textColor = scheme === 'dark' ? '#fff' : '#000';

  const fetchGroupMemberships = async () => {
    // Fetch group memberships with related group names
    const { data: membershipsData, error: membershipsError } = await supabase
      .from('group_memberships')
      .select('*, groups!group_id(name)')
      .order('created_at', { ascending: false });

    if (membershipsError) throw new Error(membershipsError.message);

    return membershipsData || [];
  };

  const { data: memberships, isLoading, error, refetch } = useQuery({
    queryKey: ['group_memberships_admin'],
    queryFn: fetchGroupMemberships,
  });

  const handleAction = async (groupId: string, userId: string, action: 'approve' | 'reject' | 'remove') => {
    if (action === 'remove') {
      const { error } = await supabase
        .from('group_memberships')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) {
        console.log('Error removing group membership:', error);
        Alert.alert('Error', `Failed to remove membership: ${error.message}`);
      } else {
        Alert.alert('Success', 'Membership removed successfully.');
        refetch();
      }
    } else {
      const { error } = await supabase
        .from('group_memberships')
        .update({ status: action === 'approve' ? 'approved' : 'rejected' })
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) {
        console.log(`Error ${action}ing group membership:`, error);
        Alert.alert('Error', `Failed to ${action} membership: ${error.message}`);
      } else {
        Alert.alert('Success', `Membership ${action}ed successfully.`);
        refetch();
      }
    }
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color={tint} style={styles.loader} />;
  }

  if (error) {
    return (
      <ThemedText style={[styles.error, { color: scheme === 'dark' ? '#f88' : 'red' }]}>
        Error loading group memberships: {error.message}
      </ThemedText>
    );
  }

  if (!memberships || memberships.length === 0) {
    return (
      <ThemedText style={[styles.empty, { color: scheme === 'dark' ? '#ccc' : '#666' }]}>
        No group memberships found.
      </ThemedText>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: scheme === 'dark' ? '#151718' : '#f5f5f5' }]}>
      <FlatList
        data={memberships}
        keyExtractor={(item) => `${item.group_id}-${item.user_id}`}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: bgCard }]}>
            <ThemedText style={[styles.groupName, { color: tint }]}>
              {item.groups?.name || 'Unknown Group'}
            </ThemedText>
            <ThemedText style={styles.details}>
              User ID: {item.user_id}
            </ThemedText>
            <ThemedText style={styles.details}>
              Role: {item.role}
            </ThemedText>
            <ThemedText style={styles.details}>
              Status: {item.status}
            </ThemedText>
            <View style={styles.buttonContainer}>
              {item.status === 'pending' && (
                <>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: buttonBackground }]}
                    onPress={() => handleAction(item.group_id, item.user_id, 'approve')}
                    accessibilityLabel="Approve group membership"
                    accessibilityHint="Approves this user’s membership in the group"
                  >
                    <ThemedText style={styles.buttonText}>Approve</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: scheme === 'dark' ? '#f88' : 'red' }]}
                    onPress={() => handleAction(item.group_id, item.user_id, 'reject')}
                    accessibilityLabel="Reject group membership"
                    accessibilityHint="Rejects this user’s membership in the group"
                  >
                    <ThemedText style={styles.buttonText}>Reject</ThemedText>
                  </TouchableOpacity>
                </>
              )}
              {item.status === 'approved' && (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: scheme === 'dark' ? '#f88' : 'red' }]}
                  onPress={() => handleAction(item.group_id, item.user_id, 'remove')}
                  accessibilityLabel="Remove from group"
                  accessibilityHint="Removes this user from the group"
                >
                  <ThemedText style={styles.buttonText}>Remove</ThemedText>
                </TouchableOpacity>
              )}
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
  groupName: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
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
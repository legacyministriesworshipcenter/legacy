import React, { useState, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
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
  const buttonBackground = Colors[scheme ?? 'light'].buttonBackground;
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [currentMembership, setCurrentMembership] = useState<any | null>(null);
  const [hasOtherMembership, setHasOtherMembership] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const fetchMembershipStatus = useCallback(async () => {
    const user = supabase.auth.user();
    if (!user) {
      setCurrentMembership(null);
      setHasOtherMembership(false);
      return;
    }

    // Check membership for this group
    const { data: membershipData, error: membershipError } = await supabase
      .from('group_memberships')
      .select('*')
      .eq('user_id', user.id)
      .eq('group_id', id)
      .single();

    if (membershipError && membershipError.code !== 'PGRST116') {
      console.log('Error fetching membership:', membershipError);
      return;
    }

    setCurrentMembership(membershipData);

    // Check if the user has an active membership in any other group
    // Active memberships are those with status 'pending', 'approved', or 'pending_leave'
    // 'rejected' memberships don't count as active
    const { data: otherMemberships, error: otherError } = await supabase
      .from('group_memberships')
      .select('*')
      .eq('user_id', user.id)
      .neq('group_id', id)
      .in('status', ['pending', 'approved', 'pending_leave']);

    if (otherError) {
      console.log('Error fetching other memberships:', otherError);
      return;
    }

    setHasOtherMembership(otherMemberships && otherMemberships.length > 0);
  }, [id]);

  // Fetch membership status on initial load and when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchMembershipStatus();
    }, [fetchMembershipStatus])
  );

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMembershipStatus();
    setRefreshing(false);
  }, [fetchMembershipStatus]);

  const handleJoin = async () => {
    setSubmissionStatus(null);

    const user = supabase.auth.user();
    if (!user) {
      Alert.alert('Error', 'You must be logged in to join a group.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => router.push('/(auth)/login') },
      ]);
      setSubmissionStatus('Error: You must be logged in to join a group.');
      return;
    }

    // Double-check if an entry already exists (safety net)
    const { data: existingEntry, error: checkError } = await supabase
      .from('group_memberships')
      .select('*')
      .eq('user_id', user.id)
      .eq('group_id', id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.log('Error checking existing membership:', checkError);
      Alert.alert('Error', `Failed to check membership: ${checkError.message}`);
      setSubmissionStatus(`Error: ${checkError.message}`);
      return;
    }

    if (existingEntry) {
      console.log('Existing membership found:', existingEntry);
      Alert.alert('Error', 'You have a membership request for this group.');
      setSubmissionStatus('Error: You have a membership request for this group.');
      return;
    }

    const { error } = await supabase.from('group_memberships').insert({
      group_id: id,
      user_id: user.id,
      status: 'pending',
      role: 'member',
    });

    if (error) {
      console.log('Group Join Request Error:', error);
      Alert.alert('Error', `Failed to request join: ${error.message}`);
      setSubmissionStatus(`Error: ${error.message}`);
    } else {
      console.log('Group Join Request Submitted Successfully');
      setCurrentMembership({ group_id: id, user_id: user.id, status: 'pending', role: 'member' });
      setHasOtherMembership(true);
      Alert.alert('Success', 'Your request to join has been sent!');
      setSubmissionStatus('Your request to join has been sent!');
      await fetchMembershipStatus();
    }
  };

  const handleLeave = async () => {
    setSubmissionStatus(null);

    const user = supabase.auth.user();
    if (!user) return;

    const { data, error } = await supabase
      .from('group_memberships')
      .update({ status: 'pending_leave' })
      .eq('group_id', id)
      .eq('user_id', user.id);

    if (error) {
      console.log('Group Leave Request Error:', error);
      Alert.alert('Error', `Failed to request leave: ${error.message}`);
      setSubmissionStatus(`Error: ${error.message}`);
    } else if (!data || data.length === 0) {
      console.log('Group Leave Request Failed: No rows updated');
      Alert.alert('Error', 'Failed to request leave: No matching membership found.');
      setSubmissionStatus('Error: Failed to request leave.');
    } else {
      console.log('Group Leave Request Submitted Successfully');
      setCurrentMembership({ ...currentMembership, status: 'pending_leave' });
      Alert.alert('Success', 'You have requested to leave the group.');
      setSubmissionStatus('You have requested to leave the group.');
    }
  };

  const handleCancel = async () => {
    setSubmissionStatus(null);

    const user = supabase.auth.user();
    if (!user) return;

    if (currentMembership?.status === 'pending_leave') {
      // Revert to approved status
      const { data, error } = await supabase
        .from('group_memberships')
        .update({ status: 'approved' })
        .eq('group_id', id)
        .eq('user_id', user.id);

      if (error) {
        console.log('Cancel Leave Request Error:', error);
        Alert.alert('Error', `Failed to cancel leave request: ${error.message}`);
        setSubmissionStatus(`Error: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.log('Cancel Leave Request Failed: No rows updated');
        Alert.alert('Error', 'Failed to cancel leave request: No matching membership found.');
        setSubmissionStatus('Error: Failed to cancel leave request.');
        return;
      }

      console.log('Cancel Leave Request Successful');
      setCurrentMembership({ ...currentMembership, status: 'approved' });
      Alert.alert('Success', 'Your leave request has been canceled.');
      setSubmissionStatus('Your leave request has been canceled.');
    } else {
      // For pending join requests, delete the entry
      const { data, error } = await supabase
        .from('group_memberships')
        .delete()
        .eq('group_id', id)
        .eq('user_id', user.id);

      if (error) {
        console.log('Cancel Join Request Error:', error);
        Alert.alert('Error', `Failed to cancel join request: ${error.message}`);
        setSubmissionStatus(`Error: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.log('Cancel Join Request Failed: No rows deleted');
        Alert.alert('Error', 'Failed to cancel join request: No matching membership found.');
        setSubmissionStatus('Error: Failed to cancel join request.');
        return;
      }

      console.log('Cancel Join Request Successful');
      setCurrentMembership(null);
      setHasOtherMembership(false);
      Alert.alert('Success', 'Your join request has been canceled.');
      setSubmissionStatus('Your join request has been canceled.');
    }

    await fetchMembershipStatus();
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

  // Status transitions:
  // - 'pending': User has requested to join the group (awaiting admin approval)
  // - 'approved': User is a member of the group
  // - 'rejected': Admin has denied the join request; user can join another group
  // - 'pending_leave': User has requested to leave the group (can be canceled to revert to 'approved')
  // Button logic:
  // - 'Join' button: Enabled if user has no membership for this group or status is 'rejected'; disabled if user has an active membership in another group
  // - 'Leave' button: Enabled if status is 'approved'; disabled otherwise
  // - 'Cancel' button: Enabled if status is 'pending' or 'pending_leave'; disabled otherwise
  const isLeaveMode = currentMembership && currentMembership.status === 'approved';
  const isJoinDisabled = hasOtherMembership || (currentMembership && currentMembership.status !== 'rejected' && !isLeaveMode);
  const isCancelDisabled = !currentMembership || !['pending', 'pending_leave'].includes(currentMembership?.status);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={tint}
          />
        }
      >
        <ThemedText type="title" style={[styles.title, { color: tint }]}>
          {group.name}
        </ThemedText>
        <ThemedText style={styles.description}>{group.description || 'No description available'}</ThemedText>
        <ThemedText style={styles.details}>Leader: {group.leader}</ThemedText>
        <ThemedText style={styles.details}>Location: {group.location}</ThemedText>
        <ThemedText style={styles.details}>Time: {group.meeting_time}</ThemedText>
        <ThemedText style={styles.details}>Role: {group.role}</ThemedText>
        {submissionStatus && (
          <ThemedText
            style={[
              styles.statusMessage,
              { color: submissionStatus.includes('Error') ? (scheme === 'dark' ? '#f88' : 'red') : (scheme === 'dark' ? '#0f0' : 'green') },
            ]}
          >
            {submissionStatus}
          </ThemedText>
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isJoinDisabled ? (scheme === 'dark' ? '#444' : '#ccc') : buttonBackground },
            ]}
            onPress={isLeaveMode ? handleLeave : handleJoin}
            disabled={isJoinDisabled}
            accessibilityLabel={isLeaveMode ? "Leave this group" : "Join this group"}
            accessibilityHint={isLeaveMode ? "Submits a request to leave the group" : "Submits a request to join the group"}
          >
            <ThemedText style={styles.buttonText}>
              {isLeaveMode ? 'Leave' : 'Join'}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.cancelButton,
              { backgroundColor: isCancelDisabled ? (scheme === 'dark' ? '#444' : '#ccc') : (scheme === 'dark' ? '#f88' : 'red') },
            ]}
            onPress={handleCancel}
            disabled={isCancelDisabled}
            accessibilityLabel="Cancel group request"
            accessibilityHint={isCancelDisabled ? "No pending request to cancel" : "Cancels your pending join or leave request"}
          >
            <ThemedText style={styles.buttonText}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
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
  statusMessage: { fontSize: 16, textAlign: 'center', marginTop: 16 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
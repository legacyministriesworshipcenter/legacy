import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import dayjs from 'dayjs';

export default function CheckInScreen() {
  console.log('CheckInScreen: Rendering');
  const scheme = useColorScheme();
  const tint = Colors[scheme ?? 'light'].tint;
  const [loading, setLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  // Check for existing check-in when the screen loads
  useEffect(() => {
    const checkExistingCheckIn = async () => {
      const user = supabase.auth.user();
      if (!user) return;

      const todayStart = dayjs().startOf('day').toISOString();
      const todayEnd = dayjs().endOf('day').toISOString();

      const { data: existingCheckIn, error: checkError } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .gte('check_in_time', todayStart)
        .lte('check_in_time', todayEnd)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.log('Error checking existing check-in on load:', checkError);
        return;
      }

      if (existingCheckIn) {
        setHasCheckedIn(true);
        setSubmissionStatus('You have already checked in for today.');
      }
    };

    checkExistingCheckIn();
  }, []);

  const handleCheckIn = async () => {
    if (loading || hasCheckedIn) return;

    setLoading(true);
    setSubmissionStatus(null);

    const user = supabase.auth.user();
    if (!user) {
      setLoading(false);
      Alert.alert('Not Logged In', 'Please log in to check in.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => router.push('/(auth)/login') },
      ]);
      setSubmissionStatus('Error: Please log in to check in.');
      return;
    }

    // Double-check for existing check-in before inserting
    const todayStart = dayjs().startOf('day').toISOString();
    const todayEnd = dayjs().endOf('day').toISOString();

    const { data: existingCheckIn, error: checkError } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .gte('check_in_time', todayStart)
      .lte('check_in_time', todayEnd)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.log('Error checking existing check-in:', checkError);
      Alert.alert('Check-In Failed', `Failed to check existing check-in: ${checkError.message}`);
      setSubmissionStatus(`Error: ${checkError.message}`);
      setLoading(false);
      return;
    }

    if (existingCheckIn) {
      setLoading(false);
      setHasCheckedIn(true);
      Alert.alert('Already Checked In', 'You have already checked in for today.');
      setSubmissionStatus('You have already checked in for today.');
      return;
    }

    // Proceed with check-in
    const { error } = await supabase.from('check_ins').insert({
      user_id: user.id,
    });

    setLoading(false);

    if (error) {
      console.log('Check-In Error:', error);
      Alert.alert('Check-In Failed', error.message);
      setSubmissionStatus(`Error: ${error.message}`);
    } else {
      console.log('Check-In Successful');
      setHasCheckedIn(true);
      Alert.alert('Check-In Successful', 'You are now checked in!', [
        { text: 'OK', onPress: () => router.navigate('/(tabs)/connect') },
      ]);
      setSubmissionStatus('You are now checked in!');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={[styles.header, { color: tint }]}>
        Service Check-In
      </ThemedText>
      <ThemedText style={[styles.subheader, { color: scheme === 'dark' ? '#ccc' : '#555' }]}>
        Let us know you’re here for today’s service.
      </ThemedText>
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
      {loading ? (
        <ActivityIndicator size="large" color={tint} style={styles.loader} />
      ) : (
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: hasCheckedIn ? (scheme === 'dark' ? '#444' : '#ccc') : tint },
          ]}
          onPress={handleCheckIn}
          disabled={hasCheckedIn}
          accessibilityLabel={hasCheckedIn ? "Already checked in for the service" : "Check in for the service"}
          accessibilityHint={hasCheckedIn ? "You have already checked in for today" : "Records your attendance for today’s service"}
        >
          <ThemedText style={styles.buttonText}>
            {hasCheckedIn ? 'Checked In' : 'Check In Now'}
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subheader: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  statusMessage: { fontSize: 16, textAlign: 'center', marginBottom: 16 },
  loader: { marginBottom: 16 },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
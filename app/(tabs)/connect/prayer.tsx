import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import ThemedTextInput from '@/components/ui/ThemedTextInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { TouchableOpacity } from 'react-native';

export default function PrayerScreen() {
  console.log('PrayerScreen: Rendering');
  const scheme = useColorScheme();
  const tint = Colors[scheme ?? 'light'].tint;
  const [request, setRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  const submitRequest = async () => {
    if (request.trim().length === 0) {
      Alert.alert('Empty Request', 'Please write your prayer request.');
      setSubmissionStatus('Error: Please write your prayer request.');
      return;
    }

    setLoading(true);
    setSubmissionStatus(null);

    const user = supabase.auth.user();
    if (!user) {
      setLoading(false);
      Alert.alert('Error', 'You must be logged in to submit a prayer request.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => router.push('/(auth)/login') },
      ]);
      setSubmissionStatus('Error: You must be logged in to submit a prayer request.');
      return;
    }

    const { error } = await supabase.from('prayer_requests').insert({
      request,
      user_id: user.id,
    });

    setLoading(false);

    if (error) {
      console.log('Prayer Request Submission Error:', error);
      Alert.alert('Submission Error', error.message);
      setSubmissionStatus(`Error: ${error.message}`);
    } else {
      console.log('Prayer Request Submitted Successfully');
      Alert.alert('Request Submitted', 'Your prayer request has been received.', [
        { text: 'OK', onPress: () => router.navigate('/(tabs)/connect') },
      ]);
      setSubmissionStatus('Your prayer request has been received.');
      setRequest('');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={[styles.header, { color: tint }]}>
        Submit Your Prayer Request
      </ThemedText>
      <ThemedText style={[styles.subheader, { color: scheme === 'dark' ? '#ccc' : '#555' }]}>
        Share your prayer needs with us, and we’ll lift them up in prayer.
      </ThemedText>
      <ThemedTextInput
        style={styles.input}
        placeholder="Type your prayer request here..."
        multiline
        numberOfLines={4}
        value={request}
        onChangeText={setRequest}
        accessibilityLabel="Enter your prayer request"
        accessibilityHint="Type the prayer request you would like to submit"
      />
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
          style={[styles.button, { backgroundColor: tint }]}
          onPress={submitRequest}
          accessibilityLabel="Submit prayer request"
          accessibilityHint="Submits your prayer request to the church"
        >
          <ThemedText style={styles.buttonText}>Submit</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  subheader: { fontSize: 16, marginBottom: 16 },
  input: { marginBottom: 16, textAlignVertical: 'top' },
  statusMessage: { fontSize: 16, textAlign: 'center', marginBottom: 16 },
  loader: { marginTop: 16 },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
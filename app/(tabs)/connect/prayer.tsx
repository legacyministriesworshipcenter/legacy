import React, { useState } from 'react';
import { View, TextInput, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function PrayerScreen() {
  console.log('PrayerScreen: Rendering');
  const scheme = useColorScheme();
  const tint = Colors[scheme ?? 'light'].tint;
  const buttonBackground = Colors[scheme ?? 'light'].buttonBackground;
  const [prayerRequest, setPrayerRequest] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submitRequest = async () => {
    if (prayerRequest.trim().length < 5) {
      Alert.alert('Error', 'Prayer request must be at least 5 characters long.');
      setSubmissionStatus('Error: Prayer request must be at least 5 characters long.');
      return;
    }

    setLoading(true);
    setSubmissionStatus(null);

    const user = supabase.auth.user();
    if (!user) {
      setLoading(false);
      Alert.alert('Not Logged In', 'Please log in to submit a prayer request.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => router.push('/(auth)/login') },
      ]);
      setSubmissionStatus('Error: Please log in to submit a prayer request.');
      return;
    }

    const { error } = await supabase.from('prayer_requests').insert({
      user_id: user.id,
      request: prayerRequest.trim(),
    });

    setLoading(false);

    if (error) {
      console.log('Prayer Request Submission Error:', error);
      Alert.alert('Submission Failed', error.message);
      setSubmissionStatus(`Error: ${error.message}`);
    } else {
      console.log('Prayer Request Submitted Successfully');
      Alert.alert('Success', 'Your prayer request has been submitted!', [
        { text: 'OK', onPress: () => router.navigate('/(tabs)/connect') },
      ]);
      setSubmissionStatus('Your prayer request has been submitted!');
      setPrayerRequest('');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={[styles.header, { color: tint }]}>
        Submit a Prayer Request
      </ThemedText>
      <ThemedText style={[styles.subheader, { color: scheme === 'dark' ? '#ccc' : '#555' }]}>
        Share your prayer needs with us.
      </ThemedText>
      <TextInput
        style={[styles.input, { color: scheme === 'dark' ? '#fff' : '#000' }]}
        placeholder="Enter your prayer request (minimum 5 characters)"
        placeholderTextColor={scheme === 'dark' ? '#888' : '#999'}
        value={prayerRequest}
        onChangeText={setPrayerRequest}
        multiline
        numberOfLines={4}
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
          style={[styles.button, { backgroundColor: buttonBackground }]}
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
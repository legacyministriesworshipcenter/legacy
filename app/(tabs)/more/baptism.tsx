import React, { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function BaptismScreen() {
  console.log('BaptismScreen: Rendering');
  const scheme = useColorScheme();
  const tint = Colors[scheme ?? 'light'].tint;
  const buttonBackground = Colors[scheme ?? 'light'].buttonBackground;
  const textColor = scheme === 'dark' ? '#fff' : '#000';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [existingRequest, setExistingRequest] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Fetch or create the user's profile ID and check for existing baptism request
  const fetchOrCreateProfileAndCheckRequest = useCallback(async () => {
    setLoading(true);
    setSubmissionStatus(null);

    const user = supabase.auth.user();
    if (!user) {
      Alert.alert('Not Logged In', 'Please log in to submit a baptism inquiry.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => router.push('/(auth)/login') },
      ]);
      setSubmissionStatus('Error: Please log in to submit a baptism inquiry.');
      setLoading(false);
      return;
    }

    console.log('Current user auth.uid():', user.id);

    // Fetch or create profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // No profile found, create one
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            role: 'user',
          })
          .select('id, role')
          .single();

        if (insertError) {
          console.log('Error creating profile:', insertError);
          Alert.alert('Error', 'Failed to create your profile. Please try again.');
          setSubmissionStatus(`Error: ${insertError.message}`);
          setLoading(false);
          return;
        }

        setProfileId(newProfile.id);
        setIsAdmin(newProfile.role === 'admin');
        console.log('Profile created successfully:', newProfile.id, 'Role:', newProfile.role);
      } else {
        console.log('Error fetching profile ID:', profileError);
        Alert.alert('Error', 'Failed to fetch your profile. Please try again.');
        setSubmissionStatus(`Error: ${profileError.message}`);
        setLoading(false);
        return;
      }
    } else {
      setProfileId(profileData.id);
      setIsAdmin(profileData.role === 'admin');
      console.log('Profile fetched successfully:', profileData.id, 'Role:', profileData.role);
    }

    // Check for existing baptism request
    if (profileData?.id || profileId) {
      const { data: requestData, error: requestError } = await supabase
        .from('baptism_requests')
        .select('*')
        .eq('user_id', profileData?.id || profileId)
        .eq('status', 'pending')
        .single();

      if (requestError && requestError.code !== 'PGRST116') {
        console.log('Error checking existing baptism request:', requestError);
        setSubmissionStatus(`Error: ${requestError.message}`);
        setLoading(false);
        return;
      }

      setExistingRequest(requestData);
      if (requestData) {
        console.log('Existing baptism request found:', requestData);
        setSubmissionStatus('You have already submitted a baptism inquiry.');
      } else {
        setSubmissionStatus(null);
      }
    }
    setLoading(false);
  }, [profileId]);

  useFocusEffect(
    React.useCallback(() => {
      fetchOrCreateProfileAndCheckRequest();
    }, [fetchOrCreateProfileAndCheckRequest])
  );

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Missing Info', 'Please provide your name and email.');
      setSubmissionStatus('Error: Please provide your name and email.');
      return;
    }

    if (!profileId) {
      Alert.alert('Error', 'User profile not loaded. Please try again.');
      setSubmissionStatus('Error: User profile not loaded.');
      return;
    }

    setLoading(true);
    setSubmissionStatus(null);

    const { error } = await supabase.from('baptism_requests').insert({
      user_id: profileId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      notes: notes.trim() || null,
    });

    setLoading(false);

    if (error) {
      console.log('Baptism Inquiry Submission Error:', error);
      Alert.alert('Submission Error', error.message);
      setSubmissionStatus(`Error: ${error.message}`);
    } else {
      console.log('Baptism Inquiry Submitted Successfully');
      Alert.alert('Thank You!', 'Your baptism inquiry has been submitted.', [
        { text: 'OK', onPress: () => router.navigate('/(tabs)/more') },
      ]);
      setSubmissionStatus('Your baptism inquiry has been submitted.');
      setExistingRequest({ user_id: profileId, status: 'pending' });
      setName('');
      setEmail('');
      setPhone('');
      setNotes('');
      // Re-fetch to ensure the UI updates with the new request
      await fetchOrCreateProfileAndCheckRequest();
    }
  };

  const handleCancel = async () => {
    if (!existingRequest) return;

    setLoading(true);
    setSubmissionStatus(null);

    console.log('Attempting to cancel baptism request:', existingRequest);
    console.log('Current user auth.uid():', supabase.auth.user()?.id);
    console.log('Request user_id:', existingRequest.user_id);
    console.log('Is user admin?', isAdmin);

    // Check if the user has permission to delete
    if (!isAdmin && existingRequest.user_id !== supabase.auth.user()?.id) {
      console.log('User does not have permission to delete this request');
      Alert.alert('Permission Error', 'You do not have permission to cancel this request.');
      setSubmissionStatus('Error: You do not have permission to cancel this request.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('baptism_requests')
      .delete()
      .eq('id', existingRequest.id)
      .select();

    setLoading(false);

    if (error) {
      console.log('Baptism Request Cancellation Error:', error);
      Alert.alert('Cancellation Error', error.message);
      setSubmissionStatus(`Error: ${error.message}`);
    } else if (!data || data.length === 0) {
      console.log('No rows deleted when cancelling baptism request with id:', existingRequest.id);
      Alert.alert('Cancellation Error', 'Failed to cancel the request. Please try again.');
      setSubmissionStatus('Error: Failed to cancel the request.');
    } else {
      console.log('Baptism Request Cancelled Successfully:', data);
      Alert.alert('Request Cancelled', 'Your baptism inquiry has been withdrawn.');
      setSubmissionStatus('Your baptism inquiry has been withdrawn.');
      setExistingRequest(null);
      setName('');
      setEmail('');
      setPhone('');
      setNotes('');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={[styles.title, { color: tint }]}>
          Baptism at Legacy Ministries
        </ThemedText>
        <ThemedText style={[styles.description, { color: scheme === 'dark' ? '#ccc' : '#555' }]}>
          Baptism symbolizes your commitment to Christ. Fill out the form below to express interest or ask questions.
        </ThemedText>

        {existingRequest ? (
          <>
            <ThemedText
              style={[
                styles.statusMessage,
                { color: submissionStatus?.includes('Error') ? (scheme === 'dark' ? '#f88' : 'red') : (scheme === 'dark' ? '#0f0' : 'green') },
              ]}
            >
              {submissionStatus || 'You have already submitted a baptism inquiry.'}
            </ThemedText>
            {loading ? (
              <ActivityIndicator size="large" color={tint} style={styles.loader} />
            ) : (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: scheme === 'dark' ? '#f88' : 'red' }]}
                onPress={handleCancel}
                accessibilityLabel="Cancel baptism inquiry"
                accessibilityHint="Withdraws your pending baptism inquiry"
              >
                <ThemedText style={styles.buttonText}>Cancel Request</ThemedText>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <TextInput
              placeholder="Full Name *"
              placeholderTextColor={scheme === 'dark' ? '#888' : '#999'}
              value={name}
              onChangeText={setName}
              style={[styles.input, { color: textColor }]}
              accessibilityLabel="Enter your full name"
            />
            <TextInput
              placeholder="Email Address *"
              placeholderTextColor={scheme === 'dark' ? '#888' : '#999'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { color: textColor }]}
              accessibilityLabel="Enter your email address"
            />
            <TextInput
              placeholder="Phone Number (optional)"
              placeholderTextColor={scheme === 'dark' ? '#888' : '#999'}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={[styles.input, { color: textColor }]}
              accessibilityLabel="Enter your phone number (optional)"
            />
            <TextInput
              placeholder="Additional Notes (optional)"
              placeholderTextColor={scheme === 'dark' ? '#888' : '#999'}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              style={[styles.input, { color: textColor, height: 100, textAlignVertical: 'top' }]}
              accessibilityLabel="Enter any additional notes (optional)"
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
                onPress={handleSubmit}
                accessibilityLabel="Submit baptism inquiry"
                accessibilityHint="Submits your baptism inquiry to the church"
              >
                <ThemedText style={styles.buttonText}>Submit Inquiry</ThemedText>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  scrollContent: { paddingBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  description: { fontSize: 16, marginBottom: 16, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  statusMessage: { fontSize: 16, textAlign: 'center', marginBottom: 16 },
  loader: { marginBottom: 16 },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
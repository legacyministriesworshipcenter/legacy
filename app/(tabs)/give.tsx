import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function GiveScreen() {
  console.log('GiveScreen: Rendering');
  const scheme = useColorScheme();
  const tint = Colors[scheme ?? 'light'].tint;
  const bgCard = scheme === 'dark' ? '#1e1e1e' : '#fff';
  const textColor = scheme === 'dark' ? '#fff' : '#000';

  const handlePress = (url: string, platform: string) => {
    // Validate URL is HTTPS
    if (!url.startsWith('https://')) {
      Alert.alert('Error', 'The donation link is not secure. Please contact support.');
      return;
    }

    // User confirmation
    Alert.alert(
      `Donate via ${platform}`,
      `You will be redirected to ${platform} to complete your donation. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              if (Platform.OS === 'web') {
                // On web, use window.open to open in a new tab
                window.open(url, '_blank');
              } else {
                // On native, directly open the URL (assume browser can handle HTTPS)
                await Linking.openURL(url);
              }
            } catch (err) {
              console.log(`Error opening ${platform} URL:`, err);
              Alert.alert('Error', 'An error occurred while opening the link.');
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={[styles.header, { color: tint }]}>
          Support Our Ministry
        </ThemedText>
        <ThemedText style={[styles.subheader, { color: scheme === 'dark' ? '#ccc' : '#555' }]}>
          Your generosity helps us continue our mission. Choose a donation method below.
        </ThemedText>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: bgCard }]}
          onPress={() =>
            handlePress(
              'https://www.paypal.com/donate?token=CclVHg8udv6CeU78NB-k3DhcvgTc7Mii7BXK68x9aLhbnGOLm897Y5L8ojy4KgfLHXBRAjvEwEi4dCO6',
              'PayPal'
            )
          }
          accessibilityLabel="Donate via PayPal"
          accessibilityHint="Opens the PayPal donation page in your browser"
        >
          <Ionicons name="card" size={24} color={tint} style={styles.icon} />
          <ThemedText style={[styles.buttonText, { color: textColor }]}>Donate via PayPal</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: bgCard }]}
          onPress={() =>
            handlePress('https://legacyministries.churchcenter.com/giving', 'Church Center')
          }
          accessibilityLabel="Donate via Church Center"
          accessibilityHint="Opens the Church Center donation page in your browser"
        >
          <Ionicons name="heart" size={24} color={tint} style={styles.icon} />
          <ThemedText style={[styles.buttonText, { color: textColor }]}>Give via Church Center</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, justifyContent: 'center' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subheader: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  icon: { marginRight: 10 },
  buttonText: { fontSize: 16, fontWeight: '600' },
});
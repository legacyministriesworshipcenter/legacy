import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';

export default function BaptismScreen() {
  const scheme = useColorScheme();
  const tint = Colors[scheme ?? 'light'].tint;

  return (
    <View style={[styles.container, { backgroundColor: scheme === 'dark' ? '#151718' : '#f5f5f5' }]}>
      <ThemedText type="title" style={[styles.title, { color: tint }]}>
        Baptism Information
      </ThemedText>
      <ThemedText type="default" style={{ color: scheme === 'dark' ? '#ccc' : '#666' }}>
        This section will include details about baptism services and registration.
      </ThemedText>
      {/* TODO: Add baptism content (e.g., form, info, schedule) */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
});
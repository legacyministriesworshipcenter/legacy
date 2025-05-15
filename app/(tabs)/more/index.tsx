import React from 'react';
import { View, FlatList, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';

const OPTIONS = [
  { label: 'Baptism', route: '/(tabs)/more/baptism' },
  { label: 'Admin Dashboard', route: '/(tabs)/more/admin' },
];

export default function MoreMenuScreen() {
  const scheme = useColorScheme();
  const tint = Colors[scheme ?? 'light'].tint;
  const bgCard = scheme === 'dark' ? '#1e1e1e' : '#fff';

  return (
    <View style={[styles.container, { backgroundColor: scheme === 'dark' ? '#151718' : '#f5f5f5' }]}>
      <FlatList
        data={OPTIONS}
        keyExtractor={item => item.route}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(item.route)}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: pressed ? (scheme === 'dark' ? '#2a2a2a' : '#e0e0e0') : bgCard },
            ]}
          >
            <ThemedText type="default" style={[styles.label, { color: tint }]}>
              {item.label}
            </ThemedText>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  list: { paddingBottom: 16 },
  row: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  label: { fontSize: 16, fontWeight: '600' },
});
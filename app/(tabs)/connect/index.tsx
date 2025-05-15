import React from 'react';
import { View, FlatList, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const LINKS = [
  { title: 'Events', icon: 'calendar', route: '/(tabs)/connect/events' },
  { title: 'Groups', icon: 'people', route: '/(tabs)/connect/groups' },
  { title: 'Prayer', icon: 'heart', route: '/(tabs)/connect/prayer' },
  { title: 'Check-In', icon: 'qr-code', route: '/(tabs)/connect/checkin' },
];

export default function ConnectHome() {
  const scheme = useColorScheme();
  const tint = Colors[scheme ?? 'light'].tint;
  const bgCard = scheme === 'dark' ? '#1e1e1e' : '#fff';

  return (
    <View style={[styles.container, { backgroundColor: scheme === 'dark' ? '#151718' : '#f5f5f5' }]}>
      <ThemedText type="title" style={[styles.title, { color: tint }]}>
        Welcome to Connect
      </ThemedText>
      <FlatList
        data={LINKS}
        keyExtractor={(item) => item.route}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(item.route)}
            style={[styles.card, { backgroundColor: bgCard }]}
          >
            <Ionicons name={item.icon} size={28} color={tint} />
            <ThemedText style={[styles.cardText, { color: tint }]}>{item.title}</ThemedText>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  columnWrapper: { justifyContent: 'space-between' },
  card: {
    flex: 0.48,
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardText: { marginTop: 8, fontSize: 16, fontWeight: '600' },
});
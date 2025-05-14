import { router } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  useWindowDimensions,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';

/* ──────────────────────────────────────────────────────────────
   Quick-link definitions (guide-accurate)
   ──────────────────────────────────────────────────────────── */
const LINKS = [
  { title: 'Give',     icon: 'gift',    route: '/(tabs)/give' },
  { title: 'Prayer',   icon: 'heart',   route: '/connect/prayer' },
  { title: 'Groups',   icon: 'people',  route: '/connect/groups' },
  { title: 'Check-In', icon: 'qr-code', route: '/connect/checkin' },
] as const;
/* ──────────────────────────────────────────────────────────── */

export default function HomeScreen() {
  /* layout + theme helpers */
  const headerHeight = useHeaderHeight();          // ← NEW
  const { width }   = useWindowDimensions();
  const scheme      = useColorScheme();
  const tint        = Colors[scheme ?? 'light'].tint;
  const bgCard      = scheme === 'dark' ? '#1e1e1e' : '#fff';
  const numCols     = width < 600 ? 2 : 4;

  /* simple greeting until the profiles table is ready */
  const user  = supabase.auth.user();
  const greet = user?.email
    ? `Welcome, ${user.email}!`
    : 'Welcome to Legacy Ministries!';

  /* helper actions */
  const planVisit  = () => router.push('/(tabs)/visit');
  const watchLive  = () => router.push('https://youtu.be/YOUR_STREAM');
  const directions = () => router.push('https://maps.app.goo.gl/YOUR_CHURCH_QUERY');

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        /* push content below transparent header on phones */
        contentContainerStyle={{
          paddingTop: headerHeight,        // ← NEW
          paddingHorizontal: 16,
        }}
        ListHeaderComponent={
          <View>
            {/* greeting */}
            <Text style={{ fontSize: 24, fontWeight: '700', color: tint }}>
              {greet}
            </Text>

            {/* Sunday banner */}
            <View
              style={{
                backgroundColor: '#2D68C4',
                borderRadius: 8,
                padding: 16,
                marginTop: 24,
              }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
                This Sunday
              </Text>
              <Text style={{ color: '#fff', marginTop: 4 }}>9:15 AM Service</Text>

              <View style={{ flexDirection: 'row', marginTop: 12 }}>
                <Pressable
                  onPress={watchLive}
                  style={{
                    backgroundColor: '#fff',
                    flex: 1,
                    marginRight: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 10,
                    borderRadius: 6,
                  }}>
                  <Ionicons
                    name="play-circle"
                    size={20}
                    color="#2D68C4"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{ color: '#2D68C4', fontWeight: '600' }}>
                    Watch Live
                  </Text>
                </Pressable>

                <Pressable
                  onPress={directions}
                  style={{
                    borderColor: '#fff',
                    borderWidth: 1,
                    flex: 1,
                    marginLeft: 6,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 10,
                    borderRadius: 6,
                  }}>
                  <Text style={{ color: '#fff', fontWeight: '600' }}>
                    Directions
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Plan-visit card */}
            <Pressable
              onPress={planVisit}
              style={{
                backgroundColor: bgCard,
                borderRadius: 8,
                padding: 16,
                marginTop: 24,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: '#E0EBF5',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                <Ionicons name="map" size={24} color="#2D68C4" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', marginBottom: 4 }}>
                  New to Legacy Ministries?
                </Text>
                <Text style={{ color: '#666' }}>Let us know you’re coming!</Text>
              </View>
            </Pressable>

            <Text
              style={{ fontWeight: '700', fontSize: 18, marginTop: 32, marginBottom: 8 }}>
              Quick Access
            </Text>
          </View>
        }
        data={LINKS}
        key={numCols}
        numColumns={numCols}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(item.route)}
            style={{
              backgroundColor: bgCard,
              borderRadius: 12,
              paddingVertical: 20,
              marginBottom: 16,
              flex: 1 / numCols,
              alignItems: 'center',
              marginHorizontal: 4,
              elevation: 2,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
            }}>
            <Ionicons name={item.icon} size={28} color={tint} />
            <Text style={{ marginTop: 8, fontWeight: '600', color: tint }}>
              {item.title}
            </Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

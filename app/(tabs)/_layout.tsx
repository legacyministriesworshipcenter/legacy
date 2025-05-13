import { Tabs, router } from 'expo-router';
import React from 'react';
import { Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        /* ── header ── */
        headerShown: true,
        headerTitle: '',
        headerTransparent: true,
        headerShadowVisible: false,
        headerRight: () => (
          <Pressable
            hitSlop={8}
            onPress={() => router.push('/profile')}
            style={{ paddingRight: 16 }}
          >
            {/* Ionicons 14.1 glyph that exists on all platforms */}
            <Ionicons name="person-circle" size={26} color="gray" />
          </Pressable>
        ),

        /* ── bottom tab bar ── */
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      }}
    >
      {/* Home ------------------------------------------------------------- */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={28} color={color} />
          ),
        }}
      />

      {/* Connect ---------------------------------------------------------- */}
      <Tabs.Screen
        name="connect"
        options={{
          title: 'Connect',
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={28} color={color} />
          ),
        }}
      />

      {/* Media ------------------------------------------------------------ */}
      <Tabs.Screen
        name="media"
        options={{
          title: 'Media',
          tabBarIcon: ({ color }) => (
            <Ionicons name="play-circle" size={28} color={color} />
          ),
        }}
      />

      {/* Give ------------------------------------------------------------- */}
      <Tabs.Screen
        name="give"
        options={{
          title: 'Give',
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart" size={28} color={color} />
          ),
        }}
      />

      {/* More ------------------------------------------------------------- */}
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => (
            <Ionicons name="menu" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

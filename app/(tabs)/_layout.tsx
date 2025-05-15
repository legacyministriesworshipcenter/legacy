import { Tabs, router } from 'expo-router';
import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerTransparent: true,
        headerShadowVisible: false,
        headerRight: () => (
          <Pressable hitSlop={8} onPress={() => router.push('/profile')} style={{ paddingRight: 16 }}>
            <Ionicons name="person-circle" size={26} color="gray" />
          </Pressable>
        ),
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({ ios: { position: 'absolute' }, default: {} }),
      }}
    >
      {/* VISIBLE */}
      <Tabs.Screen
        name="index"
        options={{ 
          title: 'Home', 
          tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color}/> 
        }}
      />
      <Tabs.Screen
        name="connect"
        options={{ 
          title: 'Connect', 
          tabBarIcon: ({ color }) => <Ionicons name="people" size={28} color={color}/> 
        }}
      />
      <Tabs.Screen
        name="media"
        options={{ 
          title: 'Media', 
          tabBarIcon: ({ color }) => <Ionicons name="play-circle" size={28} color={color}/> 
        }}
      />
      <Tabs.Screen
        name="give"
        options={{ 
          title: 'Give',
          tabBarIcon: ({ color }) => <Ionicons name="heart" size={28} color={color}/>,
          headerTransparent: false,
          headerShadowVisible: true,
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#151718' : '#fff',
          },
          headerTitle: () => (
            <View style={{ alignItems: 'center', paddingBottom: 8 }}>
              <ThemedText type="title" style={{ fontSize: 22, fontWeight: '700' }}>
                Give
              </ThemedText>
            </View>
          ),
          headerTitleAlign: 'center',
        }}
      />
      <Tabs.Screen
        name="more"
        options={{ 
          title: 'More', 
          tabBarIcon: ({ color }) => <Ionicons name="menu" size={28} color={color}/> 
        }}
      />

      {/* HIDDEN VISIT SCREEN */}
      <Tabs.Screen
        name="visit/index"
        options={{
          href: null,
          tabBarItemStyle: { display: 'none' },
          headerShown: true,
          headerTransparent: false,
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#151718' : '#fff',
          },
          headerLeft: () => (
            <Pressable
              hitSlop={8}
              onPress={() => router.back()}
              style={{ paddingLeft: 16 }}
            >
              <Ionicons name="arrow-back" size={26} color="gray" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              hitSlop={8}
              onPress={() => router.push('/profile')}
              style={{ paddingRight: 16 }}
            >
              <Ionicons name="person-circle" size={26} color="gray" />
            </Pressable>
          ),
          headerTitle: () => (
            <View style={{ alignItems: 'center', paddingBottom: 8 }}>
              <ThemedText
                type="title"
                style={{ fontSize: 22, fontWeight: '700' }}
              >
                Plan Your Visit
              </ThemedText>
            </View>
          ),
          headerTitleAlign: 'center',
        }}
      />
    </Tabs>
  );
}
import { Stack, router } from 'expo-router';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function MoreLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: false,
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#151718' : '#fff',
        },
        headerTitle: () => null, // Titles handled by individual screens
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => (
            <View style={{ alignItems: 'center', paddingBottom: 8 }}>
              <ThemedText
                type="title"
                style={{ fontSize: 22, fontWeight: '700' }}
              >
                More
              </ThemedText>
            </View>
          ),
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="baptism"
        options={{
          headerTitle: () => (
            <View style={{ alignItems: 'center', paddingBottom: 8 }}>
              <ThemedText
                type="title"
                style={{ fontSize: 22, fontWeight: '700' }}
              >
                Baptism
              </ThemedText>
            </View>
          ),
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable
              hitSlop={8}
              onPress={() => router.back()}
              style={{ paddingLeft: 16 }}
            >
              <Ionicons name="arrow-back" size={26} color="gray" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="admin"
        options={{
          headerTitle: () => (
            <View style={{ alignItems: 'center', paddingBottom: 8 }}>
              <ThemedText
                type="title"
                style={{ fontSize: 22, fontWeight: '700' }}
              >
                Admin Dashboard
              </ThemedText>
            </View>
          ),
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable
              hitSlop={8}
              onPress={() => router.back()}
              style={{ paddingLeft: 16 }}
            >
              <Ionicons name="arrow-back" size={26} color="gray" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="admin/prayer-requests"
        options={{
          headerTitle: () => (
            <View style={{ alignItems: 'center', paddingBottom: 8 }}>
              <ThemedText
                type="title"
                style={{ fontSize: 22, fontWeight: '700' }}
              >
                Prayer Requests
              </ThemedText>
            </View>
          ),
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable
              hitSlop={8}
              onPress={() => router.back()}
              style={{ paddingLeft: 16 }}
            >
              <Ionicons name="arrow-back" size={26} color="gray" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="admin/group-memberships"
        options={{
          headerTitle: () => (
            <View style={{ alignItems: 'center', paddingBottom: 8 }}>
              <ThemedText
                type="title"
                style={{ fontSize: 22, fontWeight: '700' }}
              >
                Group Memberships
              </ThemedText>
            </View>
          ),
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable
              hitSlop={8}
              onPress={() => router.back()}
              style={{ paddingLeft: 16 }}
            >
              <Ionicons name="arrow-back" size={26} color="gray" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="admin/check-ins"
        options={{
          headerTitle: () => (
            <View style={{ alignItems: 'center', paddingBottom: 8 }}>
              <ThemedText
                type="title"
                style={{ fontSize: 22, fontWeight: '700' }}
              >
                Check-Ins
              </ThemedText>
            </View>
          ),
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable
              hitSlop={8}
              onPress={() => router.back()}
              style={{ paddingLeft: 16 }}
            >
              <Ionicons name="arrow-back" size={26} color="gray" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="admin/events"
        options={{
          headerTitle: () => (
            <View style={{ alignItems: 'center', paddingBottom: 8 }}>
              <ThemedText
                type="title"
                style={{ fontSize: 22, fontWeight: '700' }}
              >
                Events
              </ThemedText>
            </View>
          ),
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable
              hitSlop={8}
              onPress={() => router.back()}
              style={{ paddingLeft: 16 }}
            >
              <Ionicons name="arrow-back" size={26} color="gray" />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
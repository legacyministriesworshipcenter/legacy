import { Stack, router } from 'expo-router';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function ConnectLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: false,
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#151718' : '#fff',
        },
        headerTitle: () => null,
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
                Connect
              </ThemedText>
            </View>
          ),
          headerTitleAlign: 'center',
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="groups"
        options={{
          headerTitle: () => (
            <View style={{ alignItems: 'center', paddingBottom: 8 }}>
              <ThemedText
                type="title"
                style={{ fontSize: 22, fontWeight: '700' }}
              >
                Groups
              </ThemedText>
            </View>
          ),
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable
              hitSlop={8}
              onPress={() => router.push('/(tabs)/connect')}
              style={{ paddingLeft: 16 }}
            >
              <Ionicons name="arrow-back" size={26} color="gray" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="group-detail"
        options={{
          headerTitle: () => (
            <View style={{ alignItems: 'center', paddingBottom: 8 }}>
              <ThemedText
                type="title"
                style={{ fontSize: 22, fontWeight: '700' }}
              >
                Group Details
              </ThemedText>
            </View>
          ),
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable
              hitSlop={8}
              onPress={() => router.push('/(tabs)/connect/groups')}
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
        }}
      />
      <Stack.Screen
        name="prayer"
        options={{
          headerTitle: () => (
            <View style={{ alignItems: 'center', paddingBottom: 8 }}>
              <ThemedText
                type="title"
                style={{ fontSize: 22, fontWeight: '700' }}
              >
                Prayer
              </ThemedText>
            </View>
          ),
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable
              hitSlop={8}
              onPress={() => router.push('/(tabs)/connect')}
              style={{ paddingLeft: 16 }}
            >
              <Ionicons name="arrow-back" size={26} color="gray" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="checkin"
        options={{
          headerTitle: () => (
            <View style={{ alignItems: 'center', paddingBottom: 8 }}>
              <ThemedText
                type="title"
                style={{ fontSize: 22, fontWeight: '700' }}
              >
                Check-In
              </ThemedText>
            </View>
          ),
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="events"
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
        }}
      />
      <Stack.Screen
        name="event-detail"
        options={{
          headerTitle: () => (
            <View style={{ alignItems: 'center', paddingBottom: 8 }}>
              <ThemedText
                type="title"
                style={{ fontSize: 22, fontWeight: '700' }}
              >
                Event Details
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
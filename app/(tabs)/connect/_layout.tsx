import { Stack } from 'expo-router';
import { View } from 'react-native';
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
                Connect
              </ThemedText>
            </View>
          ),
          headerTitleAlign: 'center',
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
    </Stack>
  );
}
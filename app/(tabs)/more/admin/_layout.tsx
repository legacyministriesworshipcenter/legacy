
import { Stack, router } from 'expo-router';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function AdminLayout() {
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
        headerLeft: () => (
          <Pressable
            hitSlop={8}
            onPress={() => router.push('/(tabs)/more')}
            style={{ paddingLeft: 16 }}
          >
            <Ionicons name="arrow-back" size={26} color="gray" />
          </Pressable>
        ),
      }}
    />
  );
}

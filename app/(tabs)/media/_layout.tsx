import { Stack, router } from 'expo-router';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function MediaLayout() {
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
              <ThemedText type="title" style={{ fontSize: 22, fontWeight: '700' }}>
                Media
              </ThemedText>
            </View>
          ),
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="sermon-detail"
        options={{
          headerTitle: () => (
            <View style={{ alignItems: 'center', paddingBottom: 8 }}>
              <ThemedText type="title" style={{ fontSize: 22, fontWeight: '700' }}>
                Sermon Details
              </ThemedText>
            </View>
          ),
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable hitSlop={8} onPress={() => router.back()} style={{ paddingLeft: 16 }}>
              <Ionicons name="arrow-back" size={26} color="gray" />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
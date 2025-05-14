import { Stack } from 'expo-router';

export default function ConnectLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        title: '',           // big title handled by child screens
      }}
    />
  );
}

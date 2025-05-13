import { router } from 'expo-router';
import { View, Button, Text } from 'react-native';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  }

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Text style={{ fontSize:18, marginBottom:24 }}>Profile</Text>
      <Button title="Sign out" onPress={handleLogout} />
    </View>
  );
}

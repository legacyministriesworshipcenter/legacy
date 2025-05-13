import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, TextInput, Button, Text, useColorScheme } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen() {
  const scheme = useColorScheme();
  const tint   = Colors[scheme ?? 'light'].text;

  const [email, setEmail]   = useState('');
  const [password, setPass] = useState('');
  const [busy,    setBusy]  = useState(false);
  const [error,   setErr]   = useState<string | null>(null);

  const valid = EMAIL_REGEX.test(email.trim()) && password.trim().length >= 8;

  async function handleSignup() {
    if (!valid) return;
    setBusy(true); setErr(null);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) { console.log(error); setErr(error.message); }
    else       { router.replace('/'); }      // auto-login if confirmations off
    setBusy(false);
  }

  const inputStyle = {
    borderWidth:1, borderColor:tint, color:tint,
    padding:8, marginBottom:12,
  } as const;

  return (
    <View style={{ flex:1, justifyContent:'center', padding:24 }}>
      {error && <Text style={{ color:'red', marginBottom:16 }}>{error}</Text>}

      <TextInput
        placeholder="Email"
        placeholderTextColor={tint}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={inputStyle}
      />
      <TextInput
        placeholder="Password (≥ 8 chars)"
        placeholderTextColor={tint}
        value={password}
        onChangeText={setPass}
        secureTextEntry
        style={inputStyle}
      />

      <Button title={busy ? '...' : 'Create Account'}
              onPress={handleSignup}
              disabled={busy || !valid} />

      <Button title="I already have an account"
              onPress={() => router.back()} />
    </View>
  );
}

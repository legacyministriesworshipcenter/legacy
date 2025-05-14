import React, { useMemo, useState } from 'react';
import { View, Text, Button, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import dayjs from 'dayjs';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import ThemedTextInput from '@/components/ui/ThemedTextInput';

function getNextSixSundays(): string[] {
  const dates: string[] = [];
  let d = dayjs();
  while (d.day() !== 0) d = d.add(1, 'day');
  for (let i = 0; i < 6; i++) dates.push(d.add(i, 'week').format('YYYY-MM-DD'));
  return dates;
}

export default function PlanVisitScreen() {
  const scheme = useColorScheme();
  const tint   = Colors[scheme ?? 'light'].tint;

  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date,  setDate]  = useState<string>();
  const [kids,  setKids]  = useState<'yes' | 'no' | undefined>();
  const sundayOptions = useMemo(getNextSixSundays, []);

  async function handleSubmit() {
    if (!name || !email || !date) {
      Alert.alert('Missing info', 'Please complete all required fields.');
      return;
    }
    Alert.alert('Thanks!', `We’ll be ready for you on ${date}, ${name}!`);
    router.back();
  }

  return (
    <View style={{ flex: 1, padding: 24, gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', color: tint }}>
        Plan Your Visit
      </Text>

      <ThemedTextInput placeholder="Name*" value={name} onChangeText={setName} />
      <ThemedTextInput
        placeholder="Email*"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <ThemedTextInput
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={{ color: tint, fontWeight: '600' }}>Select a Sunday*</Text>
      <Picker
        selectedValue={date}
        onValueChange={setDate}
        style={{ color: tint }}
        itemStyle={Platform.OS === 'ios' ? { color: tint } : undefined}
      >
        <Picker.Item label="— choose a date —" value={undefined} />
        {sundayOptions.map((d) => (
          <Picker.Item key={d} label={d} value={d} />
        ))}
      </Picker>

      <Text style={{ color: tint, fontWeight: '600' }}>Bringing kids?*</Text>
      <Picker
        selectedValue={kids}
        onValueChange={(v) => setKids(v as any)}
        style={{ color: tint }}
        itemStyle={Platform.OS === 'ios' ? { color: tint } : undefined}
      >
        <Picker.Item label="— select —" value={undefined} />
        <Picker.Item label="Yes" value="yes" />
        <Picker.Item label="No" value="no" />
      </Picker>

      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}

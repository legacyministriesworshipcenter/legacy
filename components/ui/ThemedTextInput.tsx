import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ThemedTextInput(props: TextInputProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <TextInput
      placeholderTextColor={isDark ? '#888' : '#999'}
      style={[
        {
          borderWidth: 1,
          borderRadius: 6,
          padding: 10,
          color: isDark ? '#fff' : '#000',
          backgroundColor: isDark ? '#222' : '#fff',
        },
        props.style,               // allow overrides
      ]}
      {...props}
    />
  );
}

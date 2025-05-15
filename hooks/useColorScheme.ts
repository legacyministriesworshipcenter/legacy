import { useColorScheme as useRNColorScheme } from 'react-native';
import { useEffect, useState } from 'react';

// Unified useColorScheme hook for all platforms
export function useColorScheme() {
  const colorScheme = useRNColorScheme();
  const [isWebHydrated, setIsWebHydrated] = useState(false);
  const isWeb = typeof window !== 'undefined';

  useEffect(() => {
    if (isWeb) {
      setIsWebHydrated(true);
    }
  }, [isWeb]);

  // On web, return 'light' until hydrated; on native, return system colorScheme directly
  return isWeb ? (isWebHydrated ? colorScheme : 'light') : colorScheme;
}
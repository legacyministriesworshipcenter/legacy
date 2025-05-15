import { useColorScheme as useRNColorScheme } from 'react-native';
import { useEffect, useState } from 'react';

// Unified useColorScheme hook for all platforms
export function useColorScheme() {
  const colorScheme = useRNColorScheme();
  const isWeb = typeof window !== 'undefined';

  // Only apply web hydration logic on web platforms
  if (isWeb) {
    const [isWebHydrated, setIsWebHydrated] = useState(false);

    useEffect(() => {
      setIsWebHydrated(true);
    }, []);

    return isWebHydrated ? colorScheme : 'light';
  }

  // Native platforms use react-native's useColorScheme directly
  return colorScheme;
}
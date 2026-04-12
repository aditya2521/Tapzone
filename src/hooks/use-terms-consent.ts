import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEYS = {
  TERMS_ACCEPTED: 'tapzone_terms_accepted_v1',
};

export const useTermsConsent = () => {
  const [hasAccepted, setHasAccepted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const loadConsent = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.TERMS_ACCEPTED);
      setHasAccepted(stored === 'true');
    } catch (e) {
      console.warn('Failed to load terms consent', e);
      setHasAccepted(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptTerms = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TERMS_ACCEPTED, 'true');
      setHasAccepted(true);
      return true;
    } catch (e) {
      console.warn('Failed to save terms consent', e);
      return false;
    }
  }, []);

  useEffect(() => {
    loadConsent();
  }, [loadConsent]);

  return {
    hasAccepted,
    loading,
    acceptTerms,
    refresh: loadConsent,
  };
};

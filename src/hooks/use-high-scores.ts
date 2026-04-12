import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEYS = {
  HIGH_SCORES: 'tapzone_high_scores',
};

// Global memory cache for session-based persistence if native module fails
let memoryScores: HighScores = {};

export interface HighScores {
  [gameId: string]: number;
}

export const useHighScores = () => {
  const [scores, setScores] = useState<HighScores>(memoryScores);
  const [loading, setLoading] = useState(true);

  // Helper to safely access AsyncStorage
  const isStorageAvailable = !!AsyncStorage;

  const loadScores = useCallback(async () => {
    try {
      if (isStorageAvailable) {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
        if (stored) {
          const parsed = JSON.parse(stored);
          setScores(parsed);
          memoryScores = parsed;
        }
      }
    } catch (e) {
      console.warn('AsyncStorage missing or failing, using memory fallback.', e);
    } finally {
      setLoading(false);
    }
  }, [isStorageAvailable]);

  const getHighScore = useCallback((gameId: string) => {
    return scores[gameId] || 0;
  }, [scores]);

  const updateHighScore = useCallback(async (gameId: string, newScore: number) => {
    const currentBest = scores[gameId] || 0;
    if (newScore > currentBest) {
      const newScores = { ...scores, [gameId]: newScore };
      setScores(newScores);
      memoryScores = newScores;
      
      try {
        if (isStorageAvailable) {
          await AsyncStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(newScores));
          return true; // New record
        }
      } catch (e) {
        console.warn('Failed to persist high score to disk', e);
      }
    }
    return false;
  }, [scores, isStorageAvailable]);

  useEffect(() => {
    loadScores();
  }, [loadScores]);

  return {
    scores,
    loading,
    getHighScore,
    updateHighScore,
    refresh: loadScores,
  };
};

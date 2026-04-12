import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions } from 'react-native';
import { useGameSounds } from './use-game-sounds';

const { width, height } = Dimensions.get('window');

// Game Constants
const BUBBLE_MIN_SIZE = 40;
const BUBBLE_MAX_SIZE = 120;
const SPAWN_INTERVAL_INITIAL = 1200;
const GROWTH_TIME_INITIAL = 4000;
const MAX_BUBBLES = 15;

export type BubbleType = 'normal' | 'multi' | 'powerup';

export interface Bubble {
  id: string;
  x: number;
  y: number;
  size: number;
  type: BubbleType;
  tapsRequired: number;
  tapsRemaining: number;
  growthTime: number;
  color: string;
}

export const useZenPop = () => {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const { playSound } = useGameSounds();

  const gameActive = useRef(true);
  const difficultyRef = useRef(1);
  const spawnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const spawnBubble = useCallback(() => {
    if (!gameActive.current) return;

    const id = Math.random().toString(36).substring(7);
    const type: BubbleType = Math.random() > 0.9 ? 'powerup' : Math.random() > 0.8 ? 'multi' : 'normal';

    // Random position within safe area
    const x = Math.random() * (width - BUBBLE_MAX_SIZE) + BUBBLE_MAX_SIZE / 2;
    const y = Math.random() * (height - 300) + 150; // Keep away from header/footer

    const newBubble: Bubble = {
      id,
      x,
      y,
      size: BUBBLE_MIN_SIZE,
      type,
      tapsRequired: type === 'multi' ? 3 : 1,
      tapsRemaining: type === 'multi' ? 3 : 1,
      growthTime: GROWTH_TIME_INITIAL / difficultyRef.current,
      color: type === 'powerup' ? '#F59E0B' : type === 'multi' ? '#8B5CF6' : '#06B6D4',
    };

    setBubbles(prev => [...prev.slice(-(MAX_BUBBLES - 1)), newBubble]);

    // Schedule next spawn
    const nextSpawnTime = Math.max(400, SPAWN_INTERVAL_INITIAL / Math.sqrt(difficultyRef.current));
    spawnTimer.current = setTimeout(spawnBubble, nextSpawnTime);

    // Increase difficulty slowly
    difficultyRef.current += 0.01;
  }, []);

  const handlePop = useCallback((id: string, missed = false) => {
    if (missed && gameActive.current) {
      // Game Over if bubble reached max size
      gameActive.current = false;
      setIsGameOver(true);
      if (spawnTimer.current) clearTimeout(spawnTimer.current);
      playSound('FAILURE');
      return;
    }

    setBubbles(prev => {
      const bubble = prev.find(b => b.id === id);
      if (!bubble) return prev;

      if (bubble.tapsRemaining > 1) {
        // Just one tap done, still more to go
        playSound('TAP');
        return prev.map(b => b.id === id ? { ...b, tapsRemaining: b.tapsRemaining - 1 } : b);
      }

      // Fully popped
      playSound('BUBBLE');
      setScore(s => s + (bubble.type === 'multi' ? 50 : 10) * (combo + 1));
      setCombo(c => c + 1);

      // Handle powerup
      if (bubble.type === 'powerup') {
        // Slow down time/difficulty temporarily
        difficultyRef.current = Math.max(1, difficultyRef.current - 0.5);
      }

      return prev.filter(b => b.id !== id);
    });
  }, [combo, playSound]);

  const startGame = useCallback(() => {
    setScore(0);
    setCombo(0);
    setIsGameOver(false);
    setBubbles([]);
    gameActive.current = true;
    difficultyRef.current = 1;
    if (spawnTimer.current) clearTimeout(spawnTimer.current);
    spawnBubble();
  }, [spawnBubble]);

  const resetCombo = useCallback(() => {
    setCombo(0);
  }, []);

  useEffect(() => {
    startGame();
    return () => {
      if (spawnTimer.current) clearTimeout(spawnTimer.current);
    };
  }, [startGame]);

  return {
    score,
    combo,
    isGameOver,
    bubbles,
    handlePop,
    startGame,
    resetCombo,
  };
};

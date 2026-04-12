import { useState, useCallback, useRef, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHighScores } from './use-high-scores';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_ID = 'whack-a-glow';
const INITIAL_SPAWN_SPEED = 1200;
const MIN_SPAWN_SPEED = 400;
const INITIAL_ORB_LIFETIME = 1500;
const MIN_ORB_LIFETIME = 600;
const MAX_LIVES = 3;

export interface Orb {
  id: string;
  x: number;
  y: number;
  size: number;
  createdAt: number;
  isTrap?: boolean;
}

export const useWhackAGlow = () => {
  const { getHighScore, updateHighScore } = useHighScores();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const spawnTimerRef = useRef<any>(null);
  const checkTimerRef = useRef<any>(null);
  const spawnSpeedRef = useRef(INITIAL_SPAWN_SPEED);
  const orbLifetimeRef = useRef(INITIAL_ORB_LIFETIME);

  // Use refs for control flow to avoid stale closures in the loop
  const isActiveRef = useRef(false);
  const gameOverRef = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    setHighScore(getHighScore(GAME_ID));
  }, [getHighScore]);

  // Keep refs in sync
  useEffect(() => {
    isActiveRef.current = isActive;
    gameOverRef.current = gameOver;
    scoreRef.current = score;
  }, [isActive, gameOver, score]);

  const spawnOrb = useCallback(() => {
    if (!isActiveRef.current || gameOverRef.current) return;

    // Difficulty scaling: Orbs get smaller
    const sizeReduction = Math.min(25, Math.floor(scoreRef.current / 10) * 5);
    const minSize = 60 - sizeReduction;
    const maxSize = 100 - sizeReduction;
    
    const size = Math.random() * (maxSize - minSize) + minSize;
    const x = Math.random() * (SCREEN_WIDTH - size - 40) + 20;
    const y = Math.random() * (SCREEN_HEIGHT - size - 300) + 150;

    // Super Hard Mode: Shadow Orbs (traps) after score 10
    const isTrap = scoreRef.current >= 10 && Math.random() < 0.15;

    const newOrb: Orb = {
      id: Math.random().toString(),
      x,
      y,
      size,
      createdAt: Date.now(),
      isTrap,
    };

    setOrbs(prev => [...prev, newOrb]);

    // Increase difficulty
    spawnSpeedRef.current = Math.max(MIN_SPAWN_SPEED, INITIAL_SPAWN_SPEED - scoreRef.current * 18);
    orbLifetimeRef.current = Math.max(MIN_ORB_LIFETIME, INITIAL_ORB_LIFETIME - scoreRef.current * 12);

    // Schedule next spawn
    spawnTimerRef.current = setTimeout(spawnOrb, spawnSpeedRef.current);
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setLives(MAX_LIVES);
    setOrbs([]);
    setIsActive(true);
    setGameOver(false);
    isActiveRef.current = true;
    gameOverRef.current = false;
    spawnSpeedRef.current = INITIAL_SPAWN_SPEED;
    orbLifetimeRef.current = INITIAL_ORB_LIFETIME;

    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    spawnTimerRef.current = setTimeout(spawnOrb, 500);
  }, [spawnOrb]);

  const handleWhack = useCallback((orbId: string) => {
    if (gameOverRef.current) return;
    
    setOrbs(prev => {
      const orb = prev.find(o => o.id === orbId);
      if (orb?.isTrap) {
        // Penalty for tapping a trap
        setLives(l => {
          const nextL = l - 1;
          if (nextL <= 0) {
            setGameOver(true);
            setIsActive(false);
          }
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          return Math.max(0, nextL);
        });
      } else {
        setScore(s => s + 1);
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }
      return prev.filter(o => o.id !== orbId);
    });
  }, []);

  // Check for expired orbs (misses)
  useEffect(() => {
    if (!isActive || gameOver) {
      if (checkTimerRef.current) clearInterval(checkTimerRef.current);
      return;
    }

    checkTimerRef.current = setInterval(() => {
      const now = Date.now();
      setOrbs(prev => {
        const expired = prev.filter(o => now - o.createdAt > orbLifetimeRef.current);
        if (expired.length > 0) {
          setLives(l => {
            const nextL = l - expired.length;
            if (nextL <= 0) {
              setGameOver(true);
              setIsActive(false);
              return 0;
            }
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            return nextL;
          });
          return prev.filter(o => now - o.createdAt <= orbLifetimeRef.current);
        }
        return prev;
      });
    }, 100);

    return () => {
      if (checkTimerRef.current) clearInterval(checkTimerRef.current);
    };
  }, [isActive, gameOver]);

  useEffect(() => {
    if (gameOver) {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
      if (score > highScore) {
        setHighScore(score);
        updateHighScore(GAME_ID, score);
      }
    }
  }, [gameOver, score, highScore, updateHighScore]);

  useEffect(() => {
    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
      if (checkTimerRef.current) clearInterval(checkTimerRef.current);
    };
  }, []);

  return {
    score,
    highScore,
    lives,
    orbs,
    orbLifetime: orbLifetimeRef.current,
    isActive,
    gameOver,
    handleWhack,
    startGame,
  };
};

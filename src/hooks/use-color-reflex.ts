import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHighScores } from './use-high-scores';

const GAME_ID = 'color-reflex';
const COLORS = [
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F43F5E', // Rose
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
];

const INITIAL_SPEED = 1000;
const MIN_SPEED = 400;
const LIVES = 3;

export const useColorReflex = () => {
  const { getHighScore, updateHighScore } = useHighScores();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [targetColor, setTargetColor] = useState(COLORS[0]);
  const [currentColor, setCurrentColor] = useState(COLORS[1]);
  const [isActive, setIsActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const speedRef = useRef(INITIAL_SPEED);
  const timerRef = useRef<any>(null);
  const targetShiftTimerRef = useRef<any>(null);
  
  // Use refs for control flow to avoid stale closures in the loop
  const isActiveRef = useRef(false);
  const gameOverRef = useRef(false);
  const targetColorRef = useRef(COLORS[0]);
  const scoreRef = useRef(0);

  useEffect(() => {
    setHighScore(getHighScore(GAME_ID));
  }, [getHighScore]);

  // Keep refs in sync
  useEffect(() => {
    isActiveRef.current = isActive;
    gameOverRef.current = gameOver;
    targetColorRef.current = targetColor;
    scoreRef.current = score;
  }, [isActive, gameOver, targetColor, score]);

  // Super Hard Mode: Shifting Target logic
  useEffect(() => {
    if (!isActive || gameOver || score < 10) {
      if (targetShiftTimerRef.current) clearInterval(targetShiftTimerRef.current);
      return;
    }

    const startShifting = () => {
      targetShiftTimerRef.current = setInterval(() => {
        const nextTarget = COLORS[Math.floor(Math.random() * COLORS.length)];
        setTargetColor(nextTarget);
        targetColorRef.current = nextTarget;
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }, 4000); // Change target every 4 seconds
    };

    startShifting();

    return () => {
      if (targetShiftTimerRef.current) clearInterval(targetShiftTimerRef.current);
    };
  }, [isActive, gameOver, score >= 10]);

  const cycleColor = useCallback(() => {
    if (!isActiveRef.current || gameOverRef.current) return;

    setCurrentColor(prev => {
      // Logic to decide when to show the match
      const shouldMatch = Math.random() < 0.3; // 30% chance for match
      if (shouldMatch) {
        return targetColorRef.current;
      }
      
      let nextColor;
      do {
        nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      } while (nextColor === targetColorRef.current);
      return nextColor;
    });

    // Schedule next cycle
    speedRef.current = Math.max(MIN_SPEED, INITIAL_SPEED - scoreRef.current * 10);
    timerRef.current = setTimeout(cycleColor, speedRef.current);
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setLives(LIVES);
    setIsActive(true);
    setGameOver(false);
    isActiveRef.current = true;
    gameOverRef.current = false;
    speedRef.current = INITIAL_SPEED;
    
    const initialTarget = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(initialTarget);
    targetColorRef.current = initialTarget;
    
    // Ensure initial current color isn't the target
    let initialCurrent;
    do {
      initialCurrent = COLORS[Math.floor(Math.random() * COLORS.length)];
    } while (initialCurrent === initialTarget);
    setCurrentColor(initialCurrent);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(cycleColor, speedRef.current);
  }, [cycleColor]);

  const handleTap = useCallback(() => {
    if (gameOver || !isActive) return;

    if (currentColor === targetColor) {
      setScore(s => s + 1);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Change target color after every correct match for better dynamics
      const nextTarget = COLORS[Math.floor(Math.random() * COLORS.length)];
      setTargetColor(nextTarget);
      targetColorRef.current = nextTarget;
    } else {
      setLives(l => {
        const nextL = l - 1;
        if (nextL <= 0) {
          setGameOver(true);
          setIsActive(false);
          return 0;
        }
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        return nextL;
      });
    }
  }, [currentColor, targetColor, gameOver, isActive, score]);

  useEffect(() => {
    if (gameOver) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (score > highScore) {
        setHighScore(score);
        updateHighScore(GAME_ID, score);
      }
    }
  }, [gameOver, score, highScore, updateHighScore]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    score,
    highScore,
    lives,
    targetColor,
    currentColor,
    isActive,
    gameOver,
    handleTap,
    startGame,
  };
};

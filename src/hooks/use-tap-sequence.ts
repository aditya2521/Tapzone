import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHighScores } from './use-high-scores';

const GAME_ID = 'tap-sequence';
const GRID_SIZE = 5; // 5x5 for 25 numbers
const MAX_NUM = GRID_SIZE * GRID_SIZE;
const SCORE_OFFSET = 100000; // Offset for high score (higher is better)

export const useTapSequence = () => {
  const { getHighScore, updateHighScore } = useHighScores();
  const [numbers, setNumbers] = useState<number[]>([]);
  const [nextNum, setNextNum] = useState(1);
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // High score inverted storage check
    const rawBest = getHighScore(GAME_ID);
    if (rawBest > 0) {
      setHighScore((SCORE_OFFSET - rawBest) / 1000);
    } else {
      setHighScore(0);
    }
  }, [getHighScore]);

  const generateGrid = useCallback(() => {
    const arr = Array.from({ length: MAX_NUM }, (_, i) => i + 1);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setNumbers(arr);
  }, []);

  const startGame = useCallback(() => {
    generateGrid();
    setNextNum(1);
    setTime(0);
    setIsActive(true);
    setGameOver(false);
    startTimeRef.current = Date.now();
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTime((Date.now() - startTimeRef.current) / 1000);
    }, 100);
  }, [generateGrid]);

  const handleTap = useCallback((num: number) => {
    if (!isActive || gameOver) return;

    if (num === nextNum) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      if (num === MAX_NUM) {
        // Game Finished
        if (timerRef.current) clearInterval(timerRef.current);
        const finalTime = (Date.now() - startTimeRef.current) / 1000;
        setTime(finalTime);
        setIsActive(false);
        setGameOver(true);
        
        // Update high score (Inverted)
        const finalTimeMs = Math.round(finalTime * 1000);
        const invertedScore = SCORE_OFFSET - finalTimeMs;
        updateHighScore(GAME_ID, invertedScore);
        
        const currentBestMs = highScore * 1000;
        if (currentBestMs === 0 || finalTime < highScore) {
          setHighScore(finalTime);
        }
      } else {
        setNextNum(n => n + 1);
        
        // Difficulty Scaling: Shuffle chance after score 5
        if (nextNum >= 5) {
          const shuffleChance = Math.min(0.4, (nextNum * 0.02)); // Up to 40% chance
          if (Math.random() < shuffleChance) {
             // Shuffle the grid!
             generateGrid();
          }
        }
      }
    } else {
      // Penalty or just ignore? Let's add a small time penalty
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      startTimeRef.current -= 500; // 0.5s penalty
    }
  }, [isActive, gameOver, nextNum, highScore, updateHighScore]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    numbers,
    nextNum,
    time,
    isActive,
    gameOver,
    highScore,
    handleTap,
    startGame,
  };
};

import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHighScores } from './use-high-scores';

const GAME_ID = 'tap-frenzy';
const GAME_DURATION = 10000; // 10 seconds

export const useTapFrenzy = () => {
  const { getHighScore, updateHighScore } = useHighScores();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION / 1000);
  const [isActive, setIsActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [tps, setTps] = useState(0); // Taps per second

  const timerRef = useRef<any>(null);
  const lastTapTime = useRef<number>(0);
  const tapCounts = useRef<number[]>([]);

  useEffect(() => {
    setHighScore(getHighScore(GAME_ID));
  }, [getHighScore]);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_DURATION / 1000);
    setIsActive(true);
    setGameOver(false);
    setTps(0);
    tapCounts.current = [];
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, (GAME_DURATION - elapsed) / 1000);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsActive(false);
        setGameOver(true);
      }
    }, 100);
  }, []);

  const handleTap = useCallback(() => {
    if (gameOver) return;
    
    if (!isActive) {
      startGame();
    }

    const now = Date.now();
    setScore(s => s + 1);
    
    // Calculate TPS based on last 1 second of taps
    tapCounts.current.push(now);
    const oneSecondAgo = now - 1000;
    tapCounts.current = tapCounts.current.filter(t => t > oneSecondAgo);
    setTps(tapCounts.current.length);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [isActive, gameOver, startGame]);

  // Difficulty scaling: target shrinks as score increases
  const difficultyScale = Math.max(0.6, 1 - (score / 200));
  // Jitter: target moves slightly after score 20
  const jitterOffset = score > 20 ? Math.min(15, (score - 20) / 5) : 0;

  useEffect(() => {
    if (gameOver) {
      if (score > highScore) {
        setHighScore(score);
        updateHighScore(GAME_ID, score);
      }
    }
  }, [gameOver, score, highScore, updateHighScore]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    score,
    highScore,
    timeLeft,
    isActive,
    gameOver,
    tps,
    difficultyScale,
    jitterOffset,
    handleTap,
    startGame,
  };
};

import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Platform } from 'react-native';
import { cancelAnimation, Easing, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useHighScores } from './use-high-scores';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const INITIAL_WIDTH = SCREEN_WIDTH * 0.6;
const BLOCK_HEIGHT = 40;
const PERFECT_TOLERANCE = 5;
const GAME_ID = 'stack-game';

export interface PlatformData {
  id: string;
  x: number;
  y: number;
  width: number;
  color: string;
}

const COLORS = ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

export const useStackGame = () => {
  const { getHighScore, updateHighScore } = useHighScores();
  const [platforms, setPlatforms] = useState<PlatformData[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const activeX = useSharedValue(0);
  const activeWidth = useRef(INITIAL_WIDTH);
  const lastX = useRef((SCREEN_WIDTH - INITIAL_WIDTH) / 2);

  const currentLevel = useRef(0);

  // Initialize high score from persistence
  useEffect(() => {
    setHighScore(getHighScore(GAME_ID));
  }, [getHighScore]);

  const spawnPlatform = useCallback(() => {
    const nextColor = COLORS[currentLevel.current % COLORS.length];

    // Reset animation with increasing speed
    const duration = Math.max(1000, 2500 - (score * 50));

    activeX.value = -activeWidth.current;
    activeX.value = withRepeat(
      withTiming(SCREEN_WIDTH, {
        duration,
        easing: Easing.linear
      }),
      -1,
      true
    );
  }, [score, activeX]);

  const startGame = useCallback(() => {
    const initialPlatform = {
      id: Math.random().toString(),
      x: (SCREEN_WIDTH - INITIAL_WIDTH) / 2,
      y: 0,
      width: INITIAL_WIDTH,
      color: COLORS[0],
    };

    setPlatforms([initialPlatform]);
    setScore(0);
    setGameOver(false);
    activeWidth.current = INITIAL_WIDTH;
    lastX.current = initialPlatform.x;
    currentLevel.current = 1;

    spawnPlatform();
  }, [spawnPlatform]);

  const dropBlock = useCallback(() => {
    if (gameOver) return;

    cancelAnimation(activeX);
    const x = activeX.value;
    const diff = x - lastX.current;

    if (Math.abs(diff) < PERFECT_TOLERANCE) {
      // Perfect alignment!
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const newPlatform = {
        id: Math.random().toString(),
        x: lastX.current,
        y: currentLevel.current * BLOCK_HEIGHT,
        width: activeWidth.current,
        color: COLORS[currentLevel.current % COLORS.length],
      };

      setPlatforms(prev => [...prev, newPlatform]);
      setScore(s => s + 1);
      currentLevel.current += 1;
      spawnPlatform();
    } else {
      const overlap = activeWidth.current - Math.abs(diff);

      if (overlap <= 0) {
        // Miss! Game Over
        setGameOver(true);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        // Persist high score
        if (score > highScore) {
          setHighScore(score);
          updateHighScore(GAME_ID, score);
        }
      } else {
        // Cut the block
        const newWidth = overlap;
        const newX = diff > 0 ? x : lastX.current;

        const newPlatform = {
          id: Math.random().toString(),
          x: newX,
          y: currentLevel.current * BLOCK_HEIGHT,
          width: newWidth,
          color: COLORS[currentLevel.current % COLORS.length],
        };

        activeWidth.current = newWidth;
        lastX.current = newX;
        setPlatforms(prev => [...prev, newPlatform]);
        setScore(s => s + 1);
        currentLevel.current += 1;

        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        spawnPlatform();
      }
    }
  }, [gameOver, score, highScore, spawnPlatform, activeX]);

  useEffect(() => {
    startGame();
  }, []);

  return {
    platforms,
    score,
    highScore,
    gameOver,
    activeX,
    activeWidth: activeWidth.current,
    currentLevel: currentLevel.current,
    dropBlock,
    startGame,
  };
};

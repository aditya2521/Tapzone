import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHighScores } from './use-high-scores';

const GAME_ID = 'pattern-lock';
const GRID_SIZE = 4;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;
const MEMORY_TIME = 2000;

export const usePatternLock = () => {
  const { getHighScore, updateHighScore } = useHighScores();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userSelection, setUserSelection] = useState<number[]>([]);
  const [isShowing, setIsShowing] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    setHighScore(getHighScore(GAME_ID));
  }, [getHighScore]);

  const generatePattern = useCallback((currentScore: number) => {
    const numTiles = Math.min(TOTAL_TILES - 2, 3 + Math.floor(currentScore / 2));
    const newPattern: number[] = [];
    while (newPattern.length < numTiles) {
      const idx = Math.floor(Math.random() * TOTAL_TILES);
      if (!newPattern.includes(idx)) {
        newPattern.push(idx);
      }
    }
    setPattern(newPattern);
    setUserSelection([]);
    setIsShowing(true);
    
    // Scale memory time: tighter windows as score increases
    const memoryTime = Math.max(600, 2000 - (Math.floor(currentScore / 2) * 200));

    setTimeout(() => {
      setIsShowing(false);
    }, memoryTime);
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setIsActive(true);
    generatePattern(0);
  }, [generatePattern]);

  const handleTilePress = useCallback((idx: number) => {
    if (isShowing || gameOver || !isActive) return;
    if (userSelection.includes(idx)) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (pattern.includes(idx)) {
      const newSelection = [...userSelection, idx];
      setUserSelection(newSelection);
      
      if (newSelection.length === pattern.length) {
        // Level Complete
        setScore(s => s + 1);
        setTimeout(() => {
          generatePattern(score + 1);
        }, 800);
      }
    } else {
      // Wrong Tile
      setGameOver(true);
      setIsActive(false);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [isShowing, gameOver, isActive, userSelection, pattern, score, generatePattern]);

  useEffect(() => {
    if (gameOver) {
      if (score > highScore) {
        setHighScore(score);
        updateHighScore(GAME_ID, score);
      }
    }
  }, [gameOver, score, highScore, updateHighScore]);

  return {
    score,
    highScore,
    pattern,
    userSelection,
    isShowing,
    isActive,
    gameOver,
    handleTilePress,
    startGame,
  };
};

import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHighScores } from './use-high-scores';

const GAME_ID = 'simon-glow';
const NUM_PADS = 4;

export const useSimonGlow = () => {
  const { getHighScore, updateHighScore } = useHighScores();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setHighScore(getHighScore(GAME_ID));
  }, [getHighScore]);

  const showSequence = useCallback(async (newSequence: number[]) => {
    setIsShowingSequence(true);
    
    // Scale playback speed: faster as score increases
    // Starts accelerating after score 3
    const speedFactor = Math.max(0.4, 1 - (Math.max(0, score - 3) * 0.1));
    const pulseDuration = 600 * speedFactor;
    const pulseDelay = 200 * speedFactor;

    for (let i = 0; i < newSequence.length; i++) {
      setActivePad(newSequence[i]);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      await new Promise(resolve => setTimeout(resolve, pulseDuration));
      setActivePad(null);
      await new Promise(resolve => setTimeout(resolve, pulseDelay));
    }
    setIsShowingSequence(false);
  }, [score]);

  const startNextRound = useCallback((currentSequence: number[]) => {
    const nextPad = Math.floor(Math.random() * NUM_PADS);
    const newSequence = [...currentSequence, nextPad];
    setSequence(newSequence);
    setUserSequence([]);
    setTimeout(() => showSequence(newSequence), 500);
  }, [showSequence]);

  const startGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setIsActive(true);
    const firstPad = Math.floor(Math.random() * NUM_PADS);
    setSequence([firstPad]);
    setUserSequence([]);
    setTimeout(() => showSequence([firstPad]), 500);
  }, [showSequence]);

  const handlePadPress = useCallback((padIndex: number) => {
    if (isShowingSequence || gameOver || !isActive) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const newUserSequence = [...userSequence, padIndex];
    setUserSequence(newUserSequence);

    // Check correctness
    const currentIdx = newUserSequence.length - 1;
    if (newUserSequence[currentIdx] !== sequence[currentIdx]) {
      setGameOver(true);
      setIsActive(false);
      return;
    }

    // Check if round complete
    if (newUserSequence.length === sequence.length) {
      setScore(s => s + 1);
      setTimeout(() => startNextRound(sequence), 800);
    }
  }, [isShowingSequence, gameOver, isActive, userSequence, sequence, startNextRound]);

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
    activePad,
    isShowingSequence,
    gameOver,
    isActive,
    handlePadPress,
    startGame,
  };
};

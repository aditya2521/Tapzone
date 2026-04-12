import { useState, useCallback, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useHighScores } from './use-high-scores';

export interface Level {
  id: number;
  size: number;
  clues: { x: number; y: number; value: number }[];
}

export interface Patch {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const COLORS = ['#06B6D4', '#F43F5E', '#10B981', '#F59E0B', '#8B5CF6'];

// Utility to generate a random Shikaku puzzle
const generateLevel = (id: number, size: number): Level => {
  const clues: { x: number; y: number; value: number }[] = [];
  const mask = Array.from({ length: size }, () => Array(size).fill(false));

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (mask[y][x]) continue;

      // Try to find a random rectangle starting here
      let maxW = 0;
      while (x + maxW < size && !mask[y][x + maxW]) maxW++;
      
      const w = Math.floor(Math.random() * Math.min(maxW, 3)) + 1;
      
      let maxH = 0;
      let possibleH = true;
      while (y + maxH < size && possibleH) {
        for (let ix = x; ix < x + w; ix++) {
          if (mask[y + maxH][ix]) {
            possibleH = false;
            break;
          }
        }
        if (possibleH) maxH++;
      }

      const h = Math.floor(Math.random() * Math.min(maxH, 3)) + 1;

      // Mark as used
      for (let iy = y; iy < y + h; iy++) {
        for (let ix = x; ix < x + w; ix++) {
          mask[iy][ix] = true;
        }
      }

      // Pick a random clue position inside the rectangle
      const clueX = x + Math.floor(Math.random() * w);
      const clueY = y + Math.floor(Math.random() * h);
      clues.push({ x: clueX, y: clueY, value: w * h });
    }
  }

  return { id, size, clues };
};

export const usePatchesGame = () => {
  const [level, setLevel] = useState<Level | null>(null);
  const [levelNumber, setLevelNumber] = useState(1);
  const [patches, setPatches] = useState<Patch[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const { updateHighScore } = useHighScores();

  // Initialize first level
  useEffect(() => {
    if (!level) {
      setLevel(generateLevel(1, 5));
    }
  }, [level]);

  // No timer needed as per request
  useEffect(() => {
    setTime(0);
  }, [isActive]);

  const startGame = useCallback(() => {
    // Generate new level every time we start if current one is finished
    if (gameOver || !level) {
      const size = levelNumber <= 2 ? 5 : levelNumber <= 5 ? 6 : 7;
      setLevel(generateLevel(levelNumber, size));
    }
    setPatches([]);
    setGameOver(false);
    setTime(0);
    setIsActive(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [gameOver, level, levelNumber]);

  const addPatch = useCallback((patch: Omit<Patch, 'id' | 'color'>) => {
    if (!isActive || gameOver) return;

    const newPatch: Patch = {
      ...patch,
      id: Math.random().toString(36).substr(2, 9),
      color: '#8B5CF6', // Default neon
    };

    setPatches((prev) => {
      const filtered = prev.filter((p) => {
        const noOverlap =
          patch.x + patch.width <= p.x ||
          p.x + p.width <= patch.x ||
          patch.y + patch.height <= p.y ||
          p.y + p.height <= patch.y;
        
        if (!noOverlap) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        return noOverlap;
      });
      return [...filtered, newPatch];
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [patches.length, isActive, gameOver]);

  const removePatch = useCallback((id: string) => {
    if (!isActive || gameOver) return;
    setPatches((prev) => prev.filter((p) => p.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [isActive, gameOver]);

  const validateWin = useCallback(() => {
    if (!level) return false;

    const totalCells = level.size * level.size;
    const coveredCells = patches.reduce((acc, p) => acc + p.width * p.height, 0);
    if (coveredCells !== totalCells) return false;

    for (const patch of patches) {
      const cluesInPatch = level.clues.filter(
        (c) =>
          c.x >= patch.x &&
          c.x < patch.x + patch.width &&
          c.y >= patch.y &&
          c.y < patch.y + patch.height
      );

      if (cluesInPatch.length !== 1) return false;
      if (patch.width * patch.height !== cluesInPatch[0].value) return false;
    }

    setGameOver(true);
    setIsActive(false);
    
    // Save high score (Level reached)
    updateHighScore('cosmic-patches', levelNumber);
    
    return true;
  }, [level, patches, time, updateHighScore]);

  useEffect(() => {
    if (patches.length > 0) {
      validateWin();
    }
  }, [patches, validateWin]);

  const nextLevel = useCallback(() => {
    const nextNum = levelNumber + 1;
    const size = nextNum <= 2 ? 5 : nextNum <= 5 ? 6 : 7;
    setLevelNumber(nextNum);
    setLevel(generateLevel(nextNum, size));
    setPatches([]);
    setGameOver(false);
    setTime(0);
    setIsActive(true);
  }, [levelNumber]);

  return {
    level,
    patches,
    gameOver,
    time,
    isActive,
    addPatch,
    removePatch,
    startGame,
    nextLevel,
    currentLevelIndex: levelNumber - 1,
    totalLevels: '∞',
  };
};

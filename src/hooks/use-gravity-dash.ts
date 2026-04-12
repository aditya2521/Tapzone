import { useCallback, useEffect, useState } from 'react';
import { Dimensions, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { 
  useSharedValue, 
  useFrameCallback, 
  runOnJS,
  withSpring,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { useHighScores } from './use-high-scores';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GAME_ID = 'gravity-dash';
const PLAYER_X = 80;
const PLAYER_SIZE = 30;
const OBSTACLE_WIDTH = 40;
const BASE_SPEED = 5;
const MAX_SPEED = 12;
const SPEED_INCREMENT = 0.002;
const GROUND_Y = SCREEN_HEIGHT - 120;
const CEILING_Y = 180;

export const useGravityDash = () => {
  const { getHighScore, updateHighScore } = useHighScores();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Initialize high score
  useEffect(() => {
    setHighScore(getHighScore(GAME_ID));
  }, [getHighScore]);

  // Shared values for performance
  const playerY = useSharedValue(GROUND_Y - PLAYER_SIZE);
  const isGravityDown = useSharedValue(true);
  const gameSpeed = useSharedValue(BASE_SPEED);
  
  // Obstacles: each element is { x, height, isTop }
  const obstaclesX = useSharedValue([SCREEN_WIDTH + 400, SCREEN_WIDTH + 700, SCREEN_WIDTH + 1000]);
  const obstaclesH = useSharedValue([
    80 + Math.random() * 100, 
    80 + Math.random() * 100, 
    80 + Math.random() * 100
  ]);
  const obstaclesIsTop = useSharedValue([
    Math.random() > 0.5, 
    Math.random() > 0.5, 
    Math.random() > 0.5
  ]);
  const obstaclePassed = useSharedValue([false, false, false]);

  const onGameOver = (finalScore: number) => {
    if (finalScore > highScore) {
      setHighScore(finalScore);
      updateHighScore(GAME_ID, finalScore);
    }
    setGameOver(true);
    setGameStarted(false);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const incrementScore = () => {
    setScore(s => s + 1);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const frameCallback = useFrameCallback((frameInfo) => {
    if (!gameStarted || gameOver) return;

    const dt = frameInfo.timeSincePreviousFrame || 16.67;
    if (gameSpeed.value < MAX_SPEED) {
      gameSpeed.value += SPEED_INCREMENT;
    }

    // Player position interpolation (smooth gravity flip)
    const targetY = isGravityDown.value ? GROUND_Y - PLAYER_SIZE : CEILING_Y;
    playerY.value = withTiming(targetY, { duration: 200, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });

    // Obstacle movement
    const newX = [...obstaclesX.value];
    const newH = [...obstaclesH.value];
    const newIsTop = [...obstaclesIsTop.value];
    const newPassed = [...obstaclePassed.value];

    for (let i = 0; i < newX.length; i++) {
      newX[i] -= gameSpeed.value;

      // Reset obstacle
      if (newX[i] < -OBSTACLE_WIDTH) {
        const maxX = Math.max(...newX);
        // Difficulty scaling: reduce spacing as speed increases
        const difficultyFactor = (gameSpeed.value - BASE_SPEED) / (MAX_SPEED - BASE_SPEED);
        const minSpacing = 250 - (difficultyFactor * 80); // Spacing gets tighter
        const randomExtra = 200 - (difficultyFactor * 100);
        
        newX[i] = maxX + minSpacing + Math.random() * randomExtra;
        newH[i] = 80 + Math.random() * (100 + difficultyFactor * 50); // Obstacles can get taller
        newIsTop[i] = Math.random() > 0.5;
        newPassed[i] = false;
      }

      // Collision Detection
      const obsX = newX[i];
      const obsH = newH[i];
      const isTop = newIsTop[i];

      const playerTop = playerY.value;
      const playerBottom = playerY.value + PLAYER_SIZE;
      const playerLeft = PLAYER_X;
      const playerRight = PLAYER_X + PLAYER_SIZE;

      // Check if player is within horizontal range
      if (playerRight > obsX && playerLeft < obsX + OBSTACLE_WIDTH) {
        // Check vertical collision
        if (isTop) {
          // Top obstacle starts at CEILING_Y and goes DOWN by obsH
          if (playerTop < CEILING_Y + obsH) {
            runOnJS(onGameOver)(score);
          }
        } else {
          // Bottom obstacle starts at GROUND_Y and goes UP by obsH
          if (playerBottom > GROUND_Y - obsH) {
            runOnJS(onGameOver)(score);
          }
        }
      }

      // Score logic
      if (!newPassed[i] && obsX + OBSTACLE_WIDTH < PLAYER_X) {
        newPassed[i] = true;
        runOnJS(incrementScore)();
      }
    }

    obstaclesX.value = newX;
    obstaclesH.value = newH;
    obstaclesIsTop.value = newIsTop;
    obstaclePassed.value = newPassed;
  });

  const flipGravity = useCallback(() => {
    if (gameOver) return;
    
    if (!gameStarted) {
      setGameStarted(true);
      setGameOver(false);
      setScore(0);
      gameSpeed.value = BASE_SPEED;
    }

    isGravityDown.value = !isGravityDown.value;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [gameStarted, gameOver]);

  const restartGame = () => {
    playerY.value = GROUND_Y - PLAYER_SIZE;
    isGravityDown.value = true;
    gameSpeed.value = BASE_SPEED;
    obstaclesX.value = [SCREEN_WIDTH + 400, SCREEN_WIDTH + 700, SCREEN_WIDTH + 1000];
    obstaclesH.value = [
      80 + Math.random() * 100, 
      80 + Math.random() * 100, 
      80 + Math.random() * 100
    ];
    obstaclesIsTop.value = [
      Math.random() > 0.5, 
      Math.random() > 0.5, 
      Math.random() > 0.5
    ];
    obstaclePassed.value = [false, false, false];
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  };

  return {
    playerY,
    isGravityDown,
    score,
    highScore,
    gameOver,
    gameStarted,
    flipGravity,
    restartGame,
    obstaclesX,
    obstaclesH,
    obstaclesIsTop,
    GROUND_Y,
    CEILING_Y
  };
};

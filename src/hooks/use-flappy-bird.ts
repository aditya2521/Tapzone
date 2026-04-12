import { useState, useCallback, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import { 
  useSharedValue, 
  useFrameCallback, 
  runOnJS,
  cancelAnimation,
  withSpring
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useHighScores } from './use-high-scores';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GRAVITY = 0.6;
const JUMP_STRENGTH = -8;
const PIPE_SPAWN_X = SCREEN_WIDTH + 100;
const PIPE_WIDTH = 60;
const BIRD_X = 50;
const BIRD_SIZE = 30;
const PIPE_GAP = 180;
const GAME_ID = 'neon-fly';

const BASE_PIPE_SPEED = 4.5;
const MAX_PIPE_SPEED = 8.5;

export const useFlappyBird = () => {
  const { getHighScore, updateHighScore } = useHighScores();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Initialize high score from persistence
  useEffect(() => {
    setHighScore(getHighScore(GAME_ID));
  }, [getHighScore]);

  const birdY = useSharedValue(SCREEN_HEIGHT / 2);
  const birdVelocity = useSharedValue(0);
  const gameSpeed = useSharedValue(BASE_PIPE_SPEED);
  
  const pipesX = useSharedValue([PIPE_SPAWN_X, PIPE_SPAWN_X + SCREEN_WIDTH * 0.6, PIPE_SPAWN_X + SCREEN_WIDTH * 1.2]);
  const pipeGapsY = useSharedValue([
    SCREEN_HEIGHT / 2, 
    SCREEN_HEIGHT / 2 - 100 + Math.random() * 200,
    SCREEN_HEIGHT / 2 - 100 + Math.random() * 200
  ]);
  const pipePassed = useSharedValue([false, false, false]);

  const onGameOver = (finalScore: number) => {
    if (finalScore > highScore) {
      setHighScore(finalScore);
      updateHighScore(GAME_ID, finalScore);
    }
    setGameOver(true);
    setGameStarted(false);
  };

  const incrementScore = () => {
    setScore(s => {
      const nextS = s + 1;
      // Increase speed every 5 points
      const newSpeed = Math.min(MAX_PIPE_SPEED, BASE_PIPE_SPEED + Math.floor(nextS / 5) * 0.4);
      gameSpeed.value = newSpeed;
      return nextS;
    });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const frameCallback = useFrameCallback((frameInfo) => {
    if (!gameStarted || gameOver) return;

    // Bird Physics
    birdVelocity.value += GRAVITY;
    birdY.value += birdVelocity.value;

    // Pipe Movement
    const newPipesX = [...pipesX.value];
    const newPipeGapsY = [...pipeGapsY.value];
    const newPipePassed = [...pipePassed.value];

    for (let i = 0; i < newPipesX.length; i++) {
        newPipesX[i] -= gameSpeed.value;
        
        // Reset pipe if it goes off screen
        if (newPipesX[i] < -PIPE_WIDTH) {
            // Find the furthest pipe to maintain consistent spacing
            const maxX = Math.max(...newPipesX);
            newPipesX[i] = Math.max(maxX + SCREEN_WIDTH * 0.6, SCREEN_WIDTH + PIPE_WIDTH);
            
            // Smoother gap generation: ensure the next gap is within reach of the previous one
            const prevPipeIndex = (i - 1 + 3) % 3;
            const prevGapY = newPipeGapsY[prevPipeIndex];
            const maxJump = 150; 
            const nextGapY = prevGapY - maxJump + Math.random() * (maxJump * 2);
            
            // Constrain within screen bounds
            newPipeGapsY[i] = Math.max(250, Math.min(SCREEN_HEIGHT - 250, nextGapY));
            newPipePassed[i] = false;
        }

        // Collision Detection
        const pipeX = newPipesX[i];
        const gapY = newPipeGapsY[i];

        // Horizontal collision check
        if (BIRD_X + BIRD_SIZE > pipeX && BIRD_X < pipeX + PIPE_WIDTH) {
            // Vertical collision check (hitting top or bottom pipe)
            if (birdY.value < gapY - PIPE_GAP / 2 || birdY.value + BIRD_SIZE > gapY + PIPE_GAP / 2) {
                runOnJS(onGameOver)(score);
            }
        }

        // Score logic
        if (!newPipePassed[i] && pipeX + PIPE_WIDTH < BIRD_X) {
            newPipePassed[i] = true;
            runOnJS(incrementScore)();
        }
    }

    pipesX.value = newPipesX;
    pipeGapsY.value = newPipeGapsY;
    pipePassed.value = newPipePassed;

    // Ground/Ceiling check
    if (birdY.value < 0 || birdY.value > SCREEN_HEIGHT - 50) {
        runOnJS(onGameOver)(score);
    }
  });

  const flap = useCallback(() => {
    if (gameOver) return;
    
    if (!gameStarted) {
      setGameStarted(true);
      setGameOver(false);
      setScore(0);
      gameSpeed.value = BASE_PIPE_SPEED;
    }

    birdVelocity.value = JUMP_STRENGTH;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [gameStarted, gameOver]);

  const restartGame = () => {
    birdY.value = SCREEN_HEIGHT / 2;
    birdVelocity.value = 0;
    gameSpeed.value = BASE_PIPE_SPEED;
    pipesX.value = [PIPE_SPAWN_X, PIPE_SPAWN_X + SCREEN_WIDTH * 0.6, PIPE_SPAWN_X + SCREEN_WIDTH * 1.2];
    pipeGapsY.value = [
        SCREEN_HEIGHT / 2, 
        200 + Math.random() * (SCREEN_HEIGHT - 400),
        200 + Math.random() * (SCREEN_HEIGHT - 400)
    ];
    pipePassed.value = [false, false, false];
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  };

  return {
    birdY,
    birdVelocity,
    pipesX,
    pipeGapsY,
    score,
    highScore,
    gameOver,
    gameStarted,
    flap,
    restartGame,
  };
};

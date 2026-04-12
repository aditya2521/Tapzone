import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle
} from 'react-native-reanimated';

import { CosmicBackground } from '@/components/CosmicBackground';
import { NeonBird } from '@/components/game/neon-bird';
import { NeonPipe } from '@/components/game/neon-pipe';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useFlappyBird } from '@/hooks/use-flappy-bird';
import { useGameSounds } from '@/hooks/use-game-sounds';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PIPE_WIDTH = 60;
const BIRD_X = 50;
const PIPE_GAP = 180;

export const FlappyBirdScreen = () => {
  const router = useRouter();
  const { playSound, isMuted, toggleMute } = useGameSounds();
  const {
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
  } = useFlappyBird();

  const birdAnimatedStyle = useAnimatedStyle(() => {
    return {
      top: birdY.value - 15, // Centering bird height (BIRD_SIZE/2)
      left: BIRD_X,
      position: 'absolute',
      zIndex: 100,
    };
  });

  const handlePress = () => {
    if (!gameOver) {
      playSound('BUBBLE'); // Soft bubble flap
      flap();
    }
  };

  useEffect(() => {
    if (gameOver) {
      playSound('FAILURE');
    }
  }, [gameOver]);

  // Render pipes
  const renderPipes = () => {
    // We have 3 pipe pairs in the loop
    return [0, 1, 2].map((index) => {
      return (
        <React.Fragment key={`pipe-group-${index}`}>
          {/* Top Pipe */}
          <PipePair
            index={index}
            pipesX={pipesX}
            pipeGapsY={pipeGapsY}
            isTop={true}
          />
          {/* Bottom Pipe */}
          <PipePair
            index={index}
            pipesX={pipesX}
            pipeGapsY={pipeGapsY}
            isTop={false}
          />
        </React.Fragment>
      );
    });
  };

  return (
    <CosmicBackground>
      <Pressable style={styles.container} onPress={handlePress}>
        {/* HUD */}
        <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
          <BlurView intensity={20} tint="dark" style={styles.headerGlass}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={20} color="#FFF" />
            </Pressable>

            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>{score}</Text>
            </View>

            <View style={styles.highScoreContainer}>
              <Text style={styles.highScoreLabel}>BEST</Text>
              <Text style={styles.highScoreValue}>{highScore}</Text>
            </View>

            <Pressable onPress={toggleMute} style={styles.muteButton}>
              <IconSymbol
                name={isMuted ? "speaker.slash.fill" : "speaker.wave.2.fill"}
                size={18}
                color={isMuted ? "#EF4444" : "#FFF"}
              />
            </Pressable>
          </BlurView>
        </Animated.View>

        {/* Start Hint */}
        {!gameStarted && !gameOver && (
          <Animated.View entering={FadeIn} style={styles.hintContainer}>
            <Text style={styles.hintText}>TAP TO FLY</Text>
            <View style={styles.hintIcon}>
              <IconSymbol name="hand.tap.fill" size={40} color="#FFF" />
            </View>
          </Animated.View>
        )}

        {/* Game Elements */}
        {renderPipes()}

        <Animated.View style={birdAnimatedStyle}>
          <NeonBird color="#8B5CF6" velocity={birdVelocity.value} />
        </Animated.View>

        {/* Game Over Overlay */}
        {gameOver && (
          <Animated.View entering={FadeIn} style={styles.overlay}>
            <BlurView intensity={60} tint="dark" style={styles.card}>
              <View style={styles.gameOverIcon}>
                <IconSymbol name="xmark.circle.fill" size={60} color="#EF4444" />
              </View>
              <Text style={styles.gameOverTitle}>GAME OVER</Text>
              <Text style={styles.finalScore}>{score}</Text>
              <Text style={styles.gameOverSubtitle}>DRONE CRASHED</Text>

              <Pressable style={styles.retryButton} onPress={restartGame}>
                <LinearGradient
                  colors={['#8B5CF6', '#3B82F6']}
                  style={styles.retryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.retryText}>REBOOST DRONE</Text>
                </LinearGradient>
              </Pressable>
            </BlurView>
          </Animated.View>
        )}
      </Pressable>
    </CosmicBackground>
  );
};

const PipePair = ({ index, pipesX, pipeGapsY, isTop }: any) => {
  const animatedStyle = useAnimatedStyle(() => {
    const x = pipesX.value[index];
    const gapY = pipeGapsY.value[index];

    if (isTop) {
      return {
        left: x,
        top: 0,
        height: gapY - PIPE_GAP / 2,
        position: 'absolute',
      };
    } else {
      return {
        left: x,
        top: gapY + PIPE_GAP / 2,
        height: SCREEN_HEIGHT - (gapY + PIPE_GAP / 2),
        position: 'absolute',
      };
    }
  });

  return (
    <Animated.View style={animatedStyle}>
      <NeonPipe color="#06B6D4" isTop={isTop} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  headerGlass: {
    padding: 16,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    fontFamily: Fonts.rounded,
  },
  highScoreContainer: {
    alignItems: 'flex-end',
    minWidth: 40,
  },
  highScoreLabel: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  highScoreValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  muteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  hintContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  hintText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 20,
    opacity: 0.8,
  },
  hintIcon: {
    opacity: 0.5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 1, 16, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 2000,
  },
  card: {
    width: '100%',
    padding: 32,
    borderRadius: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  gameOverIcon: {
    marginBottom: 16,
  },
  gameOverTitle: {
    color: '#EF4444',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  finalScore: {
    color: '#FFF',
    fontSize: 72,
    fontWeight: '900',
    marginVertical: 8,
  },
  gameOverSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 32,
  },
  retryButton: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  retryGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

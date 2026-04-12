import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CosmicBackground } from '@/components/CosmicBackground';
import { NeonSquare } from '@/components/game/neon-square';
import { NeonObstacle } from '@/components/game/neon-obstacle';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useGravityDash } from '@/hooks/use-gravity-dash';
import { useGameSounds } from '@/hooks/use-game-sounds';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PLAYER_X = 80;

export const GravityDashScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { playSound, isMuted, toggleMute } = useGameSounds();
  const {
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
  } = useGravityDash();

  const playerAnimatedStyle = useAnimatedStyle(() => {
    return {
      top: playerY.value,
      left: PLAYER_X,
      position: 'absolute',
      zIndex: 100,
    };
  });

  const handlePress = () => {
    if (!gameOver) {
      playSound('BUBBLE');
      flipGravity();
    }
  };

  useEffect(() => {
    if (gameOver) {
      playSound('FAILURE');
    }
  }, [gameOver]);

  // Render ground and ceiling
  const renderBoundaries = () => (
    <>
      <View style={[styles.boundary, { top: CEILING_Y, backgroundColor: '#8B5CF6' }]} />
      <View style={[styles.boundary, { top: GROUND_Y, backgroundColor: '#EC4899' }]} />
    </>
  );

  return (
    <CosmicBackground>
      <Pressable style={styles.container} onPress={handlePress}>
        {/* HUD - Uses Safe Area Insets */}
        <Animated.View 
          entering={FadeInDown.duration(800)} 
          style={[styles.header, { top: Math.max(insets.top, 20) }]}
        >
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
            <Text style={styles.hintText}>TAP TO FLIP GRAVITY</Text>
            <View style={styles.hintIcon}>
              <IconSymbol name="hand.tap.fill" size={40} color="#FFF" />
            </View>
          </Animated.View>
        )}

        {/* Boundaries */}
        {renderBoundaries()}

        {/* Active Elements */}
        {[0, 1, 2].map((i) => (
          <Obstacle 
            key={i} 
            index={i} 
            obstaclesX={obstaclesX} 
            obstaclesH={obstaclesH} 
            obstaclesIsTop={obstaclesIsTop} 
            CEILING_Y={CEILING_Y}
            GROUND_Y={GROUND_Y}
          />
        ))}

        <Animated.View style={playerAnimatedStyle}>
          <NeonSquare color="#EC4899" isGravityDown={isGravityDown.value} />
        </Animated.View>

        {/* Game Over Overlay */}
        {gameOver && (
          <Animated.View entering={FadeIn} style={styles.overlay}>
            <BlurView intensity={60} tint="dark" style={styles.card}>
              <View style={styles.gameOverIcon}>
                <IconSymbol name="xmark.circle.fill" size={60} color="#EF4444" />
              </View>
              <Text style={styles.gameOverTitle}>SYSTEM SHUTDOWN</Text>
              <Text style={styles.finalScore}>{score}</Text>
              <Text style={styles.gameOverSubtitle}>CORE COLLISION DETECTED</Text>

              <Pressable style={styles.retryButton} onPress={restartGame}>
                <LinearGradient
                  colors={['#EC4899', '#8B5CF6']}
                  style={styles.retryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.retryText}>REBOOT SYSTEM</Text>
                </LinearGradient>
              </Pressable>
            </BlurView>
          </Animated.View>
        )}
      </Pressable>
    </CosmicBackground>
  );
};

const Obstacle = ({ index, obstaclesX, obstaclesH, obstaclesIsTop, CEILING_Y, GROUND_Y }: any) => {
  const animatedStyle = useAnimatedStyle(() => {
    const x = obstaclesX.value[index];
    const h = obstaclesH.value[index];
    const isTop = obstaclesIsTop.value[index];

    return {
      left: x,
      height: h,
      top: isTop ? CEILING_Y : GROUND_Y - h,
      position: 'absolute',
      width: 40,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <NeonObstacle isTop={obstaclesIsTop.value[index]} color={obstaclesIsTop.value[index] ? '#8B5CF6' : '#06B6D4'} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  boundary: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    opacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
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
    fontSize: 24,
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
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
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

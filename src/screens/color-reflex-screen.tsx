import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withTiming, 
  FadeInDown, 
  useSharedValue,
  interpolate,
  Extrapolate,
  FadeIn
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { CosmicBackground } from '@/components/CosmicBackground';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useColorReflex } from '@/hooks/use-color-reflex';
import { useGameSounds } from '@/hooks/use-game-sounds';

const { width } = Dimensions.get('window');

export const ColorReflexScreen = () => {
  const router = useRouter();
  const { playSound, isMuted, toggleMute } = useGameSounds();
  const {
    score,
    highScore,
    lives,
    targetColor,
    currentColor,
    isActive,
    gameOver,
    handleTap,
    startGame,
  } = useColorReflex();

  const circleScale = useSharedValue(1);
  const targetScale = useSharedValue(1);

  useEffect(() => {
    // Pulse effect when color changes
    circleScale.value = withSequence(
      withTiming(1.1, { duration: 100 }),
      withSpring(1)
    );
  }, [currentColor]);

  useEffect(() => {
    // Pulse target when it changes
    targetScale.value = withSequence(
      withTiming(1.2, { duration: 200 }),
      withSpring(1)
    );
  }, [targetColor]);

  const onGamePress = () => {
    if (!gameOver) {
      if (currentColor === targetColor) {
        playSound('SUCCESS');
      } else {
        playSound('FAILURE');
      }
      handleTap();
    }
  };

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    backgroundColor: currentColor,
    borderColor: 'rgba(255,255,255,0.4)',
    borderWidth: 8,
    shadowColor: currentColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  }));

  const animatedTargetStyle = useAnimatedStyle(() => ({
    transform: [{ scale: targetScale.value }],
    backgroundColor: targetColor,
    shadowColor: targetColor,
    shadowOpacity: 0.6,
    shadowRadius: 10,
  }));

  return (
    <CosmicBackground>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
        <BlurView intensity={20} tint="dark" style={styles.headerGlass}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={20} color="#FFF" />
          </Pressable>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>STREAK</Text>
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

      {/* Target Color Display */}
      {isActive && (
        <Animated.View entering={FadeInDown.delay(200)} style={styles.targetWrapper}>
          <Text style={styles.targetLabel}>MATCH THIS COLOR</Text>
          <Animated.View style={[styles.targetBox, animatedTargetStyle]} />
        </Animated.View>
      )}

      {/* Main Interaction Area */}
      <Pressable style={styles.gameArea} onPress={isActive ? onGamePress : undefined}>
        {!isActive && !gameOver && (
          <View style={styles.startInfo}>
            <Text style={styles.startTitle}>COLOR REFLEX</Text>
            <Text style={styles.startDesc}>Tap ONLY when the center color matches the target.</Text>
            <Pressable style={styles.startButton} onPress={startGame}>
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.startGradient}>
                <Text style={styles.startBtnText}>START MISSION</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {isActive && (
          <View style={styles.activeGame}>
            <Animated.View style={[styles.mainCircle, animatedCircleStyle]} />
            <Text style={styles.tapInstruction}>TAP TO MATCH</Text>
          </View>
        )}

        {isActive && (
          <View style={styles.livesWrapper}>
            {Array.from({ length: 3 }).map((_, i) => (
              <IconSymbol 
                key={i}
                name="heart.fill" 
                size={28} 
                color={i < lives ? "#F43F5E" : "rgba(255,255,255,0.1)"} 
                style={styles.heartIcon}
              />
            ))}
          </View>
        )}
      </Pressable>

      {/* Game Over Overlay */}
      {gameOver && (
        <View style={styles.gameOverOverlay}>
          <BlurView intensity={40} tint="dark" style={styles.gameOverCard}>
            <IconSymbol name="exclamationmark.triangle.fill" size={60} color="#F59E0B" />
            <Text style={styles.gameOverTitle}>MISSION FAILED</Text>
            <Text style={styles.finalScore}>{score}</Text>
            <Text style={styles.gameOverSubtitle}>STREAK BROKEN</Text>
            
            <View style={styles.resultStats}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>BEST</Text>
                <Text style={styles.statValue}>{highScore}</Text>
              </View>
            </View>

            <Pressable style={styles.retryButton} onPress={startGame}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.retryGradient}
              >
                <Text style={styles.retryText}>RETRY MISSION</Text>
              </LinearGradient>
            </Pressable>
          </BlurView>
        </View>
      )}
    </CosmicBackground>
  );
};

const styles = StyleSheet.create({
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
  scoreLabel: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: -4,
  },
  scoreText: {
    color: '#FFF',
    fontSize: 40,
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
  targetWrapper: {
    position: 'absolute',
    top: 150,
    alignItems: 'center',
    width: '100%',
  },
  targetLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 12,
  },
  targetBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  gameArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startInfo: {
    alignItems: 'center',
    padding: 40,
  },
  startTitle: {
    color: '#F59E0B',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 10,
  },
  startDesc: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  startButton: {
    width: 220,
    borderRadius: 30,
    overflow: 'hidden',
  },
  startGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  activeGame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCircle: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
  },
  tapInstruction: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 5,
    marginTop: 40,
    opacity: 0.6,
  },
  livesWrapper: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    gap: 15,
  },
  heartIcon: {
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  gameOverCard: {
    width: '85%',
    padding: 30,
    borderRadius: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  gameOverTitle: {
    color: '#F59E0B',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 15,
  },
  finalScore: {
    color: '#FFF',
    fontSize: 100,
    fontWeight: '900',
    marginVertical: 10,
    fontFamily: Fonts.rounded,
  },
  gameOverSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 3,
    marginBottom: 30,
  },
  resultStats: {
    marginBottom: 40,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
  },
  statValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },
  retryButton: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  retryGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  retryText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

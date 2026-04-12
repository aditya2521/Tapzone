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
  Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { CosmicBackground } from '@/components/CosmicBackground';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useTapFrenzy } from '@/hooks/use-tap-frenzy';
import { useGameSounds } from '@/hooks/use-game-sounds';

const { width } = Dimensions.get('window');

export const TapFrenzyScreen = () => {
  const router = useRouter();
  const { playSound, isMuted, toggleMute } = useGameSounds();
  const {
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
  } = useTapFrenzy();

  const tapScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);
  const jitterX = useSharedValue(0);
  const jitterY = useSharedValue(0);

  const handlePress = () => {
    if (!gameOver) {
      playSound('CRACK');
      handleTap();
      
      // Animate tap interaction
      tapScale.value = withSequence(
        withTiming(1.05, { duration: 50 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
      glowOpacity.value = withSequence(
        withTiming(0.8, { duration: 50 }),
        withTiming(0.3, { duration: 300 })
      );

      // Apply jitter if available
      if (jitterOffset > 0) {
        jitterX.value = withSpring((Math.random() - 0.5) * jitterOffset * 2, { damping: 5 });
        jitterY.value = withSpring((Math.random() - 0.5) * jitterOffset * 2, { damping: 5 });
      } else {
        jitterX.value = 0;
        jitterY.value = 0;
      }
    }
  };

  const animatedTapStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: tapScale.value * difficultyScale },
      { translateX: jitterX.value },
      { translateY: jitterY.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
    opacity: interpolate(glowOpacity.value, [0.3, 0.8], [0.4, 1], Extrapolate.CLAMP),
  }));

  const timerColor = timeLeft < 3 ? '#EF4444' : '#F43F5E';

  return (
    <CosmicBackground>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
        <BlurView intensity={20} tint="dark" style={styles.headerGlass}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={20} color="#FFF" />
          </Pressable>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>TAPS</Text>
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

      {/* Main Game Area */}
      <Pressable style={styles.gameArea} onPress={handlePress}>
        <View style={styles.centerContent}>
          {!isActive && !gameOver && (
            <Animated.View entering={FadeInDown} style={styles.instructionContainer}>
              <Text style={styles.instructionText}>TAP TO START</Text>
              <Text style={styles.subInstruction}>10 SECONDS ON THE CLOCK</Text>
            </Animated.View>
          )}

          <Animated.View style={[styles.tapCircleContainer, animatedTapStyle]}>
            <LinearGradient
              colors={['#F43F5E', '#FB7185', '#F43F5E']}
              style={styles.tapCircle}
            >
              <Animated.View style={[styles.glowRing, glowStyle]} />
              <IconSymbol name="bolt.fill" size={60} color="#FFF" />
            </LinearGradient>
          </Animated.View>

          {isActive && (
            <View style={styles.statsContainer}>
              <View style={styles.timerBadge}>
                <Text style={[styles.timerText, { color: timerColor }]}>
                  {timeLeft.toFixed(1)}s
                </Text>
              </View>
              <View style={styles.tpsBadge}>
                <Text style={styles.tpsLabel}>TPS</Text>
                <Text style={styles.tpsValue}>{tps}</Text>
              </View>
            </View>
          )}
        </View>
      </Pressable>

      {/* Game Over Overlay */}
      {gameOver && (
        <View style={styles.gameOverOverlay}>
          <BlurView intensity={40} tint="dark" style={styles.gameOverCard}>
            <Text style={styles.gameOverTitle}>TIME'S UP!</Text>
            <Text style={styles.finalScore}>{score}</Text>
            <Text style={styles.gameOverSubtitle}>TOTAL TAPS</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>AVG TPS</Text>
                <Text style={styles.statValue}>{(score / 10).toFixed(1)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>BEST</Text>
                <Text style={styles.statValue}>{highScore}</Text>
              </View>
            </View>

            <Pressable style={styles.retryButton} onPress={startGame}>
              <LinearGradient
                colors={['#F43F5E', '#E11D48']}
                style={styles.retryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.retryText}>TRY AGAIN</Text>
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
    color: '#F43F5E',
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
  gameArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionContainer: {
    position: 'absolute',
    top: -120,
    alignItems: 'center',
  },
  instructionText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
  },
  subInstruction: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  tapCircleContainer: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapCircle: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  glowRing: {
    position: 'absolute',
    width: '110%',
    height: '110%',
    borderRadius: width * 0.35,
    borderWidth: 4,
    borderColor: '#F43F5E',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  statsContainer: {
    marginTop: 60,
    flexDirection: 'row',
    gap: 20,
  },
  timerBadge: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  timerText: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: Fonts.mono,
  },
  tpsBadge: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  tpsLabel: {
    color: '#F43F5E',
    fontSize: 12,
    fontWeight: '800',
  },
  tpsValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    fontFamily: Fonts.mono,
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    color: '#F43F5E',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
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
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 30,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
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
    elevation: 8,
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
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

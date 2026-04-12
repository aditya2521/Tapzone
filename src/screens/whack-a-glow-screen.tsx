import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withTiming, 
  FadeIn, 
  FadeOut,
  FadeInDown, 
  useSharedValue,
  withRepeat,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { CosmicBackground } from '@/components/CosmicBackground';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useWhackAGlow, Orb } from '@/hooks/use-whack-a-glow';
import { useGameSounds } from '@/hooks/use-game-sounds';

const { width, height } = Dimensions.get('window');

const WhackOrb = ({ orb, onWhack, lifetime }: { orb: Orb, onWhack: (id: string) => void, lifetime: number }) => {
  const scale = useSharedValue(0);
  const glowScale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1);
    glowScale.value = withRepeat(
      withTiming(1.2, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    
    // Scale down before vanishing
    const timer = setTimeout(() => {
      scale.value = withTiming(0, { duration: 200 });
    }, lifetime - 200);

    return () => clearTimeout(timer);
  }, [lifetime]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: orb.isTrap ? 0.6 : 0.4,
    backgroundColor: orb.isTrap ? '#EF4444' : '#06B6D4',
  }));

  const orbColors = (orb.isTrap 
    ? ['#1F2937', '#111827', '#000000'] // Dark Shadow
    : ['#06B6D4', '#22D3EE', '#0891B2']) as any;

  return (
    <Animated.View 
      style={[
        styles.orbContainer, 
        { left: orb.x, top: orb.y, width: orb.size, height: orb.size },
        animatedStyle
      ]}
    >
      <Pressable onPress={() => onWhack(orb.id)} style={styles.orbPressable}>
        <Animated.View style={[styles.orbGlow, animatedGlowStyle]} />
        <LinearGradient
          colors={orbColors}
          style={[styles.orbGradient, orb.isTrap && { borderColor: '#EF4444' }]}
        >
          {orb.isTrap ? (
             <IconSymbol name="xmark.circle.fill" size={orb.size * 0.5} color="#EF4444" />
          ) : (
             <View style={styles.orbInner} />
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

export const WhackAGlowScreen = () => {
  const router = useRouter();
  const { playSound, isMuted, toggleMute } = useGameSounds();
  const {
    score,
    highScore,
    lives,
    orbs,
    orbLifetime,
    isActive,
    gameOver,
    handleWhack,
    startGame,
  } = useWhackAGlow();

  useEffect(() => {
    if (gameOver) {
      playSound('FAILURE');
    }
  }, [gameOver]);

  const onOrbWhack = (id: string) => {
    playSound('BUBBLE');
    handleWhack(id);
  };

  return (
    <CosmicBackground>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
        <BlurView intensity={20} tint="dark" style={styles.headerGlass}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={20} color="#FFF" />
          </Pressable>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>WHACKS</Text>
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

      {/* Game Content */}
      <View style={styles.container}>
        {!isActive && !gameOver && (
          <Animated.View entering={FadeInDown} style={styles.startContainer}>
            <Text style={styles.startTitle}>WHACK-A-GLOW</Text>
            <Text style={styles.startSub}>TAP ORBS BEFORE THEY FADE</Text>
            <Pressable style={styles.startButton} onPress={startGame}>
              <LinearGradient
                colors={['#06B6D4', '#0891B2']}
                style={styles.startGradient}
              >
                <Text style={styles.startText}>START GAME</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {/* Render Orbs */}
        {orbs.map(orb => (
          <WhackOrb 
            key={orb.id} 
            orb={orb} 
            onWhack={onOrbWhack} 
            lifetime={orbLifetime} 
          />
        ))}

        {/* Lives Indicator */}
        {isActive && (
          <View style={styles.livesContainer}>
            {Array.from({ length: 3 }).map((_, i) => (
              <IconSymbol 
                key={i}
                name="heart.fill" 
                size={24} 
                color={i < lives ? "#F43F5E" : "rgba(255,255,255,0.1)"} 
                style={styles.heart}
              />
            ))}
          </View>
        )}
      </View>

      {/* Game Over Overlay */}
      {gameOver && (
        <View style={styles.gameOverOverlay}>
          <BlurView intensity={40} tint="dark" style={styles.gameOverCard}>
            <View style={styles.failIcon}>
              <IconSymbol name="xmark.circle.fill" size={60} color="#EF4444" />
            </View>
            <Text style={styles.gameOverTitle}>GAME OVER</Text>
            <Text style={styles.finalScore}>{score}</Text>
            <Text style={styles.gameOverSubtitle}>ORBS WHACKED</Text>
            
            <View style={styles.highScoreResult}>
              <Text style={styles.resultBestLabel}>PERSONAL BEST</Text>
              <Text style={styles.resultBestValue}>{highScore}</Text>
            </View>

            <Pressable style={styles.retryButton} onPress={startGame}>
              <LinearGradient
                colors={['#06B6D4', '#0891B2']}
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
    color: '#06B6D4',
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
  container: {
    flex: 1,
    width: '100%',
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startTitle: {
    color: '#06B6D4',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 4,
  },
  startSub: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 10,
    marginBottom: 40,
  },
  startButton: {
    width: 200,
    borderRadius: 25,
    overflow: 'hidden',
  },
  startGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  startText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  orbContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbPressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbGlow: {
    position: 'absolute',
    width: '140%',
    height: '140%',
    borderRadius: 100,
    backgroundColor: '#06B6D4',
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  orbInner: {
    width: '60%',
    height: '60%',
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  livesContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  heart: {
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
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
  failIcon: {
    marginBottom: 20,
  },
  gameOverTitle: {
    color: '#EF4444',
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
  highScoreResult: {
    alignItems: 'center',
    marginBottom: 40,
  },
  resultBestLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
  },
  resultBestValue: {
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

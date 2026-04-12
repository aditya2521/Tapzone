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
  FadeIn
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { CosmicBackground } from '@/components/CosmicBackground';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useSimonGlow } from '@/hooks/use-simon-glow';
import { useGameSounds } from '@/hooks/use-game-sounds';

const { width } = Dimensions.get('window');
const PAD_SIZE = width * 0.4;

const PADS = [
  { color: '#8B5CF6', icon: 'star.fill' },
  { color: '#F43F5E', icon: 'heart.fill' },
  { color: '#10B981', icon: 'leaf.fill' },
  { color: '#3B82F6', icon: 'moon.fill' },
];

export const SimonGlowScreen = () => {
  const router = useRouter();
  const { playSound, isMuted, toggleMute } = useGameSounds();
  const {
    score,
    highScore,
    activePad,
    isShowingSequence,
    gameOver,
    isActive,
    handlePadPress,
    startGame,
  } = useSimonGlow();

  const scales = [
    useSharedValue(1),
    useSharedValue(1),
    useSharedValue(1),
    useSharedValue(1),
  ];

  useEffect(() => {
    if (activePad !== null) {
      playSound('SUCCESS');
      scales[activePad].value = withSequence(
        withTiming(1.1, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    }
  }, [activePad]);

  useEffect(() => {
    if (gameOver) {
      playSound('FAILURE');
    }
  }, [gameOver]);

  const onPadPress = (index: number) => {
    if (!isShowingSequence && !gameOver && isActive) {
      playSound('TAP');
      scales[index].value = withSequence(
        withTiming(1.05, { duration: 50 }),
        withSpring(1)
      );
      handlePadPress(index);
    }
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

      <View style={styles.container}>
        {!isActive && !gameOver && (
          <Animated.View entering={FadeInDown} style={styles.startHero}>
            <Text style={styles.heroTitle}>SIMON GLOW</Text>
            <Text style={styles.heroSubtitle}>WATCH THE SEQUENCE, MATCH THE GLOW</Text>
            <Pressable style={styles.startButton} onPress={startGame}>
              <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.startGradient}>
                <Text style={styles.startText}>RECALL SEQUENCE</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        <View style={styles.grid}>
          {PADS.map((pad, index) => {
            const animatedStyle = useAnimatedStyle(() => {
              const isActivePad = activePad === index;
              return {
                transform: [{ scale: scales[index].value }],
                opacity: isActivePad ? 1 : 0.6,
                backgroundColor: pad.color,
                shadowColor: pad.color,
                shadowOpacity: isActivePad ? 1 : 0.4,
                shadowRadius: isActivePad ? 20 : 5,
                elevation: isActivePad ? 20 : 5,
                borderColor: isActivePad ? '#FFF' : 'rgba(255,255,255,0.1)',
              };
            });

            return (
              <Animated.View key={index} style={[styles.pad, animatedStyle]}>
                <Pressable
                  style={styles.padPressable}
                  onPress={() => onPadPress(index)}
                  disabled={isShowingSequence}
                >
                  <IconSymbol name={pad.icon as any} size={40} color="#FFF" />
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {isActive && (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>
              {isShowingSequence ? 'WATCHING...' : 'YOUR TURN!'}
            </Text>
          </View>
        )}
      </View>

      {/* Game Over Overlay */}
      {gameOver && (
        <View style={styles.gameOverOverlay}>
          <BlurView intensity={40} tint="dark" style={styles.gameOverCard}>
            <IconSymbol name="brain.head.profile" size={60} color="#8B5CF6" />
            <Text style={styles.gameOverTitle}>MEMORY FAILED</Text>
            <Text style={styles.finalScore}>{score}</Text>
            <Text style={styles.gameOverSubtitle}>ROUNDS COMPLETED</Text>
            
            <View style={styles.highScoreResult}>
              <Text style={styles.resultBestLabel}>PERSONAL BEST</Text>
              <Text style={styles.resultBestValue}>{highScore}</Text>
            </View>

            <Pressable style={styles.retryButton} onPress={startGame}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.retryGradient}
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
    color: '#8B5CF6',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  startHero: {
    alignItems: 'center',
    padding: 30,
    marginBottom: 40,
  },
  heroTitle: {
    color: '#8B5CF6',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 2,
  },
  heroSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 30,
    textAlign: 'center',
  },
  startButton: {
    width: 200,
    borderRadius: 30,
    overflow: 'hidden',
  },
  startGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  startText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  grid: {
    width: width * 0.9,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  pad: {
    width: PAD_SIZE,
    height: PAD_SIZE,
    borderRadius: 32,
    borderWidth: 4,
    overflow: 'hidden',
  },
  padPressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBox: {
    marginTop: 60,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  statusText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 4,
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
    color: '#8B5CF6',
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

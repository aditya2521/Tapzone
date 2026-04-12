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
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { CosmicBackground } from '@/components/CosmicBackground';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { usePatternLock } from '@/hooks/use-pattern-lock';
import { useGameSounds } from '@/hooks/use-game-sounds';

const { width } = Dimensions.get('window');
const GRID_SIZE = 4;
const GRID_WIDTH = width * 0.9;
const TILE_SIZE = (GRID_WIDTH - 40) / GRID_SIZE;

export const PatternLockScreen = () => {
  const router = useRouter();
  const { playSound, isMuted, toggleMute } = useGameSounds();
  const {
    score,
    highScore,
    pattern,
    userSelection,
    isShowing,
    isActive,
    gameOver,
    handleTilePress,
    startGame,
  } = usePatternLock();

  useEffect(() => {
    if (gameOver) {
      playSound('FAILURE');
    }
  }, [gameOver]);

  const onTilePress = (idx: number) => {
    if (!isShowing && !gameOver && isActive) {
      if (pattern.includes(idx)) {
        playSound('TAP');
      } else {
        playSound('FAILURE');
      }
      handleTilePress(idx);
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
            <Text style={styles.scoreLabel}>LEVEL</Text>
            <Text style={styles.scoreText}>{score + 1}</Text>
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
          <View style={styles.startHero}>
            <Text style={styles.heroTitle}>PATTERN LOCK</Text>
            <Text style={styles.heroSubtitle}>MEMORIZE THE NEON SEQUENCE</Text>
            <Pressable style={styles.startButton} onPress={startGame}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.startGradient}>
                <Text style={styles.startText}>REVEAL CODES</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {isActive && (
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              {isShowing ? 'MEMORIZE THE PATTERN' : 'REPLICATE THE PATTERN'}
            </Text>
          </View>
        )}

        <View style={styles.grid}>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
            const isPart = pattern.includes(idx);
            const isSelected = userSelection.includes(idx);
            const highlight = (isShowing && isPart) || isSelected;

            return (
              <Tile 
                key={idx} 
                isActive={highlight} 
                isShowing={isShowing && isPart}
                onPress={() => onTilePress(idx)}
                disabled={isShowing || gameOver || !isActive}
              />
            );
          })}
        </View>
      </View>

      {/* Game Over Overlay */}
      {gameOver && (
        <View style={styles.gameOverOverlay}>
          <BlurView intensity={40} tint="dark" style={styles.gameOverCard}>
            <IconSymbol name="lock.shield.fill" size={60} color="#EF4444" />
            <Text style={styles.gameOverTitle}>ACCESS DENIED</Text>
            <Text style={styles.finalScore}>{score}</Text>
            <Text style={styles.gameOverSubtitle}>LEVELS CLEARED</Text>
            
            <View style={styles.bestBox}>
              <Text style={styles.bestLabel}>PERSONAL BEST</Text>
              <Text style={styles.bestValue}>{highScore}</Text>
            </View>

            <Pressable style={styles.retryButton} onPress={startGame}>
              <LinearGradient
                colors={['#10B981', '#059669']}
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

const Tile = ({ isActive, isShowing, onPress, disabled }: { isActive: boolean, isShowing: boolean, onPress: () => void, disabled: boolean }) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.3);

  useEffect(() => {
    if (isActive) {
      scale.value = withSequence(withTiming(1.1, { duration: 100 }), withTiming(1));
      glow.value = withTiming(0.8);
    } else {
      glow.value = withTiming(0.3);
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: isActive ? '#10B981' : 'rgba(255,255,255,0.05)',
    borderColor: isActive ? '#FFF' : 'rgba(255,255,255,0.1)',
    shadowColor: '#10B981',
    shadowOpacity: isActive ? 0.6 : 0,
    shadowRadius: 10,
    opacity: isShowing ? 1 : (isActive ? 0.9 : 0.6),
  }));

  return (
    <Animated.View style={[styles.tile, animatedStyle]}>
      <Pressable style={styles.tilePressable} onPress={onPress} disabled={disabled} />
    </Animated.View>
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
    color: '#10B981',
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
    marginBottom: 40,
  },
  heroTitle: {
    color: '#10B981',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 4,
  },
  heroSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 40,
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
  instructions: {
    position: 'absolute',
    top: 150,
  },
  instructionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 4,
    opacity: 0.6,
  },
  grid: {
    width: GRID_WIDTH,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 30,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 15,
    borderWidth: 1,
  },
  tilePressable: {
    flex: 1,
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
    color: '#EF4444',
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
  bestBox: {
    alignItems: 'center',
    marginBottom: 40,
  },
  bestLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
  },
  bestValue: {
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

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
  FadeIn,
  useSharedValue,
  Layout
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { CosmicBackground } from '@/components/CosmicBackground';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useTapSequence } from '@/hooks/use-tap-sequence';
import { useGameSounds } from '@/hooks/use-game-sounds';

const { width } = Dimensions.get('window');
const GRID_WIDTH = width * 0.9;
const GAP = 8;
const PADDING = 12;
const COLUMNS = 5;
const TILE_SIZE = Math.floor((GRID_WIDTH - (PADDING * 2) - (GAP * (COLUMNS - 1))) / COLUMNS) - 1;

export const TapSequenceScreen = () => {
  const router = useRouter();
  const { playSound, isMuted, toggleMute } = useGameSounds();
  const {
    numbers,
    nextNum,
    time,
    isActive,
    gameOver,
    highScore,
    handleTap,
    startGame,
  } = useTapSequence();

  useEffect(() => {
    if (gameOver) {
      playSound('SUCCESS');
    }
  }, [gameOver]);

  const onTilePress = (num: number) => {
    if (num === nextNum) {
      playSound('CRACK');
    } else {
      playSound('FAILURE');
    }
    handleTap(num);
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
            <Text style={styles.scoreLabel}>TIME</Text>
            <Text style={styles.scoreText}>{time.toFixed(1)}s</Text>
          </View>
          
          <View style={styles.highScoreContainer}>
            <Text style={styles.highScoreLabel}>BEST</Text>
            <Text style={styles.highScoreValue}>{highScore === 0 ? '--' : highScore.toFixed(1)}s</Text>
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
          <Animated.View entering={FadeInDown} style={styles.startArea}>
            <Text style={styles.title}>TAP SEQUENCE</Text>
            <Text style={styles.subtitle}>TAP NUMBERS 1-25 IN ORDER</Text>
            <Pressable style={styles.startButton} onPress={startGame}>
              <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.startGradient}>
                <Text style={styles.startBtnText}>START TIMER</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {isActive && (
          <Animated.View entering={FadeInDown} style={styles.targetIndicator}>
            <Text style={styles.targetLabel}>NEXT TARGET</Text>
            <View style={styles.targetNumBox}>
              <Text style={styles.targetNumText}>{nextNum}</Text>
            </View>
          </Animated.View>
        )}

        <View style={styles.grid}>
          {numbers.map((num, index) => {
            const isTapped = num < nextNum;
            const isNext = num === nextNum;

            return (
              <Animated.View 
                key={num} 
                layout={Layout.springify()} 
                entering={FadeInDown.delay(index * 20)}
                style={[
                  styles.tile,
                  isTapped && styles.tileTapped,
                  isNext && styles.tileNext
                ]}
              >
                <Pressable
                  style={styles.tilePressable}
                  onPress={() => onTilePress(num)}
                  disabled={isTapped || !isActive}
                >
                  <Text style={[
                     styles.tileText,
                     isTapped && styles.tileTextTapped,
                     isNext && styles.tileTextNext
                   ]}>
                    {num}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* Game Over Overlay */}
      {gameOver && (
        <View style={styles.gameOverOverlay}>
          <BlurView intensity={40} tint="dark" style={styles.gameOverCard}>
            <IconSymbol name="timer" size={60} color="#3B82F6" />
            <Text style={styles.gameOverTitle}>SEQUENCE COMPLETE!</Text>
            <Text style={styles.finalScore}>{time.toFixed(2)}s</Text>
            <Text style={styles.gameOverSubtitle}>TOTAL TIME</Text>
            
            <View style={styles.bestTimeBox}>
              <Text style={styles.bestTimeLabel}>BEST TIME</Text>
              <Text style={styles.bestTimeValue}>{highScore.toFixed(2)}s</Text>
            </View>

            <Pressable style={styles.retryButton} onPress={startGame}>
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.retryGradient}
              >
                <Text style={styles.retryText}>RACE AGAIN</Text>
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
    color: '#3B82F6',
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
    paddingTop: 80, // Space for header
  },
  startArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: '#3B82F6',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
  },
  subtitle: {
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
  startBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  targetIndicator: {
    alignItems: 'center',
    marginBottom: 20,
  },
  targetLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 8,
  },
  targetNumBox: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetNumText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
  },
  grid: {
    width: GRID_WIDTH,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: GAP,
    padding: PADDING,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileTapped: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'transparent',
    opacity: 0.3,
  },
  tileNext: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3B82F6',
    borderWidth: 2,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  tilePressable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  tileTextTapped: {
    color: '#64748B',
  },
  tileTextNext: {
    color: '#3B82F6',
    fontSize: 24,
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
    color: '#3B82F6',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 15,
    textAlign: 'center',
  },
  finalScore: {
    color: '#FFF',
    fontSize: 80,
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
  bestTimeBox: {
    alignItems: 'center',
    marginBottom: 40,
  },
  bestTimeLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
  },
  bestTimeValue: {
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

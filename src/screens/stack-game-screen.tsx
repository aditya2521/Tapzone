import { CosmicBackground } from '@/components/CosmicBackground';
import { StackBlock } from '@/components/game/stack-block';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useGameSounds } from '@/hooks/use-game-sounds';
import { useStackGame } from '@/hooks/use-stack-game';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BLOCK_HEIGHT = 40;

export const StackGameScreen = () => {
  const router = useRouter();
  const { playSound, isMuted, toggleMute } = useGameSounds();

  const {
    platforms,
    score,
    highScore,
    gameOver,
    activeX,
    activeWidth,
    currentLevel,
    dropBlock,
    startGame,
  } = useStackGame();

  // Play sounds on state changes
  React.useEffect(() => {
    if (score > 0 && !gameOver) {
      playSound('BUBBLE');
    }
  }, [score, playSound]);

  React.useEffect(() => {
    if (gameOver) {
      playSound('COLLAPSE');
    }
  }, [gameOver, playSound]);

  const handleDrop = () => {
    if (!gameOver) {
      playSound('TAP');
      dropBlock();
    }
  };

  const containerStyle = useAnimatedStyle(() => {
    // Scroll the tower down as it grows
    const offset = Math.max(0, (currentLevel - 5) * BLOCK_HEIGHT);
    return {
      transform: [{ translateY: withSpring(offset) }],
    };
  });

  const activeBlockStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: activeX.value }],
      width: activeWidth,
    };
  });

  return (
    <CosmicBackground>
      {/* Unified Glassmorphic Header - Outside main Pressable to avoid overlap */}
      <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
        <BlurView intensity={20} tint="dark" style={styles.headerGlass}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={20} color="#FFF" />
          </Pressable>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>SCORE</Text>
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

      <Pressable style={styles.container} onPress={handleDrop}>
        <Animated.View style={[styles.gameArea, containerStyle]}>
          {/* Render the established tower */}
          {platforms.map((p) => (
            <View
              key={p.id}
              style={[
                styles.blockWrapper,
                { left: p.x, bottom: p.y, width: p.width }
              ]}
            >
              <StackBlock width={p.width} height={BLOCK_HEIGHT} color={p.color} />
            </View>
          ))}

          {/* Render the moving active block */}
          {!gameOver && (
            <Animated.View
              style={[
                styles.activeBlockWrapper,
                { bottom: currentLevel * BLOCK_HEIGHT, height: BLOCK_HEIGHT },
                activeBlockStyle
              ]}
            >
              <StackBlock
                width={activeWidth}
                height={BLOCK_HEIGHT}
                color="#FFFFFF"
                isMoving
              />
            </Animated.View>
          )}
        </Animated.View>

        {gameOver && (
          <View style={styles.gameOverOverlay}>
            <BlurView intensity={40} tint="dark" style={styles.gameOverCard}>
              <Text style={styles.gameOverTitle}>GAME OVER</Text>
              <Text style={styles.finalScore}>{score}</Text>
              <Text style={styles.gameOverSubtitle}>LEVELS STACKED</Text>

              <Pressable style={styles.retryButton} onPress={startGame}>
                <Text style={styles.retryText}>TRY AGAIN</Text>
              </Pressable>
            </BlurView>
          </View>
        )}
      </Pressable>
    </CosmicBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000, // Highest z-index
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
  gameArea: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
    height: SCREEN_HEIGHT,
  },
  blockWrapper: {
    position: 'absolute',
  },
  activeBlockWrapper: {
    position: 'absolute',
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameOverCard: {
    width: '80%',
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  gameOverTitle: {
    color: '#EF4444',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
  },
  finalScore: {
    color: '#FFF',
    fontSize: 84,
    fontWeight: '900',
    marginVertical: 10,
  },
  gameOverSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  retryText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

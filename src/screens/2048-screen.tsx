import React from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions, Platform } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  runOnJS,
  useSharedValue
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { CosmicBackground } from '@/components/CosmicBackground';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { use2048 } from '@/hooks/use-2048';
import { Grid2048 } from '@/components/game/grid-2048';
import { Tile2048 } from '@/components/game/tile-2048';
import { useGameSounds } from '@/hooks/use-game-sounds';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GRID_PADDING = 16;
const CELL_MARGIN = 8;
const GRID_SIZE = 4;
const GRID_WIDTH = SCREEN_WIDTH - GRID_PADDING * 2;
// Combined padding and margins with safety buffer to prevent wrapping
const CELL_SIZE = Math.floor((GRID_WIDTH - 52) / 4);
const SWIPE_THRESHOLD = 30;

export const Screen2048 = () => {
  const router = useRouter();
  const { playSound, isMuted, toggleMute } = useGameSounds();
  const {
    tiles,
    score,
    bestScore,
    gameOver,
    move,
    restart,
  } = use2048();

  const startCell = useSharedValue<{ row: number, col: number } | null>(null);

  // Play sounds on state changes
  React.useEffect(() => {
    if (score > 0) {
      playSound('SHORT_BUBBLE');
    }
  }, [score, playSound]);

  React.useEffect(() => {
    if (gameOver) {
      playSound('FAILURE');
    }
  }, [gameOver, playSound]);

  const handleMove = (dir: any, r: number, c: number) => {
    playSound('TAP');
    move(dir, r, c);
  };

  // Gesture handling for swipes
  const panGesture = Gesture.Pan()
    .onStart((event) => {
      'worklet';
      // Calculate row/col relative to the board
      // board is centered, but we'll use local x,y if we wrap the detector
      const x = event.x;
      const y = event.y;
      
      const col = Math.floor((x - CELL_MARGIN * 1.5) / (CELL_SIZE + CELL_MARGIN));
      const row = Math.floor((y - CELL_MARGIN * 1.5) / (CELL_SIZE + CELL_MARGIN));
      
      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        startCell.value = { row, col };
      } else {
        startCell.value = null;
      }
    })
    .onFinalize((event) => {
      'worklet';
      if (!startCell.value) return;

      const { translationX, translationY } = event;
      const absX = Math.abs(translationX);
      const absY = Math.abs(translationY);

      if (Math.max(absX, absY) < SWIPE_THRESHOLD) return;

      const { row, col } = startCell.value;
      const direction = absX > absY 
        ? (translationX > 0 ? 'right' : 'left')
        : (translationY > 0 ? 'down' : 'up');

      runOnJS(handleMove)(direction, row, col);
    });

  return (
    <CosmicBackground>
      <View style={styles.container}>
        {/* Glassmorphic Header HUD */}
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
              <View style={styles.bestBadge}>
                 <Text style={styles.bestLabel}>BEST</Text>
                 <Text style={styles.bestValue}>{bestScore}</Text>
              </View>
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

        {/* Game Board */}
        <View style={styles.boardContainer}>
          <GestureDetector gesture={panGesture}>
            <View>
              <Grid2048 />
              <View style={styles.tilesContainer} pointerEvents="none">
                {tiles.map((tile) => (
                  <Tile2048 key={tile.id} {...tile} />
                ))}
              </View>
            </View>
          </GestureDetector>
        </View>

        {/* Footer controls */}
        <View style={styles.footer}>
           <Pressable onPress={restart} style={styles.restartButton}>
              <LinearGradient
                 colors={['#06B6D4', '#3B82F6']}
                 style={styles.restartGradient}
                 start={{ x: 0, y: 0 }}
                 end={{ x: 1, y: 1 }}
              >
                 <Text style={styles.restartText}>RESET GRID</Text>
              </LinearGradient>
           </Pressable>
           <Text style={styles.hintText}>SWIPE TO MERGE NEON TILES</Text>
        </View>

        {/* Game Over Overlay */}
        {gameOver && (
          <Animated.View entering={FadeIn} style={styles.overlay}>
            <BlurView intensity={60} tint="dark" style={styles.card}>
              <View style={styles.statusIcon}>
                <IconSymbol name="xmark.circle.fill" size={60} color="#EF4444" />
              </View>
              <Text style={styles.statusTitle}>SYSTEM OVERLOAD</Text>
              <Text style={styles.finalScore}>{score}</Text>
              <Text style={styles.statusSubtitle}>GRID CAPACITY REACHED</Text>
              
              <Pressable style={styles.actionButton} onPress={restart}>
                <LinearGradient
                  colors={['#06B6D4', '#3B82F6']}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.actionText}>REBOOT GRID</Text>
                </LinearGradient>
              </Pressable>
            </BlurView>
          </Animated.View>
        )}
      </View>
    </CosmicBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 200,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bestBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  bestLabel: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bestValue: {
    color: '#FFF',
    fontSize: 14,
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
  undoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardContainer: {
    marginTop: 40,
  },
  tilesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  restartButton: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  restartGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  hintText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 4,
    opacity: 0.4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 1, 16, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 1000,
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
  statusIcon: {
    marginBottom: 16,
  },
  statusTitle: {
    color: '#EF4444',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  finalScore: {
    color: '#FFF',
    fontSize: 72,
    fontWeight: '900',
    marginVertical: 8,
  },
  statusSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 32,
  },
  actionButton: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

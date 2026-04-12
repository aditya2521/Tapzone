import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeInDown,
  runOnJS,
  useSharedValue
} from 'react-native-reanimated';

import { CosmicBackground } from '@/components/CosmicBackground';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useGameSounds } from '@/hooks/use-game-sounds';
import { usePatchesGame } from '@/hooks/use-patches-game';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 20;
const GRID_WIDTH = SCREEN_WIDTH - GRID_PADDING * 2;

export const PatchesScreen = () => {
  const router = useRouter();
  const { playSound, isMuted, toggleMute } = useGameSounds();
  const {
    level,
    patches,
    gameOver,
    time,
    isActive,
    addPatch,
    removePatch,
    startGame,
    nextLevel,
    currentLevelIndex,
    totalLevels
  } = usePatchesGame();

  const cellSize = GRID_WIDTH / (level?.size || 5);

  // Drag state
  const dragStart = useSharedValue<{ x: number, y: number } | null>(null);
  const dragEnd = useSharedValue<{ x: number, y: number } | null>(null);
  const [previewPatch, setPreviewPatch] = useState<any>(null);

  const getPatchInfo = (patch: any) => {
    if (!level) return { state: 'EMPTY', color: '#8B5CF6' };

    const cluesInPatch = level.clues.filter(
      (c) =>
        c.x >= patch.x &&
        c.x < patch.x + patch.width &&
        c.y >= patch.y &&
        c.y < patch.y + patch.height
    );

    const area = patch.width * patch.height;

    if (cluesInPatch.length > 1) {
      return { state: 'CONFLICT', color: '#F59E0B', label: '!', sound: 'SHORT_BUBBLE' };
    }

    if (cluesInPatch.length === 1) {
      const clue = cluesInPatch[0];
      if (area === clue.value) {
        return { state: 'VALID', color: '#10B981', label: 'checkmark.circle.fill', sound: 'SUCCESS' };
      }
      if (area > clue.value) {
        return { state: 'OVERFLOW', color: '#EF4444', label: 'exclamationmark.triangle.fill', sound: 'FAILURE' };
      }
      return { state: 'INCOMPLETE', color: '#8B5CF6', label: null, sound: 'TAP' };
    }

    return { state: 'EMPTY', color: '#8B5CF6', label: null, sound: 'TAP' };
  };

  const handleLevelComplete = () => {
    playSound('SUCCESS');
  };

  React.useEffect(() => {
    if (gameOver) {
      handleLevelComplete();
    }
  }, [gameOver]);

  const commitPatch = (patch: any) => {
    const info = getPatchInfo(patch);
    addPatch(patch);
    playSound(info.sound as any);
    setPreviewPatch(null);
  };

  const gesture = Gesture.Pan()
    .enabled(isActive && !gameOver)
    .onStart((e) => {
      'worklet';
      const col = Math.floor(e.x / cellSize);
      const row = Math.floor(e.y / cellSize);
      if (col >= 0 && col < level.size && row >= 0 && row < level.size) {
        dragStart.value = { x: col, y: row };
        dragEnd.value = { x: col, y: row };
      }
    })
    .onUpdate((e) => {
      'worklet';
      if (!dragStart.value) return;
      const col = Math.floor(e.x / cellSize);
      const row = Math.floor(e.y / cellSize);
      if (col >= 0 && col < level.size && row >= 0 && row < level.size) {
        dragEnd.value = { x: col, y: row };

        const x1 = dragStart.value.x;
        const y1 = dragStart.value.y;
        const x2 = col;
        const y2 = row;

        const x = Math.min(x1, x2);
        const y = Math.min(y1, y2);
        const w = Math.abs(x1 - x2) + 1;
        const h = Math.abs(y1 - y2) + 1;

        runOnJS(setPreviewPatch)({ x, y, width: w, height: h });
      }
    })
    .onFinalize(() => {
      'worklet';
      if (dragStart.value && dragEnd.value) {
        const x1 = dragStart.value.x;
        const y1 = dragStart.value.y;
        const x2 = dragEnd.value.x;
        const y2 = dragEnd.value.y;

        const x = Math.min(x1, x2);
        const y = Math.min(y1, y2);
        const w = Math.abs(x1 - x2) + 1;
        const h = Math.abs(y1 - y2) + 1;

        runOnJS(commitPatch)({ x, y, width: w, height: h });
      }
      dragStart.value = null;
      dragEnd.value = null;
      runOnJS(setPreviewPatch)(null);
    });

  return (
    <CosmicBackground>
      <View style={styles.container}>
        {/* Header HUD */}
        <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
          <BlurView intensity={20} tint="dark" style={styles.headerGlass}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={20} color="#FFF" />
            </Pressable>

            <View style={styles.levelInfo}>
              <Text style={styles.levelLabel}>LEVEL</Text>
              <Text style={styles.levelValue}>{currentLevelIndex + 1}/{totalLevels}</Text>
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
        <View style={styles.boardWrapper}>
          {!level ? (
            <View style={[styles.grid, { width: GRID_WIDTH, height: GRID_WIDTH, justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: '#94A3B8' }}>LOADING GRID...</Text>
            </View>
          ) : (
            <View style={[styles.grid, { width: GRID_WIDTH, height: GRID_WIDTH }]}>
              {/* Grid Lines */}
              {Array.from({ length: level.size + 1 }).map((_, i) => (
                <React.Fragment key={i}>
                  <View style={[styles.gridLineV, { left: i * cellSize }]} />
                  <View style={[styles.gridLineH, { top: i * cellSize }]} />
                </React.Fragment>
              ))}

              {/* Patches */}
              {patches.map((patch) => {
                const info = getPatchInfo(patch);

                return (
                  <Pressable
                    key={patch.id}
                    onLongPress={() => removePatch(patch.id)}
                    delayLongPress={200}
                    style={[
                      styles.patch,
                      {
                        left: patch.x * cellSize,
                        top: patch.y * cellSize,
                        width: patch.width * cellSize,
                        height: patch.height * cellSize,
                        backgroundColor: info.color + '44',
                        borderColor: info.color,
                        borderWidth: info.state === 'VALID' ? 3 : 1.5,
                      }
                    ]}
                  >
                    <View style={[styles.patchGlow, { shadowColor: info.color, opacity: info.state !== 'EMPTY' ? 1 : 0.5 }]} />
                    {info.label && (
                      <Animated.View entering={FadeIn} style={styles.validatedIndicator}>
                        <IconSymbol name={info.label as any} size={12} color={info.color} />
                      </Animated.View>
                    )}
                  </Pressable>
                );
              })}

              {/* Preview Patch */}
              {previewPatch && (
                <View
                  style={[
                    styles.patchPreview,
                    {
                      left: previewPatch.x * cellSize,
                      top: previewPatch.y * cellSize,
                      width: previewPatch.width * cellSize,
                      height: previewPatch.height * cellSize,
                    }
                  ]}
                />
              )}

              {/* Clues (Numbers) */}
              {level.clues.map((clue, i) => (
                <View
                  key={i}
                  pointerEvents="none"
                  style={[
                    styles.clueBox,
                    {
                      left: clue.x * cellSize,
                      top: clue.y * cellSize,
                      width: cellSize,
                      height: cellSize,
                    }
                  ]}
                >
                  <Text style={styles.clueText}>{clue.value}</Text>
                </View>
              ))}

              {/* Tap to Start Overlay */}
              {!isActive && !gameOver && (
                <Pressable style={styles.startOverlay} onPress={startGame}>
                  <BlurView intensity={30} tint="dark" style={styles.startOverlayBlur}>
                    <IconSymbol name="play.fill" size={40} color="#8B5CF6" />
                    <Text style={styles.startOverlayText}>TAP TO START</Text>
                  </BlurView>
                </Pressable>
              )}

              {/* Gesture Area */}
              {isActive && !gameOver && (
                <GestureDetector gesture={gesture}>
                  <View style={StyleSheet.absoluteFill} />
                </GestureDetector>
              )}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          {!isActive && !gameOver && (
            <Pressable onPress={startGame} style={styles.mainButton}>
              <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>START LEVEL</Text>
              </LinearGradient>
            </Pressable>
          )}
          {isActive && (
            <Animated.Text entering={FadeIn} style={styles.hintText}>
              DRAG TO CREATE PATCHES • LONG PRESS TO REMOVE
            </Animated.Text>
          )}
        </View>

        {/* Level Success Overlay */}
        {gameOver && (
          <Animated.View entering={FadeIn} style={styles.overlay}>
            <BlurView intensity={60} tint="dark" style={styles.card}>
              <IconSymbol name="star.fill" size={60} color="#F59E0B" />
              <Text style={styles.statusTitle}>PATCHES COMPLETE!</Text>
              <Text style={styles.statusSubtitle}>ACCURACY: 100%</Text>

              <Pressable
                style={styles.actionButton}
                onPress={nextLevel}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.actionGradient}
                >
                  <Text style={styles.actionText}>
                    {currentLevelIndex < totalLevels - 1 ? 'NEXT LEVEL' : 'BACK TO ARCADE'}
                  </Text>
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
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelInfo: {
    flex: 1,
    alignItems: 'center',
  },
  levelLabel: {
    color: '#8B5CF6',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  levelValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  muteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardWrapper: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  grid: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  clueBox: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  clueText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    fontFamily: Fonts.rounded,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  patch: {
    position: 'absolute',
    borderWidth: 1.5,
    zIndex: 5,
  },
  validatedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 2,
  },
  patchGlow: {
    ...StyleSheet.absoluteFillObject,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  patchPreview: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: 'rgba(255,255,255,0.15)',
    zIndex: 15,
    borderStyle: 'dashed',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    alignItems: 'center',
  },
  mainButton: {
    width: 200,
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  hintText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    opacity: 0.6,
    textAlign: 'center',
  },
  startOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startOverlayBlur: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  startOverlayText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 1, 16, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 1000,
  },
  card: {
    width: '100%',
    padding: 40,
    borderRadius: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  statusTitle: {
    color: '#F59E0B',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 20,
    textAlign: 'center',
  },
  statusSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 40,
  },
  actionButton: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  actionGradient: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  actionText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

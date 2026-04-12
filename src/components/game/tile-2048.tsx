import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  LinearTransition, 
  ZoomIn,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts } from '@/constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 16;
const CELL_MARGIN = 8;
const GRID_SIZE = 4;
const GRID_WIDTH = SCREEN_WIDTH - GRID_PADDING * 2;
const CELL_SIZE = Math.floor((GRID_WIDTH - 52) / 4);

interface TileProps {
  id: string;
  value: number;
  row: number;
  col: number;
}

const TILE_COLORS: Record<number, { colors: [string, string], shadow: string }> = {
  2: { colors: ['#06B6D4', '#0891B2'], shadow: '#06B6D4' },
  4: { colors: ['#10B981', '#059669'], shadow: '#10B981' },
  8: { colors: ['#8B5CF6', '#7C3AED'], shadow: '#8B5CF6' },
  16: { colors: ['#F59E0B', '#D97706'], shadow: '#F59E0B' },
  32: { colors: ['#EF4444', '#DC2626'], shadow: '#EF4444' },
  64: { colors: ['#F97316', '#EA580C'], shadow: '#F97316' },
  128: { colors: ['#6366F1', '#4F46E5'], shadow: '#6366F1' },
  256: { colors: ['#EC4899', '#DB2777'], shadow: '#EC4899' },
  512: { colors: ['#D946EF', '#C026D3'], shadow: '#D946EF' },
  1024: { colors: ['#14B8A6', '#0D9488'], shadow: '#14B8A6' },
  2048: { colors: ['#FACC15', '#EAB308'], shadow: '#FACC15' },
};

export const Tile2048 = ({ value, row, col }: TileProps) => {
  const config = TILE_COLORS[value] || TILE_COLORS[2048];

  const animatedStyle = useAnimatedStyle(() => {
    return {
      top: CELL_MARGIN * 1.5 + row * (CELL_SIZE + CELL_MARGIN),
      left: CELL_MARGIN * 1.5 + col * (CELL_SIZE + CELL_MARGIN),
    };
  });

  return (
    <Animated.View 
      entering={ZoomIn.duration(200)}
      exiting={FadeOut.duration(150)}
      layout={LinearTransition.springify().damping(20).stiffness(150)}
      style={[styles.tile, animatedStyle]}
    >
      <LinearGradient
        colors={config.colors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[
          styles.text, 
          { fontSize: value > 1000 ? 18 : value > 100 ? 22 : 28 }
        ]}>
          {value}
        </Text>
        
        {/* Subtle glow highlight */}
        <View style={[styles.glow, { backgroundColor: config.shadow }]} />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tile: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFF',
    fontWeight: '900',
    fontFamily: Fonts.rounded,
  },
  glow: {
    position: 'absolute',
    top: -CELL_SIZE / 2,
    right: -CELL_SIZE / 2,
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    opacity: 0.2,
  },
});

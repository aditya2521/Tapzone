import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const GRID_PADDING = 16;
const CELL_MARGIN = 8;
const GRID_SIZE = 4;
const GRID_WIDTH = width - GRID_PADDING * 2;
const CELL_SIZE = Math.floor((GRID_WIDTH - 52) / 4);

export const Grid2048 = () => {
  const cells = Array.from({ length: GRID_SIZE * GRID_SIZE });

  return (
    <BlurView intensity={20} tint="dark" style={styles.grid}>
      {cells.map((_, i) => (
        <View key={i} style={styles.cell} />
      ))}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  grid: {
    width: width - GRID_PADDING * 2,
    height: width - GRID_PADDING * 2,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: CELL_MARGIN,
    overflow: 'hidden',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: CELL_MARGIN / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.02)',
  },
});

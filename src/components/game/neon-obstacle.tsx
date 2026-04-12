import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface NeonObstacleProps {
  color?: string;
  isTop?: boolean;
}

export const NeonObstacle = ({ color = '#06B6D4', isTop = true }: NeonObstacleProps) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[color, '#3B82F6', 'transparent']}
        style={[styles.gradient, isTop ? styles.topGradient : styles.bottomGradient]}
        start={{ x: 0.5, y: isTop ? 0 : 1 }}
        end={{ x: 0.5, y: isTop ? 1 : 0 }}
      >
        <View style={[styles.mainBar, { borderColor: color }]} />
        <View style={[styles.glow, { backgroundColor: color, shadowColor: color }]} />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: '100%',
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    width: '100%',
    padding: 2,
  },
  topGradient: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  bottomGradient: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  mainBar: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 2,
    borderRadius: 8,
  },
  glow: {
    position: 'absolute',
    width: '120%',
    height: 10,
    left: '-10%',
    opacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    borderRadius: 5,
  },
});

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface StackBlockProps {
  width: number;
  height: number;
  color: string;
  isMoving?: boolean;
}

export const StackBlock = ({ width, height, color, isMoving = false }: StackBlockProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(width),
    };
  });

  return (
    <Animated.View style={[styles.container, { height }, !isMoving && animatedStyle]}>
      <LinearGradient
        colors={[color, color + '99', color + '33']}
        style={[styles.gradient, { borderColor: color }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.innerGlow, { backgroundColor: color + '22' }]} />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 2,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  gradient: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
  },
});

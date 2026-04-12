import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  interpolateColor
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface NeonSquareProps {
  color?: string;
  isGravityDown?: boolean;
}

export const NeonSquare = ({ color = '#F472B6', isGravityDown = true }: NeonSquareProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: withRepeat(withTiming(isGravityDown ? '0deg' : '180deg', { duration: 200 }), 1) },
        { scale: withSequence(withTiming(1.1, { duration: 100 }), withTiming(1, { duration: 100 })) }
      ],
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 15,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={[color, '#A855F7']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.innerSquare}>
          <View style={[styles.glowPoint, { backgroundColor: '#FFF' }]} />
        </View>
      </LinearGradient>
      
      {/* Motion Trail Effect (Simplified) */}
      <View style={[styles.trail, { backgroundColor: color, opacity: 0.3 }]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    padding: 2,
  },
  innerSquare: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  glowPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.8,
  },
  trail: {
    position: 'absolute',
    right: 40,
    width: 20,
    height: 4,
    borderRadius: 2,
  }
});

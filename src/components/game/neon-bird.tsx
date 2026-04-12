import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  interpolate,
  withSpring
} from 'react-native-reanimated';

interface NeonBirdProps {
  color?: string;
  velocity?: number; // Used for tilt
}

export const NeonBird = ({ color = '#8B5CF6', velocity = 0 }: NeonBirdProps) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    // Tilt the bird based on vertical velocity
    const rotation = interpolate(velocity, [-10, 10], [-25, 25]);
    return {
      transform: [
        { rotate: `${rotation}deg` },
        { scale: interpolate(pulse.value, [0, 1], [1, 1.05]) }
      ],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(pulse.value, [0, 1], [0.4, 0.8]),
      transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.2]) }],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Outer Glow */}
      <Animated.View style={[styles.outerGlow, { shadowColor: color }, glowStyle]} />
      
      {/* Bird Body (Drone/Spaceship style) */}
      <View style={styles.bodyContainer}>
        {/* Wings / Engines */}
        <View style={[styles.wing, styles.leftWing, { backgroundColor: color }]} />
        <View style={[styles.wing, styles.rightWing, { backgroundColor: color }]} />
        
        {/* Core Body */}
        <View style={[styles.mainBody, { borderColor: color }]}>
          <LinearGradient
            colors={[`${color}40`, color, `${color}40`]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          {/* Eye / Cockpit */}
          <View style={styles.cockpit}>
            <View style={[styles.eye, { backgroundColor: '#FFF' }]} />
          </View>
        </View>

        {/* Trail / Engine Glow */}
        <View style={[styles.engine, { backgroundColor: color }]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerGlow: {
    position: 'absolute',
    width: 50,
    height: 40,
    borderRadius: 25,
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  bodyContainer: {
    width: 34,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBody: {
    width: 24,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 2,
  },
  wing: {
    position: 'absolute',
    width: 12,
    height: 6,
    borderRadius: 3,
    zIndex: 1,
  },
  leftWing: {
    left: -4,
    top: 4,
    transform: [{ rotate: '-20deg' }],
  },
  rightWing: {
    right: -4,
    top: 4,
    transform: [{ rotate: '20deg' }],
  },
  cockpit: {
    position: 'absolute',
    right: 4,
    top: 3,
    width: 8,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eye: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    shadowColor: '#FFF',
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  engine: {
    position: 'absolute',
    bottom: -2,
    width: 10,
    height: 4,
    borderRadius: 2,
    opacity: 0.6,
  },
});

import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  withDelay,
  Easing,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

const RING_COUNT = 4;
const RING_SIZE = 360;

const Particle = ({ index }: { index: number }) => {
  const animatedValue = useSharedValue(0);
  const startX = useMemo(() => Math.random() * 400 - 200, []);
  const startY = useMemo(() => Math.random() * 400 - 200, []);
  const duration = useMemo(() => 4000 + Math.random() * 4000, []);

  useEffect(() => {
    animatedValue.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [animatedValue, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(animatedValue.value, [0, 1], [0, -40]);
    const translateX = interpolate(animatedValue.value, [0, 1], [0, 20]);
    const opacity = interpolate(animatedValue.value, [0, 0.5, 1], [0.2, 0.6, 0.2]);

    return {
      transform: [{ translateX }, { translateY }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          top: 200 + startY,
          left: 200 + startX,
          backgroundColor: index % 2 === 0 ? '#8B5CF6' : '#3B82F6',
        },
        animatedStyle,
      ]}
    />
  );
};

const Orbit = ({ index }: { index: number }) => {
  const animatedValue = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withRepeat(
      withDelay(index * 600, withTiming(1, { duration: 4000, easing: Easing.bezier(0.4, 0, 0.2, 1) })),
      -1,
      false
    );
    rotation.value = withRepeat(
      withTiming(360, { duration: 10000 + index * 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, [index, animatedValue, rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(animatedValue.value, [0, 1], [0.5, 3]);
    const opacity = interpolate(animatedValue.value, [0, 0.4, 1], [0, 0.6, 0], Extrapolate.CLAMP);
    const borderDash = interpolate(animatedValue.value, [0, 1], [1, 20]);

    return {
      transform: [
        { scale },
        { rotate: `${rotation.value}deg` }
      ],
      opacity,
      borderColor: index % 2 === 0 ? '#C026D3' : '#2563EB',
      borderWidth: interpolate(animatedValue.value, [0, 1], [4, 1]),
      borderStyle: 'dashed',
    };
  });

  return <Animated.View style={[styles.ring, animatedStyle]} />;
};

const CoreGlow = () => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulse.value, [0, 1], [1, 1.5]);
    const opacity = interpolate(pulse.value, [0, 1], [0.3, 0.6]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.coreGlow, animatedStyle]}>
      <LinearGradient
        colors={['#8B5CF6', '#3B82F6', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
};

export const PulsingRings = () => {
  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: 15 }).map((_, i) => (
        <Particle key={`p-${i}`} index={i} />
      ))}
      {Array.from({ length: RING_COUNT }).map((_, i) => (
        <Orbit key={`o-${i}`} index={i} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
  },
  coreGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
});

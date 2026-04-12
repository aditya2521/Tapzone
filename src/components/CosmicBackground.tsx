import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  SensorType,
  useAnimatedSensor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const STAR_COUNT = 40;

const Star = ({ index, depth }: { index: number; depth: number }) => {
  const size = useMemo(() => Math.random() * (3 - depth) + 1, [depth]);
  const top = useMemo(() => Math.random() * height, []);
  const left = useMemo(() => Math.random() * width, []);
  const opacity = useMemo(() => Math.random() * 0.5 + 0.3, []);

  const sensor = useAnimatedSensor(SensorType.GYROSCOPE, { interval: 16 });

  const animatedStyle = useAnimatedStyle(() => {
    const { x, y } = sensor.sensor.value;
    const movement = depth * 15;

    return {
      opacity: withSpring(opacity, { damping: 10 }),
      transform: [
        { translateX: withSpring(x * movement, { damping: 20 }) },
        { translateY: withSpring(y * movement, { damping: 20 }) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.star,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          top,
          left,
          backgroundColor: depth === 1 ? '#A855F7' : depth === 2 ? '#3B82F6' : '#FFF',
        },
        animatedStyle,
      ]}
    />
  );
};

const ShootingStar = () => {
  const animatedValue = useSharedValue(0);
  const startX = useMemo(() => Math.random() * width, []);
  const startY = useMemo(() => Math.random() * (height / 2), []);
  const angle = useMemo(() => Math.random() * 45 + 135, []);

  useEffect(() => {
    const trigger = () => {
      animatedValue.value = 0;
      animatedValue.value = withDelay(
        Math.random() * 8000 + 3000,
        withTiming(1, { duration: 600, easing: Easing.linear })
      );
    };

    const interval = setInterval(trigger, 10000);
    trigger();
    return () => clearInterval(interval);
  }, [animatedValue]);

  const animatedStyle = useAnimatedStyle(() => {
    const travel = 600;
    const translateX = interpolate(animatedValue.value, [0, 1], [0, -travel * Math.cos((angle * Math.PI) / 180)]);
    const translateY = interpolate(animatedValue.value, [0, 1], [0, travel * Math.sin((angle * Math.PI) / 180)]);
    const opacity = interpolate(animatedValue.value, [0, 0.1, 0.5, 1], [0, 1, 1, 0]);

    return {
      transform: [{ translateX }, { translateY }, { rotate: `${angle}deg` }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[styles.shootingStar, { top: startY, left: startX }, animatedStyle]}
    >
      <LinearGradient
        colors={['transparent', 'rgba(255, 255, 255, 0.5)', '#FFF']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.starTail}
      />
    </Animated.View>
  );
};

export const CosmicBackground = ({ children }: { children: React.ReactNode }) => {
  const sensor = useAnimatedSensor(SensorType.GYROSCOPE, { interval: 16 });

  const animatedStyle = useAnimatedStyle(() => {
    const { x, y } = sensor.sensor.value;
    const rotateX = interpolate(y, [-2, 2], [8, -8], Extrapolate.CLAMP);
    const rotateY = interpolate(x, [-2, 2], [-8, 8], Extrapolate.CLAMP);

    return {
      transform: [
        { perspective: 1000 },
        { rotateX: `${rotateX}deg` },
        { rotateY: `${rotateY}deg` },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#050110', '#1E1B4B', '#020008']}
        style={StyleSheet.absoluteFill}
      />

      <View style={StyleSheet.absoluteFill}>
        {/* Deep Field Stars */}
        {Array.from({ length: 20 }).map((_, i) => (
          <Star key={`s1-${i}`} index={i} depth={1} />
        ))}
        {/* Mid Field Stars */}
        {Array.from({ length: 20 }).map((_, i) => (
          <Star key={`s2-${i}`} index={i} depth={2} />
        ))}
        {/* Foreground Stars */}
        {Array.from({ length: 15 }).map((_, i) => (
          <Star key={`s3-${i}`} index={i} depth={3} />
        ))}

        <ShootingStar />
        <ShootingStar />

        {/* Nebula Fog Bottom */}
        <LinearGradient
          colors={['transparent', 'rgba(139, 92, 246, 0.15)', 'rgba(59, 130, 246, 0.25)']}
          style={styles.nebula}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      <Animated.View style={[styles.content, animatedStyle]}>
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050110',
  },
  star: {
    position: 'absolute',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  shootingStar: {
    position: 'absolute',
    width: 200,
    height: 1,
    zIndex: 1,
  },
  starTail: {
    width: '100%',
    height: '100%',
    borderRadius: 1,
  },
  nebula: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

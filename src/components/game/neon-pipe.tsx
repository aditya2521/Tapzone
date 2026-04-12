import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

interface NeonPipeProps {
  color?: string;
  isTop?: boolean;
}

export const NeonPipe = ({ color = '#06B6D4', isTop = false }: NeonPipeProps) => {
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(pulse.value, [0, 1], [0.3, 0.7]),
    };
  });

  return (
    <View style={styles.container}>
      {/* Pipe Body */}
      <BlurView intensity={30} tint="dark" style={[
        styles.pipeBody, 
        { borderColor: color },
        isTop ? styles.topPipe : styles.bottomPipe
      ]}>
        <LinearGradient
          colors={[`${color}20`, `${color}40`, `${color}20`]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        
        {/* Neon Glow Lines */}
        <View style={[styles.glowLine, { backgroundColor: color, left: 2 }]} />
        <View style={[styles.glowLine, { backgroundColor: color, right: 2 }]} />
        
        {/* Inner Pulse */}
        <Animated.View style={[
          StyleSheet.absoluteFill,
          { backgroundColor: color },
          glowStyle
        ]} />
      </BlurView>

      {/* Pipe Mouth / Cap */}
      <View style={[
        styles.pipeCap, 
        { backgroundColor: color, borderColor: '#FFF' },
        isTop ? styles.topCap : styles.bottomCap
      ]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.4)', 'transparent', 'rgba(255,255,255,0.2)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.capGlow} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: '100%',
    alignItems: 'center',
  },
  pipeBody: {
    width: 50,
    height: '100%',
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(5, 1, 16, 0.6)',
  },
  topPipe: {
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  bottomPipe: {
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  glowLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    opacity: 0.8,
  },
  pipeCap: {
    width: 66,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    position: 'absolute',
    zIndex: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowColor: '#FFF',
  },
  topCap: {
    bottom: -12,
  },
  bottomCap: {
    top: -12,
  },
  capGlow: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: '80%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 1,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  SensorType,
  useAnimatedSensor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming
} from 'react-native-reanimated';

import { CosmicBackground } from '@/components/CosmicBackground';
import { PulsingRings } from '@/components/PulsingRings';
import { useSplashAnimation } from '@/hooks/use-splash-animation';

const { width } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const STATUS_MESSAGES = [
  'INITIALIZING TAPLINK...',
  'OPTIMIZING NEON CORE...',
  'SYNCING RHYTHM ENGINE...',
  'SYSTEM READY // TAPZONE'
];

export const SplashScreen = () => {
  const { handlePlayPress, animatedButtonStyle } = useSplashAnimation();
  const [statusIndex, setStatusIndex] = useState(0);
  const coreScale = useSharedValue(1);
  const sensor = useAnimatedSensor(SensorType.GYROSCOPE, { interval: 16 });

  useEffect(() => {
    // Pulse the core
    coreScale.value = withRepeat(
      withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Cycle status messages
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev < STATUS_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 1500);

    return () => clearInterval(interval);
  }, [coreScale]);

  const animatedLogoStyle = useAnimatedStyle(() => {
    const { x, y } = sensor.sensor.value;
    const rotateX = withSpring(interpolate(y, [-1, 1], [10, -10]), { damping: 15 });
    const rotateY = withSpring(interpolate(x, [-1, 1], [-15, 15]), { damping: 15 });

    return {
      transform: [
        { perspective: 1000 },
        { rotateX: `${rotateX}deg` },
        { rotateY: `${rotateY}deg` },
        { scale: coreScale.value },
      ],
    };
  });

  return (
    <CosmicBackground>
      <View style={styles.container}>
        <PulsingRings />

        {/* Central Reactor Core */}
        <Animated.View style={[styles.reactorWrapper, animatedLogoStyle]}>
          <Animated.View 
            entering={FadeIn.duration(1500)}
            style={styles.logoContainer}
          >
            <Image
              source={require('@/assets/images/logo-reactor.png')}
              style={styles.reactorImage}
              resizeMode="contain"
            />
            
            {/* HUD Scanning Lines */}
            <View style={styles.scanningFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </Animated.View>
        </Animated.View>

        {/* Status Readout */}
        <View style={styles.statusWrapper}>
          <Animated.Text 
            key={statusIndex}
            entering={FadeInDown.duration(800)}
            style={styles.statusText}
          >
            {STATUS_MESSAGES[statusIndex]}
          </Animated.Text>
          <View style={styles.statusLine} />
        </View>

        {/* Premium Play Button - Lower Position */}
        <Animated.View 
          entering={FadeInUp.delay(2000).springify().damping(12)}
          style={styles.bottomControls}
        >
          <AnimatedPressable
            onPress={handlePlayPress}
            style={[styles.playButtonWrapper, animatedButtonStyle]}
          >
            <BlurView intensity={30} tint="dark" style={styles.glassButton}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.3)', 'rgba(59, 130, 246, 0.3)']}
                style={styles.buttonGradient}
              >
                <View style={styles.innerDiamond}>
                  <Ionicons name="play" size={40} color="#FFF" />
                </View>
              </LinearGradient>
            </BlurView>
          </AnimatedPressable>
          <Text style={styles.versionText}>v1.0.0 // STABLE BUILD</Text>
        </Animated.View>
      </View>
    </CosmicBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactorWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
  },
  logoContainer: {
    width: 320,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 160,
    overflow: 'hidden',
    backgroundColor: '#050110', // Match exact background for seamless look
  },
  reactorImage: {
    width: 300,
    height: 300,
  },
  scanningFrame: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    borderWidth: 2,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  statusWrapper: {
    position: 'absolute',
    bottom: 240,
    alignItems: 'center',
  },
  statusText: {
    color: '#8B5CF6',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 8,
    textShadowColor: 'rgba(139, 92, 246, 0.5)',
    textShadowRadius: 10,
  },
  statusLine: {
    width: 140,
    height: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  playButtonWrapper: {
    width: 100,
    height: 100,
    transform: [{ rotate: '45deg' }],
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glassButton: {
    flex: 1,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerDiamond: {
    transform: [{ rotate: '-45deg' }],
    marginLeft: 5,
  },
  versionText: {
    marginTop: 40,
    color: 'rgba(139, 92, 246, 0.5)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
  },
});

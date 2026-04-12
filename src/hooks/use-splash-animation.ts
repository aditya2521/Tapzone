import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withSequence,
  withTiming
} from 'react-native-reanimated';

export const useSplashAnimation = () => {
  const router = useRouter();
  const buttonScale = useSharedValue(1);

  const handlePlayPress = useCallback(() => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Button animation
    buttonScale.value = withSequence(
      withSpring(0.9, { damping: 10, stiffness: 200 }),
      withSpring(1.2, { damping: 10, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );

    // Navigate to arcade after a short delay to allow animation to feel impactful
    setTimeout(() => {
      router.replace('/arcade');
    }, 400);
  }, [router, buttonScale]);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  return {
    handlePlayPress,
    animatedButtonStyle,
  };
};

import React from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue, 
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { Colors, Fonts } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

interface GameCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  highScore?: number;
  displayScore?: string;
  onPress: () => void;
  isLocked?: boolean;
}

export const GameCard = ({ 
  title, 
  description, 
  icon, 
  color, 
  highScore, 
  displayScore,
  onPress, 
  isLocked 
}: GameCardProps) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
    shadowColor: color,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    glowOpacity.value = withSpring(0.6);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    glowOpacity.value = withSpring(0.3);
  };

  return (
    <Animated.View style={[styles.cardContainer, animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={isLocked}
        style={styles.pressable}
      >
        <Animated.View style={[styles.cardGlow, glowStyle, { borderColor: isLocked ? 'rgba(148, 163, 184, 0.2)' : `${color}40` }]}>
          <BlurView intensity={25} tint="dark" style={styles.blurContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'transparent']}
              style={styles.gradient}
            />
            
            <View style={[styles.content, isLocked && { opacity: 0.5 }]}>
              <View style={[styles.iconWrapper, { backgroundColor: isLocked ? 'rgba(148, 163, 184, 0.1)' : `${color}20` }]}>
                <IconSymbol size={32} name={icon as any} color={isLocked ? '#64748B' : color} />
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
              </View>

              {(highScore !== undefined || displayScore !== undefined) && !isLocked && (
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreLabel}>BEST</Text>
                  <Text style={styles.scoreValue}>{displayScore ?? highScore}</Text>
                </View>
              )}
            </View>

            {isLocked && (
              <View style={styles.lockedOverlay}>
                <BlurView intensity={10} tint="dark" style={styles.lockedBadge}>
                  <IconSymbol size={14} name="lock.fill" color="#94A3B8" />
                  <Text style={styles.lockedBadgeText}>COMING SOON</Text>
                </BlurView>
              </View>
            )}

            <View style={styles.footer}>
              <Pressable disabled={isLocked} onPress={onPress}>
                <LinearGradient
                  colors={isLocked ? ['#334155', '#1E293B'] : [color, `${color}CC`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.playButton}
                >
                  <Text style={styles.playText}>{isLocked ? 'LOCKED' : 'PLAY NOW'}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </BlurView>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: 180,
    marginVertical: 8,
    alignSelf: 'center',
  },
  pressable: {
    flex: 1,
  },
  cardGlow: {
    flex: 1,
    borderRadius: 32,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  blurContainer: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textContainer: {
    flex: 1,
    paddingTop: 4,
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    fontFamily: Fonts.rounded,
    marginBottom: 4,
  },
  description: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  scoreBadge: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  scoreValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  footer: {
    padding: 20,
    paddingTop: 0,
    alignItems: 'flex-end',
  },
  playButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  playText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
  },
  lockedBadgeText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
});

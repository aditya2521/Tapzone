import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/theme';

interface ScoreHUDProps {
  score: number;
  highScore: number;
}

export const ScoreHUD = ({ score, highScore }: ScoreHUDProps) => {
  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="dark" style={styles.blur}>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreTitle}>SCORE</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.highScoreRow}>
          <Text style={styles.highScoreTitle}>BEST</Text>
          <Text style={styles.highScoreValue}>{highScore}</Text>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    width: '100%',
    alignItems: 'center',
    zIndex: 100,
  },
  blur: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  scoreTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
  },
  scoreValue: {
    color: '#FFF',
    fontSize: 48,
    fontWeight: '900',
  },
  highScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: -4,
  },
  highScoreTitle: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  highScoreValue: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '800',
  },
});

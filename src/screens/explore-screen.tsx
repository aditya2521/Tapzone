import { useHighScores } from '@/hooks/use-high-scores';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CosmicBackground } from '@/components/CosmicBackground';
import { GameCard } from '@/components/game/game-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string | null;
  isLocked?: boolean;
}

const INITIAL_GAMES: Game[] = [
  {
    id: 'stack-game',
    title: 'Stack Up',
    description: 'Stack the blocks as high as you can! Timing is everything.',
    icon: 'square.stack.3d.up.fill',
    color: '#8B5CF6',
    route: '/stack-game',
  },

  {
    id: '2048',
    title: 'Neon 2048',
    description: 'Swipe to merge cosmic tiles and reach the 2048 singularity.',
    icon: 'grid.circle.fill',
    color: '#10B981',
    route: '/2048',
  },
  {
    id: 'neon-fly',
    title: 'Neon Fly',
    description: 'Tap to keep your drone airborne through energy barriers.',
    icon: 'paperplane.fill',
    color: '#8B5CF6',
    route: '/neon-fly',
  },
  {
    id: 'tap-frenzy',
    title: 'Tap Frenzy',
    description: 'Tap as fast as you can! 10 seconds of pure speed.',
    icon: 'bolt.fill',
    color: '#F43F5E',
    route: '/tap-frenzy',
  },
  {
    id: 'whack-a-glow',
    title: 'Whack-a-Glow',
    description: 'Tap the neon orbs before they vanish. Watch out!',
    icon: 'target',
    color: '#06B6D4',
    route: '/whack-a-glow',
  },
  {
    id: 'color-reflex',
    title: 'Color Reflex',
    description: 'React only to the target color. Don\'t miss!',
    icon: 'circle.hexagongrid.fill',
    color: '#F59E0B',
    route: '/color-reflex',
  },
  {
    id: 'simon-glow',
    title: 'Simon Glow',
    description: 'Repeat the sequence of light. How far can you go?',
    icon: 'square.grid.2x2.fill',
    color: '#8B5CF6',
    route: '/simon-glow',
  },
  {
    id: 'tap-sequence',
    title: 'Tap Sequence',
    description: 'Find and tap numbers 1-25 as fast as possible.',
    icon: 'textformat.123',
    color: '#3B82F6',
    route: '/tap-sequence',
  },
  {
    id: 'pattern-lock',
    title: 'Pattern Lock',
    description: 'Memorize and reveal the hidden neon pattern.',
    icon: 'lock.rectangle.on.rectangle',
    color: '#10B981',
    route: '/pattern-lock',
  },
  {
    id: 'cosmic-patches',
    title: 'Cosmic Patches',
    description: 'Divide the cosmic grid into rectangles to match the clues.',
    icon: 'square.grid.3x3.topleft.filled',
    color: '#06B6D4',
    route: '/patches',
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const { getHighScore, refresh } = useHighScores();
  const [games, setGames] = useState(INITIAL_GAMES);

  // Refresh scores when screen is focused (e.g. coming back from a game)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handlePlay = (route: string | null) => {
    if (route) {
      router.push(route as any);
    }
  };

  const formatHighScore = (id: string, score: number) => {
    if (!score) return undefined;

    switch (id) {
      case 'tap-sequence':
        // Tap Sequence uses inverted scores: 100000 - timeMs
        return ((100000 - score) / 1000).toFixed(1) + 's';
      case 'tap-frenzy':
        return score.toString();
      case '2048':
        return score >= 1000 ? (score / 1000).toFixed(1) + 'K' : score.toString();
      case 'cosmic-patches':
        return 'Lvl ' + score;
      default:
        return score.toString();
    }
  };

  return (
    <CosmicBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
          <Image
            source={require('@/assets/images/logo-reactor.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerSubtitle}>NEON ARCADE</Text>
          <Text style={styles.headerTitle}>TAPZONE</Text>
          <View style={styles.headerLine} />
        </Animated.View>

        <View style={styles.gameGrid}>
          {games.map((game) => (
            <GameCard
              key={game.id}
              title={game.title}
              description={game.description}
              icon={game.icon}
              color={game.color}
              highScore={getHighScore(game.id)}
              displayScore={formatHighScore(game.id, getHighScore(game.id))}
              isLocked={game.isLocked}
              onPress={() => handlePlay(game.route)}
            />
          ))}
        </View>

        <View style={styles.footerInfo}>
          <IconSymbol size={20} name="info.circle" color="#94A3B8" />
          <Text style={styles.footerText}>New games added every week!</Text>
        </View>
      </ScrollView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 30,
    alignItems: 'center',
  },
  headerLogo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  headerSubtitle: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 4,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 48,
    fontWeight: '900',
    fontFamily: Fonts.rounded,
    letterSpacing: -1,
  },
  headerLine: {
    width: 60,
    height: 4,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
    marginTop: 8,
  },
  gameGrid: {
    gap: 16,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    gap: 8,
    opacity: 0.6,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
});


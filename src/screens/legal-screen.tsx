import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, ScrollView, Dimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { CosmicBackground } from '@/components/CosmicBackground';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { PRIVACY_POLICY, TERMS_AND_CONDITIONS } from '@/constants/legal';

const { width } = Dimensions.get('window');

const LegalSection = ({ title, content }: { title: string, content: string }) => {
  // Simple markdown-ish formatter
  const lines = content.split('\n');
  
  return (
    <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.contentInner}>
        {lines.map((line, index) => {
          if (line.startsWith('# ')) {
            return <Text key={index} style={styles.h1}>{line.replace('# ', '')}</Text>;
          }
          if (line.startsWith('## ')) {
            return <Text key={index} style={styles.h2}>{line.replace('## ', '')}</Text>;
          }
          if (line.startsWith('- ')) {
            return <Text key={index} style={styles.listItem}>• {line.replace('- ', '')}</Text>;
          }
          if (line.trim() === '') return <View key={index} style={{ height: 10 }} />;
          
          return <Text key={index} style={styles.paragraph}>{line}</Text>;
        })}
      </Animated.View>
    </ScrollView>
  );
};

export default function LegalScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('terms');

  return (
    <CosmicBackground>
      <View style={styles.container}>
        <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>LEGAL</Text>
          <View style={{ width: 44 }} />
        </Animated.View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'terms' && styles.activeTab]}
            onPress={() => setActiveTab('terms')}
          >
            <Text style={[styles.tabText, activeTab === 'terms' && styles.activeTabText]}>TERMS</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'privacy' && styles.activeTab]}
            onPress={() => setActiveTab('privacy')}
          >
            <Text style={[styles.tabText, activeTab === 'privacy' && styles.activeTabText]}>PRIVACY</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.viewContainer}>
          {activeTab === 'terms' ? (
            <LegalSection title="Terms of Service" content={TERMS_AND_CONDITIONS} />
          ) : (
            <LegalSection title="Privacy Policy" content={PRIVACY_POLICY} />
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>© 2026 TapZone Neon Arcade</Text>
        </View>
      </View>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
    fontFamily: Fonts.rounded,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#8B5CF6',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  activeTabText: {
    color: '#FFF',
  },
  viewContainer: {
    flex: 1,
    marginHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  contentScroll: {
    flex: 1,
  },
  contentInner: {
    padding: 24,
  },
  h1: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 20,
    fontFamily: Fonts.rounded,
  },
  h2: {
    fontSize: 20,
    fontWeight: '800',
    color: '#8B5CF6',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: '#CBD5E1',
    lineHeight: 24,
    marginBottom: 12,
  },
  listItem: {
    fontSize: 16,
    color: '#CBD5E1',
    lineHeight: 24,
    marginLeft: 12,
    marginBottom: 8,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 4,
    opacity: 0.5,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

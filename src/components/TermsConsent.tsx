import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { useTermsConsent } from '@/hooks/use-terms-consent';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export function TermsConsent() {
  const { hasAccepted, loading, acceptTerms } = useTermsConsent();
  const router = useRouter();

  if (loading || hasAccepted) return null;

  const handleReadFull = () => {
    router.push('/legal');
  };

  return (
    <Modal transparent animationType="none" visible={!hasAccepted}>
      <Animated.View 
        entering={FadeIn} 
        exiting={FadeOut} 
        style={styles.overlay}
      >
        <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
          <Animated.View entering={FadeIn.delay(300)} style={styles.card}>
            <View style={styles.iconContainer}>
              <IconSymbol name="lock.shield" size={48} color="#8B5CF6" />
            </View>

            <Text style={styles.title}>Welcome to TapZone</Text>
            
            <ScrollView style={styles.textScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.description}>
                Before you start exploring the cosmic arcade, please take a moment to review our Terms and Privacy Policy.
                {"\n\n"}
                We are committed to a <Text style={styles.highlight}>Privacy-First</Text> experience:
                {"\n"}• Your scores are stored locally.
                {"\n"}• No personal data is collected.
                {"\n"}• No account is required to play.
                {"\n\n"}
                By clicking "Accept", you agree to our Terms of Use and acknowledge our Privacy Policy.
              </Text>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={handleReadFull}
              >
                <Text style={styles.secondaryButtonText}>Read Full Policies</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={acceptTerms}
              >
                <Text style={styles.primaryButtonText}>ACCEPT & PLAY</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </BlurView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    fontFamily: Fonts.rounded,
    marginBottom: 16,
    textAlign: 'center',
  },
  textScroll: {
    maxHeight: 250,
    width: '100%',
    marginBottom: 24,
  },
  description: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  highlight: {
    color: '#8B5CF6',
    fontWeight: '700',
  },
  footer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#8B5CF6',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

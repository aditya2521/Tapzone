import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';

// Global state to persist sound settings across screens
let globalMuted = false;
const soundListeners: Set<(muted: boolean) => void> = new Set();

const SOUNDS = {
  TAP: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  FAILURE: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3',
  HIT: 'https://assets.mixkit.co/active_storage/sfx/1234/1234-preview.mp3',
  THROW: 'https://assets.mixkit.co/active_storage/sfx/1233/1233-preview.mp3',
  MERGE: 'https://assets.mixkit.co/active_storage/sfx/2633/2633-preview.mp3',
  BUBBLE_1: 'https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3',
  BUBBLE_2: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
  BUBBLE_3: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
  SHORT_BUBBLE: 'https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3',
  COLLAPSE: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3',
  CRACK: 'https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3',
};

export type SoundType = keyof typeof SOUNDS | 'BUBBLE';

export const useGameSounds = () => {
  const [isMuted, setIsMuted] = useState(globalMuted);
  const soundsRef = useRef<Record<string, Audio.Sound>>({});

  useEffect(() => {
    const listener = (muted: boolean) => setIsMuted(muted);
    soundListeners.add(listener);

    return () => {
      soundListeners.delete(listener);
      // Unload all sounds on unmount
      Object.values(soundsRef.current).forEach(sound => {
        sound.unloadAsync();
      });
    };
  }, []);

  const toggleMute = useCallback(() => {
    globalMuted = !globalMuted;
    soundListeners.forEach(listener => listener(globalMuted));
  }, []);

  const playSound = useCallback(async (type: SoundType) => {
    try {
      if (globalMuted) return;

      // Small guard for missing native modules during builds
      if (!Audio) return;

      // Use a single satisfying bubble sound instead of randomizing
      let soundKey: string = type;
      if (type === 'BUBBLE') {
        soundKey = 'BUBBLE_3';
      }

      // If already loaded, just replay
      if (soundsRef.current[soundKey]) {
        await soundsRef.current[soundKey].replayAsync();
        return;
      }

      // Load and play
      const { sound } = await Audio.Sound.createAsync(
        { uri: SOUNDS[soundKey as keyof typeof SOUNDS] },
        { shouldPlay: true }
      );
      soundsRef.current[soundKey] = sound;
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }, []);

  return { playSound, isMuted, toggleMute };
};

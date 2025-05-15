import React, { createContext, useContext, useState, useEffect } from 'react';
import { Audio } from 'expo-av';

interface AudioContextType {
  playAudio: (url: string, sermonId: string) => Promise<void>;
  pauseAudio: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  getPlaybackStatus: () => { isPlaying: boolean; position: number; duration: number };
  currentSermonId: string | null;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSermonId, setCurrentSermonId] = useState<string | null>(null);

  const playAudio = async (url: string, sermonId: string) => {
    try {
      // Pause and unload any existing sound
      if (sound) {
        console.log('Pausing previous audio, sermon id:', currentSermonId);
        await sound.pauseAsync();
        console.log('Unloading previous audio');
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        setPosition(0);
        setDuration(0);
      }

      // Load new sound
      console.log('Loading new audio:', url);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: false }
      );
      setSound(newSound);
      setCurrentSermonId(sermonId);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis || 0);
          setDuration(status.durationMillis || 0);
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPosition(0);
            alert('Audio finished playing');
          }
        }
      });

      console.log('Playing audio, sermon id:', sermonId);
      await newSound.playAsync();
      setIsPlaying(true);
    } catch (err) {
      console.log('Audio load/play error:', err);
      throw err;
    }
  };

  const pauseAudio = async () => {
    if (sound && isPlaying) {
      console.log('Pausing audio, sermon id:', currentSermonId);
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const seekTo = async (position: number) => {
    if (sound) {
      try {
        await sound.setPositionAsync(position);
      } catch (err) {
        console.log('Seek error:', err);
        throw err;
      }
    }
  };

  const getPlaybackStatus = () => ({
    isPlaying,
    position,
    duration,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        console.log('Unloading audio on provider unmount');
        sound.unloadAsync().catch((err) => console.log('Unload error:', err));
      }
    };
  }, [sound]);

  return (
    <AudioContext.Provider value={{ playAudio, pauseAudio, seekTo, getPlaybackStatus, currentSermonId }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
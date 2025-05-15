import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Slider } from '@miblanchard/react-native-slider';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useAudio } from '@/lib/audio-context';

export default function SermonDetailScreen() {
  console.log('SermonDetailScreen: Rendering');
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const tint = Colors[scheme ?? 'light'].tint;
  const { playAudio, pauseAudio, seekTo, getPlaybackStatus, currentSermonId } = useAudio();

  // State for audio playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);

  const fetchSermonDetail = async () => {
    const { data, error } = await supabase
      .from('sermons')
      .select('*, series(name)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  };

  const { data: sermon, isLoading, error } = useQuery({
    queryKey: ['sermon', id],
    queryFn: fetchSermonDetail,
  });

  // Update local state based on global audio context
  useEffect(() => {
    const updateStatus = () => {
      const { isPlaying: playing, position: pos, duration: dur } = getPlaybackStatus();
      setIsPlaying(playing && currentSermonId === id);
      setPosition(pos);
      setDuration(dur);
    };

    const interval = setInterval(updateStatus, 500);
    updateStatus();

    return () => clearInterval(interval);
  }, [getPlaybackStatus, currentSermonId, id]);

  // Pause audio when screen loses focus
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        console.log('Screen blurred, sermon id:', id);
        pauseAudio().catch((err) => console.log('Pause error on blur:', err));
      };
    }, [pauseAudio])
  );

  // Play or pause audio
  const toggleAudio = async () => {
    if (!sermon) return;
    try {
      if (isPlaying && currentSermonId === id) {
        await pauseAudio();
      } else {
        await playAudio(sermon.media_url, id);
      }
    } catch (err) {
      setAudioError('Playback error: ' + err.message);
    }
  };

  // Seek to a position using the slider
  const seekToPosition = async (value: number) => {
    try {
      await seekTo(value);
    } catch (err) {
      setAudioError('Seek error: ' + err.message);
    }
  };

  // Format time as mm:ss
  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 1000 / 60);
    const seconds = Math.floor((millis / 1000) % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color={tint} style={styles.loader} />;
  }

  if (error || !sermon) {
    return (
      <ThemedText style={[styles.error, { color: scheme === 'dark' ? '#f88' : 'red' }]}>
        Error loading sermon: {error?.message || 'Sermon not found'}
      </ThemedText>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={[styles.title, { color: tint }]}>
          {sermon.title}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {sermon.speaker} | {sermon.series?.name || 'No Series'}
        </ThemedText>
        <ThemedText style={styles.date}>
          {new Date(sermon.date).toLocaleDateString()}
        </ThemedText>
        <ThemedText style={styles.description}>{sermon.description || 'No description'}</ThemedText>
        {sermon.media_type === 'video' ? (
          <Video
            source={{ uri: sermon.media_url }}
            style={styles.media}
            useNativeControls
            resizeMode="contain"
            shouldPlay={false}
          />
        ) : (
          <View style={styles.audioContainer}>
            {audioError ? (
              <ThemedText style={[styles.error, { color: scheme === 'dark' ? '#f88' : 'red' }]}>
                {audioError}
              </ThemedText>
            ) : (
              <View style={styles.player}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={toggleAudio}
                  disabled={!sermon}
                >
                  <Ionicons
                    name={isPlaying && currentSermonId === id ? 'pause' : 'play'}
                    size={24}
                    color={scheme === 'dark' ? '#fff' : '#000'}
                  />
                </TouchableOpacity>
                <View style={styles.progressContainer}>
                  <ThemedText style={styles.timeText}>
                    {formatTime(position)}
                  </ThemedText>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={duration || 1}
                    value={position}
                    onValueChange={seekToPosition}
                    minimumTrackTintColor={tint}
                    maximumTrackTintColor={scheme === 'dark' ? '#555' : '#ccc'}
                    thumbTintColor={tint}
                    disabled={!sermon || currentSermonId !== id}
                  />
                  <ThemedText style={styles.timeText}>
                    {formatTime(duration)}
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { padding: 16, fontSize: 16, textAlign: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 8 },
  date: { fontSize: 16, color: '#555', marginBottom: 8 },
  description: { fontSize: 16, marginBottom: 16 },
  media: { width: '100%', height: 220, borderRadius: 8, marginBottom: 16 },
  audioContainer: { marginBottom: 16 },
  player: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 8,
  },
  playButton: {
    padding: 8,
    marginRight: 12,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#555',
  },
});
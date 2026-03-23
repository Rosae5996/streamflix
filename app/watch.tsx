import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  controlButton: {
    padding: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginVertical: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 2,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
});

export default function WatchScreen() {
  const router = useRouter();
  const { contentId, videoId } = useLocalSearchParams();
  const { user } = useAuth();
  const [content, setContent] = useState<any>(null);
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showControls, setShowControls] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);

  const player = useVideoPlayer(video?.videoUrl || '', (player) => {
    player.play();
  });

  useEffect(() => {
    loadContent();
  }, [contentId, videoId]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError('');

      if (!contentId) {
        setError('Contenido no encontrado');
        return;
      }

      // Load content
      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .select('*')
        .eq('id', contentId)
        .single();

      if (contentError) throw contentError;
      setContent(contentData);

      // Load video
      if (videoId) {
        const { data: videoData, error: videoError } = await supabase
          .from('videos')
          .select('*')
          .eq('id', videoId)
          .single();

        if (videoError) throw videoError;
        setVideo(videoData);
      } else {
        const { data: videoData, error: videoError } = await supabase
          .from('videos')
          .select('*')
          .eq('content_id', contentId)
          .limit(1)
          .single();

        if (videoError) throw videoError;
        setVideo(videoData);
      }

      // Update watch history
      if (user) {
        await supabase.from('watch_history').insert({
          user_id: user.id,
          content_id: contentId,
          watched_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error loading content:', err);
      setError('Error al cargar el contenido');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#E50914',
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 8,
            }}
            onPress={() => router.back()}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.videoContainer}>
        {video && (
          <>
            <VideoView
              style={styles.video}
              player={player}
              allowsFullscreen
              allowsPictureInPicture
            />

            {/* Top bar */}
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <ArrowLeft size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.title}>{content?.title}</Text>
            </View>

            {/* Controls */}
            {showControls && (
              <View style={styles.controls}>
                <View style={styles.controlsRow}>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => {
                      if (playing) {
                        player.pause();
                      } else {
                        player.play();
                      }
                      setPlaying(!playing);
                    }}
                  >
                    {playing ? (
                      <Pause size={24} color="#fff" />
                    ) : (
                      <Play size={24} color="#fff" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => {
                      player.muted = !muted;
                      setMuted(!muted);
                    }}
                  >
                    {muted ? (
                      <VolumeX size={24} color="#fff" />
                    ) : (
                      <Volume2 size={24} color="#fff" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => {
                      player.requestFullscreen();
                    }}
                  >
                    <Maximize size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          player.duration > 0
                            ? (player.currentTime / player.duration) * 100
                            : 0
                        }%`,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.timeText}>
                  {formatTime(player.currentTime)} / {formatTime(player.duration)}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

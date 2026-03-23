import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Trash2 } from 'lucide-react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0d0d0d',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contentCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  contentImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  contentImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#222',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E50914',
    borderRadius: 20,
    padding: 8,
  },
  contentInfo: {
    padding: 8,
  },
  contentTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  contentType: {
    fontSize: 11,
    color: '#E50914',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default function WatchlistScreen() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadWatchlist();
    }
  }, [user]);

  const loadWatchlist = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('watchlist')
        .select('*, content(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      setWatchlist(data || []);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (watchlistId: string) => {
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', watchlistId);

      if (error) throw error;
      setWatchlist(watchlist.filter((item) => item.id !== watchlistId));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Lista</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Lista</Text>
      </View>

      {watchlist.length > 0 ? (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.contentGrid}>
              {watchlist.map((item) => (
                <View key={item.id} style={styles.contentCard}>
                  <View style={styles.contentImageContainer}>
                    {item.content?.posterUrl && (
                      <Image
                        source={{ uri: item.content.posterUrl }}
                        style={styles.contentImage}
                      />
                    )}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => removeFromWatchlist(item.id)}
                    >
                      <Trash2 size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.contentInfo}>
                    <Text style={styles.contentTitle} numberOfLines={2}>
                      {item.content?.title}
                    </Text>
                    <Text style={styles.contentType}>
                      {item.content?.type === 'movie' ? 'Película' : 'Serie'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tu lista está vacía</Text>
          <Text style={[styles.emptyText, { marginTop: 8, fontSize: 14 }]}>
            Agrega películas y series a tu lista para verlas después
          </Text>
        </View>
      )}
    </View>
  );
}

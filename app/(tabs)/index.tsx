import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0d0d0d',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
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
  contentImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#222',
  },
  contentInfo: {
    padding: 8,
  },
  contentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  contentType: {
    fontSize: 12,
    color: '#E50914',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function HomeScreen() {
  const { user, loading, isAuthenticated } = useAuth();
  const [content, setContent] = useState<any[]>([]);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadContent();
    }
  }, [isAuthenticated]);

  const loadContent = async () => {
    try {
      setContentLoading(true);
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('status', 'published')
        .limit(6);

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setContentLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <Text style={{ color: '#E50914' }}>Stream</Text>Flix
        </Text>
        <Text style={styles.headerSubtitle}>
          {isAuthenticated ? `Bienvenido, ${user?.email}` : 'Inicia sesión para ver contenido'}
        </Text>
      </View>

      {isAuthenticated ? (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {contentLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E50914" />
            </View>
          ) : (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Películas Populares</Text>
                <View style={styles.contentGrid}>
                  {content.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.contentCard}>
                      {item.posterUrl && (
                        <Image
                          source={{ uri: item.posterUrl }}
                          style={styles.contentImage}
                        />
                      )}
                      <View style={styles.contentInfo}>
                        <Text style={styles.contentTitle} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <Text style={styles.contentType}>
                          {item.type === 'movie' ? 'Película' : 'Serie'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={{ color: '#fff', fontSize: 18, marginBottom: 24 }}>
            Inicia sesión para ver contenido
          </Text>
        </View>
      )}
    </View>
  );
}

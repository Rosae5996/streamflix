import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search } from 'lucide-react-native';

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
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    color: '#fff',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
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
    height: 180,
    backgroundColor: '#222',
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
});

export default function BrowseScreen() {
  const [content, setContent] = useState<any[]>([]);
  const [filteredContent, setFilteredContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContent(content);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredContent(
        content.filter(
          (item) =>
            item.title.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, content]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('status', 'published')
        .limit(20);

      if (error) throw error;
      setContent(data || []);
      setFilteredContent(data || []);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explorar</Text>
        <View style={styles.searchContainer}>
          <Search size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar películas, series..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? 'Resultados de búsqueda' : 'Todo el contenido'}
            </Text>
            {filteredContent.length > 0 ? (
              <View style={styles.contentGrid}>
                {filteredContent.map((item) => (
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
            ) : (
              <Text style={{ color: '#999', textAlign: 'center', marginTop: 20 }}>
                No se encontraron resultados
              </Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { format } from 'date-fns';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Favorite {
  id: string;
  recipe: any;
  added_at: string;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchFavorites();
    }
  }, [userId]);

  const initializeUser = async () => {
    try {
      let id = await AsyncStorage.getItem('userId');
      if (!id) {
        id = `user_${Date.now()}`;
        await AsyncStorage.setItem('userId', id);
      }
      setUserId(id);
    } catch (error) {
      console.error('Error initializing user:', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/favorites/${userId}`);
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFavorite = async (favoriteId: string) => {
    Alert.alert(
      'Remove Favorite',
      'Remove this recipe from favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${BACKEND_URL}/api/favorites/${favoriteId}`);
              fetchFavorites();
            } catch (error) {
              console.error('Error deleting favorite:', error);
              Alert.alert('Error', 'Failed to remove favorite');
            }
          },
        },
      ]
    );
  };

  const viewRecipe = (recipe: any) => {
    router.push({
      pathname: '/recipe-detail',
      params: {
        recipe: JSON.stringify(recipe),
        mealType: recipe.meal_type || 'Recipe',
        isFavorite: 'true',
      },
    });
  };

  const renderFavorite = ({ item }: { item: Favorite }) => (
    <TouchableOpacity
      style={styles.favoriteCard}
      onPress={() => viewRecipe(item.recipe)}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="silverware-fork-knife" size={28} color="#FF9B85" />
      </View>
      <View style={styles.textContent}>
        <Text style={styles.recipeName}>{item.recipe.name}</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="clock-outline" size={13} color="#BBB" />
            <Text style={styles.infoText}>{item.recipe.prep_time}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="fire" size={13} color="#BBB" />
            <Text style={styles.infoText}>{item.recipe.cook_time}</Text>
          </View>
        </View>
        <Text style={styles.savedDate}>
          Saved {format(new Date(item.added_at), 'MMM dd')}
        </Text>
      </View>
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          deleteFavorite(item.id);
        }}
        style={styles.heartButton}
      >
        <MaterialCommunityIcons name="heart" size={24} color="#FFB5A0" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF9B85" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Favorites</Text>
          <Text style={styles.subtitle}>
            {favorites.length} {favorites.length === 1 ? 'recipe' : 'recipes'}
          </Text>
        </View>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons name="heart-outline" size={64} color="#DDD" />
          </View>
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>
            Save your favorite recipes to find them quickly
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavorite}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEFEFE',
  },
  header: {
    padding: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3D3D3D',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  favoriteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContent: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3D3D3D',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#BBB',
  },
  savedDate: {
    fontSize: 11,
    color: '#CCC',
  },
  heartButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#3D3D3D',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },
});
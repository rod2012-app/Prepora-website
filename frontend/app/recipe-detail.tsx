import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function RecipeDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [userId, setUserId] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);

  const recipe = params.recipe ? JSON.parse(params.recipe as string) : null;
  const mealType = params.mealType as string;
  const day = params.day as string;

  useEffect(() => {
    initializeUser();
  }, []);

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

  const addToFavorites = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/favorites/add`, {
        user_id: userId,
        recipe: {
          ...recipe,
          meal_type: mealType,
        },
      });
      setIsFavorited(true);
      Alert.alert('Success', 'Recipe added to favorites!');
    } catch (error: any) {
      console.error('Error adding to favorites:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to add to favorites');
    }
  };

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Recipe not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#3D3D3D" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.favoriteButton, isFavorited && styles.favoriteButtonActive]}
            onPress={addToFavorites}
            disabled={isFavorited}
          >
            <MaterialCommunityIcons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorited ? '#FFF' : '#FF9B85'}
            />
          </TouchableOpacity>
        </View>

        {/* Recipe Title */}
        <View style={styles.titleSection}>
          <View style={styles.badgeContainer}>
            <View style={styles.mealTypeBadge}>
              <Text style={styles.mealTypeBadgeText}>{mealType}</Text>
            </View>
            {day && (
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>{day}</Text>
              </View>
            )}
          </View>
          <Text style={styles.recipeTitle}>{recipe.name}</Text>
        </View>

        {/* Recipe Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#FF9B85" />
            </View>
            <Text style={styles.infoLabel}>Prep</Text>
            <Text style={styles.infoValue}>{recipe.prep_time}</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="fire" size={24} color="#FFB5A0" />
            </View>
            <Text style={styles.infoLabel}>Cook</Text>
            <Text style={styles.infoValue}>{recipe.cook_time}</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="account-group" size={24} color="#A8C5A8" />
            </View>
            <Text style={styles.infoLabel}>Serves</Text>
            <Text style={styles.infoValue}>{recipe.servings}</Text>
          </View>
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <MaterialCommunityIcons name="food-variant" size={20} color="#FF9B85" />
            </View>
            <Text style={styles.sectionTitle}>Ingredients</Text>
          </View>
          <View style={styles.ingredientsList}>
            {recipe.ingredients.map((ingredient: string, index: number) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <MaterialCommunityIcons name="chef-hat" size={20} color="#A8C5A8" />
            </View>
            <Text style={styles.sectionTitle}>Instructions</Text>
          </View>
          {recipe.instructions.map((instruction: string, index: number) => (
            <View key={index} style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF5F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: '#FF9B85',
  },
  titleSection: {
    marginBottom: 24,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  mealTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF5F3',
    borderRadius: 12,
  },
  mealTypeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9B85',
    textTransform: 'capitalize',
  },
  dayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F5F0',
    borderRadius: 12,
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A8C5A8',
  },
  recipeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3D3D3D',
    lineHeight: 36,
  },
  infoSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  infoCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIcon: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#BBB',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3D3D3D',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3D3D3D',
  },
  ingredientsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9B85',
    marginRight: 12,
  },
  ingredientText: {
    flex: 1,
    fontSize: 15,
    color: '#3D3D3D',
    lineHeight: 22,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#A8C5A8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: '#3D3D3D',
    lineHeight: 22,
  },
  errorText: {
    fontSize: 18,
    color: '#3D3D3D',
    textAlign: 'center',
    marginTop: 40,
  },
});
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

interface MealPlan {
  id: string;
  plan_type: string;
  cuisine_type: string;
  meals: any;
  created_at: string;
}

export default function MealPlansScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchMealPlans();
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

  const fetchMealPlans = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/meal-plans/${userId}`);
      setMealPlans(response.data);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMealPlan = async (planId: string) => {
    Alert.alert(
      'Delete Meal Plan',
      'Are you sure you want to delete this meal plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${BACKEND_URL}/api/meal-plans/${planId}`);
              fetchMealPlans();
            } catch (error) {
              console.error('Error deleting meal plan:', error);
              Alert.alert('Error', 'Failed to delete meal plan');
            }
          },
        },
      ]
    );
  };

  const viewRecipe = (recipe: any, mealType: string, day?: string) => {
    router.push({
      pathname: '/recipe-detail',
      params: {
        recipe: JSON.stringify(recipe),
        mealType,
        day: day || 'Today',
      },
    });
  };

  const renderMealCard = (mealType: string, recipe: any, day?: string) => {
    if (!recipe) return null;

    const iconName =
      mealType === 'breakfast'
        ? 'coffee'
        : mealType === 'lunch'
        ? 'food-fork-drink'
        : 'food-turkey';

    return (
      <TouchableOpacity
        style={styles.mealCard}
        onPress={() => viewRecipe(recipe, mealType, day)}
      >
        <View style={styles.mealCardHeader}>
          <View style={styles.mealTypeContainer}>
            <MaterialCommunityIcons name={iconName} size={20} color="#4CAF50" />
            <Text style={styles.mealType}>{mealType}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#888" />
        </View>
        <Text style={styles.recipeName}>{recipe.name}</Text>
        <View style={styles.recipeInfo}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#888" />
            <Text style={styles.infoText}>{recipe.prep_time}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="fire" size={14} color="#888" />
            <Text style={styles.infoText}>{recipe.cook_time}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMealPlan = ({ item }: { item: MealPlan }) => {
    const isWeekly = item.plan_type === 'weekly';

    return (
      <View style={styles.planCard}>
        <View style={styles.planHeader}>
          <View>
            <Text style={styles.planTitle}>
              {item.cuisine_type} {item.plan_type} Plan
            </Text>
            <Text style={styles.planDate}>
              Created {format(new Date(item.created_at), 'MMM dd, yyyy')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => deleteMealPlan(item.id)}
            style={styles.deleteButton}
          >
            <MaterialCommunityIcons name="delete" size={20} color="#ff5252" />
          </TouchableOpacity>
        </View>

        {isWeekly ? (
          // Weekly plan
          Object.entries(item.meals).map(([day, meals]: [string, any]) => (
            <View key={day} style={styles.daySection}>
              <Text style={styles.dayTitle}>{day}</Text>
              {renderMealCard('breakfast', meals.breakfast, day)}
              {renderMealCard('lunch', meals.lunch, day)}
              {renderMealCard('dinner', meals.dinner, day)}
            </View>
          ))
        ) : (
          // Daily plan
          <View>
            {renderMealCard('breakfast', item.meals.breakfast)}
            {renderMealCard('lunch', item.meals.lunch)}
            {renderMealCard('dinner', item.meals.dinner)}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Meal Plans</Text>
      </View>

      {mealPlans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="calendar-blank" size={64} color="#555" />
          <Text style={styles.emptyText}>No meal plans yet</Text>
          <Text style={styles.emptySubtext}>Generate your first meal plan</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/')}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Create Plan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={mealPlans}
          renderItem={renderMealPlan}
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
    backgroundColor: '#0c0c0c',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0c0c0c',
  },
  header: {
    padding: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  planCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'capitalize',
  },
  planDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  daySection: {
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  mealCard: {
    backgroundColor: '#0c0c0c',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  mealCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mealType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    textTransform: 'uppercase',
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  recipeInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { format } from 'date-fns';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// Food image categories for Foodish API
const FOOD_CATEGORIES = ['pizza', 'burger', 'pasta', 'rice', 'biryani', 'dessert'];

interface MealPlan {
  id: string;
  plan_type: string;
  cuisine_type: string;
  meals: any;
  created_at: string;
}

// Generate a consistent food image URL based on meal name
const getFoodImageUrl = (mealName: string, mealType: string): string => {
  // Use a hash of the meal name to consistently get the same image
  const hash = mealName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const categoryIndex = hash % FOOD_CATEGORIES.length;
  const imageNumber = (hash % 20) + 1; // Each category has about 20 images
  
  // Map meal types to better categories
  let category = FOOD_CATEGORIES[categoryIndex];
  if (mealType === 'breakfast') {
    category = 'dessert'; // Breakfast items often look like desserts/pastries
  } else if (mealName.toLowerCase().includes('pasta') || mealName.toLowerCase().includes('spaghetti')) {
    category = 'pasta';
  } else if (mealName.toLowerCase().includes('rice') || mealName.toLowerCase().includes('biryani')) {
    category = 'rice';
  } else if (mealName.toLowerCase().includes('pizza')) {
    category = 'pizza';
  } else if (mealName.toLowerCase().includes('burger')) {
    category = 'burger';
  }
  
  return `https://foodish-api.com/images/${category}/${category}${imageNumber}.jpg`;
};

export default function MealPlansScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMealPlans();
  }, [userId]);

  const deleteMealPlan = async (planId: string) => {
    Alert.alert(
      'Delete Meal Plan',
      'Are you sure you want to delete this plan?',
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

    const imageUrl = getFoodImageUrl(recipe.name || 'food', mealType);

    return (
      <TouchableOpacity
        style={styles.mealCard}
        onPress={() => viewRecipe(recipe, mealType, day)}
      >
        {/* Meal Image */}
        <Image
          source={{ uri: imageUrl }}
          style={styles.mealImage}
          defaultSource={require('../../assets/images/icon.png')}
        />
        
        <View style={styles.mealCardContent}>
          <View style={styles.mealTypeRow}>
            <View style={styles.mealIcon}>
              <MaterialCommunityIcons name={iconName} size={16} color="#FF9B85" />
            </View>
            <Text style={styles.mealType}>{mealType}</Text>
          </View>
          
          <Text style={styles.recipeName} numberOfLines={2}>{recipe.name}</Text>
          
          <View style={styles.recipeInfo}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="clock-outline" size={12} color="#BBB" />
              <Text style={styles.infoText}>{recipe.prep_time}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="fire" size={12} color="#BBB" />
              <Text style={styles.infoText}>{recipe.cook_time}</Text>
            </View>
          </View>
        </View>
        
        <MaterialCommunityIcons name="chevron-right" size={20} color="#DDD" />
      </TouchableOpacity>
    );
  };

  const renderMealPlan = ({ item }: { item: MealPlan }) => {
    const isWeekly = item.plan_type === 'weekly';

    return (
      <View style={styles.planCard}>
        <View style={styles.planHeader}>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>
              {item.cuisine_type}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => deleteMealPlan(item.id)}
            style={styles.deleteButton}
          >
            <MaterialCommunityIcons name="delete-outline" size={20} color="#FFB5A0" />
          </TouchableOpacity>
        </View>

        <Text style={styles.planTitle}>
          {item.plan_type} Plan
        </Text>
        <Text style={styles.planDate}>
          Created {format(new Date(item.created_at), 'MMM dd, yyyy')}
        </Text>

        <View style={styles.mealsContainer}>
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
            <>
              {renderMealCard('breakfast', item.meals.breakfast)}
              {renderMealCard('lunch', item.meals.lunch)}
              {renderMealCard('dinner', item.meals.dinner)}
            </>
          )}
        </View>
      </View>
    );
  };

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
          <Text style={styles.title}>My Meal Plans</Text>
          <Text style={styles.subtitle}>
            {mealPlans.length} {mealPlans.length === 1 ? 'plan' : 'plans'}
          </Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <MaterialCommunityIcons name="refresh" size={24} color="#FF9B85" />
        </TouchableOpacity>
      </View>

      {mealPlans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={64} color="#DDD" />
          </View>
          <Text style={styles.emptyText}>No meal plans yet</Text>
          <Text style={styles.emptySubtext}>Create your first meal plan to get started</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/')}
          >
            <MaterialCommunityIcons name="plus" size={18} color="#FFF" />
            <Text style={styles.emptyButtonText}>Create Plan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={mealPlans}
          renderItem={renderMealPlan}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FF9B85']}
              tintColor="#FF9B85"
            />
          }
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  refreshButton: {
    padding: 8,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF5F3',
    borderRadius: 12,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9B85',
    textTransform: 'capitalize',
  },
  deleteButton: {
    padding: 8,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3D3D3D',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  planDate: {
    fontSize: 13,
    color: '#BBB',
    marginBottom: 20,
  },
  mealsContainer: {
    gap: 12,
  },
  daySection: {
    marginBottom: 16,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#A8C5A8',
    marginBottom: 12,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    marginBottom: 8,
  },
  mealImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#E8E8E8',
    marginRight: 12,
  },
  mealCardContent: {
    flex: 1,
  },
  mealTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  mealType: {
    fontSize: 11,
    fontWeight: '600',
    color: '#BBB',
    textTransform: 'uppercase',
  },
  recipeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3D3D3D',
    marginBottom: 6,
  },
  recipeInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 11,
    color: '#BBB',
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
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#FF9B85',
    borderRadius: 16,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});

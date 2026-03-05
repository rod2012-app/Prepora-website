import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function HomeScreen() {
  const router = useRouter();
  const [planType, setPlanType] = useState<'daily' | 'weekly'>('daily');
  const [cuisineType, setCuisineType] = useState<'healthy' | 'comfort'>('healthy');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');

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

  const generateMealPlan = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not initialized');
      return;
    }

    setLoading(true);
    try {
      // Get user's available ingredients
      const ingredientsResponse = await axios.get(
        `${BACKEND_URL}/api/ingredients/${userId}`
      );
      const availableIngredients = ingredientsResponse.data.map(
        (ing: any) => ing.ingredient_name
      );

      // Generate meal plan
      const response = await axios.post(`${BACKEND_URL}/api/meal-plan/generate`, {
        user_id: userId,
        plan_type: planType,
        cuisine_type: cuisineType,
        available_ingredients: availableIngredients.length > 0 ? availableIngredients : null,
      });

      Alert.alert(
        'Success!',
        `Your ${planType} ${cuisineType} meal plan has been created!`,
        [
          {
            text: 'View Plans',
            onPress: () => router.push('/meal-plans'),
          },
          { text: 'OK' },
        ]
      );
    } catch (error: any) {
      console.error('Error generating meal plan:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to generate meal plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="chef-hat" size={48} color="#4CAF50" />
          <Text style={styles.title}>Meal Planner</Text>
          <Text style={styles.subtitle}>Your personal cooking assistant</Text>
        </View>

        {/* Plan Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Duration</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                planType === 'daily' && styles.optionButtonActive,
              ]}
              onPress={() => setPlanType('daily')}
            >
              <MaterialCommunityIcons
                name="calendar-today"
                size={24}
                color={planType === 'daily' ? '#fff' : '#4CAF50'}
              />
              <Text
                style={[
                  styles.optionText,
                  planType === 'daily' && styles.optionTextActive,
                ]}
              >
                Daily
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                planType === 'weekly' && styles.optionButtonActive,
              ]}
              onPress={() => setPlanType('weekly')}
            >
              <MaterialCommunityIcons
                name="calendar-week"
                size={24}
                color={planType === 'weekly' ? '#fff' : '#4CAF50'}
              />
              <Text
                style={[
                  styles.optionText,
                  planType === 'weekly' && styles.optionTextActive,
                ]}
              >
                Weekly
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cuisine Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Style</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                cuisineType === 'healthy' && styles.optionButtonActive,
              ]}
              onPress={() => setCuisineType('healthy')}
            >
              <MaterialCommunityIcons
                name="food-apple"
                size={24}
                color={cuisineType === 'healthy' ? '#fff' : '#4CAF50'}
              />
              <Text
                style={[
                  styles.optionText,
                  cuisineType === 'healthy' && styles.optionTextActive,
                ]}
              >
                Healthy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                cuisineType === 'comfort' && styles.optionButtonActive,
              ]}
              onPress={() => setCuisineType('comfort')}
            >
              <MaterialCommunityIcons
                name="food"
                size={24}
                color={cuisineType === 'comfort' ? '#fff' : '#4CAF50'}
              />
              <Text
                style={[
                  styles.optionText,
                  cuisineType === 'comfort' && styles.optionTextActive,
                ]}
              >
                Comfort
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information" size={20} color="#4CAF50" />
          <Text style={styles.infoText}>
            Add ingredients to your pantry for personalized meal suggestions!
          </Text>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, loading && styles.generateButtonDisabled]}
          onPress={generateMealPlan}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="magic-staff" size={24} color="#fff" />
              <Text style={styles.generateButtonText}>Generate Meal Plan</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/ingredients')}
          >
            <MaterialCommunityIcons name="plus-circle" size={32} color="#4CAF50" />
            <Text style={styles.quickActionText}>Add Ingredients</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/meal-plans')}
          >
            <MaterialCommunityIcons name="book-open-variant" size={32} color="#4CAF50" />
            <Text style={styles.quickActionText}>View Plans</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  optionButtonActive: {
    backgroundColor: '#4CAF50',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  optionTextActive: {
    color: '#fff',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#ccc',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    marginBottom: 32,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  quickActionText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
});
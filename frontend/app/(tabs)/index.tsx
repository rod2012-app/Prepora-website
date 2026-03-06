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
      const ingredientsResponse = await axios.get(
        `${BACKEND_URL}/api/ingredients/${userId}`
      );
      const availableIngredients = ingredientsResponse.data.map(
        (ing: any) => ing.ingredient_name
      );

      const response = await axios.post(`${BACKEND_URL}/api/meal-plan/generate`, {
        user_id: userId,
        plan_type: planType,
        cuisine_type: cuisineType,
        available_ingredients: availableIngredients.length > 0 ? availableIngredients : null,
      });

      Alert.alert(
        'Success!',
        `Your ${planType} ${cuisineType} meal plan is ready!`,
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
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="food" size={32} color="#FF9B85" />
          </View>
          <Text style={styles.appName}>Prepora</Text>
          <Text style={styles.tagline}>Plan smart. Eat better. Live easier.</Text>
          <View style={styles.divider} />
          <Text style={styles.greeting}>Good day!</Text>
          <Text style={styles.title}>Let's plan your meals</Text>
        </View>

        {/* Plan Type Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How long should we plan for?</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                planType === 'daily' && styles.optionButtonActivePrimary,
              ]}
              onPress={() => setPlanType('daily')}
            >
              <MaterialCommunityIcons
                name="calendar-today"
                size={20}
                color={planType === 'daily' ? '#FFF' : '#FF9B85'}
              />
              <Text
                style={[
                  styles.optionText,
                  planType === 'daily' && styles.optionTextActive,
                ]}
              >
                One Day
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                planType === 'weekly' && styles.optionButtonActivePrimary,
              ]}
              onPress={() => setPlanType('weekly')}
            >
              <MaterialCommunityIcons
                name="calendar-week"
                size={20}
                color={planType === 'weekly' ? '#FFF' : '#FF9B85'}
              />
              <Text
                style={[
                  styles.optionText,
                  planType === 'weekly' && styles.optionTextActive,
                ]}
              >
                Full Week
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cuisine Type Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What's your mood today?</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                cuisineType === 'healthy' && styles.optionButtonActiveSecondary,
              ]}
              onPress={() => setCuisineType('healthy')}
            >
              <MaterialCommunityIcons
                name="leaf"
                size={20}
                color={cuisineType === 'healthy' ? '#FFF' : '#A8C5A8'}
              />
              <Text
                style={[
                  styles.optionTextSecondary,
                  cuisineType === 'healthy' && styles.optionTextActive,
                ]}
              >
                Fresh & Healthy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                cuisineType === 'comfort' && styles.optionButtonActiveSecondary,
              ]}
              onPress={() => setCuisineType('comfort')}
            >
              <MaterialCommunityIcons
                name="heart"
                size={20}
                color={cuisineType === 'comfort' ? '#FFF' : '#A8C5A8'}
              />
              <Text
                style={[
                  styles.optionTextSecondary,
                  cuisineType === 'comfort' && styles.optionTextActive,
                ]}
              >
                Comfort Food
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color="#B8A8D8" />
          <Text style={styles.infoText}>
            Add ingredients to your pantry for personalized suggestions!
          </Text>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, loading && styles.generateButtonDisabled]}
          onPress={generateMealPlan}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator color="#fff" />
              <Text style={styles.generateButtonText}>Creating your plan...</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="auto-fix" size={24} color="#fff" />
              <Text style={styles.generateButtonText}>Generate Meal Plan</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/ingredients')}
          >
            <View style={styles.quickActionIcon}>
              <MaterialCommunityIcons name="basket" size={28} color="#FF9B85" />
            </View>
            <Text style={styles.quickActionTitle}>My Pantry</Text>
            <Text style={styles.quickActionSubtitle}>Manage ingredients</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/meal-plans')}
          >
            <View style={styles.quickActionIcon}>
              <MaterialCommunityIcons name="book-open-variant" size={28} color="#A8C5A8" />
            </View>
            <Text style={styles.quickActionTitle}>My Plans</Text>
            <Text style={styles.quickActionSubtitle}>View all plans</Text>
          </TouchableOpacity>
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FF9B85',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#A8C5A8',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: '#FFE5E0',
    borderRadius: 2,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#999',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3D3D3D',
  },
  card: {
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
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#3D3D3D',
    marginBottom: 16,
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
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonActivePrimary: {
    backgroundColor: '#FF9B85',
    borderColor: '#FF9B85',
  },
  optionButtonActiveSecondary: {
    backgroundColor: '#A8C5A8',
    borderColor: '#A8C5A8',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF9B85',
  },
  optionTextSecondary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A8C5A8',
  },
  optionTextActive: {
    color: '#FFF',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#F8F5FF',
    borderRadius: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
    backgroundColor: '#FF9B85',
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#FF9B85',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3D3D3D',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#999',
  },
});
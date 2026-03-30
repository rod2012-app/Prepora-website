import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface UserIngredient {
  id: string;
  ingredient_name: string;
  added_at: string;
}

export default function IngredientsScreen() {
  const [userId, setUserId] = useState('');
  const [ingredients, setIngredients] = useState<UserIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIngredient, setNewIngredient] = useState('');
  const [commonIngredients, setCommonIngredients] = useState<string[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<string[]>([]);

  useEffect(() => {
    initializeUser();
    fetchCommonIngredients();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchIngredients();
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

  const fetchIngredients = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/ingredients/${userId}`);
      setIngredients(response.data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommonIngredients = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/ingredients/common/list`);
      setCommonIngredients(response.data.ingredients);
      setFilteredIngredients(response.data.ingredients);
    } catch (error) {
      console.error('Error fetching common ingredients:', error);
    }
  };

  const addIngredient = async (ingredientName: string) => {
    if (!ingredientName.trim()) return;

    try {
      await axios.post(`${BACKEND_URL}/api/ingredients/add`, {
        user_id: userId,
        ingredient_name: ingredientName.trim(),
      });
      fetchIngredients();
      setNewIngredient('');
      setShowAddModal(false);
    } catch (error: any) {
      console.error('Error adding ingredient:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to add ingredient');
    }
  };

  const performDelete = async (ingredientId: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/ingredients/${ingredientId}`);
      await fetchIngredients();
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      Alert.alert('Error', 'Failed to remove ingredient');
    }
  };

  const deleteIngredient = (ingredientId: string) => {
    Alert.alert(
      'Remove Ingredient',
      'Remove this from your pantry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => performDelete(ingredientId),
        },
      ]
    );
  };

  const performClearAll = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/api/ingredients/clear/${userId}`);
      await fetchIngredients();
      Alert.alert('Success', 'All ingredients cleared');
    } catch (error) {
      console.error('Error clearing ingredients:', error);
      Alert.alert('Error', 'Failed to clear ingredients');
    }
  };

  const clearAllIngredients = () => {
    Alert.alert(
      'Clear All Ingredients',
      `Remove all ${ingredients.length} ingredients from your pantry?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => performClearAll(),
        },
      ]
    );
  };

  const filterIngredients = (text: string) => {
    setNewIngredient(text);
    if (text.trim() === '') {
      setFilteredIngredients(commonIngredients);
    } else {
      const filtered = commonIngredients.filter((ing) =>
        ing.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredIngredients(filtered);
    }
  };

  const renderIngredient = ({ item }: { item: UserIngredient }) => (
    <View style={styles.ingredientItem}>
      <View style={styles.ingredientIcon}>
        <MaterialCommunityIcons name="food-variant" size={20} color="#FF9B85" />
      </View>
      <Text style={styles.ingredientName}>{item.ingredient_name}</Text>
      <TouchableOpacity
        onPress={() => deleteIngredient(item.id)}
        style={styles.deleteButton}
      >
        <MaterialCommunityIcons name="close-circle" size={20} color="#FFB5A0" />
      </TouchableOpacity>
    </View>
  );

  const renderCommonIngredient = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.commonIngredientItem}
      onPress={() => addIngredient(item)}
    >
      <Text style={styles.commonIngredientText}>{item}</Text>
      <MaterialCommunityIcons name="plus" size={16} color="#FF9B85" />
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
          <Text style={styles.title}>My Pantry</Text>
          <Text style={styles.subtitle}>
            {ingredients.length} {ingredients.length === 1 ? 'ingredient' : 'ingredients'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {ingredients.length > 0 && (
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={clearAllIngredients}
            >
              <MaterialCommunityIcons name="delete-sweep" size={20} color="#FFB5A0" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {ingredients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons name="basket-outline" size={64} color="#DDD" />
          </View>
          <Text style={styles.emptyText}>Your pantry is empty</Text>
          <Text style={styles.emptySubtext}>Add ingredients to get personalized meal plans</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.emptyButtonText}>Add Your First Ingredient</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={ingredients}
          renderItem={renderIngredient}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Add Ingredient Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Ingredient</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Search or type ingredient name"
              placeholderTextColor="#BBB"
              value={newIngredient}
              onChangeText={filterIngredients}
              autoFocus
            />

            {newIngredient.trim() && (
              <TouchableOpacity
                style={styles.customAddButton}
                onPress={() => addIngredient(newIngredient)}
              >
                <MaterialCommunityIcons name="plus-circle" size={20} color="#FF9B85" />
                <Text style={styles.customAddText}>Add "{newIngredient}"</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.commonTitle}>Suggestions</Text>
            <FlatList
              data={filteredIngredients}
              renderItem={renderCommonIngredient}
              keyExtractor={(item) => item}
              numColumns={2}
              contentContainerStyle={styles.commonGrid}
            />
          </View>
        </View>
      </Modal>
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  clearAllButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE5E0',
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF9B85',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9B85',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ingredientIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ingredientName: {
    flex: 1,
    fontSize: 16,
    color: '#3D3D3D',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  deleteButton: {
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
    marginBottom: 32,
  },
  emptyButton: {
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    backgroundColor: '#FEFEFE',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3D3D3D',
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#3D3D3D',
    marginBottom: 16,
  },
  customAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: '#FFF5F3',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE5E0',
    marginBottom: 20,
  },
  customAddText: {
    fontSize: 16,
    color: '#FF9B85',
    fontWeight: '600',
  },
  commonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  commonGrid: {
    paddingBottom: 20,
  },
  commonIngredientItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    margin: 4,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  commonIngredientText: {
    fontSize: 14,
    color: '#3D3D3D',
    fontWeight: '500',
  },
});
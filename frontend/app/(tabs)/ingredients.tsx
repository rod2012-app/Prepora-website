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

  const deleteIngredient = async (ingredientId: string) => {
    Alert.alert(
      'Delete Ingredient',
      'Are you sure you want to remove this ingredient?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${BACKEND_URL}/api/ingredients/${ingredientId}`);
              fetchIngredients();
            } catch (error) {
              console.error('Error deleting ingredient:', error);
              Alert.alert('Error', 'Failed to delete ingredient');
            }
          },
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
        <MaterialCommunityIcons name="food-variant" size={24} color="#4CAF50" />
      </View>
      <Text style={styles.ingredientName}>{item.ingredient_name}</Text>
      <TouchableOpacity
        onPress={() => deleteIngredient(item.id)}
        style={styles.deleteButton}
      >
        <MaterialCommunityIcons name="close" size={20} color="#ff5252" />
      </TouchableOpacity>
    </View>
  );

  const renderCommonIngredient = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.commonIngredientItem}
      onPress={() => addIngredient(item)}
    >
      <Text style={styles.commonIngredientText}>{item}</Text>
      <MaterialCommunityIcons name="plus" size={18} color="#4CAF50" />
    </TouchableOpacity>
  );

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
        <Text style={styles.title}>My Pantry</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {ingredients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="food-off" size={64} color="#555" />
          <Text style={styles.emptyText}>No ingredients yet</Text>
          <Text style={styles.emptySubtext}>Add ingredients to get started</Text>
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
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Search or type ingredient name"
              placeholderTextColor="#666"
              value={newIngredient}
              onChangeText={filterIngredients}
              autoFocus
            />

            {newIngredient.trim() && (
              <TouchableOpacity
                style={styles.customAddButton}
                onPress={() => addIngredient(newIngredient)}
              >
                <MaterialCommunityIcons name="plus-circle" size={20} color="#4CAF50" />
                <Text style={styles.customAddText}>Add "{newIngredient}"</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.commonTitle}>Common Ingredients</Text>
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
    backgroundColor: '#0c0c0c',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0c0c0c',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 12,
  },
  ingredientIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0c0c0c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ingredientName: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    textTransform: 'capitalize',
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
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
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
    fontWeight: 'bold',
    color: '#fff',
  },
  input: {
    backgroundColor: '#0c0c0c',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
  },
  customAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#0c0c0c',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    marginBottom: 20,
  },
  customAddText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  commonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
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
    backgroundColor: '#0c0c0c',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  commonIngredientText: {
    fontSize: 14,
    color: '#fff',
  },
});
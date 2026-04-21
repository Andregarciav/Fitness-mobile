import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { nutritionAPI, subscriptionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

type TACOFood = {
  id: number;
  description: string;
  category: string;
  energy_kcal: number;
  protein_g: number;
  lipid_g: number;
  carbohydrate_g: number;
  fiber_g?: number;
};

export default function NutritionScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [limits, setLimits] = useState<any>(null);

  const [tacoQuery, setTacoQuery] = useState('');
  const [tacoCategory, setTacoCategory] = useState('');
  const [tacoCategories, setTacoCategories] = useState<string[]>([]);
  const [tacoResults, setTacoResults] = useState<TACOFood[]>([]);
  const [tacoSearching, setTacoSearching] = useState(false);
  const [portionGrams, setPortionGrams] = useState<Record<number, number>>({});
  const [addingTacoId, setAddingTacoId] = useState<number | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [])
  );

  useEffect(() => {
    nutritionAPI.getTACOCategories().then((r: any) => setTacoCategories(r.categories || [])).catch(() => {});
  }, []);

  const loadMeals = async () => {
    try {
      const data = await nutritionAPI.getMeals();
      setMeals(data || []);

      if (!user?.is_premium) {
        try {
          const limitsData = await subscriptionAPI.getLimits();
          setLimits(limitsData);
        } catch (error) {
          console.error('Erro ao carregar limites:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar refeições:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMeals();
  };

  const searchTACO = async () => {
    setTacoSearching(true);
    try {
      const res = await nutritionAPI.searchTACO(
        tacoQuery.trim() || undefined,
        tacoCategory || undefined,
        30
      );
      setTacoResults(res.foods || []);
    } catch {
      setTacoResults([]);
    } finally {
      setTacoSearching(false);
    }
  };

  const addMealFromTACO = async (food: TACOFood) => {
    const grams = portionGrams[food.id] ?? 100;
    if (grams <= 0) {
      Alert.alert('Erro', 'Informe a porção em gramas.');
      return;
    }
    const maxMeals = limits?.max_meals ?? 30;
    const isLimitReached = !user?.is_premium && meals.length >= maxMeals;
    if (isLimitReached) {
      Alert.alert('Limite atingido', 'Faça upgrade para premium.');
      return;
    }
    setAddingTacoId(food.id);
    try {
      await nutritionAPI.createMealFromTACO(food.id, grams, food.description);
      loadMeals();
      setPortionGrams((p) => ({ ...p, [food.id]: 100 }));
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Erro ao adicionar refeição';
      if (error.response?.status === 403 && error.response?.data?.upgrade_required) {
        Alert.alert('Limite atingido', 'Faça upgrade para premium.');
      } else {
        Alert.alert('Erro', msg);
      }
    } finally {
      setAddingTacoId(null);
    }
  };

  const handleMealPress = (meal: any) => {
    navigation.navigate('MealDetail' as never, { mealId: meal.id } as never);
  };

  const handleAddPress = () => {
    navigation.navigate('CreateMeal' as never);
  };

  const handleDeleteMeal = (mealId: number) => {
    Alert.alert('Excluir', 'Excluir esta refeição?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await nutritionAPI.delete(mealId);
            loadMeals();
          } catch (err: any) {
            Alert.alert('Erro', err.response?.data?.error || 'Erro ao excluir');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" style={styles.loader} />
      </View>
    );
  }

  const currentCount = meals.length;
  const maxMeals = limits?.max_meals ?? 30;
  const isLimitReached = !user?.is_premium && currentCount >= maxMeals;
  const remainingCount = !user?.is_premium ? maxMeals - currentCount : null;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Seção TACO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tabela TACO</Text>
          <Text style={styles.hint}>
            Busque um alimento e adicione informando a porção em gramas (valores por 100g).
          </Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Ex: arroz, feijão, frango..."
              value={tacoQuery}
              onChangeText={setTacoQuery}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.categoryButton}
              onPress={() => setCategoryModalVisible(true)}
            >
              <Text style={styles.categoryButtonText} numberOfLines={1}>
                {tacoCategory || 'Categoria'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={searchTACO}
              disabled={tacoSearching}
            >
              {tacoSearching ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>Buscar</Text>
              )}
            </TouchableOpacity>
          </View>

          <Modal
            visible={categoryModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setCategoryModalVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setCategoryModalVisible(false)}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Categoria</Text>
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setTacoCategory('');
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text>Todas</Text>
                </TouchableOpacity>
                {tacoCategories.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={styles.modalItem}
                    onPress={() => {
                      setTacoCategory(c);
                      setCategoryModalVisible(false);
                    }}
                  >
                    <Text numberOfLines={1}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

          {tacoResults.length > 0 && (
            <View style={styles.tacoResults}>
              {tacoResults.map((food) => (
                <View key={food.id} style={styles.tacoItem}>
                  <View style={styles.tacoItemInfo}>
                    <Text style={styles.tacoItemName}>{food.description}</Text>
                    <Text style={styles.tacoItemMeta}>
                      {food.category} • {Number(food.energy_kcal).toFixed(0)} kcal/100g
                    </Text>
                    <Text style={styles.tacoItemNutrients}>
                      P: {Number(food.protein_g).toFixed(1)}g · C: {Number(food.carbohydrate_g).toFixed(1)}g · G: {Number(food.lipid_g).toFixed(1)}g
                    </Text>
                  </View>
                  <View style={styles.portionRow}>
                    <TextInput
                      style={styles.portionInput}
                      value={String(portionGrams[food.id] ?? 100)}
                      onChangeText={(t) =>
                        setPortionGrams((p) => ({ ...p, [food.id]: Number(t) || 100 }))
                      }
                      keyboardType="number-pad"
                    />
                    <Text style={styles.portionLabel}>g</Text>
                    <TouchableOpacity
                      style={[styles.addTacoButton, (isLimitReached || addingTacoId !== null) && styles.addTacoButtonDisabled]}
                      onPress={() => addMealFromTACO(food)}
                      disabled={isLimitReached || addingTacoId !== null}
                    >
                      {addingTacoId === food.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.addTacoButtonText}>Adicionar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
          {(tacoQuery || tacoCategory) && tacoResults.length === 0 && !tacoSearching && (
            <Text style={styles.emptyTaco}>Nenhum resultado. Tente outro termo.</Text>
          )}
        </View>

        {/* Header Minhas Refeições */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Minhas refeições</Text>
            {!user?.is_premium && limits && (
              <Text style={styles.limitText}>
                {currentCount} / {maxMeals}
                {remainingCount !== null && remainingCount >= 0 && (
                  <Text style={styles.remainingText}> ({remainingCount} restantes)</Text>
                )}
              </Text>
            )}
            {isLimitReached && (
              <View style={styles.limitWarning}>
                <Text style={styles.limitWarningText}>Limite atingido!</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[styles.addButton, isLimitReached && styles.addButtonDisabled]}
            onPress={handleAddPress}
            disabled={isLimitReached}
          >
            <Text style={styles.addButtonText}>+ Manual</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de refeições */}
        {meals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma refeição. Use a TACO acima ou crie manualmente.</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddPress}>
              <Text style={styles.emptyButtonText}>Nova Refeição Manual</Text>
            </TouchableOpacity>
          </View>
        ) : (
          meals.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.mealCard}
              onPress={() => handleMealPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.mealCardContent}>
                <Text style={styles.mealName}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.mealDescription} numberOfLines={1}>{item.description}</Text>
                ) : null}
                <Text style={styles.mealInfo}>
                  {Math.round(item.calories)} kcal · P: {Number(item.protein).toFixed(1)}g · C: {Number(item.carbs).toFixed(1)}g · G: {Number(item.fats).toFixed(1)}g
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteMealButton}
                onPress={() => handleDeleteMeal(item.id)}
              >
                <Text style={styles.deleteMealButtonText}>Excluir</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    marginTop: 40,
  },
  scroll: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 100,
    justifyContent: 'center',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    minWidth: 70,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: 400,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tacoResults: {
    marginTop: 8,
    maxHeight: 280,
  },
  tacoItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tacoItemInfo: {
    marginBottom: 8,
  },
  tacoItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  tacoItemMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  tacoItemNutrients: {
    fontSize: 12,
    color: '#1976d2',
    marginTop: 2,
  },
  portionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  portionInput: {
    width: 70,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  portionLabel: {
    fontSize: 14,
    color: '#666',
  },
  addTacoButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addTacoButtonDisabled: {
    backgroundColor: '#9e9e9e',
    opacity: 0.7,
  },
  addTacoButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyTaco: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  limitText: {
    fontSize: 14,
    color: '#666',
  },
  remainingText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  limitWarning: {
    marginTop: 6,
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  limitWarningText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealCardContent: {
    flex: 1,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  mealDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  mealInfo: {
    fontSize: 14,
    color: '#666',
  },
  deleteMealButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffebee',
    borderRadius: 6,
    marginLeft: 8,
  },
  deleteMealButtonText: {
    color: '#c62828',
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

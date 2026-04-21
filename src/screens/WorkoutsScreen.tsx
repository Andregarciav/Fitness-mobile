import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { workoutAPI, subscriptionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function WorkoutsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [limits, setLimits] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const loadWorkouts = async () => {
    try {
      const data = await workoutAPI.getAll();
      setWorkouts(data);
      
      // Carregar limites se não for premium
      if (!user?.is_premium) {
        try {
          const limitsData = await subscriptionAPI.getLimits();
          setLimits(limitsData);
        } catch (error) {
          console.error('Erro ao carregar limites:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar treinos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWorkouts();
  };

  const handleWorkoutPress = (workout: any) => {
    navigation.navigate('WorkoutDetail' as never, { workoutId: workout.id } as never);
  };

  const handleAddPress = () => {
    navigation.navigate('CreateWorkout' as never);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const currentCount = workouts.length;
  const maxWorkouts = limits?.max_workouts || 5;
  const isLimitReached = !user?.is_premium && currentCount >= maxWorkouts;
  const remainingCount = !user?.is_premium ? maxWorkouts - currentCount : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Treinos</Text>
          {!user?.is_premium && limits && (
            <Text style={styles.limitText}>
              {currentCount} / {maxWorkouts}
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
          <Text style={styles.addButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.workoutCard}
            onPress={() => handleWorkoutPress(item)}
          >
            <Text style={styles.workoutName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.workoutDescription}>{item.description}</Text>
            )}
            <Text style={styles.workoutInfo}>
              {item.exercises?.length || 0} exercícios
            </Text>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum treino cadastrado</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddPress}>
              <Text style={styles.emptyButtonText}>Criar Primeiro Treino</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  workoutCard: {
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
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  workoutInfo: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
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


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
import { exerciseAPI } from '../services/api';

export default function ExercisesScreen() {
  const navigation = useNavigation();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadExercises();
    }, [])
  );

  const loadExercises = async () => {
    try {
      const data = await exerciseAPI.getAll();
      setExercises(data);
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadExercises();
  };

  const handleExercisePress = (exercise: any) => {
    navigation.navigate('ExerciseDetail' as never, { exerciseId: exercise.id } as never);
  };

  const handleAddPress = () => {
    navigation.navigate('CreateExercise' as never);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Exercícios</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPress}
        >
          <Text style={styles.addButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.exerciseCard}
            onPress={() => handleExercisePress(item)}
          >
            <Text style={styles.exerciseName}>{item.name}</Text>
            <Text style={styles.exerciseInfo}>
              {item.muscle_group?.charAt(0).toUpperCase() + item.muscle_group?.slice(1)} • {' '}
              {item.difficulty?.charAt(0).toUpperCase() + item.difficulty?.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum exercício cadastrado</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddPress}>
              <Text style={styles.emptyButtonText}>Criar Primeiro Exercício</Text>
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
  exerciseCard: {
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
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  exerciseInfo: {
    fontSize: 14,
    color: '#666',
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


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { workoutAPI, exerciseAPI } from '../services/api';

export default function CreateWorkoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const workout = route.params?.workout || null;

  const [name, setName] = useState(workout?.name || '');
  const [description, setDescription] = useState(workout?.description || '');
  const [exercises, setExercises] = useState<any[]>([]);
  const [availableExercises, setAvailableExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(true);

  useEffect(() => {
    loadExercises();
    if (workout?.exercises) {
      setExercises(workout.exercises);
    }
  }, []);

  const loadExercises = async () => {
    try {
      const data = await exerciseAPI.getAll();
      setAvailableExercises(data);
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
    } finally {
      setLoadingExercises(false);
    }
  };

  const handleAddExercise = (exercise: any) => {
    setExercises([...exercises, {
      exercise_id: exercise.id,
      exercise: exercise,
      sets: 3,
      reps: 10,
      weight: null,
      rest_time: 60,
      order: exercises.length + 1,
    }]);
  };

  const handleRemoveExercise = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises.map((ex, i) => ({ ...ex, order: i + 1 })));
  };

  const handleUpdateExercise = (index: number, field: string, value: any) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Nome do treino é obrigatório');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um exercício');
      return;
    }

    setLoading(true);

    try {
      const workoutData = {
        name: name.trim(),
        description: description.trim(),
        exercises: exercises.map(ex => ({
          exercise_id: ex.exercise_id || ex.exercise?.id,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          rest_time: ex.rest_time,
          order: ex.order,
        })),
      };

      if (workout) {
        await workoutAPI.update(workout.id, workoutData);
        Alert.alert('Sucesso', 'Treino atualizado com sucesso!');
      } else {
        await workoutAPI.create(workoutData);
        Alert.alert('Sucesso', 'Treino criado com sucesso!');
      }

      navigation.goBack();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao salvar treino';
      
      if (error.response?.status === 403 && error.response?.data?.upgrade_required) {
        Alert.alert(
          'Limite Atingido',
          `Você atingiu o limite de treinos (${error.response.data.limit}). Faça upgrade para premium!`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Ver Premium',
              onPress: () => navigation.navigate('Premium' as never),
            },
          ]
        );
      } else {
        Alert.alert('Erro', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {workout ? 'Editar Treino' : 'Novo Treino'}
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Treino de Peito e Tríceps"
            value={name}
            onChangeText={setName}
            maxLength={100}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva o treino..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Exercícios *</Text>
          {exercises.length > 0 && (
            <View style={styles.exercisesList}>
              {exercises.map((ex, index) => (
                <View key={index} style={styles.exerciseItem}>
                  <Text style={styles.exerciseName}>{ex.exercise?.name}</Text>
                  <View style={styles.exerciseFields}>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Series:</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={ex.sets?.toString()}
                        onChangeText={(val) => handleUpdateExercise(index, 'sets', parseInt(val) || 0)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Repetições:</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={ex.reps?.toString()}
                        onChangeText={(val) => handleUpdateExercise(index, 'reps', parseInt(val) || 0)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveExercise(index)}
                  >
                    <Text style={styles.removeButtonText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {!loadingExercises && (
            <View style={styles.addExerciseContainer}>
              <Text style={styles.sectionTitle}>Adicionar Exercício</Text>
              <FlatList
                data={availableExercises.filter(ex => 
                  !exercises.some(e => e.exercise_id === ex.id || e.exercise?.id === ex.id)
                )}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.exerciseOption}
                    onPress={() => handleAddExercise(item)}
                  >
                    <Text style={styles.exerciseOptionText}>{item.name}</Text>
                    <Text style={styles.exerciseOptionInfo}>
                      {item.muscle_group} • {item.difficulty}
                    </Text>
                  </TouchableOpacity>
                )}
                nestedScrollEnabled
                style={styles.exercisesFlatList}
              />
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {workout ? 'Atualizar' : 'Criar'} Treino
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  exercisesList: {
    marginBottom: 15,
  },
  exerciseItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  exerciseFields: {
    flexDirection: 'row',
    gap: 15,
  },
  fieldRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
  },
  fieldInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
  },
  removeButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  removeButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  addExerciseContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 300,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  exercisesFlatList: {
    maxHeight: 200,
  },
  exerciseOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exerciseOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  exerciseOptionInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});


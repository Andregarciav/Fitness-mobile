import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { exerciseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CreateExerciseScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const exercise = route.params?.exercise || null;

  const [name, setName] = useState(exercise?.name || '');
  const [description, setDescription] = useState(exercise?.description || '');
  const [muscleGroup, setMuscleGroup] = useState(exercise?.muscle_group || '');
  const [equipment, setEquipment] = useState(exercise?.equipment || '');
  const [difficulty, setDifficulty] = useState(exercise?.difficulty || '');
  const [loading, setLoading] = useState(false);

  const muscleGroups = ['chest', 'back', 'legs', 'arms', 'shoulders', 'core'];
  const equipments = ['bodyweight', 'dumbbell', 'barbell', 'machine', 'cable'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Nome do exercício é obrigatório');
      return;
    }

    if (!muscleGroup) {
      Alert.alert('Erro', 'Selecione o grupo muscular');
      return;
    }

    setLoading(true);

    try {
      const exerciseData = {
        name: name.trim(),
        description: description.trim(),
        muscle_group: muscleGroup,
        equipment: equipment || 'bodyweight',
        difficulty: difficulty || 'beginner',
      };

      if (exercise) {
        await exerciseAPI.update(exercise.id, exerciseData);
        Alert.alert('Sucesso', 'Exercício atualizado com sucesso!');
      } else {
        await exerciseAPI.create(exerciseData);
        Alert.alert('Sucesso', 'Exercício criado com sucesso!');
      }

      navigation.goBack();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao salvar exercício';
      
      if (error.response?.status === 403 && error.response?.data?.upgrade_required) {
        Alert.alert(
          'Limite Atingido',
          `Você atingiu o limite de exercícios (${error.response.data.limit}). Faça upgrade para premium!`,
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
          {exercise ? 'Editar Exercício' : 'Novo Exercício'}
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Supino Reto"
            value={name}
            onChangeText={setName}
            maxLength={100}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva o exercício..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Grupo Muscular *</Text>
          <View style={styles.optionsContainer}>
            {muscleGroups.map((group) => (
              <TouchableOpacity
                key={group}
                style={[
                  styles.optionButton,
                  muscleGroup === group && styles.optionButtonSelected,
                ]}
                onPress={() => setMuscleGroup(group)}
              >
                <Text
                  style={[
                    styles.optionText,
                    muscleGroup === group && styles.optionTextSelected,
                  ]}
                >
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Equipamento</Text>
          <View style={styles.optionsContainer}>
            {equipments.map((eq) => (
              <TouchableOpacity
                key={eq}
                style={[
                  styles.optionButton,
                  equipment === eq && styles.optionButtonSelected,
                ]}
                onPress={() => setEquipment(eq)}
              >
                <Text
                  style={[
                    styles.optionText,
                    equipment === eq && styles.optionTextSelected,
                  ]}
                >
                  {eq.charAt(0).toUpperCase() + eq.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Dificuldade</Text>
          <View style={styles.optionsContainer}>
            {difficulties.map((diff) => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.optionButton,
                  difficulty === diff && styles.optionButtonSelected,
                ]}
                onPress={() => setDifficulty(diff)}
              >
                <Text
                  style={[
                    styles.optionText,
                    difficulty === diff && styles.optionTextSelected,
                  ]}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
              {exercise ? 'Atualizar' : 'Criar'} Exercício
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
    height: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    marginBottom: 10,
  },
  optionButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
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


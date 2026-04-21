import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { exerciseAPI } from '../services/api';

export default function ExerciseDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const exerciseId = route.params?.exerciseId || route.params?.id;

  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercise();
  }, [exerciseId]);

  const loadExercise = async () => {
    try {
      const data = await exerciseAPI.getById(exerciseId);
      setExercise(data);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar exercício');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('CreateExercise' as never, { exercise } as never);
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este exercício?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await exerciseAPI.delete(exerciseId);
              Alert.alert('Sucesso', 'Exercício excluído com sucesso!');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', 'Erro ao excluir exercício');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={styles.container}>
        <Text>Exercício não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{exercise.name}</Text>
      </View>

      <View style={styles.content}>
        {exercise.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.sectionContent}>{exercise.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Grupo Muscular:</Text>
            <Text style={styles.infoValue}>
              {exercise.muscle_group?.charAt(0).toUpperCase() + exercise.muscle_group?.slice(1)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Equipamento:</Text>
            <Text style={styles.infoValue}>
              {exercise.equipment?.charAt(0).toUpperCase() + exercise.equipment?.slice(1)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dificuldade:</Text>
            <Text style={styles.infoValue}>
              {exercise.difficulty?.charAt(0).toUpperCase() + exercise.difficulty?.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


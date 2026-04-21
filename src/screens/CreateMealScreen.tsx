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
import { nutritionAPI } from '../services/api';

export default function CreateMealScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const meal = route.params?.meal || null;

  const [name, setName] = useState(meal?.name || '');
  const [description, setDescription] = useState(meal?.description || '');
  const [calories, setCalories] = useState(meal?.calories?.toString() || '');
  const [protein, setProtein] = useState(meal?.protein?.toString() || '');
  const [carbs, setCarbs] = useState(meal?.carbs?.toString() || '');
  const [fats, setFats] = useState(meal?.fats?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Nome da refeição é obrigatório');
      return;
    }

    const caloriesNum = parseFloat(calories) || 0;
    const proteinNum = parseFloat(protein) || 0;
    const carbsNum = parseFloat(carbs) || 0;
    const fatsNum = parseFloat(fats) || 0;

    if (caloriesNum < 0 || proteinNum < 0 || carbsNum < 0 || fatsNum < 0) {
      Alert.alert('Erro', 'Valores não podem ser negativos');
      return;
    }

    setLoading(true);

    try {
      const mealData = {
        name: name.trim(),
        description: description.trim(),
        calories: caloriesNum,
        protein: proteinNum,
        carbs: carbsNum,
        fats: fatsNum,
      };

      if (meal) {
        await nutritionAPI.update(meal.id, mealData);
        Alert.alert('Sucesso', 'Refeição atualizada com sucesso!');
      } else {
        await nutritionAPI.createMeal(mealData);
        Alert.alert('Sucesso', 'Refeição criada com sucesso!');
      }

      navigation.goBack();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao salvar refeição';
      
      if (error.response?.status === 403 && error.response?.data?.upgrade_required) {
        Alert.alert(
          'Limite Atingido',
          `Você atingiu o limite de refeições (${error.response.data.limit}). Faça upgrade para premium!`,
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
          {meal ? 'Editar Refeição' : 'Nova Refeição'}
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Salada de Frango"
            value={name}
            onChangeText={setName}
            maxLength={100}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva a refeição..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Valores Nutricionais</Text>
          
          <View style={styles.nutritionRow}>
            <View style={styles.nutritionField}>
              <Text style={styles.nutritionLabel}>Calorias (kcal)</Text>
              <TextInput
                style={styles.nutritionInput}
                placeholder="0"
                value={calories}
                onChangeText={setCalories}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.nutritionRow}>
            <View style={styles.nutritionField}>
              <Text style={styles.nutritionLabel}>Proteínas (g)</Text>
              <TextInput
                style={styles.nutritionInput}
                placeholder="0"
                value={protein}
                onChangeText={setProtein}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.nutritionField}>
              <Text style={styles.nutritionLabel}>Carboidratos (g)</Text>
              <TextInput
                style={styles.nutritionInput}
                placeholder="0"
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.nutritionRow}>
            <View style={styles.nutritionField}>
              <Text style={styles.nutritionLabel}>Gorduras (g)</Text>
              <TextInput
                style={styles.nutritionInput}
                placeholder="0"
                value={fats}
                onChangeText={setFats}
                keyboardType="decimal-pad"
              />
            </View>
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
              {meal ? 'Atualizar' : 'Criar'} Refeição
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
  nutritionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  nutritionField: {
    flex: 1,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  nutritionInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
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


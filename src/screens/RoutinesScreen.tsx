import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { workoutAPI, nutritionAPI } from '../services/api';

type Workout = { id: number; name: string; description?: string };
type Meal = { id: number; name: string; calories?: number };

type WorkoutCompletion = {
  id: number;
  workout?: Workout;
  completed_at: string;
};

type MealLog = {
  id: number;
  meal?: Meal;
  logged_at: string;
};

export default function RoutinesScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [completions, setCompletions] = useState<WorkoutCompletion[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyDays, setHistoryDays] = useState(30);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [loggingId, setLoggingId] = useState<number | null>(null);

  const loadTodayLists = useCallback(async () => {
    try {
      const [w, m] = await Promise.all([workoutAPI.getAll(), nutritionAPI.getMeals()]);
      setWorkouts(Array.isArray(w) ? w : []);
      setMeals(Array.isArray(m) ? m : []);
    } catch {
      setWorkouts([]);
      setMeals([]);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - historyDays);
    const fromStr = from.toISOString().slice(0, 10);
    const toStr = to.toISOString().slice(0, 10);
    try {
      const [c, ml] = await Promise.all([
        workoutAPI.getCompletions({ from: fromStr, to: toStr }),
        nutritionAPI.getMealLogs({ from: fromStr, to: toStr }),
      ]);
      setCompletions(Array.isArray(c) ? c : []);
      setMealLogs(Array.isArray(ml) ? ml : []);
    } catch {
      setCompletions([]);
      setMealLogs([]);
    }
  }, [historyDays]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([loadTodayLists(), loadHistory()]).finally(() => setLoading(false));
    }, [loadTodayLists, loadHistory]),
  );

  useEffect(() => {
    loadHistory();
  }, [historyDays, loadHistory]);

  const handleCompleteWorkout = async (id: number) => {
    setCompletingId(id);
    try {
      await workoutAPI.complete(id);
      await loadHistory();
    } catch (err) {
      console.error('Erro ao marcar treino como feito:', err);
    } finally {
      setCompletingId(null);
    }
  };

  const handleLogMeal = async (id: number) => {
    setLoggingId(id);
    try {
      await nutritionAPI.logMeal(id);
      await loadHistory();
    } catch (err) {
      console.error('Erro ao marcar refeição como feita:', err);
    } finally {
      setLoggingId(null);
    }
  };

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Minhas rotinas</Text>
      <Text style={styles.subtitle}>
        Marque treinos e refeições como realizados e acompanhe seu histórico.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Treinos de hoje</Text>
        {workouts.length === 0 ? (
          <Text style={styles.emptyText}>Você ainda não tem treinos cadastrados.</Text>
        ) : (
          workouts.map((w) => (
            <View key={w.id} style={styles.card}>
              <View style={styles.cardMain}>
                <Text style={styles.cardName}>{w.name}</Text>
                {w.description ? (
                  <Text style={styles.cardDesc}>{w.description}</Text>
                ) : null}
              </View>
              <TouchableOpacity
                style={styles.primaryBtn}
                disabled={completingId === w.id}
                onPress={() => handleCompleteWorkout(w.id)}
              >
                <Text style={styles.primaryBtnText}>
                  {completingId === w.id ? 'Marcando...' : 'Marcar como feito'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Refeições de hoje</Text>
        {meals.length === 0 ? (
          <Text style={styles.emptyText}>
            Você ainda não tem refeições cadastradas. Crie em Nutrição.
          </Text>
        ) : (
          meals.map((m) => (
            <View key={m.id} style={styles.card}>
              <View style={styles.cardMain}>
                <Text style={styles.cardName}>{m.name}</Text>
                {m.calories != null && (
                  <Text style={styles.cardMeta}>{Math.round(m.calories)} kcal</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.primaryBtn}
                disabled={loggingId === m.id}
                onPress={() => handleLogMeal(m.id)}
              >
                <Text style={styles.primaryBtnText}>
                  {loggingId === m.id ? 'Marcando...' : 'Marcar como feita'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Histórico</Text>
          <View style={styles.chipRow}>
            {[7, 30, 90].map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.chip, historyDays === d && styles.chipActive]}
                onPress={() => setHistoryDays(d)}
              >
                <Text style={[styles.chipText, historyDays === d && styles.chipTextActive]}>
                  {d}d
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.historyTitle}>Treinos realizados</Text>
        {completions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum treino registrado neste período.</Text>
        ) : (
          completions.map((c) => (
            <View key={c.id} style={styles.historyItem}>
              <Text style={styles.historyName}>{c.workout?.name || 'Treino'}</Text>
              <Text style={styles.historyDate}>{formatDateTime(c.completed_at)}</Text>
            </View>
          ))
        )}

        <Text style={styles.historyTitle}>Refeições realizadas</Text>
        {mealLogs.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma refeição registrada neste período.</Text>
        ) : (
          mealLogs.map((ml) => (
            <View key={ml.id} style={styles.historyItem}>
              <Text style={styles.historyName}>{ml.meal?.name || 'Refeição'}</Text>
              <Text style={styles.historyDate}>{formatDateTime(ml.logged_at)}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1020',
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0b1020',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#111827',
    marginBottom: 8,
  },
  cardMain: {
    flex: 1,
    marginRight: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardDesc: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  cardMeta: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
  },
  primaryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#3b82f6',
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4b5563',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  chipText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    marginTop: 8,
    marginBottom: 6,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1f2933',
  },
  historyName: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  historyDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
});


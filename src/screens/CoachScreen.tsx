import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { coachAPI } from '../services/coachAPI';

type CoachClient = {
  id: number;
  client_id: number;
  status: string;
  notes?: string;
  client?: { id: number; name: string; email: string };
};

type EvolutionData = {
  summary?: { last_weight?: number; last_body_fat?: number; last_muscle_mass?: number; total_measurements?: number };
};

type Workout = {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  exercises?: Array<{ exercise?: { name: string }; sets: number; reps: number }>;
};

export default function CoachScreen() {
  const { user } = useAuth();
  const [clients, setClients] = useState<CoachClient[]>([]);
  const [pendingInvites, setPendingInvites] = useState<CoachClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<CoachClient | null>(null);
  const [evolution, setEvolution] = useState<EvolutionData | null>(null);
  const [evolutionLoading, setEvolutionLoading] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (!selectedClient || selectedClient.status !== 'active') {
      setEvolution(null);
      setWorkouts([]);
      return;
    }
    setEvolutionLoading(true);
    setEvolution(null);
    coachAPI
      .getClientEvolution(selectedClient.client_id)
      .then((data: EvolutionData) => setEvolution(data))
      .catch(() => setEvolution(null))
      .finally(() => setEvolutionLoading(false));

    setWorkoutsLoading(true);
    setWorkouts([]);
    coachAPI
      .getClientWorkouts(selectedClient.client_id)
      .then((res: { workouts?: Workout[] }) => setWorkouts(res?.workouts || []))
      .catch(() => setWorkouts([]))
      .finally(() => setWorkoutsLoading(false));
  }, [selectedClient]);

  const loadClients = async () => {
    try {
      const [allData, pendingData] = await Promise.all([
        coachAPI.getClients(),
        coachAPI.getClients('pending'),
      ]);
      setClients(Array.isArray(allData) ? allData : []);
      setPendingInvites(Array.isArray(pendingData) ? pendingData : []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setClients([]);
      setPendingInvites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = (coachClientId: number) => {
    Alert.alert(
      'Aceitar convite',
      'Deseja aceitar este aluno?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceitar',
          onPress: async () => {
            try {
              await coachAPI.acceptInvite(coachClientId);
              Alert.alert('Sucesso', 'Aluno aceito.');
              loadClients();
              setSelectedClient(null);
            } catch (err: any) {
              Alert.alert('Erro', err.response?.data?.error || 'Erro ao aceitar');
            }
          },
        },
      ]
    );
  };

  const handleRejectInvite = (coachClientId: number) => {
    Alert.alert(
      'Recusar convite',
      'Deseja recusar este convite?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Recusar',
          style: 'destructive',
          onPress: async () => {
            try {
              await coachAPI.rejectInvite(coachClientId);
              loadClients();
              setSelectedClient(null);
            } catch (err: any) {
              Alert.alert('Erro', err.response?.data?.error || 'Erro ao recusar');
            }
          },
        },
      ]
    );
  };

  const handleAddClient = () => {
    Alert.prompt(
      'Adicionar Cliente',
      'Digite o email do cliente:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Adicionar',
          onPress: async (email) => {
            if (!email?.trim()) return;
            try {
              await coachAPI.addClient(email.trim());
              Alert.alert('Sucesso', 'Cliente adicionado com sucesso!');
              loadClients();
            } catch (error: any) {
              Alert.alert('Erro', error.response?.data?.error || 'Erro ao adicionar cliente');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" style={styles.loader} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Clientes</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddClient}>
          <Text style={styles.addButtonText}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>

      {pendingInvites.length > 0 && (
        <View style={styles.pendingSection}>
          <Text style={styles.pendingTitle}>Convites pendentes</Text>
          {pendingInvites.map((inv) => (
            <View key={inv.id} style={styles.pendingCard}>
              <View>
                <Text style={styles.clientName}>{inv.client?.name || 'Cliente'}</Text>
                <Text style={styles.clientEmail}>{inv.client?.email}</Text>
              </View>
              <View style={styles.pendingActions}>
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => handleAcceptInvite(inv.id)}
                >
                  <Text style={styles.acceptBtnText}>Aceitar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectBtn}
                  onPress={() => handleRejectInvite(inv.id)}
                >
                  <Text style={styles.rejectBtnText}>Recusar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.listTitle}>Alunos ({clients.length})</Text>
      {clients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum cliente cadastrado</Text>
          <Text style={styles.emptySubtext}>Adicione clientes ou aceite convites</Text>
        </View>
      ) : (
        clients.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.clientCard,
              selectedClient?.id === item.id && styles.clientCardActive,
            ]}
            onPress={() => setSelectedClient(selectedClient?.id === item.id ? null : item)}
          >
            <Text style={styles.clientName}>{item.client?.name || 'Cliente'}</Text>
            <Text style={styles.clientEmail}>{item.client?.email}</Text>
            <Text style={styles.clientStatus}>Status: {item.status}</Text>
            {item.notes ? (
              <Text style={styles.clientNotes}>{item.notes}</Text>
            ) : null}
          </TouchableOpacity>
        ))
      )}

      {selectedClient && selectedClient.status === 'active' && (
        <View style={styles.detailSection}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setSelectedClient(null)}
          >
            <Text style={styles.backBtnText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.detailTitle}>{selectedClient.client?.name || 'Aluno'}</Text>
          <Text style={styles.detailEmail}>{selectedClient.client?.email}</Text>

          {evolutionLoading ? (
            <ActivityIndicator size="small" style={styles.detailLoader} />
          ) : evolution?.summary ? (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Resumo de evolução</Text>
              {evolution.summary.last_weight != null && (
                <Text style={styles.summaryText}>Peso: {evolution.summary.last_weight} kg</Text>
              )}
              {evolution.summary.last_body_fat != null && (
                <Text style={styles.summaryText}>Gordura: {evolution.summary.last_body_fat}%</Text>
              )}
              {evolution.summary.last_muscle_mass != null && (
                <Text style={styles.summaryText}>Massa magra: {evolution.summary.last_muscle_mass} kg</Text>
              )}
            </View>
          ) : null}

          <Text style={styles.workoutsTitle}>Treinos do aluno</Text>
          {workoutsLoading ? (
            <ActivityIndicator size="small" style={styles.detailLoader} />
          ) : workouts.length === 0 ? (
            <Text style={styles.hint}>Nenhum treino registrado.</Text>
          ) : (
            workouts.map((w) => (
              <View key={w.id} style={styles.workoutCard}>
                <Text style={styles.workoutName}>{w.name}</Text>
                <Text style={styles.workoutDate}>{formatDate(w.created_at)}</Text>
                {(w.exercises || []).slice(0, 3).map((ex, i) => (
                  <Text key={i} style={styles.exLine}>
                    • {ex.exercise?.name || 'Exercício'} — {ex.sets}×{ex.reps}
                  </Text>
                ))}
              </View>
            ))
          )}

          <Text style={styles.webHint}>
            Criar treino para este aluno: use a versão web em Treinador → aluno → Criar treino.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loader: { marginTop: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  pendingSection: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  pendingTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#333' },
  pendingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pendingActions: { flexDirection: 'row', gap: 8 },
  acceptBtn: { backgroundColor: '#34C759', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  acceptBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  rejectBtn: { backgroundColor: '#FF3B30', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  rejectBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  listTitle: { fontSize: 16, fontWeight: '600', marginHorizontal: 14, marginBottom: 8, color: '#333' },
  clientCard: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clientCardActive: { borderWidth: 2, borderColor: '#007AFF' },
  clientName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  clientEmail: { fontSize: 14, color: '#666', marginBottom: 5 },
  clientStatus: { fontSize: 12, color: '#999', marginBottom: 5 },
  clientNotes: { fontSize: 14, color: '#333', marginTop: 5, fontStyle: 'italic' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#666', marginBottom: 10 },
  emptySubtext: { fontSize: 14, color: '#999' },
  detailSection: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  backBtn: { marginBottom: 12 },
  backBtnText: { fontSize: 15, color: '#007AFF', fontWeight: '500' },
  detailTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  detailEmail: { fontSize: 14, color: '#666', marginBottom: 16 },
  detailLoader: { marginVertical: 12 },
  summaryBox: { backgroundColor: '#f8f8f8', padding: 12, borderRadius: 8, marginBottom: 16 },
  summaryTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  summaryText: { fontSize: 14, color: '#666', marginBottom: 4 },
  workoutsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#333' },
  hint: { fontSize: 14, color: '#999', marginBottom: 8 },
  workoutCard: { backgroundColor: '#f8f8f8', padding: 12, borderRadius: 8, marginBottom: 10 },
  workoutName: { fontWeight: '600', fontSize: 15, color: '#333', marginBottom: 4 },
  workoutDate: { fontSize: 12, color: '#666', marginBottom: 8 },
  exLine: { fontSize: 13, color: '#555', marginLeft: 8, marginBottom: 2 },
  webHint: { fontSize: 12, color: '#888', marginTop: 16, fontStyle: 'italic' },
});

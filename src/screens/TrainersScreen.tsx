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
import { useAuth } from '../context/AuthContext';
import { coachAPI } from '../services/coachAPI';

type CoachItem = {
  id: number;
  name: string;
  email: string;
  coach_plan?: string;
};

type MyCoach = {
  id: number;
  coach_id: number;
  status: string;
  coach?: CoachItem;
};

export default function TrainersScreen() {
  const { user } = useAuth();
  const [myCoaches, setMyCoaches] = useState<MyCoach[]>([]);
  const [availableCoaches, setAvailableCoaches] = useState<CoachItem[]>([]);
  const [loadingMy, setLoadingMy] = useState(true);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [invitingId, setInvitingId] = useState<number | null>(null);

  useEffect(() => {
    loadMyCoaches();
    loadAvailable();
  }, []);

  const loadMyCoaches = async () => {
    setLoadingMy(true);
    try {
      const data = await coachAPI.getMyCoaches();
      setMyCoaches(Array.isArray(data) ? data : []);
    } catch {
      setMyCoaches([]);
    } finally {
      setLoadingMy(false);
    }
  };

  const loadAvailable = async () => {
    setLoadingAvailable(true);
    try {
      const data = await coachAPI.getCoachAvailable();
      setAvailableCoaches(Array.isArray(data) ? data : []);
    } catch {
      setAvailableCoaches([]);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handleInvite = (coachId: number) => {
    const already = myCoaches.some((c) => c.coach_id === coachId);
    if (already) {
      Alert.alert('Aviso', 'Você já tem vínculo com este treinador.');
      return;
    }
    setInvitingId(coachId);
    coachAPI
      .coachInvite(coachId)
      .then(() => {
        Alert.alert('Sucesso', 'Convite enviado. Aguarde o treinador aceitar.');
        loadMyCoaches();
      })
      .catch((err: any) => {
        Alert.alert('Erro', err.response?.data?.error || 'Erro ao enviar convite');
      })
      .finally(() => setInvitingId(null));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meus treinadores</Text>
        {loadingMy ? (
          <ActivityIndicator size="small" style={styles.loader} />
        ) : myCoaches.length === 0 ? (
          <Text style={styles.emptyText}>Você ainda não tem treinadores. Convide abaixo.</Text>
        ) : (
          myCoaches.map((mc) => (
            <View key={mc.id} style={styles.card}>
              <Text style={styles.coachName}>{mc.coach?.name || 'Treinador'}</Text>
              <Text style={styles.coachEmail}>{mc.coach?.email}</Text>
              <View style={[styles.badge, mc.status === 'active' ? styles.badgeActive : styles.badgePending]}>
                <Text style={styles.badgeText}>{mc.status === 'active' ? 'Ativo' : 'Pendente'}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Descobrir treinadores</Text>
        {loadingAvailable ? (
          <ActivityIndicator size="small" style={styles.loader} />
        ) : availableCoaches.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum treinador disponível no momento.</Text>
        ) : (
          availableCoaches.map((c) => {
            const isMyCoach = myCoaches.some((mc) => mc.coach_id === c.id);
            return (
              <View key={c.id} style={styles.card}>
                <Text style={styles.coachName}>{c.name}</Text>
                <Text style={styles.coachEmail}>{c.email}</Text>
                {c.coach_plan && (
                  <Text style={styles.planLabel}>Plano: {c.coach_plan}</Text>
                )}
                {!isMyCoach ? (
                  <TouchableOpacity
                    style={styles.inviteBtn}
                    onPress={() => handleInvite(c.id)}
                    disabled={invitingId === c.id}
                  >
                    <Text style={styles.inviteBtnText}>
                      {invitingId === c.id ? 'Enviando...' : 'Convidar'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.invitedLabel}>Já vinculado</Text>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  section: { padding: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  loader: { marginVertical: 12 },
  emptyText: { fontSize: 14, color: '#666', marginBottom: 8 },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  coachName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  coachEmail: { fontSize: 14, color: '#666', marginBottom: 6 },
  planLabel: { fontSize: 12, color: '#888', marginBottom: 8 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  badgeActive: { backgroundColor: '#e8f5e9' },
  badgePending: { backgroundColor: '#fff3e0' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#333' },
  inviteBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  inviteBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  invitedLabel: { fontSize: 13, color: '#666', marginTop: 4 },
});

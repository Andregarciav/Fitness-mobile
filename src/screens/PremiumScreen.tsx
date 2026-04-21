import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { subscriptionAPI } from '../services/api';

export default function PremiumScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [limits, setLimits] = useState<any>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const [statusData, limitsData] = await Promise.all([
        subscriptionAPI.getStatus(),
        subscriptionAPI.getLimits(),
      ]);
      setStatus(statusData);
      setLimits(limitsData);
    } catch (error) {
      console.error('Erro ao carregar dados da assinatura:', error);
    }
  };

  const handleUpgrade = async () => {
    Alert.alert(
      'Upgrade para Premium',
      'Deseja fazer upgrade para o plano Premium?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setLoading(true);
            try {
              await subscriptionAPI.upgrade();
              Alert.alert('Sucesso', 'Upgrade realizado com sucesso!');
              await loadSubscriptionData();
            } catch (error: any) {
              Alert.alert('Erro', error.response?.data?.error || 'Erro ao fazer upgrade');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const isPremium = status?.is_premium || user?.is_premium;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Seu Plano</Text>
        <View style={[styles.badge, isPremium && styles.badgePremium]}>
          <Text style={[styles.badgeText, isPremium && styles.badgeTextPremium]}>
            {isPremium ? 'PREMIUM' : 'GRATUITO'}
          </Text>
        </View>
      </View>

      {limits && (
        <View style={styles.limitsContainer}>
          <Text style={styles.sectionTitle}>Limites do Plano</Text>
          
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Exercícios:</Text>
            <Text style={styles.limitValue}>
              {limits.max_exercises === -1 ? 'Ilimitado' : `Até ${limits.max_exercises}`}
            </Text>
          </View>

          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Treinos:</Text>
            <Text style={styles.limitValue}>
              {limits.max_workouts === -1 ? 'Ilimitado' : `Até ${limits.max_workouts}`}
            </Text>
          </View>

          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Refeições:</Text>
            <Text style={styles.limitValue}>
              {limits.max_meals === -1 ? 'Ilimitado' : `Até ${limits.max_meals}`}
            </Text>
          </View>

          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>IA Personalizada:</Text>
            <Text style={styles.limitValue}>
              {limits.ai_features ? '✅ Incluído' : '❌ Não disponível'}
            </Text>
          </View>

          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Análises Avançadas:</Text>
            <Text style={styles.limitValue}>
              {limits.advanced_analytics ? '✅ Incluído' : '❌ Não disponível'}
            </Text>
          </View>
        </View>
      )}

      {!isPremium && (
        <View style={styles.upgradeContainer}>
          <Text style={styles.upgradeTitle}>Faça Upgrade para Premium</Text>
          <Text style={styles.upgradeDescription}>
            Desbloqueie recursos avançados como:
          </Text>
          <View style={styles.featuresList}>
            <Text style={styles.feature}>✓ Exercícios e treinos ilimitados</Text>
            <Text style={styles.feature}>✓ Planos gerados por IA</Text>
            <Text style={styles.feature}>✓ Análises avançadas de progresso</Text>
            <Text style={styles.feature}>✓ Exportação de dados</Text>
            <Text style={styles.feature}>✓ Suporte prioritário</Text>
          </View>

          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgrade}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.upgradeButtonText}>Fazer Upgrade</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {isPremium && status?.premium_until && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Premium válido até: {new Date(status.premium_until).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      )}
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
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  badge: {
    backgroundColor: '#666',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgePremium: {
    backgroundColor: '#FFD700',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  badgeTextPremium: {
    color: '#333',
  },
  limitsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  limitLabel: {
    fontSize: 16,
    color: '#666',
  },
  limitValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  upgradeContainer: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 10,
    borderRadius: 8,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  upgradeDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  featuresList: {
    marginBottom: 20,
  },
  feature: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  upgradeButton: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
  },
});


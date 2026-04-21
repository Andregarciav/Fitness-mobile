import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://images.pexels.com/photos/1552104/pexels-photo-1552104.jpeg?auto=compress&cs=tinysrgb&w=1200',
        }}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroGreeting}>Olá, {user?.name || 'atleta'} 👋</Text>
          <Text style={styles.heroTitle}>Seu próximo treino começa agora</Text>
          <Text style={styles.heroSubtitle}>
            Acompanhe treinos, alimentação e evolução em um só lugar.
          </Text>
          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={styles.heroPrimaryBtn}
              onPress={() => navigation.navigate('Workouts')}
            >
              <Text style={styles.heroPrimaryText}>Ver treinos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroSecondaryBtn}
              onPress={() => navigation.navigate('Routines')}
            >
              <Text style={styles.heroSecondaryText}>Rotinas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.sectionRow}>
        <TouchableOpacity
          style={styles.sectionCard}
          onPress={() => navigation.navigate('Workouts')}
        >
          <Text style={styles.sectionTitle}>Treinos</Text>
          <Text style={styles.sectionText}>Veja seus treinos e programe a semana.</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sectionCard}
          onPress={() => navigation.navigate('Nutrition')}
        >
          <Text style={styles.sectionTitle}>Nutrição</Text>
          <Text style={styles.sectionText}>Controle refeições e calorias do dia.</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionRow}>
        <TouchableOpacity
          style={styles.sectionCard}
          onPress={() => navigation.navigate('Routines')}
        >
          <Text style={styles.sectionTitle}>Rotinas</Text>
          <Text style={styles.sectionText}>Marque treinos e refeições como feitos.</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sectionCard}
          onPress={() => navigation.navigate('Trainers')}
        >
          <Text style={styles.sectionTitle}>Treinadores</Text>
          <Text style={styles.sectionText}>Conecte-se com um coach na plataforma.</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  hero: {
    height: 260,
    justifyContent: 'flex-end',
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.65)',
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heroGreeting: {
    fontSize: 14,
    color: '#e5e7eb',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#d1d5db',
    marginBottom: 14,
  },
  heroButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroPrimaryBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  heroPrimaryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  heroSecondaryBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#6b7280',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  heroSecondaryText: {
    color: '#e5e7eb',
    fontWeight: '500',
    fontSize: 13,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionCard: {
    flex: 1,
    backgroundColor: '#020617',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 13,
    color: '#9ca3af',
  },
});


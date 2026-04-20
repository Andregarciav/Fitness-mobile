import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ExercisesScreen from './src/screens/ExercisesScreen';
import CreateExerciseScreen from './src/screens/CreateExerciseScreen';
import ExerciseDetailScreen from './src/screens/ExerciseDetailScreen';
import WorkoutsScreen from './src/screens/WorkoutsScreen';
import CreateWorkoutScreen from './src/screens/CreateWorkoutScreen';
import WorkoutDetailScreen from './src/screens/WorkoutDetailScreen';
import NutritionScreen from './src/screens/NutritionScreen';
import CreateMealScreen from './src/screens/CreateMealScreen';
import MealDetailScreen from './src/screens/MealDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RoutinesScreen from './src/screens/RoutinesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import CoachScreen from './src/screens/CoachScreen';
import TrainersScreen from './src/screens/TrainersScreen';
import ExamsScreen from './src/screens/ExamsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Routines" component={RoutinesScreen} options={{ title: 'Rotinas' }} />
      <Tab.Screen name="Exercises" component={ExercisesScreen} />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Ou um componente de loading
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="CreateExercise" component={CreateExerciseScreen} options={{ title: 'Novo Exercício' }} />
            <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: 'Detalhes' }} />
            <Stack.Screen name="CreateWorkout" component={CreateWorkoutScreen} options={{ title: 'Novo Treino' }} />
            <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} options={{ title: 'Detalhes' }} />
            <Stack.Screen name="CreateMeal" component={CreateMealScreen} options={{ title: 'Nova Refeição' }} />
            <Stack.Screen name="MealDetail" component={MealDetailScreen} options={{ title: 'Detalhes' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configurações' }} />
            <Stack.Screen name="Exams" component={ExamsScreen} options={{ title: 'Exames de sangue' }} />
            <Stack.Screen name="Premium" component={PremiumScreen} options={{ title: 'Premium' }} />
            <Stack.Screen name="Coach" component={CoachScreen} options={{ title: 'Meus Clientes' }} />
            <Stack.Screen name="Trainers" component={TrainersScreen} options={{ title: 'Treinadores' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}


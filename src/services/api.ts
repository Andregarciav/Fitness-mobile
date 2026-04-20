import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL_PROD } from '../config';

// Para o APK debug rodando no celular, "localhost" aponta para o próprio aparelho.
// Usamos sempre a URL de produção (São André / Tailscale) para evitar erro de rede.
const API_BASE_URL = API_BASE_URL_PROD;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const userAPI = {
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data?.user ?? response.data;
  },
  updateMe: async (data: {
    name?: string;
    photo_base64?: string;
    age?: number;
    weight?: number;
    height?: number;
    gender?: string;
    goal?: string;
    birth_date?: string;
    cpf?: string;
    alternate_email?: string;
  }) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },
};

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },
};

export const exerciseAPI = {
  getAll: async () => {
    const response = await api.get('/exercises');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/exercises/${id}`);
    return response.data;
  },
  create: async (exercise: any) => {
    const response = await api.post('/exercises', exercise);
    return response.data;
  },
  update: async (id: number, exercise: any) => {
    const response = await api.put(`/exercises/${id}`, exercise);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/exercises/${id}`);
    return response.data;
  },
};

export const workoutAPI = {
  getAll: async () => {
    const response = await api.get('/workouts');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/workouts/${id}`);
    return response.data;
  },
  create: async (workout: any) => {
    const response = await api.post('/workouts', workout);
    return response.data;
  },
  update: async (id: number, workout: any) => {
    const response = await api.put(`/workouts/${id}`, workout);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/workouts/${id}`);
    return response.data;
  },
  complete: async (workoutId: number, body?: { completed_at?: string; notes?: string }) => {
    const response = await api.post(`/workouts/${workoutId}/complete`, body || {});
    return response.data;
  },
  getCompletions: async (params?: { from?: string; to?: string }) => {
    const search = params ? new URLSearchParams(params as any).toString() : '';
    const url = search ? `/workouts/completions?${search}` : '/workouts/completions';
    const response = await api.get(url);
    return response.data;
  },
};

export const nutritionAPI = {
  getMeals: async () => {
    const response = await api.get('/nutrition/meals');
    return response.data;
  },
  getMeal: async (id: number) => {
    const response = await api.get(`/nutrition/meals/${id}`);
    return response.data;
  },
  createMeal: async (meal: any) => {
    const response = await api.post('/nutrition/meals', meal);
    return response.data;
  },
  createMealFromTACO: async (tacoId: number, portionGrams: number, name?: string) => {
    const response = await api.post('/nutrition/meals/from-taco', {
      taco_id: tacoId,
      portion_grams: portionGrams,
      name: name || undefined,
    });
    return response.data;
  },
  update: async (id: number, meal: any) => {
    const response = await api.put(`/nutrition/meals/${id}`, meal);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/nutrition/meals/${id}`);
    return response.data;
  },
  logMeal: async (mealId: number, body?: { logged_at?: string; notes?: string }) => {
    const response = await api.post(`/nutrition/meals/${mealId}/log`, body || {});
    return response.data;
  },
  getMealLogs: async (params?: { from?: string; to?: string }) => {
    const search = params ? new URLSearchParams(params as any).toString() : '';
    const url = search ? `/nutrition/meals/logs?${search}` : '/nutrition/meals/logs';
    const response = await api.get(url);
    return response.data;
  },
  getPlans: async () => {
    const response = await api.get('/nutrition/plans');
    return response.data;
  },
  createPlan: async (plan: any) => {
    const response = await api.post('/nutrition/plans', plan);
    return response.data;
  },
  // TACO - Tabela Brasileira de Composição de Alimentos
  searchTACO: async (q?: string, category?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (limit) params.set('limit', String(limit));
    const response = await api.get(`/nutrition/taco?${params.toString()}`);
    return response.data;
  },
  getTACOCategories: async () => {
    const response = await api.get('/nutrition/taco/categories');
    return response.data;
  },
  getTACOById: async (id: number) => {
    const response = await api.get(`/nutrition/taco/${id}`);
    return response.data;
  },
};

export const examsAPI = {
  getTypes: async () => {
    const response = await api.get('/exams/types');
    return response.data.types;
  },
  getAll: async (params?: { exam_date_from?: string; exam_date_to?: string; exam_code?: string }) => {
    const q = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const response = await api.get('/exams' + q);
    return response.data;
  },
  create: async (data: {
    exam_code: string;
    exam_name: string;
    value: string;
    unit?: string;
    reference?: string;
    exam_date: string;
    notes?: string;
  }) => {
    const response = await api.post('/exams', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/exams/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/exams/${id}`);
    return response.data;
  },
  parseText: async (text: string) => {
    const response = await api.post('/exams/parse-text', { text });
    return response.data;
  },
};

export const healthAPI = {
  getMetrics: async (params?: { category?: string; type?: string; date_from?: string; date_to?: string }) => {
    const q = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const response = await api.get('/health/metrics' + q);
    return response.data;
  },
  sync: async (source: string, metrics: Array<{
    category: string;
    type: string;
    value?: string;
    value_min?: number;
    value_max?: number;
    unit?: string;
    date?: string;
    notes?: string;
  }>) => {
    const response = await api.post('/health/sync', { source, metrics });
    return response.data;
  },
};

export const subscriptionAPI = {
  getStatus: async () => {
    const response = await api.get('/subscription/status');
    return response.data;
  },
  getLimits: async () => {
    const response = await api.get('/subscription/limits');
    return response.data;
  },
  upgrade: async () => {
    const response = await api.post('/subscription/upgrade');
    return response.data;
  },
  cancel: async () => {
    const response = await api.post('/subscription/cancel');
    return response.data;
  },
};

export const aiAPI = {
  generateWorkoutPlan: async (data: any) => {
    const response = await api.post('/ai/workout-plan', data);
    return response.data;
  },
  generateNutritionPlan: async (data: any) => {
    const response = await api.post('/ai/nutrition-plan', data);
    return response.data;
  },
};

export default api;


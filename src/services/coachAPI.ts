import api from './api';

export const coachAPI = {
  getCoachAvailable: async () => {
    const response = await api.get('/coach/available');
    return response.data;
  },

  coachInvite: async (coachId: number) => {
    const response = await api.post('/coach/invite', { coach_id: coachId });
    return response.data;
  },

  getMyCoaches: async () => {
    const response = await api.get('/coach/my-coaches');
    return response.data;
  },

  becomeCoach: async () => {
    const response = await api.post('/coach/become');
    return response.data;
  },

  getClients: async (status?: string) => {
    const url = status ? `/coach/clients?status=${encodeURIComponent(status)}` : '/coach/clients';
    const response = await api.get(url);
    return response.data;
  },

  acceptInvite: async (coachClientId: number) => {
    const response = await api.patch(`/coach/invites/${coachClientId}/accept`);
    return response.data;
  },

  rejectInvite: async (coachClientId: number) => {
    const response = await api.patch(`/coach/invites/${coachClientId}/reject`);
    return response.data;
  },
  
  addClient: async (clientEmail: string, notes?: string) => {
    const response = await api.post('/coach/clients', {
      client_email: clientEmail,
      notes: notes || '',
    });
    return response.data;
  },
  
  removeClient: async (clientId: number) => {
    const response = await api.delete(`/coach/clients/${clientId}`);
    return response.data;
  },
  
  getClientProgress: async (clientId: number) => {
    const response = await api.get(`/coach/clients/${clientId}/progress`);
    return response.data;
  },

  getClientEvolution: async (clientId: number) => {
    const response = await api.get(`/coach/clients/${clientId}/evolution`);
    return response.data;
  },

  getClientWorkouts: async (clientId: number) => {
    const response = await api.get(`/coach/clients/${clientId}/workouts`);
    return response.data;
  },

  getClientExercises: async (clientId: number) => {
    const response = await api.get(`/coach/clients/${clientId}/exercises`);
    return response.data;
  },

  createClientWorkout: async (clientId: number, workout: any) => {
    const response = await api.post(`/coach/clients/${clientId}/workouts`, workout);
    return response.data;
  },
  
  createClientNutritionPlan: async (clientId: number, plan: any) => {
    const response = await api.post(`/coach/clients/${clientId}/nutrition-plans`, plan);
    return response.data;
  },
  
  updateClientNotes: async (clientId: number, notes: string) => {
    const response = await api.put(`/coach/clients/${clientId}/notes`, { notes });
    return response.data;
  },
  
  sendMessage: async (clientId: number, message: string, type?: string) => {
    const response = await api.post('/coach/messages', {
      client_id: clientId,
      message,
      type: type || 'feedback',
    });
    return response.data;
  },
  
  getClientMessages: async (clientId: number) => {
    const response = await api.get(`/coach/messages/${clientId}`);
    return response.data;
  },
};


// Tipo User — source of truth para o mobile.
// Deve ser mantido em sincronia com a API (openapi-typescript na Fase 0 final).

export interface User {
  id: number;
  email: string;
  name: string;
  photo_base64?: string;
  age?: number;
  weight_kg?: number;
  height_cm?: number;
  gender?: 'male' | 'female' | 'other';
  goal?: 'lose_weight' | 'gain_muscle' | 'maintain' | 'performance';
  role?: 'user' | 'coach';
  bio?: string;
  specialization?: string;
  birth_date?: string; // ISO 8601: YYYY-MM-DD
  cpf?: string;
  alternate_email?: string;

  // Subscription
  plan: 'free' | 'premium' | 'coach';
  is_premium: boolean;
  premium_until?: string; // ISO 8601
  subscription_id?: number;
  subscription_provider?: 'google_play' | 'apple' | 'mercadopago' | null;

  // Coach-specific
  coach_plan?: 'basic' | 'personal' | 'pro';
  coach_plan_expires_at?: string;

  created_at: string;
  updated_at: string;
}

export const isPremium = (user: User): boolean => user.is_premium === true;
export const isCoach = (user: User): boolean => user.role === 'coach';
export const isPremiumOrCoach = (user: User): boolean =>
  isPremium(user) || isCoach(user);

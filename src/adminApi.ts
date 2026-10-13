import { api } from './api';

const TOKEN_KEY = 'adminToken';

export const getAdminToken = () => sessionStorage.getItem(TOKEN_KEY);
export const clearAdminToken = () => sessionStorage.removeItem(TOKEN_KEY);

export const adminLogin = async (username: string, password: string) => {
  const response = await api.post<{ token: string }>('/api/admin/login', { username, password });
  sessionStorage.setItem(TOKEN_KEY, response.data.token);
};

const authHeaders = () => ({ Authorization: `Bearer ${getAdminToken() ?? ''}` });

export const adminGet = async <T,>(path: string): Promise<T> => {
  const response = await api.get<T>(`/api/admin${path}`, { headers: authHeaders() });
  return response.data;
};

export const adminDownload = async (path: string, filename: string) => {
  const response = await api.get<Blob>(`/api/admin${path}`, { headers: authHeaders(), responseType: 'blob' });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export interface AdminSummary {
  totals: { surveys: number; completed: number; inProgress: number; withAi: number; withoutAi: number; meals: number; completionRate: number; answerRate: number };
  averages: { durationMinutes: number; answeredQuestions: number; mealsPerSurvey: number };
  byDay: { date: string; count: number }[];
  questions: { id: string; number: number; question: string; answered: number; skipped: number; choices: Record<string, number> }[];
}

export interface AdminSurveyItem {
  id: string;
  status: 'in_progress' | 'completed';
  mode: string;
  mascot: string;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  answered: number;
  total: number;
  intakes: number;
}

export interface AdminAiTurn {
  transcript: string;
  answer: string;
  reply: string;
  followUp: boolean;
  needsRepeat: boolean;
  selectedGroups?: Record<string, string[]>;
  at: string;
}

export interface AdminQuestion {
  id: string;
  number: number;
  question: string;
  mode: string;
  text?: string;
  typed?: string;
  voice?: string;
  selections?: Record<string, string[]>;
  parentOccupations?: Record<string, { occupation: string; notWorking: boolean }>;
  aiReply?: string;
  aiTurns?: AdminAiTurn[];
}

export interface AdminIntake {
  intake: number;
  text: string;
  mode: string;
  fields: Record<string, string | string[]>;
  skipped?: string[];
  heard?: string[];
  turns?: { stage: string; transcript: string; reply: string; at: string }[];
}

export interface AdminSurveyDetail extends Omit<AdminSurveyItem, 'intakes'> {
  questions: AdminQuestion[];
  intakes: AdminIntake[];
  currentIntake: AdminIntake | null;
}

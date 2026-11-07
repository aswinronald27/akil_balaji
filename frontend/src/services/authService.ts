import { User, UserRole } from '../types';
import { apiClient } from './apiClient';

const DEMO_USERS: Record<UserRole, User> = {
  'Incident Commander': {
    id: 'usr-001',
    name: 'Elena Rostova',
    email: 'elena.rostova@intellidesk.io',
    role: 'Incident Commander',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    department: 'Site Reliability Engineering / NOC',
  },
  'Senior SRE': {
    id: 'usr-002',
    name: 'Alex Rivera',
    email: 'alex.rivera@intellidesk.io',
    role: 'Senior SRE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    department: 'Core Infrastructure',
  },
  'DevOps Lead': {
    id: 'usr-003',
    name: 'Marcus Vance',
    email: 'marcus.vance@intellidesk.io',
    role: 'DevOps Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    department: 'Cloud Platform Engineering',
  },
  'Support Engineer': {
    id: 'usr-004',
    name: 'Priya Sharma',
    email: 'priya.sharma@intellidesk.io',
    role: 'Support Engineer',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    department: 'Tier-2 Technical Operations',
  },
};

const STORAGE_KEY_USER = 'intellidesk_current_user';
const STORAGE_KEY_TOKEN = 'intellidesk_auth_token';

export const authService = {
  async login(email?: string, _password?: string, selectedRole: UserRole = 'Incident Commander'): Promise<User> {
    return apiClient.post<User>(
      '/auth/login',
      { email, selectedRole },
      () => {
        const user = DEMO_USERS[selectedRole] || DEMO_USERS['Incident Commander'];
        const dummyToken = `mock_jwt_token_${user.id}_${Date.now()}`;
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEY_TOKEN, dummyToken);
        return user;
      }
    );
  },

  getCurrentUser(): User {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    // Default to Elena Rostova (Incident Commander)
    const defaultUser = DEMO_USERS['Incident Commander'];
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(defaultUser));
    localStorage.setItem(STORAGE_KEY_TOKEN, `mock_jwt_token_default`);
    return defaultUser;
  },

  switchRole(role: UserRole): User {
    const user = DEMO_USERS[role] || DEMO_USERS['Incident Commander'];
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    return user;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  },

  getAvailableRoles(): UserRole[] {
    return ['Incident Commander', 'Senior SRE', 'DevOps Lead', 'Support Engineer'];
  },

  getDemoUsers(): Record<UserRole, User> {
    return DEMO_USERS;
  },
};

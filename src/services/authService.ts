import type { User } from '../types/auth';

const API_URL = '/api/auth';

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    const res = await fetch(`${API_URL}/me`);
    if (!res.ok) return null;
    return res.json();
  },

  async login(email: string, password: string):Promise<User> {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async register(fullName: string, email: string, password: string, phone?: string):Promise<User> {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, phone })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async logout(): Promise<void> {
    await fetch(`${API_URL}/logout`, { method: 'POST' });
  },

  async updateProfile(fullName: string, email: string, phone?: string): Promise<User> {
    const res = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, phone })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update failed');
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const res = await fetch(`${API_URL}/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Password change failed');
  },

  async requestPasswordReset(email: string): Promise<void> {
    const res = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const res = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Reset failed');
  }
};

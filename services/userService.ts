
import { supabase } from './supabase';
import { User } from '../types';
import { DEMO_USERS } from '../data/Users';

export const userService = {
  // --- USER MANAGEMENT (SQL: app_users) ---
  async fetchUsers(): Promise<User[]> {
      if (!supabase) return DEMO_USERS;
      const { data, error } = await supabase.from('app_users').select('*').order('full_name');
      if (error) return DEMO_USERS;
      return data.map((u: any) => ({
          id: u.id, username: u.username, password: u.password, fullName: u.full_name, role: u.role,
          permissions: u.permissions || [], jobTitle: u.job_title, email: u.email, phone: u.phone, address: u.address, avatarUrl: u.avatar_url
      }));
  },

  async addUser(user: Omit<User, 'id'>): Promise<User | null> {
      if (!supabase) return null;
      const { data, error } = await supabase.from('app_users').insert({ username: user.username, password: user.password, full_name: user.fullName, role: user.role, permissions: user.permissions, job_title: user.jobTitle, email: user.email, phone: user.phone, address: user.address, avatar_url: user.avatarUrl }).select().single();
      if (error) return null;
      return { id: data.id, username: data.username, password: data.password, fullName: data.full_name, role: data.role, permissions: data.permissions || [], jobTitle: data.job_title, email: data.email, phone: data.phone, address: data.address, avatarUrl: data.avatar_url };
  },

  async updateUser(id: string, user: Partial<User>): Promise<boolean> {
      if (!supabase) return false;
      const { error } = await supabase.from('app_users').update({ full_name: user.fullName, job_title: user.jobTitle, email: user.email, phone: user.phone, address: user.address, role: user.role, permissions: user.permissions, avatar_url: user.avatarUrl }).eq('id', id);
      return !error;
  },

  async deleteUser(id: string): Promise<boolean> {
      if (!supabase) return false;
      const { error } = await supabase.from('app_users').delete().eq('id', id);
      return !error;
  },

  async upsertUser(user: User): Promise<boolean> { 
      return this.updateUser(user.id, user); 
  }
};

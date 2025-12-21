
import { supabase } from './supabase';
import { User } from '../types';

export const authService = {
  async getUser(userId: string): Promise<User | null> {
      if (!supabase) return null;
      const { data, error } = await supabase.from('app_users').select('*').eq('id', userId).single();
      if (error || !data) return null;
      return {
          id: data.id,
          username: data.username,
          password: data.password,
          fullName: data.full_name,
          jobTitle: data.job_title,
          email: data.email,
          phone: data.phone,
          address: data.address,
          avatarUrl: data.avatar_url,
          role: data.role,
          permissions: data.permissions || []
      };
  },

  async upsertUser(user: User): Promise<boolean> {
      if (!supabase) return true;
      const { error } = await supabase.from('app_users').upsert({
          id: user.id,
          username: user.username,
          password: user.password,
          full_name: user.fullName,
          job_title: user.jobTitle,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
          permissions: user.permissions
      });
      return !error;
  },

  async deleteUser(userId: string): Promise<boolean> {
      if (!supabase) return true;
      const { error } = await supabase.from('app_users').delete().eq('id', userId);
      return !error;
  }
};


import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Permission } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (user: User) => void;
  logout: () => void;
  setUsers: (users: User[]) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const SESSION_KEY = 'IHA_SESSION_ID';

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // 1. Uygulama açılışında oturum kontrolü ve taze veri çekme
  useEffect(() => {
      const initSession = async () => {
          const sessionId = localStorage.getItem(SESSION_KEY);
          if (sessionId) {
              const freshUser = await apiService.getUser(sessionId);
              if (freshUser) {
                  setCurrentUser(freshUser);
              } else {
                  // Kullanıcı DB'den silinmişse oturumu kapat
                  localStorage.removeItem(SESSION_KEY);
              }
          }
      };
      initSession();
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
    // Sadece ID'yi sakla, tüm objeyi değil.
    localStorage.setItem(SESSION_KEY, user.id);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const addUser = async (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: Math.random().toString(36).substr(2, 9) };
    setUsers(prev => [...prev, newUser]);
    await apiService.upsertUser(newUser);
  };

  const updateUser = async (id: string, updated: Partial<User>) => {
    let updatedUserObj: User | null = null;

    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        updatedUserObj = { ...u, ...updated };
        return updatedUserObj;
      }
      return u;
    }));

    if (currentUser?.id === id && updatedUserObj) {
      setCurrentUser(updatedUserObj);
      // LocalStorage'ı güncellemiyoruz, sadece state ve DB
    }

    if (updatedUserObj) {
        await apiService.upsertUser(updatedUserObj);
    }
  };

  const deleteUser = async (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    await apiService.deleteUser(id);
  };

  const hasPermission = (permission: Permission) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return currentUser.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, users, login, logout, setUsers, addUser, updateUser, deleteUser, hasPermission 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

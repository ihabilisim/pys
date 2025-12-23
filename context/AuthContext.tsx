
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Permission } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  users: User[]; // Admin list
  login: (user: User) => void;
  logout: () => void;
  setUsers: (users: User[]) => void;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
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

  // 1. Session Init
  useEffect(() => {
      const initSession = async () => {
          const sessionId = localStorage.getItem(SESSION_KEY);
          if (sessionId) {
              // Note: We use fetchUsers() then find, or a specific getUserById endpoint.
              // Given the structure, fetching all users for admin context is acceptable, 
              // but for auth, we should ideally have a single get.
              // For now, let's assume we can find the user in the full list if we are admin,
              // or we need a specific 'getUser' call in dbService.
              // Since dbService.fetchUsers() is implemented, let's use that to populate the list.
              const allUsers = await apiService.fetchUsers();
              setUsers(allUsers);
              
              const found = allUsers.find(u => u.id === sessionId);
              if (found) setCurrentUser(found);
              else localStorage.removeItem(SESSION_KEY);
          }
      };
      initSession();
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, user.id);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  // --- SQL CONNECTED CRUD ---

  const addUser = async (user: Omit<User, 'id'>) => {
    const newUser = await apiService.addUser(user);
    if (newUser) {
        setUsers(prev => [...prev, newUser]);
    }
  };

  const updateUser = async (id: string, updated: Partial<User>) => {
    // Optimistic Update
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
    if (currentUser?.id === id) setCurrentUser(prev => prev ? { ...prev, ...updated } : null);

    // DB Update
    await apiService.updateUser(id, updated);
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

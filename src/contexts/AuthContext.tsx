"use client";

import type { User } from '@/types';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
// mockUsers from data/mockData.ts is now initialized as empty.
// This context will manage its own list of users, persisted in localStorage.

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REGISTERED_USERS_STORAGE_KEY = 'registeredUsers';
const CURRENT_USER_STORAGE_KEY = 'currentUser';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load registered users from localStorage
    const storedRegisteredUsers = localStorage.getItem(REGISTERED_USERS_STORAGE_KEY);
    if (storedRegisteredUsers) {
      try {
        setRegisteredUsers(JSON.parse(storedRegisteredUsers));
      } catch (e) {
        console.error("Failed to parse registered users from localStorage:", e);
        localStorage.removeItem(REGISTERED_USERS_STORAGE_KEY); // Clear corrupted data
      }
    }

    // Simulate checking for a logged-in user from localStorage
    const storedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse current user from localStorage:", e);
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY); // Clear corrupted data
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Persist registered users to localStorage whenever it changes
    localStorage.setItem(REGISTERED_USERS_STORAGE_KEY, JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const login = async (email: string, _pass: string): Promise<boolean> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    const foundUser = registeredUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(foundUser));
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  const register = async (name: string, email: string, _pass: string): Promise<boolean> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    const existingUser = registeredUsers.find(u => u.email === email);
    if (existingUser) {
      setLoading(false);
      return false; // User already exists
    }
    
    const newUser: User = { id: `user-${Date.now()}-${Math.random().toString(36).substring(2,9)}`, email, name };
    setRegisteredUsers(prevUsers => [...prevUsers, newUser]);
    
    // Optionally, log in the user immediately after registration
    setUser(newUser);
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(newUser));
    
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

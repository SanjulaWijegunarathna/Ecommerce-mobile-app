import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize session from AsyncStorage on app launch
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@atelier_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load user session', e);
      } finally {
        setIsInitializing(false);
      }
    };
    loadUser();
  }, []);

  const login = async (userData) => {
    const updatedUser = { ...userData, explicitLoggedOut: false };
    setUser(updatedUser);
    try {
      await AsyncStorage.setItem('@atelier_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Failed to save user session', e);
    }
  };

  const logout = async () => {
    setUser((prev) => {
      if (!prev) return null;
      const loggedOutUser = { ...prev, token: null, explicitLoggedOut: true };
      AsyncStorage.setItem('@atelier_user', JSON.stringify(loggedOutUser)).catch(e => console.error('Failed to update logout sync', e));
      return loggedOutUser;
    });
  };

  const updateUser = async (updates) => {
    setUser((prev) => {
      // If we are logged out but updating (e.g. cart changes), keep the flag
      const updatedUser = prev ? { ...prev, ...updates } : updates;
      AsyncStorage.setItem('@atelier_user', JSON.stringify(updatedUser)).catch(e => console.error('Failed to update session sync', e));
      return updatedUser;
    });
  };

  return (
    <UserContext.Provider value={{ user, isInitializing, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

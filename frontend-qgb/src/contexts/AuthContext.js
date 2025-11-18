"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const tokenStorage = localStorage.getItem('qg_auth_token');
      const userStorage = localStorage.getItem('qg_user');

      if (tokenStorage && userStorage) {
        setUser(JSON.parse(userStorage));
        setToken(tokenStorage);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error("Falha ao carregar autenticação", error);
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    }
    setIsLoading(false);
  }, []);

  const loginContext = (userData, token) => {
    localStorage.setItem('qg_auth_token', token);
    localStorage.setItem('qg_user', JSON.stringify(userData));
    setUser(userData);
    setToken(token);
    setIsAuthenticated(true);
  };

  const logoutContext = () => {
    localStorage.removeItem('qg_auth_token');
    localStorage.removeItem('qg_user');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user, 
        token,
        isLoading, 
        loginContext, 
        logoutContext 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
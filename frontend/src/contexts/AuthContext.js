"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // O estado do token
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Efeito que roda UMA VEZ para verificar o localStorage
  useEffect(() => {
    try {
      const tokenStorage = localStorage.getItem('userToken');
      const userStorage = localStorage.getItem('user');

      if (tokenStorage && userStorage) {
        setUser(JSON.parse(userStorage));
        setToken(tokenStorage); // Define o token no estado
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
    setIsLoading(false); // Termina de carregar
  }, []);

  // Função para realizar o login no contexto
  const loginContext = (userData, token) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(token); // Define o token no estado
    setIsAuthenticated(true);
  };

  // Função para realizar o logout no contexto
  const logoutContext = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null); // Limpa o token do estado
    setIsAuthenticated(false);
  };

  // Se ainda estiver carregando os dados do localStorage, não renderize o app
  if (isLoading) {
    return <div>Carregando...</div>; // Ou um componente de Spinner global
  }

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user, 
        token,  // <-- A CORREÇÃO ESTÁ AQUI
        isLoading, 
        loginContext, 
        logoutContext 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso
export const useAuth = () => {
  return useContext(AuthContext);
};


// frontend/src/context/AuthContext.js

"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importe o router de 'next/navigation'

// 1. Criar o Contexto
const AuthContext = createContext();

// 2. Criar o Provedor (Componente que vai envolver o app)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Começa carregando

  // 3. Efeito que roda UMA VEZ para verificar o localStorage
  useEffect(() => {
    // localStorage só existe no navegador (cliente)
    try {
      const token = localStorage.getItem('userToken');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Falha ao carregar autenticação", error);
      setIsAuthenticated(false);
      setUser(null);
    }
    setIsLoading(false); // Termina de carregar
  }, []);

  // 4. Função para realizar o login no contexto
  const loginContext = (userData, token) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  // 5. Função para realizar o logout no contexto
  const logoutContext = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, loginContext, logoutContext }}>
      {children}
    </AuthContext.Provider>
  );
};

// 6. Hook customizado para facilitar o uso
export const useAuth = () => {
  return useContext(AuthContext);
};
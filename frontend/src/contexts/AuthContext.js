"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import * as lojaService from "@/services/lojaService"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // --- Estados de Autenticação ---
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- Estados da Matriz (Seleção de Loja) ---
  const [lojaSelecionada, setLojaSelecionada] = useState(null);
  const [listaLojas, setListaLojas] = useState([]);

  // --- Carregamento Inicial ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        const tokenStorage = localStorage.getItem('userToken');
        const userStorage = localStorage.getItem('user');

        if (tokenStorage && userStorage) {
          const userData = JSON.parse(userStorage);
          setUser(userData);
          setToken(tokenStorage);
          setIsAuthenticated(true);

          // Se for Admin/Matriz, carrega as lojas disponíveis
          // Você pode adicionar uma verificação aqui: if (userData.tipo === 'admin') ...
          await carregarLojas(tokenStorage);
        }
      } catch (error) {
        console.error("Falha ao carregar autenticação", error);
        logoutContext();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // --- Funções Auxiliares ---

  const carregarLojas = async (t) => {
      try {
         // Busca todas as lojas
         const res = await lojaService.readAll(t);
         const lojas = Array.isArray(res) ? res : (res.data || []);
         
         // Formata para o padrão do TeamSwitcher (opcional, mas útil para UI)
         const lojasFormatadas = lojas.map(l => ({
             id: l.loja_id || l.id,
             name: l.nome,
             logo: null, 
             plan: l.tipo || "Filial"
         }));
         
         setListaLojas(lojasFormatadas);

         // Se nenhuma loja estiver selecionada, seleciona a primeira ou tenta recuperar do localStorage
         if (lojasFormatadas.length > 0) {
             // Aqui você poderia recuperar a última loja selecionada do localStorage se quisesse
             setLojaSelecionada(lojasFormatadas[0]);
         }
      } catch (error) {
         console.error("Erro ao carregar lojas no contexto", error);
      }
  };

  // --- Ações de Auth (Login/Logout) ---

  const loginContext = (userData, tokenData) => {
    localStorage.setItem('userToken', tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setUser(userData);
    setToken(tokenData);
    setIsAuthenticated(true);
    
    // Ao logar, já carrega as lojas
    carregarLojas(tokenData);
  };

  const logoutContext = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setLojaSelecionada(null);
    setListaLojas([]);
  };

  // --- Ação de Troca de Loja ---
  const mudarLoja = (loja) => {
      setLojaSelecionada(loja);
      // Opcional: Salvar 'lastSelectedStore' no localStorage
  };

  return (
    <AuthContext.Provider value={{ 
        // Autenticação Básica
        user, 
        token, 
        isAuthenticated,
        isLoading,
        loginContext, 
        logoutContext,
        
        // Funcionalidades de Matriz
        lojaSelecionada,
        listaLojas,
        mudarLoja
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
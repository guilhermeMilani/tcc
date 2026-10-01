import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { configurarNotificacoes, configurarListeners } from '../services/notificacaoService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarUsuarioSalvo();
  }, []);

  async function carregarUsuarioSalvo() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        setUsuario({ token, ...decoded });
      }
    } catch (e) {
      await AsyncStorage.removeItem('token');
    } finally {
      setCarregando(false);
    }
  }

async function salvarLogin(token) {
  await AsyncStorage.setItem('token', token);
  const decoded = jwtDecode(token);
  setUsuario({ token, ...decoded });

  if (decoded.tipo === 'CUIDADOR') {
    await configurarNotificacoes(decoded.id);
  }
}

  async function logout() {
    await AsyncStorage.removeItem('token');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, salvarLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
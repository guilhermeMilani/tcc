import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://192.168.0.102:8080',
  timeout: 10000,
});

// Interceptor — injeta o token JWT em toda requisição automaticamente
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email, senha) =>
  api.post('/auth/login', { email, senha });

export const cadastrarIdoso = (dados) =>
  api.post('/auth/cadastro/idoso', dados);

export const cadastrarCuidador = (dados) =>
  api.post('/auth/cadastro/cuidador', dados);

// Sinais vitais
export const buscarHistoricoSinaisVitais = (idosoId, range = '24h') =>
  api.get(`/sinais-vitais/${idosoId}?range=${range}`);

// Alertas
export const buscarAlertas = (idosoId) =>
  api.get(`/alertas/idoso/${idosoId}`);

export const marcarAlertaComoLido = (alertaId) =>
  api.patch(`/alertas/${alertaId}/lido`);

// Medicações
export const buscarMedicacoes = (idosoId) =>
  api.get(`/medicacoes/idoso/${idosoId}`);

export const cadastrarMedicacao = (dados) =>
  api.post('/medicacoes', dados);

export const registrarAdesao = (medicacaoId, tomou) =>
  api.post(`/medicacoes/${medicacaoId}/adesao?tomou=${tomou}`);

export const buscarHistoricoAdesao = (idosoId, inicio, fim) =>
  api.get(`/medicacoes/idoso/${idosoId}/historico?inicio=${inicio}&fim=${fim}`);

// Localização
export const registrarLocalizacao = (dados) =>
  api.post('/localizacao', dados);

export const buscarUltimaLocalizacao = (idosoId) =>
  api.get(`/localizacao/idoso/${idosoId}/ultima`);

export const acionarPanico = (dados) =>
  api.post('/localizacao/panico', dados);

// Vínculos
export const vincular = (cuidadorId, idosoId) =>
  api.post('/vinculos', { cuidadorId, idosoId });

export const listarIdososDoCuidador = (cuidadorId) =>
  api.get(`/vinculos/cuidador/${cuidadorId}/idosos`);

export const listarCuidadoresDoIdoso = (idosoId) =>
  api.get(`/vinculos/idoso/${idosoId}/cuidadores`);

export default api;
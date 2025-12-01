// frontend-qgb/src/services/solicitacaoService.js
import { apiService } from './apiService';

export const getSolicitacoes = async (token) => {
  return await apiService.get('/solicitacoes', token);
};

export const createSolicitacao = async (data, token) => {
  return await apiService.post('/solicitacoes', data, token);
};

export const despacharSolicitacao = async (id, token) => {
  return await apiService.put(`/solicitacoes/${id}/despachar`, {}, token);
};

export const receberSolicitacao = async (id, token) => {
  return await apiService.put(`/solicitacoes/${id}/receber`, {}, token);
};

export const rejeitarSolicitacao = async (id, token) => {
  return await apiService.put(`/solicitacoes/${id}/rejeitar`, {}, token);
};
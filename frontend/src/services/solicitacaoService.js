import { apiService } from './apiService';

export const getSolicitacoes = async () => {
  return await apiService.get('/solicitacoes');
};

export const createSolicitacao = async (data) => {
  return await apiService.post('/solicitacoes', data);
};

export const despacharSolicitacao = async (id) => {
  return await apiService.put(`/solicitacoes/${id}/despachar`);
};

export const receberSolicitacao = async (id) => {
  return await apiService.put(`/solicitacoes/${id}/receber`);
};

export const rejeitarSolicitacao = async (id) => {
  return await apiService.put(`/solicitacoes/${id}/rejeitar`);
};
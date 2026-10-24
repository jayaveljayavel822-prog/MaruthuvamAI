import api from './client';

export const getConversationsApi = async () => {
  const resp = await api.get('/chat/conversations');
  return resp.data;
};

export const createConversationApi = async (title = 'New Consultation') => {
  const resp = await api.post('/chat/conversations', { title });
  return resp.data;
};

export const getConversationApi = async (id) => {
  const resp = await api.get(`/chat/conversations/${id}`);
  return resp.data;
};

export const deleteConversationApi = async (id) => {
  await api.delete(`/chat/conversations/${id}`);
};

export const sendMessageApi = async (conversationId, content, language = 'English') => {
  const resp = await api.post(`/chat/conversations/${conversationId}/messages`, { content, language });
  return resp.data;
};

export const performQuickTaskApi = async (taskType, contextText = '', language = 'English') => {
  const resp = await api.post('/chat/quick-task', {
    task_type: taskType,
    context_text: contextText,
    language,
  });
  return resp.data;
};

/**
 * AI Assistant service.
 */
import { api } from './api.js';
import type { Conversation, Message } from './types.js';

export async function getConversations(): Promise<Conversation[]> {
  return api.get<Conversation[]>('/api/ai/conversations');
}

export async function sendMessage(convId: string, text: string): Promise<Message> {
  return api.post<Message>('/api/ai/chat', { conversationId: convId, text });
}

export async function createConversation(): Promise<Conversation> {
  return api.post<Conversation>('/api/ai/conversations');
}

export async function deleteConversation(id: string): Promise<void> {
  return api.delete<void>(`/api/ai/conversations/${id}`);
}

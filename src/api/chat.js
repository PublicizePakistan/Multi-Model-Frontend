// PLACE THIS FILE AT:
// D:\MultiModel\frontend\src\api\chat.js
// (REPLACE the existing file completely)

import apiClient from './client'

export async function listAvailableModels() {
  const response = await apiClient.get('/chat/models')
  return response.data
}

export async function createConversation(title, modelSlug) {
  const response = await apiClient.post('/chat/conversations', {
    title: title || null,
    model_slug: modelSlug || null,
  })
  return response.data
}

export async function listConversations() {
  const response = await apiClient.get('/chat/conversations')
  return response.data
}

export async function getConversation(conversationId) {
  const response = await apiClient.get(`/chat/conversations/${conversationId}`)
  return response.data
}

export async function deleteConversation(conversationId) {
  await apiClient.delete(`/chat/conversations/${conversationId}`)
}

export async function sendMessage(conversationId, content, options = {}) {
  const response = await apiClient.post(
    `/chat/conversations/${conversationId}/messages`,
    {
      content,
      model_slug: options.modelSlug || null,
      web_search: options.webSearch || false,
      file_id: options.fileId || null,
    }
  )
  return response.data
}

/**
 * Builds a short title from the first message of a conversation.
 */
export function titleFromMessage(text) {
  const trimmed = text.trim().replace(/\s+/g, ' ')
  return trimmed.length > 40 ? trimmed.slice(0, 40) + '…' : trimmed
}

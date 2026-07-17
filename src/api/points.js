import apiClient from './client'

export async function getBalance() {
  const response = await apiClient.get('/points/balance')
  return response.data
}
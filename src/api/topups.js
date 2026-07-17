import apiClient from './client'

export async function listPackages() {
  const response = await apiClient.get('/topups/packages')
  return response.data
}

export async function purchaseTopup(packageSlug) {
  const response = await apiClient.post('/topups/purchase', {
    package_slug: packageSlug,
  })
  return response.data
}

export async function getTopupHistory() {
  const response = await apiClient.get('/topups/history')
  return response.data
}
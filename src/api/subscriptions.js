// PLACE THIS FILE AT:
// D:\MultiModel\frontend\src\api\subscriptions.js

import apiClient from './client'

export async function listPlans() {
  const response = await apiClient.get('/subscriptions/plans')
  return response.data
}

export async function getMySubscription() {
  const response = await apiClient.get('/subscriptions/me')
  return response.data
}

export async function subscribeToPlan(planSlug, billingCycle = 'monthly') {
  const response = await apiClient.post('/subscriptions/subscribe', {
    plan_slug: planSlug,
    billing_cycle: billingCycle,
  })
  return response.data
}

export async function cancelSubscription() {
  const response = await apiClient.post('/subscriptions/cancel')
  return response.data
}

export async function pauseSubscription() {
  const response = await apiClient.post('/subscriptions/pause')
  return response.data
}

export async function resumeSubscription() {
  const response = await apiClient.post('/subscriptions/resume')
  return response.data
}

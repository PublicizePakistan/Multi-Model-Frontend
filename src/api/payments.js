// PLACE THIS FILE AT:
// D:\MultiModel\frontend\src\api\payments.js
// (REPLACE the existing file completely)

import apiClient from './client'

export async function initiatePayment({ amountPkr, description, transactionType, planSlug, topupPackageId }) {
  const response = await apiClient.post('/payments/initiate', {
    amount_pkr: amountPkr,
    description,
    transaction_type: transactionType,
    plan_slug: planSlug || null,
    topup_package_id: topupPackageId || null,
  })
  return response.data
}

export async function verifyPayment(orderId, hash) {
  const response = await apiClient.get('/payments/verify', {
    params: { order_id: orderId, hash },
  })
  return response.data
}

export async function getTransactions() {
  const response = await apiClient.get('/payments/transactions')
  return response.data
}

export async function getInvoices() {
  const response = await apiClient.get('/payments/invoices')
  return response.data
}

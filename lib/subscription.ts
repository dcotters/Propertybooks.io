import { supabase } from './supabase'

export async function checkSubscriptionStatus(userId: string) {
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('userId', userId)
      .single()

    if (error || !subscription) {
      return { hasActiveSubscription: false, plan: 'FREE' }
    }

    // Check if subscription is active
    const isActive = subscription.status === 'ACTIVE' || subscription.status === 'TRIAL'
    
    // Check if subscription hasn't expired
    const isNotExpired = !subscription.currentPeriodEnd || 
      new Date() < new Date(subscription.currentPeriodEnd)

    return {
      hasActiveSubscription: isActive && isNotExpired,
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd
    }
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return { hasActiveSubscription: false, plan: 'FREE' }
  }
}

export function getPlanLimits(plan: string) {
  switch (plan) {
    case 'FREE':
      return {
        maxProperties: 1,
        maxTransactions: 10,
        maxDocuments: 5,
        features: ['Basic Property Management', 'Transaction Tracking']
      }
    case 'BASIC':
      return {
        maxProperties: 5,
        maxTransactions: 100,
        maxDocuments: 50,
        features: ['Property Management', 'Transaction Tracking', 'Basic Reports', 'Email Support']
      }
    case 'PREMIUM':
      return {
        maxProperties: 25,
        maxTransactions: 1000,
        maxDocuments: 500,
        features: ['Advanced Reports', 'AI Analysis', 'Tax Optimization', 'Priority Support']
      }
    case 'ENTERPRISE':
      return {
        maxProperties: -1, // Unlimited
        maxTransactions: -1, // Unlimited
        maxDocuments: -1, // Unlimited
        features: ['All Features', 'Custom Integrations', 'Dedicated Support', 'API Access']
      }
    default:
      return {
        maxProperties: 1,
        maxTransactions: 10,
        maxDocuments: 5,
        features: ['Basic Property Management', 'Transaction Tracking']
      }
  }
}

export async function checkUsageLimits(userId: string, plan: string) {
  const limits = getPlanLimits(plan)
  
  if (limits.maxProperties === -1) {
    return { canAddProperty: true, canAddTransaction: true, canAddDocument: true }
  }

  const [propertyCount, transactionCount, documentCount] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('userId', userId),
    supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('userId', userId),
    supabase.from('documents').select('*', { count: 'exact', head: true }).eq('userId', userId)
  ])

  return {
    canAddProperty: (propertyCount.count || 0) < limits.maxProperties,
    canAddTransaction: (transactionCount.count || 0) < limits.maxTransactions,
    canAddDocument: (documentCount.count || 0) < limits.maxDocuments,
    limits: {
      properties: { current: propertyCount.count || 0, max: limits.maxProperties },
      transactions: { current: transactionCount.count || 0, max: limits.maxTransactions },
      documents: { current: documentCount.count || 0, max: limits.maxDocuments }
    }
  }
} 
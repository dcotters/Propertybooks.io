import { prisma } from './prisma'

export async function checkSubscriptionStatus(userId: string) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    })

    if (!subscription) {
      return { hasActiveSubscription: false, plan: 'FREE' }
    }

    // Check if subscription is active
    const isActive = subscription.status === 'ACTIVE' || subscription.status === 'TRIAL'
    
    // Check if subscription hasn't expired
    const isNotExpired = !subscription.currentPeriodEnd || 
      new Date() < subscription.currentPeriodEnd

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
    prisma.property.count({ where: { userId } }),
    prisma.transaction.count({ where: { userId } }),
    prisma.document.count({ where: { userId } })
  ])

  return {
    canAddProperty: propertyCount < limits.maxProperties,
    canAddTransaction: transactionCount < limits.maxTransactions,
    canAddDocument: documentCount < limits.maxDocuments,
    limits: {
      properties: { current: propertyCount, max: limits.maxProperties },
      transactions: { current: transactionCount, max: limits.maxTransactions },
      documents: { current: documentCount, max: limits.maxDocuments }
    }
  }
} 
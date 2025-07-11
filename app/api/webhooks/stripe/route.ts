import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '../../../../lib/stripe'
import { prisma } from '../../../../lib/prisma'
import { sendSubscriptionConfirmation } from '../../../../lib/email'
import { SubscriptionStatus, SubscriptionPlan } from '@prisma/client'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object
        await handleSubscriptionUpdate(subscription)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object
        await handleSubscriptionDeletion(deletedSubscription)
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object
        await handlePaymentSucceeded(invoice)
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object
        await handlePaymentFailed(failedInvoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionUpdate(subscription: any) {
  const customerId = subscription.customer as string
  const subscriptionId = subscription.id
  const status = subscription.status
  const plan = getPlanFromPriceId(subscription.items.data[0].price.id)

  await prisma.subscription.upsert({
    where: { stripeCustomerId: customerId },
    update: {
      stripeSubscriptionId: subscriptionId,
      status: mapStripeStatus(status),
      plan,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    create: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      status: mapStripeStatus(status),
      plan,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      userId: '', // This should be set when creating the subscription
    },
  })
}

async function handleSubscriptionDeletion(subscription: any) {
  const customerId = subscription.customer as string

  await prisma.subscription.update({
    where: { stripeCustomerId: customerId },
    data: {
      status: SubscriptionStatus.CANCELED,
      cancelAtPeriodEnd: true,
    },
  })
}

async function handlePaymentSucceeded(invoice: any) {
  const customerId = invoice.customer as string
  const user = await prisma.user.findFirst({
    where: {
      subscriptions: {
        some: {
          stripeCustomerId: customerId,
        },
      },
    },
  })

  if (user) {
    await sendSubscriptionConfirmation(user.email, 'Premium')
  }
}

async function handlePaymentFailed(invoice: any) {
  const customerId = invoice.customer as string

  await prisma.subscription.update({
    where: { stripeCustomerId: customerId },
    data: {
      status: SubscriptionStatus.PAST_DUE,
    },
  })
}

function mapStripeStatus(stripeStatus: string): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    active: SubscriptionStatus.ACTIVE,
    canceled: SubscriptionStatus.CANCELED,
    past_due: SubscriptionStatus.PAST_DUE,
    unpaid: SubscriptionStatus.UNPAID,
    trialing: SubscriptionStatus.TRIAL,
  }
  return statusMap[stripeStatus] || SubscriptionStatus.UNPAID
}

function getPlanFromPriceId(priceId: string): SubscriptionPlan {
  // Map your Stripe price IDs to plan enums
  const planMap: Record<string, SubscriptionPlan> = {
    'price_basic': SubscriptionPlan.BASIC,
    'price_premium': SubscriptionPlan.PREMIUM,
    'price_enterprise': SubscriptionPlan.ENTERPRISE,
  }
  return planMap[priceId] || SubscriptionPlan.FREE
} 
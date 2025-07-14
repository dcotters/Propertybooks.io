import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '../../../../lib/stripe'
import { supabase } from '../../../../lib/supabase'
import { sendSubscriptionConfirmation } from '../../../../lib/email'

// Define subscription status and plan types
type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'UNPAID' | 'TRIAL'
type SubscriptionPlan = 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE'

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

  // Check if subscription exists
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripeCustomerId', customerId)
    .single()

  if (existingSubscription) {
    // Update existing subscription
    const { error } = await supabase
      .from('subscriptions')
      .update({
        stripeSubscriptionId: subscriptionId,
        status: mapStripeStatus(status),
        plan,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      })
      .eq('stripeCustomerId', customerId)

    if (error) {
      console.error('Error updating subscription:', error)
    }
  } else {
    // Create new subscription
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        status: mapStripeStatus(status),
        plan,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        userId: '', // This should be set when creating the subscription
      })

    if (error) {
      console.error('Error creating subscription:', error)
    }
  }
}

async function handleSubscriptionDeletion(subscription: any) {
  const customerId = subscription.customer as string

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'CANCELED',
      cancelAtPeriodEnd: true,
    })
    .eq('stripeCustomerId', customerId)

  if (error) {
    console.error('Error updating subscription deletion:', error)
  }
}

async function handlePaymentSucceeded(invoice: any) {
  const customerId = invoice.customer as string
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', (
      await supabase
        .from('subscriptions')
        .select('userId')
        .eq('stripeCustomerId', customerId)
        .single()
    ).data?.userId)
    .single()

  if (error) {
    console.error('Error finding user for payment success:', error)
    return
  }

  if (user) {
    await sendSubscriptionConfirmation(user.email, 'Premium')
  }
}

async function handlePaymentFailed(invoice: any) {
  const customerId = invoice.customer as string

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'PAST_DUE',
    })
    .eq('stripeCustomerId', customerId)

  if (error) {
    console.error('Error updating subscription payment failure:', error)
  }
}

function mapStripeStatus(stripeStatus: string): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    active: 'ACTIVE',
    canceled: 'CANCELED',
    past_due: 'PAST_DUE',
    unpaid: 'UNPAID',
    trialing: 'TRIAL',
  }
  return statusMap[stripeStatus] || 'UNPAID'
}

function getPlanFromPriceId(priceId: string): SubscriptionPlan {
  // Map your Stripe price IDs to plan enums
  const planMap: Record<string, SubscriptionPlan> = {
    'price_basic': 'BASIC',
    'price_premium': 'PREMIUM',
    'price_enterprise': 'ENTERPRISE',
  }
  return planMap[priceId] || 'FREE'
} 
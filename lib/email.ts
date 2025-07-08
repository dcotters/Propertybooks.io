import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export interface EmailData {
  to: string
  subject: string
  text?: string
  html?: string
}

export const sendEmail = async (emailData: EmailData) => {
  try {
    const msg = {
      to: emailData.to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
    }

    await sgMail.send(msg)
    return { success: true }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}

export const sendWelcomeEmail = async (email: string, name: string) => {
  return sendEmail({
    to: email,
    subject: 'Welcome to PropertyBooks.io!',
    html: `
      <h1>Welcome to PropertyBooks.io, ${name}!</h1>
      <p>Thank you for joining us. We're excited to help you manage your property accounting more efficiently.</p>
      <p>Get started by adding your first property and tracking your income and expenses.</p>
    `
  })
}

export const sendSubscriptionConfirmation = async (email: string, plan: string) => {
  return sendEmail({
    to: email,
    subject: 'Subscription Confirmed - PropertyBooks.io',
    html: `
      <h1>Subscription Confirmed!</h1>
      <p>Your ${plan} subscription has been successfully activated.</p>
      <p>You now have access to all premium features.</p>
    `
  })
} 
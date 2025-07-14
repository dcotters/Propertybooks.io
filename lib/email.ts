import sgMail from '@sendgrid/mail'

// Only set API key if it exists
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export interface EmailData {
  to: string
  subject: string
  text?: string
  html?: string
}

export const sendEmail = async (emailData: EmailData) => {
  try {
    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
      console.log('SendGrid not configured, skipping email:', emailData.subject, 'to:', emailData.to)
      return { success: true, skipped: true }
    }

    const msg = {
      to: emailData.to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: emailData.subject,
      text: emailData.text || '',
      html: emailData.html || '',
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
    subject: 'Welcome to PropertyBooks.io - Your Property Accounting Journey Starts Here!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to PropertyBooks.io</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to PropertyBooks.io!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Property Accounting Journey Starts Here</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #2d3748; margin-top: 0;">Hi ${name},</h2>
          <p>Thank you for joining PropertyBooks.io! We're excited to help you streamline your property accounting and maximize your rental income.</p>
          
          <h3 style="color: #4a5568;">What you can do now:</h3>
          <ul style="color: #4a5568;">
            <li>📊 <strong>Track Income & Expenses</strong> - Monitor your rental income and property expenses</li>
            <li>🏠 <strong>Manage Properties</strong> - Add and organize your rental properties</li>
            <li>📈 <strong>Generate Reports</strong> - Get detailed financial insights and performance metrics</li>
            <li>🤖 <strong>AI-Powered Analysis</strong> - Receive personalized recommendations for optimizing your returns</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Get Started Now</a>
        </div>
        
        <div style="background: #e2e8f0; padding: 20px; border-radius: 8px; margin-top: 25px;">
          <h4 style="margin-top: 0; color: #2d3748;">Need Help?</h4>
          <p style="margin-bottom: 0; color: #4a5568;">Our support team is here to help you get the most out of PropertyBooks.io. Don't hesitate to reach out!</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px;">
          <p>© 2024 PropertyBooks.io. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </body>
      </html>
    `
  })
}

export const sendSubscriptionConfirmation = async (email: string, plan: string) => {
  return sendEmail({
    to: email,
    subject: `Your ${plan} Subscription is Now Active - PropertyBooks.io`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Confirmed</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Subscription Confirmed!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your ${plan} plan is now active</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #2d3748; margin-top: 0;">Welcome to ${plan}!</h2>
          <p>Your subscription has been successfully activated. You now have access to all premium features including:</p>
          
          <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #4a5568; margin-top: 0;">✨ Premium Features Unlocked:</h3>
            <ul style="color: #4a5568; margin-bottom: 0;">
              <li>🤖 <strong>Advanced AI Analysis</strong> - Get personalized insights and recommendations</li>
              <li>📊 <strong>Detailed Financial Reports</strong> - Comprehensive property performance analytics</li>
              <li>📱 <strong>Mobile App Access</strong> - Manage your properties on the go</li>
              <li>📧 <strong>Priority Support</strong> - Get help when you need it most</li>
              <li>🔄 <strong>Unlimited Properties</strong> - Scale your portfolio without limits</li>
            </ul>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard" style="background: #48bb78; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Access Your Dashboard</a>
        </div>
        
        <div style="background: #e2e8f0; padding: 20px; border-radius: 8px; margin-top: 25px;">
          <h4 style="margin-top: 0; color: #2d3748;">Billing Information</h4>
          <p style="margin-bottom: 0; color: #4a5568;">Your subscription will automatically renew. You can manage your billing settings anytime from your dashboard.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px;">
          <p>© 2024 PropertyBooks.io. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </body>
      </html>
    `
  })
}

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
  
  return sendEmail({
    to: email,
    subject: 'Reset Your Password - PropertyBooks.io',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset Request</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">PropertyBooks.io</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #2d3748; margin-top: 0;">Reset Your Password</h2>
          <p>We received a request to reset your password for your PropertyBooks.io account.</p>
          
          <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
            <a href="${resetUrl}" style="background: #ed8936; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          
          <p style="color: #718096; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #4a5568; font-size: 14px; word-break: break-all;">${resetUrl}</p>
        </div>
        
        <div style="background: #e2e8f0; padding: 20px; border-radius: 8px; margin-top: 25px;">
          <h4 style="margin-top: 0; color: #2d3748;">Security Notice</h4>
          <p style="margin-bottom: 0; color: #4a5568;">This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px;">
          <p>© 2024 PropertyBooks.io. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </body>
      </html>
    `
  })
} 
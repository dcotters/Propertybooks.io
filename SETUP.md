# PropertyBooks.io Setup Guide

This guide will help you set up all the required services for the PropertyBooks.io landlord accounting software.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Stripe account
- SendGrid account
- AWS account with S3 access

## 1. Install Dependencies

```bash
npm install
```

## 2. Database Setup

### PostgreSQL Setup
1. Install PostgreSQL on your system
2. Create a new database:
```sql
CREATE DATABASE propertybooks;
```

### Prisma Setup
1. Generate Prisma client:
```bash
npx prisma generate
```

2. Run database migrations:
```bash
npx prisma db push
```

## 3. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/propertybooks"

# Authentication (NextAuth.js)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="whsec_your-stripe-webhook-secret"
STRIPE_BASIC_PRICE_ID="price_your-basic-price-id"
STRIPE_PREMIUM_PRICE_ID="price_your-premium-price-id"
STRIPE_ENTERPRISE_PRICE_ID="price_your-enterprise-price-id"

# SendGrid
SENDGRID_API_KEY="SG.your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@propertybooks.io"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="propertybooks-documents"

# App Configuration
NODE_ENV="development"
```

## 4. Service Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to your `.env.local`

### Stripe Setup
1. Create a [Stripe account](https://stripe.com/)
2. Get your API keys from the Dashboard
3. Create subscription products and prices:
   - Basic Plan ($9/month)
   - Premium Plan ($19/month)
   - Enterprise Plan ($49/month)
4. Copy the price IDs to your `.env.local`
5. Set up webhook endpoint:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`

### SendGrid Setup
1. Create a [SendGrid account](https://sendgrid.com/)
2. Create an API key with Mail Send permissions
3. Verify your sender email address
4. Copy the API key to your `.env.local`

### AWS S3 Setup
1. Create an [AWS account](https://aws.amazon.com/)
2. Create an S3 bucket for document storage
3. Create an IAM user with S3 access:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```
4. Copy the access key and secret to your `.env.local`

## 5. Running the Application

### Development Mode
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## 6. Testing the Setup

1. **Authentication**: Visit `/auth/signup` to create an account
2. **Database**: Check that user data is saved in PostgreSQL
3. **Email**: Verify welcome emails are sent via SendGrid
4. **File Upload**: Test document upload to S3
5. **Payments**: Test subscription flow with Stripe test cards

## 7. Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production
Update your production environment variables:
- `NEXTAUTH_URL`: Your production domain
- `DATABASE_URL`: Production PostgreSQL connection string
- `STRIPE_WEBHOOK_SECRET`: Production webhook secret
- `AWS_S3_BUCKET`: Production S3 bucket name

## 8. Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Database**: Use strong passwords and enable SSL
3. **API Keys**: Rotate keys regularly and use least privilege access
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Configure CORS properly for your domain

## 9. Monitoring and Logging

1. Set up error tracking (e.g., Sentry)
2. Configure logging for all services
3. Monitor database performance
4. Set up alerts for failed payments and email delivery

## 10. Backup Strategy

1. **Database**: Set up automated PostgreSQL backups
2. **Files**: Enable S3 versioning and cross-region replication
3. **Code**: Use Git for version control
4. **Environment**: Document all configuration

## Troubleshooting

### Common Issues

1. **Database Connection**: Check PostgreSQL is running and credentials are correct
2. **OAuth Errors**: Verify redirect URIs match exactly
3. **Stripe Webhooks**: Ensure webhook endpoint is accessible and signature verification works
4. **S3 Uploads**: Check IAM permissions and bucket configuration
5. **Email Delivery**: Verify SendGrid API key and sender verification

### Getting Help

- Check the logs in your terminal for detailed error messages
- Verify all environment variables are set correctly
- Test each service individually before running the full application
- Consult the documentation for each service provider

## Next Steps

After setup, consider implementing:
- User onboarding flow
- Advanced analytics and reporting
- Multi-tenant architecture
- API rate limiting
- Automated testing
- CI/CD pipeline 
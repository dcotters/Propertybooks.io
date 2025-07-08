# PropertyBooks.io - Landlord Accounting Software

A comprehensive accounting and property management solution designed specifically for landlords. Track properties, manage rent collection, categorize expenses, and generate tax reports with ease.

## 🚀 Features

### ✅ Authentication & User Management
- **NextAuth.js** integration with multiple providers
- Google OAuth and email/password authentication
- Secure session management
- User registration and profile management

### 🗄️ Database Integration
- **PostgreSQL** database with Prisma ORM
- Comprehensive data models for properties, transactions, and users
- Automatic database migrations
- Type-safe database queries

### 💳 Payment Processing
- **Stripe** integration for subscription management
- Multiple pricing tiers (Basic, Premium, Enterprise)
- Secure checkout process
- Webhook handling for subscription events
- Automatic billing and payment processing

### 📧 Email Service
- **SendGrid** integration for transactional emails
- Welcome emails for new users
- Subscription confirmation emails
- Automated notifications

### 📁 File Storage
- **AWS S3** integration for document storage
- Secure file upload and download
- Receipt and document management
- Automatic file organization by user and property

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Email**: SendGrid
- **Storage**: AWS S3
- **Deployment**: Vercel (recommended)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd landlord-accounting-software
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Edit `.env.local` with your service credentials (see SETUP.md for detailed instructions)

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Required Services

1. **PostgreSQL Database**
   - Set up a PostgreSQL database
   - Update `DATABASE_URL` in your environment variables

2. **Google OAuth**
   - Create a Google Cloud project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add redirect URI: `http://localhost:3000/api/auth/callback/google`

3. **Stripe Account**
   - Create a Stripe account
   - Get API keys from the dashboard
   - Create subscription products and prices
   - Set up webhook endpoints

4. **SendGrid Account**
   - Create a SendGrid account
   - Generate an API key
   - Verify your sender email

5. **AWS S3**
   - Create an AWS account
   - Create an S3 bucket
   - Create IAM user with S3 permissions
   - Get access keys

### Environment Variables

See `SETUP.md` for a complete list of required environment variables and detailed setup instructions for each service.

## 🏗️ Project Structure

```
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── webhooks/      # Webhook handlers
│   │   └── upload/        # File upload endpoints
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── pricing/           # Pricing page
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── subscription/      # Subscription components
│   └── providers/         # Context providers
├── lib/                   # Utility libraries
│   ├── prisma.ts          # Database client
│   ├── stripe.ts          # Stripe configuration
│   ├── email.ts           # Email service
│   └── s3.ts              # S3 file storage
├── prisma/                # Database schema
│   └── schema.prisma      # Prisma schema
├── types/                 # TypeScript type definitions
└── middleware.ts          # Next.js middleware
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📊 Database Schema

The application includes comprehensive data models for:

- **Users**: Authentication and profile information
- **Properties**: Property details and management
- **Transactions**: Income and expense tracking
- **Subscriptions**: Payment and plan management
- **Documents**: File storage and organization

## 🔒 Security Features

- Secure authentication with NextAuth.js
- Password hashing with bcrypt
- JWT token management
- CORS protection
- Input validation with Zod
- Secure file uploads
- Environment variable protection

## 📈 Monitoring & Analytics

- Error tracking and logging
- Database performance monitoring
- Payment failure alerts
- Email delivery tracking
- File upload monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For setup help and troubleshooting, see `SETUP.md` for detailed instructions.

## 🔮 Roadmap

- [ ] Multi-tenant architecture
- [ ] Advanced reporting and analytics
- [ ] Mobile app
- [ ] API for third-party integrations
- [ ] Automated expense categorization
- [ ] Tax form generation
- [ ] Tenant portal
- [ ] Maintenance request tracking

---

Built with ❤️ for landlords who want to simplify their property management. 
# PropertyBooks.io - Simple Accounting for Landlords

Stop playing property management detective. PropertyBooks.io automatically categorizes your expenses, tracks rent payments, and generates clean tax reports designed specifically for landlords.

## 🏠 What is PropertyBooks?

PropertyBooks.io is a modern web application built specifically for landlords who are tired of managing spreadsheets, tracking expenses in multiple apps, and dealing with complex accounting software that doesn't understand their business.

### Key Features

- **Property Management**: Track multiple properties and units with occupancy rates
- **Rent Collection**: Monitor rent payments and late fees automatically
- **Expense Tracking**: Categorize expenses by property and unit
- **Financial Reports**: Generate clean tax reports and income statements
- **Rent Calculator**: Free tool to analyze rent collection efficiency
- **Modern UI**: Beautiful, intuitive interface designed for landlords

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd propertybooks-io
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
propertybooks-io/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and Tailwind CSS
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Landing page
│   ├── calculator/        # Rent collection calculator (lead magnet)
│   │   └── page.tsx
│   └── dashboard/         # Main application dashboard
│       └── page.tsx
├── components/            # Reusable React components
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## 🎯 Features Overview

### Landing Page (`/`)
- Hero section with compelling value proposition
- Pain points identification
- Feature highlights
- Pricing plans (Starter $29/month, Standard $59/month)
- Email capture for lead generation

### Rent Collection Calculator (`/calculator`)
- **Free Lead Magnet**: Helps landlords calculate rent collection efficiency
- Input fields for:
  - Total units and average rent
  - Late payment rates and fees
  - Vacancy and eviction rates
  - Property management fees
- Real-time calculations and recommendations
- Email capture for detailed PDF report

### Dashboard (`/dashboard`)
- **Overview Tab**: Key metrics and recent activity
- **Properties Tab**: Manage all properties and units
- **Transactions Tab**: Track income, expenses, and late fees
- **Reports Tab**: Generate financial reports

## 💰 Pricing Plans

### Starter Plan - $29/month
- Up to 5 properties
- Property & unit tracking
- Rent collection & reminders
- Expense categorization
- Basic tax reports
- Email support

### Standard Plan - $59/month
- Up to 20 properties
- Everything in Starter
- Advanced reporting & analytics
- Tenant portal
- Maintenance tracking
- Priority support

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Animations**: Framer Motion
- **Charts**: Recharts (for future enhancements)
- **Date Handling**: date-fns

## 🎨 Design System

The application uses a custom design system with:

- **Primary Colors**: Blue gradient (#0ea5e9 to #3b82f6)
- **Success Colors**: Green (#22c55e)
- **Warning Colors**: Yellow (#f59e0b)
- **Error Colors**: Red (#ef4444)
- **Typography**: Inter font family
- **Components**: Custom card, button, and input styles

## 📊 Business Model

### Market Opportunity
- Global property management software market: $27.95B (2025) → $54.16B (2032)
- 9.9% CAGR growth rate
- Underserved mid-market segments (5-50 unit landlords)

### Revenue Streams
1. **SaaS Subscriptions**: Monthly recurring revenue
2. **Lead Generation**: Free calculator tool
3. **Premium Features**: Advanced reporting and analytics

### Target Market
- Small to medium landlords (5-50 units)
- Property managers
- Real estate investors
- Self-managing landlords

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Railway

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Environment Variables

Create a `.env.local` file for environment variables:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Add other environment variables as needed
```

## 📈 Future Enhancements

### Phase 2 Features
- [ ] User authentication and accounts
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Payment processing integration
- [ ] Tenant portal
- [ ] Maintenance request tracking
- [ ] Document storage
- [ ] Email notifications
- [ ] Mobile app

### Phase 3 Features
- [ ] Advanced analytics and reporting
- [ ] Integration with property management APIs
- [ ] Multi-currency support
- [ ] Advanced tax reporting
- [ ] API for third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@propertybooks.com or join our Slack channel.

## 📞 Contact

- **Website**: [propertybooks.io](https://propertybooks.io)
- **Email**: hello@propertybooks.io
- **Twitter**: [@propertybooksio](https://twitter.com/propertybooksio)

---

Built with ❤️ for landlords who want to get their weekends back. 
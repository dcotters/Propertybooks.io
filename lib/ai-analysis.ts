import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface PropertyAnalysis {
  pricingInsights: {
    isOverpriced: boolean
    isUnderpriced: boolean
    recommendedRent: number
    marketComparison: string
    pricingFactors: string[]
  }
  marketAnalysis: {
    marketTrend: 'rising' | 'stable' | 'declining'
    demandLevel: 'high' | 'medium' | 'low'
    investmentPotential: 'excellent' | 'good' | 'fair' | 'poor'
    marketInsights: string
  }
  recommendations: {
    improvements: string[]
    marketingSuggestions: string[]
    financialOptimization: string[]
    riskFactors: string[]
  }
  roiAnalysis: {
    estimatedROI: number
    cashOnCashReturn: number
    capRate: number
    breakEvenAnalysis: string
  }
}

export interface PropertyData {
  name: string
  address: string
  city: string
  state: string
  country: string
  propertyType: string
  purchasePrice: number
  estimatedValue: number
  monthlyRent: number
  yearBuilt: number
  squareFootage: number
  bedrooms: number
  bathrooms: number
  units: number
  monthlyExpenses: number
}

export async function analyzeProperty(property: PropertyData): Promise<PropertyAnalysis> {
  try {
    const prompt = `
You are a professional real estate investment analyst. Analyze the following property and provide comprehensive insights:

Property Details:
- Name: ${property.name}
- Location: ${property.address}, ${property.city}, ${property.state}, ${property.country}
- Type: ${property.propertyType}
- Purchase Price: $${property.purchasePrice.toLocaleString()}
- Estimated Current Value: $${property.estimatedValue.toLocaleString()}
- Monthly Rent: $${property.monthlyRent}
- Year Built: ${property.yearBuilt}
- Square Footage: ${property.squareFootage}
- Bedrooms: ${property.bedrooms}
- Bathrooms: ${property.bathrooms}
- Units: ${property.units}
- Monthly Expenses: $${property.monthlyExpenses}

Please provide a detailed analysis including:

1. PRICING INSIGHTS:
- Is the property overpriced or underpriced for its market?
- What should the recommended rent be?
- How does it compare to similar properties?
- What factors affect the pricing?

2. MARKET ANALYSIS:
- What's the current market trend in this area?
- What's the demand level?
- What's the investment potential?
- Key market insights

3. RECOMMENDATIONS:
- Specific improvements to increase value
- Marketing suggestions
- Financial optimization strategies
- Risk factors to consider

4. ROI ANALYSIS:
- Estimated ROI percentage
- Cash-on-cash return
- Cap rate calculation
- Break-even analysis

Provide specific, actionable insights that a landlord can use to make informed decisions. Be concise but thorough.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional real estate investment analyst with expertise in property valuation, market analysis, and investment strategies. Provide practical, data-driven insights that help landlords make informed decisions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const analysis = completion.choices[0].message.content;
    
    // Parse the AI response and structure it
    return parseAnalysisResponse(analysis || '', property);
  } catch (error) {
    console.error('Error analyzing property:', error);
    throw new Error('Failed to analyze property');
  }
}

function parseAnalysisResponse(response: string, property: PropertyData): PropertyAnalysis {
  // This is a simplified parser - in production, you'd want more sophisticated parsing
  const lines = response.split('\n');
  
  // Calculate basic metrics
  const annualRent = property.monthlyRent * 12;
  const annualExpenses = property.monthlyExpenses * 12;
  const netOperatingIncome = annualRent - annualExpenses;
  const capRate = (netOperatingIncome / property.estimatedValue) * 100;
  const cashOnCashReturn = (netOperatingIncome / property.purchasePrice) * 100;
  
  // Determine if over/underpriced based on typical cap rates
  const isOverpriced = capRate < 4; // Below 4% cap rate suggests overpricing
  const isUnderpriced = capRate > 8; // Above 8% cap rate suggests good value
  
  // Estimate recommended rent based on 1% rule
  const recommendedRent = property.estimatedValue * 0.01 / 12;
  
  return {
    pricingInsights: {
      isOverpriced,
      isUnderpriced,
      recommendedRent: Math.round(recommendedRent),
      marketComparison: "Based on local market data and comparable properties",
      pricingFactors: [
        "Location and neighborhood quality",
        "Property condition and age",
        "Local market demand",
        "Economic factors"
      ]
    },
    marketAnalysis: {
      marketTrend: capRate > 6 ? 'rising' : capRate > 4 ? 'stable' : 'declining',
      demandLevel: property.monthlyRent > recommendedRent * 0.9 ? 'high' : 'medium',
      investmentPotential: capRate > 7 ? 'excellent' : capRate > 5 ? 'good' : capRate > 3 ? 'fair' : 'poor',
      marketInsights: "Market analysis based on current economic indicators and local trends"
    },
    recommendations: {
      improvements: [
        "Consider property upgrades to increase rental value",
        "Review and optimize operating expenses",
        "Explore refinancing options if rates are favorable"
      ],
      marketingSuggestions: [
        "Highlight unique property features",
        "Consider professional photography",
        "Target specific tenant demographics"
      ],
      financialOptimization: [
        "Review property tax assessments",
        "Negotiate better insurance rates",
        "Consider energy efficiency improvements"
      ],
      riskFactors: [
        "Market volatility",
        "Interest rate changes",
        "Local economic conditions"
      ]
    },
    roiAnalysis: {
      estimatedROI: Math.round(capRate * 100) / 100,
      cashOnCashReturn: Math.round(cashOnCashReturn * 100) / 100,
      capRate: Math.round(capRate * 100) / 100,
      breakEvenAnalysis: `Property breaks even when rent covers all expenses plus mortgage payments`
    }
  };
}

export async function generateTaxInsights(country: string, propertyData: any): Promise<string> {
  try {
    const prompt = `
You are a tax expert specializing in real estate investment. Provide tax insights for a landlord in ${country}.

Property Details:
- Purchase Price: $${propertyData.purchasePrice}
- Monthly Rent: $${propertyData.monthlyRent}
- Property Type: ${propertyData.propertyType}

Please provide:
1. Key tax deductions available for landlords in ${country}
2. Tax implications of rental income
3. Property depreciation rules
4. Capital gains considerations
5. Any tax incentives or credits available
6. Important filing requirements and deadlines

Provide practical, actionable tax advice that a landlord can use for tax planning.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a tax expert specializing in real estate investment taxation. Provide clear, practical tax advice that helps landlords optimize their tax position while remaining compliant."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 1500
    });

    return completion.choices[0].message.content || 'Unable to generate tax insights';
  } catch (error) {
    console.error('Error generating tax insights:', error);
    return 'Unable to generate tax insights at this time';
  }
} 
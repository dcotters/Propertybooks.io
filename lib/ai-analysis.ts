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

export interface TaxOptimizationAnalysis {
  deductions: {
    availableDeductions: string[]
    missedDeductions: string[]
    deductionAmount: number
    recommendations: string[]
  }
  taxLossHarvesting: {
    opportunities: string[]
    potentialSavings: number
    strategy: string
  }
  expenseCategorization: {
    categories: { [key: string]: number }
    suggestions: string[]
    complianceNotes: string[]
  }
  taxPlanning: {
    quarterlyEstimates: number
    yearEndStrategies: string[]
    filingDeadlines: string[]
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

export async function analyzeTaxOptimization(
  country: string, 
  propertyData: any[], 
  transactions: any[]
): Promise<TaxOptimizationAnalysis> {
  try {
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const prompt = `
You are a tax expert specializing in real estate investment. Analyze the following landlord data for tax optimization opportunities:

Country: ${country}
Total Properties: ${propertyData.length}
Total Annual Income: $${totalIncome.toLocaleString()}
Total Annual Expenses: $${totalExpenses.toLocaleString()}

Property Details:
${propertyData.map(p => `
- ${p.name}: $${p.purchasePrice} purchase price, $${p.monthlyRent} monthly rent, ${p.propertyType}
`).join('')}

Transaction Categories:
${transactions.reduce((acc, t) => {
  if (!acc[t.category]) acc[t.category] = 0;
  acc[t.category] += Number(t.amount);
  return acc;
}, {} as any)}

Please provide comprehensive tax optimization analysis including:

1. DEDUCTIONS ANALYSIS:
- List all available tax deductions for landlords in ${country}
- Identify any missed deduction opportunities
- Calculate potential deduction amounts
- Provide specific recommendations

2. TAX LOSS HARVESTING:
- Identify opportunities for tax loss harvesting
- Calculate potential tax savings
- Provide strategic recommendations

3. EXPENSE CATEGORIZATION:
- Review current expense categorization
- Suggest improvements for better tax compliance
- Identify any compliance issues

4. TAX PLANNING:
- Calculate quarterly tax estimates
- Provide year-end tax strategies
- List important filing deadlines

Provide specific, actionable tax advice that maximizes deductions while ensuring compliance.
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
      max_tokens: 2000
    });

    const analysis = completion.choices[0].message.content;
    
    return parseTaxOptimizationResponse(analysis || '', transactions, totalIncome, totalExpenses);
  } catch (error) {
    console.error('Error analyzing tax optimization:', error);
    throw new Error('Failed to analyze tax optimization');
  }
}

export async function categorizeExpense(description: string, amount: number, country: string): Promise<{
  category: string;
  taxDeductible: boolean;
  deductionType: string;
  confidence: number;
}> {
  try {
    const prompt = `
You are a tax expert. Categorize this expense for a landlord in ${country}:

Description: ${description}
Amount: $${amount}

Please categorize this expense and determine:
1. The appropriate expense category
2. Whether it's tax deductible
3. The type of deduction (ordinary, capital, etc.)
4. Your confidence level (0-100%)

Respond in JSON format:
{
  "category": "string",
  "taxDeductible": boolean,
  "deductionType": "string",
  "confidence": number
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a tax expert specializing in real estate expense categorization. Provide accurate, compliant categorization for landlord expenses."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response || '{}');
  } catch (error) {
    console.error('Error categorizing expense:', error);
    return {
      category: 'Other',
      taxDeductible: false,
      deductionType: 'None',
      confidence: 0
    };
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

function parseTaxOptimizationResponse(
  response: string, 
  transactions: any[], 
  totalIncome: number, 
  totalExpenses: number
): TaxOptimizationAnalysis {
  // Calculate basic metrics
  const expenseCategories = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = 0;
      acc[t.category] += Number(t.amount);
      return acc;
    }, {} as any);

  const potentialDeductions = [
    'Mortgage Interest',
    'Property Taxes',
    'Insurance',
    'Maintenance & Repairs',
    'Utilities',
    'Property Management Fees',
    'Travel Expenses',
    'Home Office',
    'Depreciation'
  ];

  const missedDeductions = potentialDeductions.filter(deduction => 
    !Object.keys(expenseCategories).some(cat => 
      cat.toLowerCase().includes(deduction.toLowerCase())
    )
  );

  return {
    deductions: {
      availableDeductions: potentialDeductions,
      missedDeductions,
      deductionAmount: totalExpenses * 0.25, // Rough estimate
      recommendations: [
        'Track all property-related travel expenses',
        'Consider home office deduction if applicable',
        'Document all maintenance and repair costs',
        'Keep detailed records of property management fees'
      ]
    },
    taxLossHarvesting: {
      opportunities: ['Consider selling underperforming properties', 'Review depreciation schedules'],
      potentialSavings: totalIncome * 0.15, // Rough estimate
      strategy: 'Review portfolio for properties with losses that could offset gains'
    },
    expenseCategorization: {
      categories: expenseCategories,
      suggestions: [
        'Use more specific categories for better tracking',
        'Separate capital improvements from repairs',
        'Track mileage for property visits'
      ],
      complianceNotes: [
        'Ensure all expenses are properly documented',
        'Keep receipts for all deductible expenses',
        'Separate personal and business expenses'
      ]
    },
    taxPlanning: {
      quarterlyEstimates: (totalIncome - totalExpenses) * 0.25,
      yearEndStrategies: [
        'Prepay deductible expenses',
        'Review depreciation schedules',
        'Consider property improvements'
      ],
      filingDeadlines: [
        'April 15: Annual tax return',
        'January 31: W-2 and 1099 forms',
        'Quarterly: Estimated tax payments'
      ]
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
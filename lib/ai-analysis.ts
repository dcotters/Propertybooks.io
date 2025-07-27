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
  canadianForms: {
    requiredForms: string[]
    formDescriptions: string[]
    filingRequirements: string[]
  }
}

export interface ReceiptAnalysis {
  vendor: string
  amount: number
  date: string
  items: string[]
  category: string
  taxCategory: string
  taxDeductible: boolean
  deductionType: string
  confidence: number
  description: string
  suggestedTags: string[]
  complianceNotes: string[]
  canadianForm: string
  gstHstEligible: boolean
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

export async function analyzeReceipt(imageUrl: string, country: string = 'CA'): Promise<ReceiptAnalysis> {
  try {
    const prompt = `
You are a Canadian tax expert specializing in real estate expense categorization. Analyze this receipt image and extract all relevant information for Canadian tax purposes.

Please analyze the receipt and provide:

1. VENDOR INFORMATION:
- Vendor/store name
- Vendor type (hardware store, utility company, etc.)

2. TRANSACTION DETAILS:
- Total amount
- Date of transaction
- Individual items purchased (if listed)
- GST/HST amount (if applicable)

3. CANADIAN TAX CATEGORIZATION:
- Primary expense category for T776 (Statement of Real Estate Rentals)
- Tax deduction category (Operating Expense, CCA, etc.)
- Whether it's tax deductible for Canadian landlords
- Specific Canadian tax deduction type
- Applicable Canadian tax form (T776, T2125, etc.)

4. CANADIAN TAX COMPLIANCE:
- GST/HST considerations
- CCA (Capital Cost Allowance) eligibility
- Compliance notes for Canadian tax filing
- Suggested tags for tracking
- Important notes for Canadian tax filing

Respond in JSON format:
{
  "vendor": "string",
  "amount": number,
  "date": "YYYY-MM-DD",
  "items": ["item1", "item2"],
  "category": "string",
  "taxCategory": "string",
  "taxDeductible": boolean,
  "deductionType": "string",
  "confidence": number (0-100),
  "description": "string",
  "suggestedTags": ["tag1", "tag2"],
  "complianceNotes": ["note1", "note2"],
  "canadianForm": "string",
  "gstHstEligible": boolean
}

Common Canadian landlord expense categories for T776:
- Advertising
- Insurance
- Interest and bank charges
- Office expenses
- Professional fees (includes legal fees)
- Management and administration fees
- Repairs and maintenance
- Salaries, wages, and benefits
- Property taxes
- Travel
- Utilities
- Motor vehicle expenses
- CCA (Capital Cost Allowance) - separate line
- GST/HST on expenses (input tax credits)

Be thorough and accurate in your analysis for Canadian tax compliance. If you cannot read certain parts of the receipt, indicate low confidence and provide best estimates.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: "You are a Canadian tax expert specializing in real estate expense categorization. Provide accurate, compliant categorization for Canadian landlord expenses from receipt images."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    });

    const response = completion.choices[0].message.content;
    const analysis = JSON.parse(response || '{}');
    
    // Validate and enhance the analysis
    return validateAndEnhanceReceiptAnalysis(analysis);
  } catch (error) {
    console.error('Error analyzing receipt:', error);
    return {
      vendor: 'Unknown',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      items: [],
      category: 'Other',
      taxCategory: 'Other',
      taxDeductible: false,
      deductionType: 'None',
      confidence: 0,
      description: 'Unable to analyze receipt',
      suggestedTags: ['unanalyzed'],
      complianceNotes: ['Receipt analysis failed - manual review required'],
      canadianForm: 'T776',
      gstHstEligible: false
    };
  }
}

function validateAndEnhanceReceiptAnalysis(analysis: any): ReceiptAnalysis {
  // Ensure all required fields are present
  const enhanced = {
    vendor: analysis.vendor || 'Unknown',
    amount: parseFloat(analysis.amount) || 0,
    date: analysis.date || new Date().toISOString().split('T')[0],
    items: Array.isArray(analysis.items) ? analysis.items : [],
    category: analysis.category || 'Other',
    taxCategory: analysis.taxCategory || 'Other',
    taxDeductible: Boolean(analysis.taxDeductible),
    deductionType: analysis.deductionType || 'None',
    confidence: Math.min(100, Math.max(0, analysis.confidence || 0)),
    description: analysis.description || 'Receipt analysis',
    suggestedTags: Array.isArray(analysis.suggestedTags) ? analysis.suggestedTags : [],
    complianceNotes: Array.isArray(analysis.complianceNotes) ? analysis.complianceNotes : [],
    canadianForm: analysis.canadianForm || 'T776',
    gstHstEligible: Boolean(analysis.gstHstEligible)
  };

  // Enhance with Canadian tax insights
  if (enhanced.category === 'Repairs and maintenance') {
    enhanced.taxDeductible = true;
    enhanced.deductionType = 'Operating Expense';
    enhanced.suggestedTags.push('repair', 'maintenance', 'T776');
    enhanced.complianceNotes.push('Deductible as operating expense on T776');
  } else if (enhanced.category === 'Utilities') {
    enhanced.taxDeductible = true;
    enhanced.deductionType = 'Operating Expense';
    enhanced.suggestedTags.push('utility', 'operating', 'T776');
    enhanced.complianceNotes.push('Deductible as operating expense on T776');
  } else if (enhanced.category === 'Insurance') {
    enhanced.taxDeductible = true;
    enhanced.deductionType = 'Operating Expense';
    enhanced.suggestedTags.push('insurance', 'protection', 'T776');
    enhanced.complianceNotes.push('Deductible as operating expense on T776');
  } else if (enhanced.category === 'Property taxes') {
    enhanced.taxDeductible = true;
    enhanced.deductionType = 'Operating Expense';
    enhanced.suggestedTags.push('property-tax', 'T776');
    enhanced.complianceNotes.push('Deductible as operating expense on T776');
  }

  return enhanced;
}

export async function analyzeProperty(property: PropertyData): Promise<PropertyAnalysis> {
  try {
    const prompt = `
You are a professional Canadian real estate investment analyst. Analyze the following property and provide comprehensive insights for Canadian landlords:

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
- Is the property overpriced or underpriced for the Canadian market?
- What should the recommended rent be?
- How does it compare to similar properties in the area?
- What factors affect the pricing?

2. MARKET ANALYSIS:
- What's the current market trend in this Canadian area?
- What's the demand level?
- What's the investment potential?
- Key market insights for Canadian investors

3. RECOMMENDATIONS:
- Specific improvements to increase value
- Marketing suggestions
- Financial optimization strategies for Canadian tax benefits
- Risk factors to consider

4. ROI ANALYSIS:
- Estimated ROI percentage
- Cash-on-cash return
- Cap rate calculation
- Break-even analysis

Provide specific, actionable insights that a Canadian landlord can use to make informed decisions. Be concise but thorough.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional Canadian real estate investment analyst with expertise in property valuation, market analysis, and investment strategies. Provide practical, data-driven insights that help Canadian landlords make informed decisions."
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
  country: string = 'CA', 
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
You are a Canadian tax expert specializing in real estate investment. Analyze the following landlord data for Canadian tax optimization opportunities:

Country: Canada
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

Please provide comprehensive Canadian tax optimization analysis including:

1. CANADIAN DEDUCTIONS ANALYSIS:
- List all available tax deductions for Canadian landlords
- Identify any missed deduction opportunities
- Calculate potential deduction amounts
- Provide specific recommendations for T776 filing

2. CANADIAN TAX FORMS REQUIRED:
- T776 - Statement of Real Estate Rentals
- T2125 - Statement of Business or Professional Activities (if applicable)
- T2091(IND) - Principal Residence Exemption (if applicable)
- Schedule 3 - Capital Gains (if applicable)

3. EXPENSE CATEGORIZATION FOR T776:
- Review current expense categorization
- Suggest improvements for Canadian tax compliance
- Identify any compliance issues
- CCA (Capital Cost Allowance) considerations

4. CANADIAN TAX PLANNING:
- Quarterly tax estimates
- Year-end tax strategies for Canadian landlords
- Important Canadian filing deadlines
- GST/HST considerations

5. CANADIAN TAX COMPLIANCE:
- CRA requirements and documentation
- Record keeping requirements
- Audit considerations
- Provincial tax considerations

Provide specific, actionable Canadian tax advice that maximizes deductions while ensuring CRA compliance.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a Canadian tax expert specializing in real estate investment taxation. Provide clear, practical Canadian tax advice that helps landlords optimize their tax position while remaining CRA compliant."
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

export async function categorizeExpense(description: string, amount: number, country: string = 'CA'): Promise<{
  category: string;
  taxDeductible: boolean;
  deductionType: string;
  confidence: number;
  canadianForm: string;
}> {
  try {
    const prompt = `
You are a Canadian tax expert. Categorize this expense for a Canadian landlord:

Description: ${description}
Amount: $${amount}

Please categorize this expense and determine:
1. The appropriate Canadian expense category for T776
2. Whether it's tax deductible in Canada
3. The type of deduction (operating expense, CCA, etc.)
4. Your confidence level (0-100%)
5. Applicable Canadian tax form

Respond in JSON format:
{
  "category": "string",
  "taxDeductible": boolean,
  "deductionType": "string",
  "confidence": number,
  "canadianForm": "string"
}

Common Canadian landlord expense categories for T776:
- Advertising
- Insurance
- Interest and bank charges
- Office expenses
- Professional fees
- Management and administration fees
- Repairs and maintenance
- Salaries, wages, and benefits
- Property taxes
- Travel
- Utilities
- Motor vehicle expenses
- CCA (Capital Cost Allowance)
- GST/HST on expenses
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a Canadian tax expert specializing in real estate expense categorization. Provide accurate, CRA-compliant categorization for Canadian landlord expenses."
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
      confidence: 0,
      canadianForm: 'T776'
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
      marketComparison: "Based on Canadian market data and comparable properties",
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
      marketInsights: "Market analysis based on current Canadian economic indicators and local trends"
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
    'Advertising',
    'Insurance',
    'Interest and bank charges',
    'Office expenses',
    'Professional fees',
    'Management and administration fees',
    'Repairs and maintenance',
    'Property taxes',
    'Travel',
    'Utilities',
    'Motor vehicle expenses',
    'CCA (Capital Cost Allowance)',
    'GST/HST on expenses'
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
        'Document all maintenance and repair costs',
        'Keep detailed records of property management fees',
        'Consider CCA for capital improvements'
      ]
    },
    taxLossHarvesting: {
      opportunities: ['Consider selling underperforming properties', 'Review CCA schedules'],
      potentialSavings: totalIncome * 0.15, // Rough estimate
      strategy: 'Review portfolio for properties with losses that could offset gains'
    },
    expenseCategorization: {
      categories: expenseCategories,
      suggestions: [
        'Use T776 categories for better tracking',
        'Separate capital improvements from repairs',
        'Track mileage for property visits',
        'Consider GST/HST input tax credits'
      ],
      complianceNotes: [
        'Ensure all expenses are properly documented for CRA',
        'Keep receipts for all deductible expenses',
        'Separate personal and business expenses',
        'Maintain records for 6 years as required by CRA'
      ]
    },
    taxPlanning: {
      quarterlyEstimates: (totalIncome - totalExpenses) * 0.25,
      yearEndStrategies: [
        'Prepay deductible expenses',
        'Review CCA schedules',
        'Consider property improvements',
        'Plan for GST/HST obligations'
      ],
      filingDeadlines: [
        'April 30: Personal tax return (T1)',
        'June 15: Self-employed tax return (T1)',
        'March 31: Corporate tax return (T2)',
        'Quarterly: GST/HST returns (if applicable)'
      ]
    },
    canadianForms: {
      requiredForms: [
        'T776 - Statement of Real Estate Rentals',
        'T1 - Personal Income Tax Return',
        'T2125 - Statement of Business Activities (if applicable)',
        'T2091(IND) - Principal Residence Exemption (if applicable)'
      ],
      formDescriptions: [
        'T776: Report rental income and expenses',
        'T1: Personal tax return including T776',
        'T2125: Business income if flipping properties',
        'T2091: Principal residence exemption'
      ],
      filingRequirements: [
        'File T776 with T1 personal return',
        'Keep records for 6 years',
        'Report all rental income',
        'Claim all eligible expenses'
      ]
    }
  };
}

export async function generateTaxInsights(country: string = 'CA', propertyData: any): Promise<string> {
  try {
    const prompt = `
You are a Canadian tax expert specializing in real estate investment. Provide Canadian tax insights for a landlord in Canada.

Property Details:
- Purchase Price: $${propertyData.purchasePrice}
- Monthly Rent: $${propertyData.monthlyRent}
- Property Type: ${propertyData.propertyType}

Please provide:
1. Key Canadian tax deductions available for landlords
2. Tax implications of rental income in Canada
3. CCA (Capital Cost Allowance) rules
4. Capital gains considerations for Canadian properties
5. GST/HST considerations for landlords
6. Important Canadian filing requirements and deadlines
7. CRA compliance requirements

Provide practical, actionable Canadian tax advice that a landlord can use for tax planning.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a Canadian tax expert specializing in real estate investment taxation. Provide clear, practical Canadian tax advice that helps landlords optimize their tax position while remaining CRA compliant."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 1500
    });

    return completion.choices[0].message.content || 'Unable to generate Canadian tax insights';
  } catch (error) {
    console.error('Error generating Canadian tax insights:', error);
    return 'Unable to generate Canadian tax insights at this time';
  }
} 
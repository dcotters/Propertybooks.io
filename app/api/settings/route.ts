import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { supabase } from '../../../lib/supabase'
import { generateTaxInsights } from '../../../lib/ai-analysis'
import { countries } from '../../../data/countries'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabase
      .from('User')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user,
      countries: countries.map(c => ({
        code: c.code,
        name: c.name,
        flag: c.flag,
        currency: c.currency,
        currencyCode: c.currencyCode
      }))
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      email, 
      country, 
      timezone, 
      currency, 
      notificationPreferences,
      businessName,
      businessAddress,
      taxId,
      accountingMethod
    } = body

    // Validate country
    const selectedCountry = countries.find(c => c.code === country)
    if (country && !selectedCountry) {
      return NextResponse.json({ error: 'Invalid country' }, { status: 400 })
    }

    const { data: user, error } = await supabase
      .from('User')
      .update({
        name: name || undefined,
        email: email || undefined,
        country: country || undefined,
        timezone: timezone || selectedCountry?.timezone || undefined,
        currency: currency || selectedCountry?.currencyCode || undefined,
        notificationPreferences: notificationPreferences || undefined,
        businessName: businessName || undefined,
        businessAddress: businessAddress || undefined,
        taxId: taxId || undefined,
        accountingMethod: accountingMethod || undefined,
        updatedAt: new Date().toISOString()
      })
      .eq('id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, country } = body

    if (action === 'generate-tax-insights') {
      if (!country) {
        return NextResponse.json({ error: 'Country is required' }, { status: 400 })
      }

      // Get user's property data for context
      const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .eq('userId', session.user.id)
        .limit(1)

      const propertyData = properties?.[0] || {
        purchasePrice: 300000,
        monthlyRent: 2500,
        propertyType: 'Residential'
      }

      // Find the full country name from the country code
      const selectedCountry = countries.find(c => c.code === country)
      const countryName = selectedCountry?.name || country

      const taxInsights = await generateTaxInsights(countryName, propertyData)

      return NextResponse.json({ taxInsights })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing settings action:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
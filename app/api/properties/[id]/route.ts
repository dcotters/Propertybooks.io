import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { supabase } from '../../../../lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', params.id)
      .eq('userId', session.user.id)
      .single()

    if (error) {
      console.error('Error fetching property:', error)
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, address, city, state, zipCode, propertyType, purchasePrice, purchaseDate, units, monthlyRent, estimatedValue, yearBuilt, squareFootage, bedrooms, bathrooms, parkingSpaces, description } = body

    // First verify the property belongs to the user
    const { data: existingProperty, error: fetchError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', params.id)
      .eq('userId', session.user.id)
      .single()

    if (fetchError || !existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const { data: property, error } = await supabase
      .from('properties')
      .update({
        name,
        address,
        city,
        state,
        zipCode,
        propertyType,
        purchasePrice,
        purchaseDate: new Date(purchaseDate).toISOString(),
        units: units ? parseInt(units) : null,
        monthlyRent: monthlyRent ? parseFloat(monthlyRent) : null,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
        squareFootage: squareFootage ? parseInt(squareFootage) : null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseFloat(bathrooms) : null,
        parkingSpaces: parkingSpaces ? parseInt(parkingSpaces) : null,
        description,
        updatedAt: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating property:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First verify the property belongs to the user
    const { data: existingProperty, error: fetchError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', params.id)
      .eq('userId', session.user.id)
      .single()

    if (fetchError || !existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting property:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
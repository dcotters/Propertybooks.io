import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabase } from '../../../../lib/supabase'
import { sendWelcomeEmail } from '../../../../lib/email'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = registerSchema.parse(body)

    // Check if user already exists
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (findError && findError.code !== 'PGRST116') {
      console.error('Error checking existing user:', findError)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const { data: user, error: createUserError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password: hashedPassword,
      })
      .select()
      .single()

    if (createUserError) {
      console.error('Error creating user:', createUserError)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create free subscription
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        userId: user.id,
        status: 'ACTIVE',
        plan: 'FREE',
      })

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError)
      // Don't fail the registration if subscription creation fails
    }

    // Send welcome email
    await sendWelcomeEmail(email, name)

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
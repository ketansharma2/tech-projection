import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password' },
        { status: 400 }
      )
    }

    // Authenticate user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      )
    }

    const userId = authData.user.id

    // Get user data from users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('name, email, role, company, is_active')
      .eq('user_id', userId)
      .single()

    if (userError || !userData) {
      // Clean up the auth session if user record not found
      await supabaseAdmin.auth.admin.signOut(userId)
      
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    // Check if user is active
    if (!userData.is_active) {
      // Clean up the auth session
      await supabaseAdmin.auth.admin.signOut(userId)
      
      return NextResponse.json(
        { error: 'Account is inactive. Please contact administrator.' },
        { status: 403 }
      )
    }

    // Calculate session expiry (24 hours from now)
    const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: userId,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        company: userData.company,
        is_active: userData.is_active ? 'Yes' : 'No'
      },
      session: {
        expiresAt: sessionExpiry
      },
      accessToken: authData.session.access_token
    }, { status: 200 })

  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

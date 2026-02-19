import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, email, role, company, name, is_active } = body

    // Validate required fields
    if (!password || !email || !name || is_active === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: password, email, name, is_active' },
        { status: 400 }
      )
    }

    // Validate is_active must be 'Yes' or 'No'
    if (is_active !== 'Yes' && is_active !== 'No') {
      return NextResponse.json(
        { error: 'is_active must be "Yes" or "No"' },
        { status: 400 }
      )
    }

    // Create user in Supabase Auth (username stored in user_metadata if provided)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: username ? { username, name } : { name }
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    // Get the user ID from Supabase Auth
    const userId = authData.user.id

    // Insert user into users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        user_id: userId,
        name: name,
        email: email,
        role: role || 'user',
        company: company || null,
        is_active: is_active === 'Yes'
      })
      .select()
      .single()

    if (userError) {
      // If user record creation fails, we should clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(userId)
      
      return NextResponse.json(
        { error: userError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: userId,
        email,
        name,
        role: userData.role,
        company: userData.company,
        is_active: userData.is_active ? 'Yes' : 'No'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

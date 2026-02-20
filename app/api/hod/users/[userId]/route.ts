import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize admin client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// API to update a user (HOD can update users)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const body = await request.json()
    const { name, role, company, is_active, profile_url } = body

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Build update object - only include fields that are provided
    const updateData: Record<string, unknown> = {}
    
    if (name !== undefined) updateData.name = name
    if (role !== undefined) updateData.role = role
    if (company !== undefined) updateData.company = company
    if (is_active !== undefined) updateData.is_active = is_active
    if (profile_url !== undefined) updateData.profile_url = profile_url

    // Update user in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single()

    if (userError) {
      console.error('Error updating user:', userError)
      return NextResponse.json(
        { error: 'Failed to update user', details: userError.message },
        { status: 500 }
      )
    }

    // If password is provided, update auth user password
    if (body.password) {
      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: body.password }
      )

      if (passwordError) {
        console.error('Error updating password:', passwordError)
        // Continue with the response even if password update fails
      }
    }

    // If email is provided, update auth user email
    if (body.email) {
      const { error: emailError } = await supabase.auth.admin.updateUserById(
        userId,
        { email: body.email }
      )

      if (emailError) {
        console.error('Error updating email:', emailError)
        // Continue with the response even if email update fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User updated successfully',
      user: userData 
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// API to delete a user (HOD can delete users)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // First, delete from users table
    const { error: deleteUserError } = await supabase
      .from('users')
      .delete()
      .eq('user_id', userId)

    if (deleteUserError) {
      console.error('Error deleting user from users table:', deleteUserError)
      return NextResponse.json(
        { error: 'Failed to delete user', details: deleteUserError.message },
        { status: 500 }
      )
    }

    // Then, delete from auth
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError)
      // The user record is already deleted, but auth deletion failed
      // This is a partial failure - we should inform the user
      return NextResponse.json(
        { 
          success: true, 
          warning: 'User record deleted but auth deletion failed',
          details: deleteAuthError.message 
        }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully' 
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

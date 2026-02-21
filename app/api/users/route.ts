import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize admin client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// API to fetch users from the users table
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const company = searchParams.get('company')

    // Create Supabase client with service role key for server-side auth
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Build query - fetch all users (no filter for is_active or company)
    const { data, error } = await supabase
      .from('users')
      .select('user_id, name, email, profile_url')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users', details: error.message },
        { status: 500 }
      )
    }

    // Extract names for the doer dropdown, use email as fallback if name is empty
    const userNames = data?.map(user => user.name || user.email?.split('@')[0] || '').filter(Boolean) || []
    const usersWithId = data?.map(user => ({
      id: user.user_id,
      name: user.name || user.email?.split('@')[0] || '',
      profile_url: user.profile_url || ''
    })).filter(u => u.name) || []

    return NextResponse.json({ users: data, userNames, usersWithId })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

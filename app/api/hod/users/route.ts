import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize admin client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// API to fetch users from the users table (HOD can view all users)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const company = searchParams.get('company')

    // Create Supabase client with service role key for server-side auth
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Build query
    let query = supabase
      .from('users')
      .select('user_id, name, email, role, is_active, company, profile_url, created_at, designation')
      .order('created_at', { ascending: false })

    // Filter by company if provided
    if (company) {
      query = query.eq('company', company)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ users: data || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// API to create a new user with optional profile image (HOD can create users)
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''

    let email: string, password: string, name: string, designation: string, role: string, company: string, isActive: string, file: File | null

    // Check if request is FormData (with file) or JSON
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      email = formData.get('email') as string
      password = formData.get('password') as string
      name = formData.get('name') as string
      designation = formData.get('designation') as string
      role = formData.get('role') as string || 'User'
      company = formData.get('company') as string || ''
      isActive = formData.get('is_active') as string || 'Yes'
      file = formData.get('file') as File | null
    } else {
      const body = await request.json()
      email = body.email
      password = body.password
      name = body.name
      designation = body.designation || ''
      role = body.role || 'User'
      company = body.company || ''
      isActive = body.is_active !== undefined ? body.is_active : 'Yes'
      file = null
    }

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json(
        { error: 'Failed to create user', details: authError.message },
        { status: 500 }
      )
    }

    const userId = authData.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Failed to get user ID from auth' },
        { status: 500 }
      )
    }

    let profileUrl: string | null = null

    // If file is provided, upload to profile_pictures bucket
    if (file) {
      try {
        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        // Generate unique file name - store directly in bucket without folder
        const fileName = `${Date.now()}-${file.name}`

        // Upload to Supabase storage bucket
        const { error: uploadError } = await supabase.storage
          .from('profile_pictures')
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true
          })

        if (!uploadError) {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('profile_pictures')
            .getPublicUrl(fileName)
          profileUrl = urlData.publicUrl
        }
      } catch (uploadErr) {
        console.error('Error uploading profile image:', uploadErr)
        // Continue with user creation even if image upload fails
      }
    }

    // Insert user into users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        user_id: userId,
        name,
        email,
        designation: designation || null,
        role,
        is_active: isActive,
        company: company || null,
        profile_url: profileUrl
      })
      .select()
      .single()

    if (userError) {
      console.error('Error inserting user:', userError)
      // Try to delete the auth user if database insert fails
      await supabase.auth.admin.deleteUser(userId)
      // Try to delete uploaded file
      if (profileUrl) {
        // Extract the filename from the URL and delete it
        const fileName = profileUrl.split('/').pop()
        if (fileName) {
          await supabase.storage.from('profile_pictures').remove([fileName])
        }
      }
      return NextResponse.json(
        { error: 'Failed to create user record', details: userError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      user: userData 
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

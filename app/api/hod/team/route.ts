import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const company = searchParams.get('company')

    if (!company) {
      return NextResponse.json(
        { error: 'Missing required parameter: company' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Company is stored in uppercase in DB, so convert it
    const companyUpper = company.toUpperCase()
    console.log('Querying for company:', companyUpper)

    // Fetch users for the company - company is an array, so use contains
    // Try without is_active filter first to debug
    const { data, error } = await supabase
      .from('users')
      .select('user_id, name, email, role, company, is_active, profile_url, designation')
      .contains('company', [companyUpper])
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users', details: error.message },
        { status: 500 }
      )
    }

    console.log('Found users:', data?.length, data?.map(u => ({ name: u.name, company: u.company, is_active: u.is_active })))

    if (!data || data.length === 0) {
      return NextResponse.json({ 
        totalTeam: 0,
        hod: null,
        tl: null,
        members: []
      })
    }

    // Group users by role (DB values are uppercase: HOD, TL, User)
    const hod = data.find(u => u.role?.toUpperCase() === 'HOD') || null
    const tl = data.find(u => u.role?.toUpperCase() === 'TL') || null
    const members = data.filter(u => u.role?.toUpperCase() !== 'HOD' && u.role?.toUpperCase() !== 'TL')

    return NextResponse.json({
      totalTeam: data.length,
      hod: hod ? {
        id: hod.user_id,
        name: hod.name,
        email: hod.email,
        designation: hod.designation
      } : null,
      tl: tl ? {
        id: tl.user_id,
        name: tl.name,
        email: tl.email,
        designation: tl.designation
      } : null,
      members: members.map(m => ({
        id: m.user_id,
        name: m.name,
        email: m.email,
        designation: m.designation,
        role: m.role
      }))
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

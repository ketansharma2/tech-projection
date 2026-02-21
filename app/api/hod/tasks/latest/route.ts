import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize admin client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// HOD API - Get latest 10 tasks sorted by created_at
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with service role key for server-side auth
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // First, fetch all users to map user_id to name
    const { data: usersData } = await supabase
      .from('users')
      .select('user_id, name')

    // Create a map of user_id -> name
    const userNameMap: Record<string, string> = {}
    if (usersData) {
      usersData.forEach((user: { user_id: string; name: string }) => {
        userNameMap[user.user_id] = user.name
      })
    }

    // Fetch latest 10 tasks sorted by created_at descending (newest first)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching latest tasks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch latest tasks', details: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ tasks: [] })
    }

    // Transform tasks to include user names
    const tasks = data.map((task: any) => ({
      id: task.task_id,
      company: task.company,
      work_area: task.work_area,
      sub_dept: task.sub_dept,
      dm_section: task.dm_section,
      month_key: task.month_key,
      delivery_mode: task.delivery_mode,
      title: task.title,
      status: task.status,
      is_active: task.is_active,
      progress_percent: task.progress_percent,
      deadline_date: task.deadline_date,
      working_freq: task.working_freq,
      goal_target: task.goal_target,
      remarks: task.remarks,
      links: task.links,
      doer: userNameMap[task.assigned_to] || task.assigned_to || '',
      assigned_to: task.assigned_to,
      created_at: task.created_at,
      updated_at: task.updated_at,
    }))

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize admin client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// HOD API - Get task activity logs from task_activity_log table
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

    // Fetch task activity logs sorted by created_at descending
    const { data, error } = await supabase
      .from('task_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching task activity logs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch task activity logs', details: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ logs: [] })
    }

    // Get unique task_ids to fetch task titles
    const taskIds = [...new Set(data.map((log: any) => log.task_id).filter(Boolean))]
    
    let taskTitleMap: Record<string, string> = {}
    if (taskIds.length > 0) {
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('task_id, title')
        .in('task_id', taskIds)
      
      if (tasksData) {
        tasksData.forEach((task: any) => {
          taskTitleMap[task.task_id] = task.title
        })
      }
    }

    // Transform logs to include user names and task titles
    const logs = data.map((log: any) => ({
      id: log.id,
      task_id: log.task_id,
      task_title: taskTitleMap[log.task_id] || 'Unknown Task',
      edited_by_user_id: log.edited_by_user_id,
      edited_by_name: userNameMap[log.edited_by_user_id] || log.edited_by_user_id || 'Unknown',
      action_type: log.action_type,
      old_data: log.old_data,
      new_data: log.new_data,
      created_at: log.created_at,
    }))

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

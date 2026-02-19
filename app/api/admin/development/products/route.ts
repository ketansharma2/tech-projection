import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize admin client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Products Section mapping from database values to UI sectionId
const productsSectionMapping: Record<string, string> = {
  'Already Built': 'already-built',
  'In Progress': 'in-progress',
}

interface Task {
  id: string
  sectionId: string
  sn: number
  title: string
  company?: string
  active: 'ON' | 'OFF'
  status: 'In Progress' | 'Not Started' | 'On Hold' | 'Delegated'
  doer: string
  deadlineDate: string
  workingFreq: string
  goalTarget: string
  deliveryMode?: string
  progressPercent: number
}

interface DBTask {
  task_id: string
  user_id: string
  assigned_to: string
  company: string
  work_area: string
  sub_dept: string
  dm_section: string | null
  month_key: string
  delivery_mode: string
  title: string
  status: string
  is_active: boolean
  progress_percent: number
  deadline_date: string | null
  working_freq: string | null
  goal_target: string | null
  remarks: string | null
  links: string | null
  recurring: string | null
  carry_forward_eligible: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

function transformDBTaskToTask(dbTask: DBTask, sn: number, userNameMap: Record<string, string>): Task {
  // Handle empty dm_section - default to 'in-progress'
  const dmSection = dbTask.dm_section || ''
  let sectionId = productsSectionMapping[dmSection] || dmSection.toLowerCase().replace(/\s+/g, '-')
  if (!sectionId) {
    sectionId = 'in-progress'
  }
  
  // Get user name from the map, fallback to assigned_to if not found
  const userName = userNameMap[dbTask.assigned_to] || dbTask.assigned_to || ''
  
  return {
    id: dbTask.task_id,
    sectionId,
    sn,
    title: dbTask.title,
    company: dbTask.company,
    active: dbTask.is_active ? 'ON' : 'OFF',
    status: dbTask.status as Task['status'],
    doer: userName,
    deadlineDate: dbTask.deadline_date || '—',
    workingFreq: dbTask.working_freq || '—',
    goalTarget: dbTask.goal_target || '—',
    deliveryMode: dbTask.delivery_mode,
    progressPercent: dbTask.progress_percent || 0,
  }
}

// Admin API - returns all tasks for PRODUCTS sub-dept (no user filter)
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

    // Build query - returns all tasks for PRODUCTS sub-dept (admin view)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .ilike('company', company)
      .eq('work_area', 'DEVELOPMENT')
      .eq('sub_dept', 'PRODUCTS')
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tasks', details: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ tasks: [] })
    }

    // Group tasks by dm_section to calculate serial numbers
    const sectionCounts: Record<string, number> = {}

    const tasks: Task[] = data.map((dbTask: DBTask) => {
      sectionCounts[dbTask.dm_section || 'in-progress'] = (sectionCounts[dbTask.dm_section || 'in-progress'] || 0) + 1
      return transformDBTaskToTask(dbTask, sectionCounts[dbTask.dm_section || 'in-progress'], userNameMap)
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

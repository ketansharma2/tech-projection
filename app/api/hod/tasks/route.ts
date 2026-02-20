import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize admin client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// DM Section mapping from database values to UI sectionId
const dmSectionMapping: Record<string, string> = {
  'Linked In': 'linkedin',
  'Social Media': 'social',
  'SEO On': 'seo-on',
  'SEO Off': 'seo-off',
  'Content Writing': 'content',
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
  // Handle empty dm_section - default to 'linkedin'
  const dmSection = dbTask.dm_section || ''
  let sectionId = dmSectionMapping[dmSection] || dmSection.toLowerCase().replace(/\s+/g, '-')
  if (!sectionId) {
    sectionId = 'linkedin'
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

// HOD API - returns all tasks for the company (same as admin for now)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const company = searchParams.get('company')
    const workArea = searchParams.get('work_area')
    const subDept = searchParams.get('sub_dept')
    const monthKey = searchParams.get('month')

    if (!company || !workArea || !subDept) {
      return NextResponse.json(
        { error: 'Missing required parameters: company, work_area, sub_dept' },
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

    // Build query - returns ALL tasks for HOD (no user filtering)
    let query = supabase
      .from('tasks')
      .select('*')
      .is('deleted_at', null)
      .ilike('company', company)
      .eq('work_area', workArea)
      .eq('sub_dept', subDept)
      .is('deleted_at', null)

    // Apply month filter if provided
    if (monthKey) {
      query = query.eq('month_key', monthKey)
    }

    const { data, error } = await query.order('created_at', { ascending: true })

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
      sectionCounts[dbTask.dm_section || 'linkedin'] = (sectionCounts[dbTask.dm_section || 'linkedin'] || 0) + 1
      return transformDBTaskToTask(dbTask, sectionCounts[dbTask.dm_section || 'linkedin'], userNameMap)
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

// HOD API - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id,
      assigned_to,
      company,
      work_area,
      sub_dept,
      dm_section,
      month_key,
      delivery_mode,
      title,
      status,
      is_active,
      progress_percent,
      deadline_date,
      working_freq,
      goal_target,
      remarks
    } = body

    // Validate required fields
    if (!title || !company || !work_area || !sub_dept) {
      return NextResponse.json(
        { error: 'Title, company, work_area, and sub_dept are required' },
        { status: 400 }
      )
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Insert task into tasks table
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user_id || null, // who creates the task
        assigned_to: assigned_to || null,
        company,
        work_area,
        sub_dept,
        dm_section: dm_section || null,
        month_key: month_key || null,
        delivery_mode: delivery_mode || 'In House',
        title,
        status: status || 'Not Started',
        is_active: is_active !== undefined ? is_active : true,
        progress_percent: progress_percent || 0,
        deadline_date: deadline_date || null,
        working_freq: working_freq || null,
        goal_target: goal_target || null,
        remarks: remarks || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error)
      return NextResponse.json(
        { error: 'Failed to create task', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Task created successfully',
      task: data 
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

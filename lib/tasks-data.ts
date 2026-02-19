export interface Task {
  id: string
  sectionId: string
  sn: number
  title: string
  company?: string
  active: 'ON' | 'OFF'
  status: 'In Progress' | 'Not Started' | 'On Hold' | 'Delegated' | 'Done'
  doer: string
  deadlineDate: string
  workingFreq: string
  goalTarget: string
  deliveryMode?: string
  progressPercent?: number
  remarks?: string
  links?: string | { name: string; url: string }[]
  monthKey?: string
}

// Database task interface (raw data from Supabase)
export interface DBTask {
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
  links: string | null | { name: string; url: string }[]
  recurring: string | null
  carry_forward_eligible: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Mapping from database dm_section values to UI sectionId
const dmSectionMapping: Record<string, string> = {
  'Linked In': 'linkedin',
  'Social Media': 'social',
  'SEO On': 'seo-on',
  'SEO Off': 'seo-off',
  'Content Writing': 'content',
}

// Transform database task to UI task
export function transformDBTaskToTask(dbTask: DBTask, sn: number): Task {
  // Handle empty dm_section - default to 'linkedin'
  const dmSection = dbTask.dm_section || ''
  let sectionId = dmSectionMapping[dmSection] || dmSection.toLowerCase().replace(/\s+/g, '-')
  if (!sectionId) {
    sectionId = 'linkedin'
  }
  
  return {
    id: dbTask.task_id,
    sectionId,
    sn,
    title: dbTask.title,
    company: dbTask.company,
    active: dbTask.is_active ? 'ON' : 'OFF',
    status: dbTask.status as Task['status'],
    doer: dbTask.assigned_to || '',
    deadlineDate: dbTask.deadline_date || '—',
    workingFreq: dbTask.working_freq || '—',
    goalTarget: dbTask.goal_target || '—',
    deliveryMode: dbTask.delivery_mode,
    progressPercent: dbTask.progress_percent || 0,
    remarks: dbTask.remarks || '',
    links: dbTask.links || '',
    monthKey: dbTask.month_key || '',
  }
}

// Helper function to parse links JSON
// Expects format: [{"name": "Link Name", "url": "https://..."}, ...]
// Can accept string (JSON) or array (already parsed)
export function parseLinks(linksData: string | null | undefined | { name: string; url: string }[]): { name: string; url: string }[] {
  if (!linksData) return []
  
  // If already an array, return as-is
  if (Array.isArray(linksData)) {
    return linksData.map((item) => ({
      name: item.name || item.url || 'Link',
      url: item.url || '',
    })).filter(item => item.url)
  }
  
  // If string, try to parse as JSON
  try {
    const parsed = JSON.parse(linksData)
    if (Array.isArray(parsed)) {
      return parsed.map((item) => ({
        name: item.name || item.url || 'Link',
        url: item.url || '',
      })).filter(item => item.url)
    }
    return []
  } catch {
    // If not valid JSON, treat as single URL
    if (linksData && typeof linksData === 'string' && linksData.trim()) {
      return [{ name: 'Link', url: linksData.trim() }]
    }
    return []
  }
}

export const tasksData: Task[] = [
  // LINKEDIN
  {
    id: 'linkedin-1',
    sectionId: 'linkedin',
    sn: 1,
    title: 'Work on Connections',
    active: 'ON',
    status: 'In Progress',
    doer: 'Lovekush',
    deadlineDate: '—',
    workingFreq: 'Daily',
    goalTarget: '8',
    progressPercent: 0,
  },
  {
    id: 'linkedin-2',
    sectionId: 'linkedin',
    sn: 2,
    title: 'LinkedIn Blogs',
    company: 'MKS',
    active: 'ON',
    status: 'Not Started',
    doer: 'Ajay',
    deadlineDate: '—',
    workingFreq: 'Weekly',
    goalTarget: '—',
  },

  // SOCIAL MEDIA
  {
    id: 'social-1',
    sectionId: 'social',
    sn: 1,
    title: 'Planning & Strategy',
    active: 'ON',
    status: 'In Progress',
    doer: 'Lovekush',
    deadlineDate: '—',
    workingFreq: 'Monthly',
    goalTarget: '—',
  },
  {
    id: 'social-2',
    sectionId: 'social',
    sn: 2,
    title: 'Posting Calendar',
    active: 'ON',
    status: 'In Progress',
    doer: 'Lovekush',
    deadlineDate: '—',
    workingFreq: 'Monthly',
    goalTarget: '—',
  },
  {
    id: 'social-3',
    sectionId: 'social',
    sn: 3,
    title: 'Post Design & Publish',
    company: 'Maven',
    active: 'ON',
    status: 'In Progress',
    doer: 'Lovekush',
    deadlineDate: '—',
    workingFreq: 'Weekly',
    goalTarget: '16',
  },
  {
    id: 'social-4',
    sectionId: 'social',
    sn: 4,
    title: 'Post Design & Publish',
    company: 'MKS',
    active: 'ON',
    status: 'In Progress',
    doer: 'Lovekush',
    deadlineDate: '—',
    workingFreq: 'Weekly',
    goalTarget: '16',
  },
  {
    id: 'social-5',
    sectionId: 'social',
    sn: 5,
    title: 'Post Design & Publish',
    company: 'Savvi',
    active: 'ON',
    status: 'In Progress',
    doer: 'Lovekush',
    deadlineDate: '—',
    workingFreq: 'Weekly',
    goalTarget: '8',
  },
  {
    id: 'social-6',
    sectionId: 'social',
    sn: 6,
    title: 'Post Design & Publish',
    company: 'Profit Pathshala',
    active: 'ON',
    status: 'In Progress',
    doer: 'Lovekush',
    deadlineDate: '—',
    workingFreq: 'Weekly',
    goalTarget: '8',
  },
  {
    id: 'social-7',
    sectionId: 'social',
    sn: 7,
    title: 'Posting on FITPL (260)',
    active: 'ON',
    status: 'In Progress',
    doer: 'Lovekush',
    deadlineDate: '—',
    workingFreq: 'Daily',
    goalTarget: '150',
  },
  {
    id: 'social-8',
    sectionId: 'social',
    sn: 8,
    title: 'Social Media Engagement',
    company: 'Maven',
    active: 'OFF',
    status: 'On Hold',
    doer: 'Lovekush',
    deadlineDate: '—',
    workingFreq: 'Daily',
    goalTarget: '—',
  },

  // SEO ON PAGE
  {
    id: 'seo-on-1',
    sectionId: 'seo-on',
    sn: 1,
    title: 'Local SEO',
    company: 'Maven',
    active: 'OFF',
    status: 'On Hold',
    doer: 'Ajay',
    deadlineDate: '—',
    workingFreq: 'As Per Req',
    goalTarget: '—',
  },
  {
    id: 'seo-on-2',
    sectionId: 'seo-on',
    sn: 2,
    title: 'On Page Optimize & Blog Publish',
    company: 'MKS',
    active: 'ON',
    status: 'In Progress',
    doer: 'Ajay',
    deadlineDate: '—',
    workingFreq: 'Monthly',
    goalTarget: '1',
  },
  {
    id: 'seo-on-3',
    sectionId: 'seo-on',
    sn: 3,
    title: 'On Page Optimize & Blog Publish',
    company: 'Maven',
    active: 'OFF',
    status: 'On Hold',
    doer: 'Ajay',
    deadlineDate: '—',
    workingFreq: 'As Per Req',
    goalTarget: '—',
  },
  {
    id: 'seo-on-4',
    sectionId: 'seo-on',
    sn: 4,
    title: 'Job Listing Platform',
    company: 'Maven',
    active: 'OFF',
    status: 'On Hold',
    doer: 'Ajay',
    deadlineDate: '—',
    workingFreq: 'As Per Req',
    goalTarget: '—',
  },

  // SEO OFF PAGE
  {
    id: 'seo-off-1',
    sectionId: 'seo-off',
    sn: 1,
    title: 'Strategy Creation',
    company: 'Maven',
    active: 'ON',
    status: 'Not Started',
    doer: 'Ajay',
    deadlineDate: '—',
    workingFreq: 'Once',
    goalTarget: '—',
  },
  {
    id: 'seo-off-2',
    sectionId: 'seo-off',
    sn: 2,
    title: 'Off Page Blogs',
    company: 'MKS',
    active: 'ON',
    status: 'Not Started',
    doer: 'Ajay',
    deadlineDate: '—',
    workingFreq: 'Weekly',
    goalTarget: '8',
  },
  {
    id: 'seo-off-3',
    sectionId: 'seo-off',
    sn: 3,
    title: 'Quora & Reddit Answers',
    company: 'Maven',
    active: 'OFF',
    status: 'On Hold',
    doer: 'Ajay',
    deadlineDate: '—',
    workingFreq: 'As Per Req',
    goalTarget: '10',
  },
  {
    id: 'seo-off-4',
    sectionId: 'seo-off',
    sn: 4,
    title: 'Backlink Creation',
    company: 'Maven + MKS',
    active: 'OFF',
    status: 'On Hold',
    doer: 'Ajay',
    deadlineDate: '—',
    workingFreq: 'Daily',
    goalTarget: '150',
  },

  // CONTENT WRITING
  {
    id: 'content-1',
    sectionId: 'content',
    sn: 1,
    title: 'Blog Content Creation',
    company: 'MKS',
    active: 'ON',
    status: 'In Progress',
    doer: 'Ajay',
    deadlineDate: '—',
    workingFreq: 'As Per Req',
    goalTarget: '9',
  },
  {
    id: 'content-2',
    sectionId: 'content',
    sn: 2,
    title: 'Assign & Review Content',
    company: 'Maven',
    active: 'ON',
    status: 'Delegated',
    doer: 'Diwakar',
    deadlineDate: '—',
    workingFreq: 'As Per Req',
    goalTarget: '—',
  },
  {
    id: 'content-3',
    sectionId: 'content',
    sn: 3,
    title: 'Backlink Content (Blog Articles)',
    company: 'Maven',
    active: 'OFF',
    status: 'On Hold',
    doer: 'Ajay',
    deadlineDate: '—',
    workingFreq: 'Once',
    goalTarget: '—',
  },
]

export const teamMembers = ['Lovekush', 'Ajay', 'Diwakar', 'Bhavishya', 'Ansh', 'Sonu', 'Kirti']

export const statuses = ['In Progress', 'Not Started', 'On Hold', 'Delegated', 'Done']

// Fetch tasks from Supabase based on company, work_area, and sub_dept
export async function fetchTasks(
  company: string,
  workArea: string,
  subDept: string
): Promise<Task[]> {
  const { supabase } = await import('@/lib/supabase')

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('company', company)
    .eq('work_area', workArea)
    .eq('sub_dept', subDept)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }

  if (!data) {
    return []
  }

  // Group tasks by dm_section to calculate serial numbers
  const sectionCounts: Record<string, number> = {}
  
  return data.map((dbTask) => {
    const dmSection = dbTask.dm_section || ''
    const sectionId = dmSectionMapping[dmSection] || dmSection.toLowerCase().replace(/\s+/g, '-') || 'linkedin'
    sectionCounts[sectionId] = (sectionCounts[sectionId] || 0) + 1
    return transformDBTaskToTask(dbTask as unknown as DBTask, sectionCounts[sectionId])
  })
}

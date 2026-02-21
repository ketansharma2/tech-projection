import { type CompanySlug } from './company-config'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type ProjectionMode = 'development' | 'operations'
export type ProjectionHead = 'dm' | 'data' | 'products'
export type DMSection = 'LinkedIn' | 'Social Media' | 'SEO On Page' | 'SEO Off Page' | 'Content Writing'
export type WorkType = 'in-house' | 'outsourcing'
export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold'
export type WorkingFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'As Per Req'

export interface NewProjectionTaskInput {
  company: CompanySlug
  mode: ProjectionMode
  head: ProjectionHead
  dmSection?: DMSection
  workType: WorkType
  month: string
  title: string
  active: boolean
  status: TaskStatus
  doer: string
  deadline: string
  workingFrequency: WorkingFrequency
  goalTarget: number
  remarks: string
  links: string
}

export interface ProjectionTask {
  taskId: string
  company: CompanySlug
  mode: ProjectionMode
  head: ProjectionHead
  dmSection?: DMSection
  workType: WorkType
  month: string
  title: string
  active: boolean
  status: TaskStatus
  doer: string
  deadline: string
  workingFrequency: WorkingFrequency
  goalTarget: number
  remarks: string
  links: string
  createdAt: string
  updatedAt: string
}

export interface TaskHistoryItem {
  taskId: string
  action: string
  timestamp: string
  changedBy: string
}

// ─────────────────────────────────────────────
// Mock Local Storage Keys
// ─────────────────────────────────────────────

const PROJECTION_TASKS_KEY = 'projection_tasks'
const PROJECTION_HISTORY_KEY = 'projection_task_history'

// ─────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────

function generateTaskId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'PRJ-'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function getStoredTasks(): ProjectionTask[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(PROJECTION_TASKS_KEY)
  return stored ? JSON.parse(stored) : []
}

function setStoredTasks(tasks: ProjectionTask[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROJECTION_TASKS_KEY, JSON.stringify(tasks))
}

function getStoredHistory(): TaskHistoryItem[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(PROJECTION_HISTORY_KEY)
  return stored ? JSON.parse(stored) : []
}

function setStoredHistory(history: TaskHistoryItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROJECTION_HISTORY_KEY, JSON.stringify(history))
}

// ─────────────────────────────────────────────
// Public Functions
// ─────────────────────────────────────────────

export function loadProjectionTasks(): ProjectionTask[] {
  return getStoredTasks().sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export function loadProjectionTaskHistory(): TaskHistoryItem[] {
  return getStoredHistory().sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

export function addProjectionTask(input: NewProjectionTaskInput, changedBy: string): ProjectionTask {
  const now = new Date().toISOString()
  const task: ProjectionTask = {
    taskId: generateTaskId(),
    ...input,
    createdAt: now,
    updatedAt: now,
  }

  const tasks = getStoredTasks()
  tasks.push(task)
  setStoredTasks(tasks)

  // Add history entry
  const history = getStoredHistory()
  history.push({
    taskId: task.taskId,
    action: 'Created',
    timestamp: now,
    changedBy,
  })
  setStoredHistory(history)

  return task
}

export function updateProjectionTask(taskId: string, updates: Partial<NewProjectionTaskInput>, changedBy: string): ProjectionTask | null {
  const tasks = getStoredTasks()
  const index = tasks.findIndex(t => t.taskId === taskId)
  
  if (index === -1) return null

  const now = new Date().toISOString()
  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: now,
  }
  setStoredTasks(tasks)

  // Add history entry
  const history = getStoredHistory()
  history.push({
    taskId,
    action: 'Updated',
    timestamp: now,
    changedBy,
  })
  setStoredHistory(history)

  return tasks[index]
}

export function deleteProjectionTask(taskId: string, changedBy: string): boolean {
  const tasks = getStoredTasks()
  const filtered = tasks.filter(t => t.taskId !== taskId)
  
  if (filtered.length === tasks.length) return false

  setStoredTasks(filtered)

  // Add history entry
  const now = new Date().toISOString()
  const history = getStoredHistory()
  history.push({
    taskId,
    action: 'Deleted',
    timestamp: now,
    changedBy,
  })
  setStoredHistory(history)

  return true
}

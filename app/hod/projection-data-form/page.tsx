'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePreviewState } from '@/hooks/use-preview-state'
import { getCompanyTheme, type CompanySlug } from '@/lib/company-config'
import {
  addProjectionTask,
  loadProjectionTaskHistory,
  loadProjectionTasks,
  type DMSection,
  type NewProjectionTaskInput,
  type ProjectionHead,
  type ProjectionMode,
  type ProjectionTask,
  type TaskStatus,
  type WorkType,
  type WorkingFrequency,
} from '@/lib/mock-tasks'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const companyOptions: CompanySlug[] = ['maven', 'mks', 'savvi', 'profit-pathshala']
const headOptions: ProjectionHead[] = ['dm', 'data', 'products']
const dmSections: DMSection[] = ['Linked In', 'Social Media', 'SEO On Page', 'SEO Off Page', 'Content Writing']
const dataSections: DMSection[] = ['Data Management', 'Data Security']
const productSections: DMSection[] = ['Developing', 'Developed']
const statusOptions: TaskStatus[] = ['Not Started', 'In Progress', 'Done', 'Delegated', 'On Hold']
const frequencyOptions: WorkingFrequency[] = ['Once', 'Daily', 'Weekly', 'Monthly', 'As Per Req']

const headLabelMap: Record<ProjectionHead, string> = {
  dm: 'DM',
  data: 'Data',
  products: 'Products',
}

function getCurrentMonth() {
  const date = new Date()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}`
}

function getInitialFormState(): NewProjectionTaskInput {
  return {
    company: '' as CompanySlug,
    mode: 'development' as ProjectionMode,
    head: '' as ProjectionHead,
    dmSection: undefined,
    workType: 'in-house' as WorkType,
    month: getCurrentMonth(),
    title: '',
    active: true,
    status: '' as TaskStatus,
    doer: '',
    deadline: '',
    workingFrequency: '' as WorkingFrequency,
    goalTarget: 0,
    remarks: '',
    links: '',
  }
}

// Custom Table Components
function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">{children}</table>
    </div>
  )
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="[&_tr]:border-b">{children}</thead>
}

function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
}

function TableRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}>{children}</tr>
}

function CustomTableHead({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}>
      {children}
    </th>
  )
}

function TableCell({ children, className = '', colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={`p-2 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</td>
}

export default function ProjectionDataFormPage() {
  const { selectedUser } = usePreviewState()
  const [form, setForm] = useState<NewProjectionTaskInput>(getInitialFormState())
  const [tasks, setTasks] = useState<ProjectionTask[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [doerList, setDoerList] = useState<{id: string; name: string}[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewCompanyFilter, setPreviewCompanyFilter] = useState<'all' | CompanySlug>('all')
  const [previewHeadFilter, setPreviewHeadFilter] = useState<'all' | ProjectionHead>('all')
  const [previewMonthFilter, setPreviewMonthFilter] = useState<'all' | string>(getCurrentMonth())
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false) // Form collapsed by default

  // Mark component as mounted after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const changedBy = selectedUser?.name || 'HOD Preview'

  const loadDoers = async () => {
    try {
      const response = await fetch('/api/hod/users')
      if (response.ok) {
        const result = await response.json()
        if (result.users && Array.isArray(result.users)) {
          // Get user id and name from the users table
          const users = result.users
            .map((u: any) => ({ id: u.user_id, name: u.name }))
            .filter((u: any) => u.name)
          setDoerList(users)
        }
      }
    } catch (err) {
      console.error('Error loading doers:', err)
    }
  }

  const refreshData = async () => {
    setIsLoading(true)
    try {
      // Fetch latest 10 tasks from new API endpoint
      const response = await fetch('/api/hod/tasks/latest')
      if (response.ok) {
        const result = await response.json()
        if (result.tasks && Array.isArray(result.tasks)) {
          // Transform API tasks to ProjectionTask format
          const transformed = result.tasks.map((task: any) => ({
            taskId: task.id,
            company: (task.company || '').toLowerCase(),
            mode: task.work_area || 'development',
            head: (task.sub_dept || 'dm').toLowerCase(),
            dmSection: task.dm_section,
            workType: task.delivery_mode === 'In House' ? 'in-house' : 'outsourcing',
            month: task.month_key,
            title: task.title,
            active: task.is_active === true,
            status: task.status,
            doer: task.doer,
            deadline: task.deadline_date,
            workingFrequency: task.working_freq,
            goalTarget: parseInt(task.goal_target) || 0,
            remarks: task.remarks || '',
            links: task.links || '',
            createdAt: task.created_at,
            updatedAt: task.updated_at,
          }))
          setTasks(transformed)
        }
      }
    } catch (err) {
      console.error('Error loading tasks:', err)
    } finally {
      setIsLoading(false)
    }
    
    // Fetch history from API
    try {
      const historyResponse = await fetch('/api/hod/task-activity-logs')
      if (historyResponse.ok) {
        const historyResult = await historyResponse.json()
        if (historyResult.logs && Array.isArray(historyResult.logs)) {
          setHistory(historyResult.logs)
        }
      }
    } catch (err) {
      console.error('Error loading history:', err)
    }
    
    // Load doer list from API
    await loadDoers()
  }

  useEffect(() => {
    refreshData()
  }, [])

  const previewRows = useMemo(() => {
    return tasks
      .filter((task) => {
        // Company is uppercase in DB, filter uses lowercase
        const taskCompany = (task.company || '').toLowerCase()
        const matchesCompany = previewCompanyFilter === 'all' || taskCompany === previewCompanyFilter
        const matchesHead = previewHeadFilter === 'all' || task.head === previewHeadFilter
        const matchesMonth = previewMonthFilter === 'all' || task.month === previewMonthFilter
        return matchesCompany && matchesHead && matchesMonth
      })
      .slice(0, 10)
  }, [tasks, previewCompanyFilter, previewHeadFilter, previewMonthFilter])

  const saveTask = async (resetForNext: boolean) => {
    // Validation - check all required fields
    if (!form.company) {
      setError('Please select a Company.')
      setSuccess('')
      return
    }
    if (!form.mode) {
      setError('Please select a Work Area.')
      setSuccess('')
      return
    }
    if (!form.head) {
      setError('Please select a Head.')
      setSuccess('')
      return
    }
    if (!form.dmSection) {
      setError('Please select a Section.')
      setSuccess('')
      return
    }
    if (!form.workType) {
      setError('Please select a Delivery Mode.')
      setSuccess('')
      return
    }
    if (!form.month) {
      setError('Please select a Month.')
      setSuccess('')
      return
    }
    if (!form.title.trim()) {
      setError('Task title is required.')
      setSuccess('')
      return
    }
    if (!form.status) {
      setError('Please select a Status.')
      setSuccess('')
      return
    }
    if (!form.doer) {
      setError('Please select a Doer.')
      setSuccess('')
      return
    }
    if (!form.deadline) {
      setError('Deadline is required.')
      setSuccess('')
      return
    }
    if (!form.workingFrequency) {
      setError('Please select a Working Frequency.')
      setSuccess('')
      return
    }
    if (form.mode === 'operations') {
      setError('Operations mode is coming soon. Save tasks in Development mode for now.')
      setSuccess('')
      return
    }

    // Prepare data for API
    const taskData = {
      company: form.company.toUpperCase(),
      work_area: form.mode.toUpperCase(), // 'DEVELOPMENT' or 'OPERATIONS'
      sub_dept: form.head.toUpperCase(), // 'DM', 'DATA', or 'PRODUCTS'
      dm_section: form.dmSection,
      month_key: form.month,
      delivery_mode: form.workType === 'in-house' ? 'In House' : 'Out Sourcing',
      title: form.title,
      status: form.status,
      is_active: form.active,
      progress_percent: 0,
      deadline_date: form.deadline,
      working_freq: form.workingFrequency,
      goal_target: form.goalTarget?.toString() || '',
      remarks: form.remarks || '',
      links: form.links || '',
      assigned_to: form.doer ? doerList.find(d => d.name === form.doer)?.id : null,
    }

    try {
      const response = await fetch('/api/hod/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to save task')
        setSuccess('')
        return
      }

      setError('')
      setSuccess('Task Created Successfully!')
      refreshData()

      // Always reset the form after successful save
      setForm(getInitialFormState())
    } catch (err) {
      setError('An unexpected error occurred')
      setSuccess('')
    }
  }

  // Don't render form elements until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">Projection Data Form</h1>
          <p className="text-sm text-gray-500 mt-1">Add / update tasks for monthly projections (mock store)</p>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Projection Data Form</h1>
        <p className="text-sm text-gray-500 mt-1">Add / update tasks for monthly projections (mock store)</p>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Form Section - Collapsible */}
        <section className="rounded-xl bg-card shadow-sm overflow-hidden border border-gray-200">
          {/* Toggle Button */}
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-100 transition-colors rounded-t-xl"
            style={{ borderLeft: '4px solid #3b82f6', backgroundColor: '#f9fafb' }}
          >
            <div className="text-left">
              <h2 className="text-lg font-semibold text-foreground">Add New Task</h2>
            </div>
            <div className={`p-2 rounded-lg bg-gray-100 transition-transform ${isFormOpen ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {/* Form Content - Only visible when expanded */}
          {isFormOpen && (
          <div className="px-5 pb-5 bg-white">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Company *</label>
              <select
                value={form.company}
                onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value as CompanySlug }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select...</option>
                {companyOptions.map((company) => (
                  <option key={company} value={company}>
                    {company.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Work Area *</label>
              <select
                value={form.mode}
                onChange={(event) => setForm((prev) => ({ ...prev, mode: event.target.value as ProjectionMode }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select...</option>
                <option value="development">DEVELOPMENT</option>
                <option value="operations">OPERATIONS</option>
              </select>
              {form.mode === 'operations' ? (
                <p className="text-xs font-medium text-amber-600">Operations data entry is coming soon.</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Head *</label>
              <select
                value={form.head}
                onChange={(event) => {
                  const nextHead = event.target.value as ProjectionHead
                  setForm((prev) => ({
                    ...prev,
                    head: nextHead,
                    dmSection: undefined,
                  }))
                }}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select...</option>
                {headOptions.map((head) => (
                  <option key={head} value={head}>
                    {headLabelMap[head]}
                  </option>
                ))}
              </select>
            </div>

            {form.head === 'dm' ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Section *</label>
                <select
                  value={form.dmSection || ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, dmSection: event.target.value as DMSection }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select...</option>
                  {dmSections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </div>
            ) : form.head === 'data' ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Section *</label>
                <select
                  value={form.dmSection || ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, dmSection: event.target.value as DMSection }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select...</option>
                  {dataSections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </div>
            ) : form.head === 'products' ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Section *</label>
                <select
                  value={form.dmSection || ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, dmSection: event.target.value as DMSection }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select...</option>
                  {productSections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Section *</label>
                <select
                  value={form.dmSection || ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, dmSection: event.target.value as DMSection }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  disabled
                >
                  <option value="">Select a Head first</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Delivery Mode *</label>
              <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-100 overflow-hidden w-64">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, workType: 'in-house' }))}
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                    form.workType === 'in-house'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  In-house
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, workType: 'outsourcing' }))}
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                    form.workType === 'outsourcing'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Out Sourcing
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Month *</label>
              <Input
                type="month"
                value={form.month}
                onChange={(event) => setForm((prev) => ({ ...prev, month: event.target.value }))}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Task Title *</label>
              <Input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Enter task title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Status *</label>
              <select
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as TaskStatus }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select...</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Doer *</label>
              <select
                value={form.doer}
                onChange={(event) => setForm((prev) => ({ ...prev, doer: event.target.value }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select...</option>
                {doerList.map((member) => (
                  <option key={member.id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Deadline *</label>
              <Input
                type="date"
                value={form.deadline}
                onChange={(event) => setForm((prev) => ({ ...prev, deadline: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Working Frequency *
              </label>
              <select
                value={form.workingFrequency}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, workingFrequency: event.target.value as WorkingFrequency }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select...</option>
                {frequencyOptions.map((frequency) => (
                  <option key={frequency} value={frequency}>
                    {frequency}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Goal / Target</label>
              <Input
                type="number"
                min={0}
                value={Number.isNaN(form.goalTarget) ? '' : form.goalTarget}
                onChange={(event) => setForm((prev) => ({ ...prev, goalTarget: Number(event.target.value || 0) }))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Active</label>
              <div className="flex h-10 items-center rounded-md border border-border px-3">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
                    className="h-4 w-4 rounded border-border"
                  />
                  {form.active ? 'Active' : 'Inactive'}
                </label>
              </div>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Remarks</label>
              <textarea
                value={form.remarks}
                onChange={(event) => setForm((prev) => ({ ...prev, remarks: event.target.value }))}
                className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Add contextual notes"
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Links</label>
              <Input
                value={form.links}
                onChange={(event) => setForm((prev) => ({ ...prev, links: event.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button onClick={() => saveTask(false)}>
              Save Task
            </Button>
            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            {success ? <p className="text-sm font-medium text-emerald-700">{success}</p> : null}
          </div>
          </div>
          )}
        </section>

        {/* Preview Section */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Latest Saved Tasks</h2>
              <p className="text-sm text-muted-foreground">Preview of last 10 entries.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={previewCompanyFilter}
                onChange={(event) => setPreviewCompanyFilter(event.target.value as 'all' | CompanySlug)}
                className="h-9 rounded-md border border-input bg-background px-2.5 text-xs"
              >
                <option value="all">All Companies</option>
                {companyOptions.map((company) => (
                  <option key={company} value={company}>
                    {company.toUpperCase()}
                  </option>
                ))}
              </select>
              <select
                value={previewHeadFilter}
                onChange={(event) => setPreviewHeadFilter(event.target.value as 'all' | ProjectionHead)}
                className="h-9 rounded-md border border-input bg-background px-2.5 text-xs"
              >
                <option value="all">All Heads</option>
                {headOptions.map((head) => (
                  <option key={head} value={head}>
                    {headLabelMap[head]}
                  </option>
                ))}
              </select>
              <Input
                type="month"
                value={previewMonthFilter === 'all' ? '' : previewMonthFilter}
                onChange={(event) => setPreviewMonthFilter(event.target.value || 'all')}
                className="h-9 w-[155px] text-xs"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <CustomTableHead className="text-xs font-semibold uppercase tracking-[0.08em]">Task</CustomTableHead>
                <CustomTableHead className="text-xs font-semibold uppercase tracking-[0.08em]">Company</CustomTableHead>
                <CustomTableHead className="text-xs font-semibold uppercase tracking-[0.08em]">Head</CustomTableHead>
                <CustomTableHead className="text-xs font-semibold uppercase tracking-[0.08em]">Month</CustomTableHead>
                <CustomTableHead className="text-xs font-semibold uppercase tracking-[0.08em]">Status</CustomTableHead>
                <CustomTableHead className="text-xs font-semibold uppercase tracking-[0.08em]">Doer</CustomTableHead>
                <CustomTableHead className="text-xs font-semibold uppercase tracking-[0.08em]">Created At</CustomTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    No saved tasks for selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                previewRows.map((task) => (
                  <TableRow key={task.taskId}>
                    <TableCell>
                      <p className="font-medium text-foreground">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.taskId}</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{ backgroundColor: getCompanyTheme(task.company).primaryColor }}
                        className="text-white text-xs font-medium text-center"
                      >
                        {getCompanyTheme(task.company).name.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {headLabelMap[task.head]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{task.month}</TableCell>
                    <TableCell className="text-sm">{task.status}</TableCell>
                    <TableCell className="text-sm">{task.doer}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(task.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </section>

        {/* History Section */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">History Log</h2>
          <p className="mt-1 text-sm text-muted-foreground">Task activity from database.</p>
          
          <div className="mt-4 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <CustomTableHead className="text-xs font-semibold uppercase tracking-[0.08em]">Task Title</CustomTableHead>
                  <CustomTableHead className="text-xs font-semibold uppercase tracking-[0.08em]">Action Type</CustomTableHead>
                  <CustomTableHead className="text-xs font-semibold uppercase tracking-[0.08em]">Edited By</CustomTableHead>
                  <CustomTableHead className="text-xs font-semibold uppercase tracking-[0.08em]">Activity Time</CustomTableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.slice(0, 8).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                      No history events yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  history.slice(0, 8).map((item: any) => (
                    <TableRow key={item.id || `${item.task_id}-${item.created_at}`}>
                      <TableCell className="text-sm font-medium">
                        {item.task_title || 'Unknown Task'}
                      </TableCell>
                      <TableCell className="text-sm">
                        <Badge variant="outline" className="text-xs">
                          {item.action_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{item.edited_by_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  )
}

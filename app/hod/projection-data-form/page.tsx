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
  type TaskHistoryItem,
  type TaskStatus,
  type WorkType,
  type WorkingFrequency,
} from '@/lib/mock-tasks'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const companyOptions: CompanySlug[] = ['maven', 'mks', 'savvi', 'profit-pathshala']
const headOptions: ProjectionHead[] = ['dm', 'data', 'products']
const dmSections: DMSection[] = ['LinkedIn', 'Social Media', 'SEO On Page', 'SEO Off Page', 'Content Writing']
const statusOptions: TaskStatus[] = ['Not Started', 'In Progress', 'Completed', 'On Hold']
const frequencyOptions: WorkingFrequency[] = ['Daily', 'Weekly', 'Monthly', 'As Per Req']
const doerOptions = ['Lovekush', 'Ajay', 'Ansh', 'Sonu', 'Bhavishya', 'Kirti']

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
    company: 'maven',
    mode: 'development',
    head: 'dm',
    dmSection: 'LinkedIn',
    workType: 'in-house',
    month: getCurrentMonth(),
    title: '',
    active: true,
    status: 'Not Started',
    doer: doerOptions[0],
    deadline: '',
    workingFrequency: 'Weekly',
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
  const [history, setHistory] = useState<TaskHistoryItem[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewCompanyFilter, setPreviewCompanyFilter] = useState<'all' | CompanySlug>('all')
  const [previewHeadFilter, setPreviewHeadFilter] = useState<'all' | ProjectionHead>('all')
  const [previewMonthFilter, setPreviewMonthFilter] = useState<'all' | string>('all')

  const changedBy = selectedUser?.name || 'HOD Preview'

  const refreshData = () => {
    setTasks(loadProjectionTasks())
    setHistory(loadProjectionTaskHistory())
  }

  useEffect(() => {
    refreshData()
  }, [])

  const previewRows = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesCompany = previewCompanyFilter === 'all' || task.company === previewCompanyFilter
        const matchesHead = previewHeadFilter === 'all' || task.head === previewHeadFilter
        const matchesMonth = previewMonthFilter === 'all' || task.month === previewMonthFilter
        return matchesCompany && matchesHead && matchesMonth
      })
      .slice(0, 10)
  }, [tasks, previewCompanyFilter, previewHeadFilter, previewMonthFilter])

  const saveTask = (resetForNext: boolean) => {
    if (!form.title.trim() || !form.deadline) {
      setError('Task title and deadline are required.')
      setSuccess('')
      return
    }
    if (form.mode === 'operations') {
      setError('Operations mode is coming soon. Save tasks in Development mode for now.')
      setSuccess('')
      return
    }
    if (form.head === 'dm' && !form.dmSection) {
      setError('DM Section is required for DM head.')
      setSuccess('')
      return
    }

    addProjectionTask(form, changedBy)
    refreshData()
    setError('')
    setSuccess('Task saved to mock local store.')

    if (resetForNext) {
      setForm((prev) => ({
        ...getInitialFormState(),
        company: prev.company,
        mode: prev.mode,
        head: prev.head,
        dmSection: prev.head === 'dm' ? prev.dmSection || 'LinkedIn' : undefined,
        month: prev.month,
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Projection Data Form</h1>
        <p className="text-sm text-gray-500 mt-1">Add / update tasks for monthly projections (mock store)</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Form Section */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Company *</label>
              <select
                value={form.company}
                onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value as CompanySlug }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {companyOptions.map((company) => (
                  <option key={company} value={company}>
                    {getCompanyTheme(company).switcherName || getCompanyTheme(company).name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Mode *</label>
              <select
                value={form.mode}
                onChange={(event) => setForm((prev) => ({ ...prev, mode: event.target.value as ProjectionMode }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="development">Development</option>
                <option value="operations">Operations</option>
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
                    dmSection: nextHead === 'dm' ? prev.dmSection || 'LinkedIn' : undefined,
                  }))
                }}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {headOptions.map((head) => (
                  <option key={head} value={head}>
                    {headLabelMap[head]}
                  </option>
                ))}
              </select>
            </div>

            {form.head === 'dm' ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">DM Section *</label>
                <select
                  value={form.dmSection || 'LinkedIn'}
                  onChange={(event) => setForm((prev) => ({ ...prev, dmSection: event.target.value as DMSection }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {dmSections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">DM Section</label>
                <div className="flex h-10 items-center rounded-md border border-dashed border-border px-3 text-sm text-muted-foreground">
                  Not applicable for this head
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Work Type *</label>
              <div className="inline-flex rounded-lg border border-[var(--brand-border)] bg-muted/35 p-1">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, workType: 'in-house' }))}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    form.workType === 'in-house'
                      ? 'bg-[var(--brand)] text-[var(--brand-foreground)]'
                      : 'text-muted-foreground'
                  }`}
                >
                  In-house
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, workType: 'outsourcing' }))}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    form.workType === 'outsourcing'
                      ? 'bg-[var(--brand)] text-[var(--brand-foreground)]'
                      : 'text-muted-foreground'
                  }`}
                >
                  Outsourcing
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
                {doerOptions.map((member) => (
                  <option key={member} value={member}>
                    {member}
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
                Working Frequency
              </label>
              <select
                value={form.workingFrequency}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, workingFrequency: event.target.value as WorkingFrequency }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
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
            <Button variant="outline" onClick={() => saveTask(true)}>
              Save & Add Another
            </Button>
            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            {success ? <p className="text-sm font-medium text-emerald-700">{success}</p> : null}
          </div>
        </section>

        {/* Preview Section */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Latest Saved Tasks</h2>
              <p className="text-sm text-muted-foreground">Preview of last 10 entries from local mock store.</p>
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
                    {getCompanyTheme(company).switcherName || getCompanyTheme(company).name}
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
                <CustomTableHead className="text-xs font-semibold uppercase tracking-[0.08em]">Updated</CustomTableHead>
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
                    <TableCell className="text-sm">
                      {getCompanyTheme(task.company).switcherName || getCompanyTheme(task.company).name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {headLabelMap[task.head]}
                        </Badge>
                        {task.head === 'dm' && task.dmSection ? (
                          <Badge variant="outline" className="text-xs">
                            {task.dmSection}
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{task.month}</TableCell>
                    <TableCell className="text-sm">{task.status}</TableCell>
                    <TableCell className="text-sm">{task.doer}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(task.updatedAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </section>

        {/* History Section */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">History Log (Mock)</h2>
          <p className="mt-1 text-sm text-muted-foreground">Task actions recorded in localStorage.</p>
          <div className="mt-4 space-y-2">
            {history.slice(0, 8).map((item) => (
              <div key={`${item.taskId}-${item.timestamp}`} className="rounded-md border border-border px-3 py-2 text-sm">
                <span className="font-medium text-foreground">{item.taskId}</span>
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-foreground">{item.action}</span>
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</span>
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-muted-foreground">{item.changedBy}</span>
              </div>
            ))}
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No history events yet.</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}

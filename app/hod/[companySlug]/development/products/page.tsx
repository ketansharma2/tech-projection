'use client'

import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'next/navigation'
import TitleBlock from '@/components/title-block'
import FiltersRow from '@/components/filters-row'
import SectionAccordion from '@/components/section-accordion'
import HodTaskTable from '@/components/hod-task-table'
import PrintHeader from '@/components/print-header'
import { type Task } from '@/lib/tasks-data'

const sections = [
  { id: 'developing', title: 'Developing' },
  { id: 'developed', title: 'Developed' },
]

export default function HodProductsPage() {
  const params = useParams()
  const companySlug = params?.companySlug as string
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedDoer, setSelectedDoer] = useState<string | null>(null)
  const [activeOnly, setActiveOnly] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [customDateStart, setCustomDateStart] = useState('')
  const [customDateEnd, setCustomDateEnd] = useState('')
  const [isInHouse, setIsInHouse] = useState(true)
  const [expandedSectionIds, setExpandedSectionIds] = useState<string[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [doers, setDoers] = useState<string[]>([])
  const [printDateTime, setPrintDateTime] = useState('')

  useEffect(() => {
    async function loadTasks() {
      if (companySlug) {
        setLoading(true)
        
        const params = new URLSearchParams({
          company: companySlug,
          month: selectedMonth,
        })
        
        try {
          const response = await fetch(`/api/hod/development/products?${params.toString()}`)
          const data = await response.json()
          
          if (data.tasks) {
            setTasks(data.tasks)
          }
        } catch (error) {
          console.error('Error fetching tasks:', error)
        }
        
        setLoading(false)
      }
    }
    loadTasks()
  }, [companySlug, selectedMonth])

  // Fetch users for doer filter
  useEffect(() => {
    async function loadDoers() {
      try {
        const response = await fetch('/api/users')
        const data = await response.json()
        
        if (data.userNames) {
          setDoers(data.userNames)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    loadDoers()
  }, [])

  // Set print date time on client side
  useEffect(() => {
    setPrintDateTime(new Date().toLocaleString('en-GB'))
  }, [])

  const tasksSource = tasks

  const filteredTasks = useMemo(() => {
    return tasksSource.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.company?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

      const matchesStatus = !selectedStatus || task.status === selectedStatus
      const matchesDoer = !selectedDoer || task.doer === selectedDoer
      const matchesActive = !activeOnly || task.active === 'ON'
      
      const taskDeliveryMode = task.deliveryMode || 'In House'
      const matchesToggle = isInHouse 
        ? taskDeliveryMode === 'In House' 
        : taskDeliveryMode === 'Out Sourcing'

      return matchesSearch && matchesStatus && matchesDoer && matchesActive && matchesToggle
    })
  }, [searchQuery, selectedStatus, selectedDoer, activeOnly, isInHouse, tasksSource])

  const productsStats = useMemo(() => {
    const activeCount = filteredTasks.filter((t) => t.active === 'ON').length
    const onHoldCount = filteredTasks.filter((t) => t.status === 'On Hold').length
    const inProgressCount = filteredTasks.filter((t) => t.status === 'In Progress').length

    return {
      total: filteredTasks.length,
      active: activeCount,
      onHold: onHoldCount,
      inProgress: inProgressCount,
    }
  }, [filteredTasks])

  // Separate stats for In House and Out Sourcing (for print - always fixed)
  const inHouseStats = useMemo(() => {
    const inHouseTasks = tasksSource.filter((t) => t.deliveryMode === 'In House' || !t.deliveryMode)
    return {
      total: inHouseTasks.length,
      active: inHouseTasks.filter((t) => t.active === 'ON').length,
      onHold: inHouseTasks.filter((t) => t.status === 'On Hold').length,
      inProgress: inHouseTasks.filter((t) => t.status === 'In Progress').length,
    }
  }, [tasksSource])

  const outSourceStats = useMemo(() => {
    const outSourceTasks = tasksSource.filter((t) => t.deliveryMode === 'Out Sourcing')
    return {
      total: outSourceTasks.length,
      active: outSourceTasks.filter((t) => t.active === 'ON').length,
      onHold: outSourceTasks.filter((t) => t.status === 'On Hold').length,
      inProgress: outSourceTasks.filter((t) => t.status === 'In Progress').length,
    }
  }, [tasksSource])

  const handleSectionNavigate = (sectionId: string) => {
    // Close all sections and open only the clicked one
    setExpandedSectionIds([sectionId])
    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TitleBlock title="Products - HOD View" />

        {/* Print Header - Only visible during print */}
        <PrintHeader 
          title="Products" 
          reportMonth={selectedMonth ? new Date(selectedMonth + '-01').toLocaleString('en-GB', { month: 'long', year: 'numeric' }) : undefined} 
        />

        {/* Print-only In House Container */}
        <div className="hidden Print-in-house-container mb-6" style={{ maxWidth: '100%', width: '100%' }}>
          {/* In House Section */}
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">In House</h2>
          <div className="space-y-4" style={{ padding: '16px' }}>
            {/* Stats Cards - In House specific */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#dbeafe', border: '1px solid #93c5fd', textAlign: 'center' }}>
                <p style={{ fontSize: '9px', fontWeight: 600, color: '#1e40af', textTransform: 'uppercase', marginBottom: '2px' }}>Total Tasks</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#1e3a8a' }}>{inHouseStats.total}</p>
              </div>
              <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#d1fae5', border: '1px solid #6ee7b7', textAlign: 'center' }}>
                <p style={{ fontSize: '9px', fontWeight: 600, color: '#065f46', textTransform: 'uppercase', marginBottom: '2px' }}>Active</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#064e3b' }}>{inHouseStats.active}</p>
              </div>
              <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#ffedd5', border: '1px solid #fdba74', textAlign: 'center' }}>
                <p style={{ fontSize: '9px', fontWeight: 600, color: '#9a3412', textTransform: 'uppercase', marginBottom: '2px' }}>On Hold</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#7c2d12' }}>{inHouseStats.onHold}</p>
              </div>
              <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#cffafe', border: '1px solid #67e8f9', textAlign: 'center' }}>
                <p style={{ fontSize: '9px', fontWeight: 600, color: '#0e7490', textTransform: 'uppercase', marginBottom: '2px' }}>In Progress</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#164e63' }}>{inHouseStats.inProgress}</p>
              </div>
            </div>
            {sections.map((section) => {
              const sectionTasks = tasksSource.filter((t) => t.sectionId === section.id && (t.deliveryMode === 'In House' || !t.deliveryMode))
              // Show all sections in In House - show No Activity Found in header if empty
              return (
                <div key={section.id} style={{ marginBottom: '16px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  {/* Section Header */}
                  <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #3b82f6', backgroundColor: '#f9fafb' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a8a' }}>{section.title}</h3>
                    {sectionTasks.length === 0 && (
                      <span style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '14px' }}>No Activity Found!</span>
                    )}
                  </div>
                  {/* Table - only show if there are tasks */}
                  {sectionTasks.length > 0 && (
                    <div style={{ borderTop: '1px solid #e5e7eb' }}>
                      <table className="w-full text-sm" style={{ display: 'table', width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, fontSize: '9px', color: '#374151', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Sn</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, fontSize: '9px', color: '#374151', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Project Title</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, fontSize: '9px', color: '#374151', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Doer</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, fontSize: '9px', color: '#374151', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Status</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, fontSize: '9px', color: '#374151', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Deadline</th>
                            <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, fontSize: '9px', color: '#374151', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Working Freq</th>
                            <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, fontSize: '9px', color: '#374151', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Goal</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, fontSize: '9px', color: '#374151', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Progress</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, fontSize: '9px', color: '#374151', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sectionTasks.map((task, idx) => {
                            const isActive = task.active === 'ON';
                            const textColor = isActive ? '#000000' : '#6b7280';
                            const statusColors: Record<string, { bg: string; text: string }> = {
                              'In Progress': { bg: '#dbeafe', text: '#1e40af' },
                              'Not Started': { bg: '#f3f4f6', text: '#1f2937' },
                              'On Hold': { bg: '#ffedd5', text: '#9a3412' },
                              'Delegated': { bg: '#fee2e2', text: '#991b1b' },
                              'Done': { bg: '#d1fae5', text: '#065f46' },
                            };
                            const statusStyle = statusColors[task.status] || { bg: '#f3f4f6', text: '#1f2937' };
                            return (
                              <tr key={task.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '8px', color: textColor, fontWeight: 500, fontSize: '10px', whiteSpace: 'nowrap' }}>{idx + 1}</td>
                                <td style={{ padding: '8px', color: textColor, fontWeight: 500, fontSize: '10px' }}>{task.title}</td>
                                <td style={{ padding: '8px', color: textColor, fontSize: '10px' }}>{task.doer || '—'}</td>
                                <td style={{ padding: '8px' }}>
                                  <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '9999px', fontSize: '9px', fontWeight: 600, backgroundColor: statusStyle.bg, color: statusStyle.text, whiteSpace: 'nowrap' }}>
                                    {task.status}
                                  </span>
                                </td>
                                <td style={{ padding: '8px', color: textColor, fontSize: '10px', whiteSpace: 'nowrap' }}>{task.deadlineDate}</td>
                                <td style={{ padding: '8px', textAlign: 'center' }}>
                                  <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '9999px', fontSize: '9px', fontWeight: 600, backgroundColor: '#f3e8ff', color: '#6b21a8', whiteSpace: 'nowrap' }}>
                                    {task.workingFreq}
                                  </span>
                                </td>
                                <td style={{ padding: '8px', textAlign: 'center', color: textColor, fontSize: '10px', whiteSpace: 'nowrap' }}>{task.goalTarget}</td>
                                <td style={{ padding: '8px', color: textColor, fontSize: '10px', whiteSpace: 'nowrap' }}>{task.progressPercent || 0}%</td>
                                <td style={{ padding: '8px', color: textColor, fontSize: '10px' }}>{task.remarks || '—'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Out Sourcing Section */}
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center mt-2">Out Sourcing</h2>
          <div className="space-y-4" style={{ padding: '16px' }}>
            {/* Stats Cards - Out Sourcing specific - only show if there are tasks */}
            {outSourceStats.total > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#ede9fe', border: '1px solid #a78bfa', textAlign: 'center' }}>
                <p style={{ fontSize: '9px', fontWeight: 600, color: '#5b21b6', textTransform: 'uppercase', marginBottom: '2px' }}>Total Tasks</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#4c1d95' }}>{outSourceStats.total}</p>
              </div>
              <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#d1fae5', border: '1px solid #6ee7b7', textAlign: 'center' }}>
                <p style={{ fontSize: '9px', fontWeight: 600, color: '#065f46', textTransform: 'uppercase', marginBottom: '2px' }}>Active</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#064e3b' }}>{outSourceStats.active}</p>
              </div>
              <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#ffedd5', border: '1px solid #fdba74', textAlign: 'center' }}>
                <p style={{ fontSize: '9px', fontWeight: 600, color: '#9a3412', textTransform: 'uppercase', marginBottom: '2px' }}>On Hold</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#7c2d12' }}>{outSourceStats.onHold}</p>
              </div>
              <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#cffafe', border: '1px solid #67e8f9', textAlign: 'center' }}>
                <p style={{ fontSize: '9px', fontWeight: 600, color: '#0e7490', textTransform: 'uppercase', marginBottom: '2px' }}>In Progress</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#164e63' }}>{outSourceStats.inProgress}</p>
              </div>
            </div>
            )}
            {sections.map((section) => {
              const sectionTasks = tasksSource.filter((t) => t.sectionId === section.id && t.deliveryMode === 'Out Sourcing')
              if (sectionTasks.length === 0) return null
              return (
                <div key={section.id + '-outsourcing'} style={{ marginBottom: '16px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  {/* Section Header */}
                  <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #8b5cf6', backgroundColor: '#f9fafb' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6d28d9' }}>{section.title}</h3>
                  </div>
                  {/* Table with Doer column */}
                  {sectionTasks.length > 0 && (
                    <div style={{ borderTop: '1px solid #e5e7eb' }}>
                      <table className="w-full text-sm" style={{ display: 'table', width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, fontSize: '9px', color: '#374151', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Sn</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, fontSize: '9px', color: '#374151', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Project Title</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, fontSize: '9px', color: '#374151', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Doer</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, fontSize: '9px', color: '#374151', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Status</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, fontSize: '9px', color: '#374151', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Deadline</th>
                            <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, fontSize: '9px', color: '#374151', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Working Freq</th>
                            <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, fontSize: '9px', color: '#374151', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Goal</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, fontSize: '9px', color: '#374151', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Progress</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, fontSize: '9px', color: '#374151', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sectionTasks.map((task, idx) => {
                            const isActive = task.active === 'ON';
                            const textColor = isActive ? '#000000' : '#6b7280';
                            const statusColors: Record<string, { bg: string; text: string }> = {
                              'In Progress': { bg: '#dbeafe', text: '#1e40af' },
                              'Not Started': { bg: '#f3f4f6', text: '#1f2937' },
                              'On Hold': { bg: '#ffedd5', text: '#9a3412' },
                              'Delegated': { bg: '#fee2e2', text: '#991b1b' },
                              'Done': { bg: '#d1fae5', text: '#065f46' },
                            };
                            const statusStyle = statusColors[task.status] || { bg: '#f3f4f6', text: '#1f2937' };
                            return (
                              <tr key={task.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '8px', color: textColor, fontWeight: 500, fontSize: '10px', whiteSpace: 'nowrap' }}>{idx + 1}</td>
                                <td style={{ padding: '8px', color: textColor, fontWeight: 500, fontSize: '10px' }}>{task.title}</td>
                                <td style={{ padding: '8px', color: textColor, fontSize: '10px' }}>{task.doer || '—'}</td>
                                <td style={{ padding: '8px' }}>
                                  <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '9999px', fontSize: '9px', fontWeight: 600, backgroundColor: statusStyle.bg, color: statusStyle.text, whiteSpace: 'nowrap' }}>
                                    {task.status}
                                  </span>
                                </td>
                                <td style={{ padding: '8px', color: textColor, fontSize: '10px', whiteSpace: 'nowrap' }}>{task.deadlineDate}</td>
                                <td style={{ padding: '8px', textAlign: 'center' }}>
                                  <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '9999px', fontSize: '9px', fontWeight: 600, backgroundColor: '#f3e8ff', color: '#6b21a8', whiteSpace: 'nowrap' }}>
                                    {task.workingFreq}
                                  </span>
                                </td>
                                <td style={{ padding: '8px', textAlign: 'center', color: textColor, fontSize: '10px', whiteSpace: 'nowrap' }}>{task.goalTarget}</td>
                                <td style={{ padding: '8px', color: textColor, fontSize: '10px', whiteSpace: 'nowrap' }}>{task.progressPercent || 0}%</td>
                                <td style={{ padding: '8px', color: textColor, fontSize: '10px' }}>{task.remarks || '—'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
            {/* Show No Activity Found if no outsourcing tasks */}
            {tasksSource.filter((t) => t.deliveryMode === 'Out Sourcing').length === 0 && (
              <p style={{ textAlign: 'center', color: '#6b7280', fontStyle: 'italic', padding: '20px' }}>No Activity Found!</p>
            )}
          </div>
          {/* Print footer with date */}
          <div style={{ textAlign: 'right', marginTop: '16px', fontSize: '9px', color: '#6b7280' }}>
            Printed on: {printDateTime}
          </div>
        </div>

        <div className="sticky top-16 bg-background z-40 py-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 border-b border-border no-print">
          <FiltersRow
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedDoer={selectedDoer}
            onDoerChange={setSelectedDoer}
            doers={doers}
            activeOnly={activeOnly}
            onActiveOnlyChange={setActiveOnly}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 mt-3 no-print">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            <button
              onClick={() => setIsInHouse(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isInHouse
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              In-House
            </button>
            <button
              onClick={() => setIsInHouse(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                !isInHouse
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Out Sourcing
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionNavigate(section.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                  expandedSectionIds.includes(section.id)
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 no-print">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-5 hover:shadow-sm hover:scale-105 transition-all duration-200">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2 uppercase tracking-wider">Total Tasks</p>
            <p className="text-3xl font-black text-blue-900 dark:text-blue-100">{productsStats.total}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-5 hover:shadow-sm hover:scale-105 transition-all duration-200">
            <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-2 uppercase tracking-wider">Active</p>
            <p className="text-3xl font-black text-green-900 dark:text-green-100">{productsStats.active}</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-5 hover:shadow-sm hover:scale-105 transition-all duration-200">
            <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-2 uppercase tracking-wider">On Hold</p>
            <p className="text-3xl font-black text-orange-900 dark:text-orange-100">{productsStats.onHold}</p>
          </div>
          <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900 rounded-lg p-5 hover:shadow-sm hover:scale-105 transition-all duration-200">
            <p className="text-xs font-medium text-cyan-700 dark:text-cyan-300 mb-2 uppercase tracking-wider">In Progress</p>
            <p className="text-3xl font-black text-cyan-900 dark:text-cyan-100">{productsStats.inProgress}</p>
          </div>
        </div>

        <div className="space-y-4 no-print">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            sections.map((section) => (
              <div key={section.id} id={section.id}>
                <SectionAccordion
                  section={section}
                  tasks={filteredTasks.filter((t) => t.sectionId === section.id)}
                  isExpanded={expandedSectionIds.includes(section.id)}
                  onToggle={(isOpen) => {
                    setExpandedSectionIds(prev => {
                      if (isOpen) {
                        return [...prev, section.id]
                      } else {
                        return prev.filter(id => id !== section.id)
                      }
                    })
                  }}
                  tableComponent={HodTaskTable}
                  showDoers={false}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}

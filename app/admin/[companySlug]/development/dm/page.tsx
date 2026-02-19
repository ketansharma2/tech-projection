'use client'

import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'next/navigation'
import TitleBlock from '@/components/title-block'
import FiltersRow from '@/components/filters-row'
import SectionAccordion from '@/components/section-accordion'
import { type Task } from '@/lib/tasks-data'

const sections = [
  { id: 'linkedin', title: 'LinkedIn' },
  { id: 'social', title: 'Social Media' },
  { id: 'seo-on', title: 'SEO On Page' },
  { id: 'seo-off', title: 'SEO Off Page' },
  { id: 'content', title: 'Content Writing' },
]

export default function AdminDMPage() {
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
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch tasks from Admin API (all tasks)
  useEffect(() => {
    async function loadTasks() {
      if (companySlug) {
        setLoading(true)
        
        // Build API URL with query params
        const params = new URLSearchParams({
          company: companySlug,
          work_area: 'DEVELOPMENT',
          sub_dept: 'DM',
        })
        
        try {
          const response = await fetch(`/api/admin/tasks?${params.toString()}`)
          const data = await response.json()
          
          if (data.tasks) {
            setTasks(data.tasks)
          } else if (data.error) {
            console.error('API error:', data.error)
          }
        } catch (error) {
          console.error('Error fetching tasks:', error)
        }
        
        setLoading(false)
      }
    }
    loadTasks()
  }, [companySlug])

  const tasksSource = tasks

  const filteredTasks = useMemo(() => {
    return tasksSource.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.company?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

      const matchesStatus = !selectedStatus || task.status === selectedStatus
      const matchesDoer = !selectedDoer || task.doer === selectedDoer
      const matchesActive = !activeOnly || task.active === 'ON'
      
      // Filter by delivery_mode (In House vs Outsourcing)
      const taskDeliveryMode = task.deliveryMode || 'In House'
      const matchesToggle = isInHouse 
        ? taskDeliveryMode === 'In House' 
        : taskDeliveryMode === 'Out Sourcing'

      return matchesSearch && matchesStatus && matchesDoer && matchesActive && matchesToggle
    })
  }, [searchQuery, selectedStatus, selectedDoer, activeOnly, isInHouse, tasksSource])

  const dmStats = useMemo(() => {
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

  const handleSectionNavigate = (sectionId: string) => {
    setExpandedSectionId(sectionId)
    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TitleBlock title="Digital Marketing - Admin View" />

        {/* Sticky Filters */}
        <div className="sticky top-16 bg-background z-40 py-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 border-b border-border">
          <FiltersRow
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedDoer={selectedDoer}
            onDoerChange={setSelectedDoer}
            activeOnly={activeOnly}
            onActiveOnlyChange={setActiveOnly}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            customDateStart={customDateStart}
            onCustomDateStartChange={setCustomDateStart}
            customDateEnd={customDateEnd}
            onCustomDateEndChange={setCustomDateEnd}
          />
        </div>

        {/* In-House vs Outsourcing Toggle + Section Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          {/* In-House vs Outsourcing Toggle */}
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
              Outsourcing
            </button>
          </div>

          {/* Section Navigation Chips */}
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionNavigate(section.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                  expandedSectionId === section.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* DM Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-5 hover:shadow-sm hover:scale-105 transition-all duration-200">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2 uppercase tracking-wider">Total Tasks</p>
            <p className="text-3xl font-black text-blue-900 dark:text-blue-100">{dmStats.total}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-5 hover:shadow-sm hover:scale-105 transition-all duration-200">
            <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-2 uppercase tracking-wider">Active</p>
            <p className="text-3xl font-black text-green-900 dark:text-green-100">{dmStats.active}</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-5 hover:shadow-sm hover:scale-105 transition-all duration-200">
            <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-2 uppercase tracking-wider">On Hold</p>
            <p className="text-3xl font-black text-orange-900 dark:text-orange-100">{dmStats.onHold}</p>
          </div>
          <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900 rounded-lg p-5 hover:shadow-sm hover:scale-105 transition-all duration-200">
            <p className="text-xs font-medium text-cyan-700 dark:text-cyan-300 mb-2 uppercase tracking-wider">In Progress</p>
            <p className="text-3xl font-black text-cyan-900 dark:text-cyan-100">{dmStats.inProgress}</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">No tasks found</p>
              <p className="text-sm">There are no tasks matching the current filters.</p>
            </div>
          ) : (
            sections.map((section) => (
              <div key={section.id} id={section.id}>
                <SectionAccordion
                  section={section}
                  tasks={filteredTasks.filter((t) => t.sectionId === section.id)}
                  isExpanded={expandedSectionId === section.id}
                  onToggle={(isOpen) => {
                    if (isOpen) {
                      setExpandedSectionId(section.id)
                    } else {
                      setExpandedSectionId(null)
                    }
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}

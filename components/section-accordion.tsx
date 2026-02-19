'use client'

import React, { useState, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import TaskTable from './task-table'
import { Task } from '@/lib/tasks-data'

interface SectionProps {
  section: {
    id: string
    title: string
  }
  tasks: Task[]
  isExpanded?: boolean
  onToggle?: (isOpen: boolean) => void
  tableComponent?: React.FC<{ tasks: Task[] }>
  showDoers?: boolean
}

export default function SectionAccordion({ section, tasks, isExpanded: controlledExpanded, onToggle, tableComponent, showDoers = true }: SectionProps) {
  const [isOpen, setIsOpen] = useState(true)
  const actualIsOpen = controlledExpanded !== undefined ? controlledExpanded : isOpen

  const handleToggle = () => {
    const newState = !actualIsOpen
    if (onToggle) {
      onToggle(newState)
    } else {
      setIsOpen(newState)
    }
  }

  const stats = useMemo(() => {
    const activeCount = tasks.filter((t) => t.active === 'ON').length
    const onHoldCount = tasks.filter((t) => t.status === 'On Hold').length
    const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length

    return {
      total: tasks.length,
      active: activeCount,
      onHold: onHoldCount,
      inProgress: inProgressCount,
    }
  }, [tasks])

  const doers = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.doer))).sort()
  }, [tasks])

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-950 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Section Header with Metrics */}
      <button
        onClick={handleToggle}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200 group border-l-4 border-l-blue-500"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 group-hover:text-blue-700 dark:group-hover:text-blue-200 transition-colors">{section.title}</h3>
          
          {/* Doer Chips */}
          {showDoers && (
            <div className="hidden sm:flex flex-wrap gap-1.5">
              {doers.map((doer) => (
                <span
                  key={doer}
                  className="px-2.5 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 rounded-full"
                >
                  {doer}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 ml-4">
          {/* Metrics inline */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-normal text-gray-600 dark:text-gray-400 whitespace-nowrap">
            <span>Total <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.total}</span></span>
            <span className="text-gray-300">•</span>
            <span>Active <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.active}</span></span>
            <span className="text-gray-300">•</span>
            <span>On Hold <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.onHold}</span></span>
            <span className="text-gray-300">•</span>
            <span>In Progress <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.inProgress}</span></span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-all duration-200 flex-shrink-0 ${
              actualIsOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Section Content */}
      {actualIsOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 animate-in fade-in duration-200">
          {/* Table */}
          {tableComponent ? (
            React.createElement(tableComponent, { tasks })
          ) : (
            <TaskTable tasks={tasks} />
          )}
        </div>
      )}
    </div>
  )
}

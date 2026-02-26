'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { teamMembers, statuses } from '@/lib/tasks-data'

interface FiltersRowProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedStatus: string | null
  onStatusChange: (status: string | null) => void
  selectedDoer?: string | null
  onDoerChange?: (doer: string | null) => void
  doers?: string[]
  activeOnly: boolean
  onActiveOnlyChange: (active: boolean) => void
  selectedMonth?: string
  onMonthChange?: (month: string) => void
  selectedDate?: string | null
  onDateChange?: (date: string | null) => void
  customDateStart?: string
  onCustomDateStartChange?: (date: string) => void
  customDateEnd?: string
  onCustomDateEndChange?: (date: string) => void
}

export default function FiltersRow({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedDoer,
  onDoerChange,
  doers,
  activeOnly,
  onActiveOnlyChange,
  selectedMonth,
  onMonthChange,
}: FiltersRowProps) {
  const [statusOpen, setStatusOpen] = useState(false)
  const [doerOpen, setDoerOpen] = useState(false)
  const [monthOpen, setMonthOpen] = useState(false)
  const statusRef = useRef<HTMLDivElement>(null)
  const doerRef = useRef<HTMLDivElement>(null)
  const monthRef = useRef<HTMLDivElement>(null)

  // Generate months on client only to avoid hydration mismatch
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      return { monthKey, label }
    })
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false)
      }
      if (doerRef.current && !doerRef.current.contains(e.target as Node)) {
        setDoerOpen(false)
      }
      if (monthRef.current && !monthRef.current.contains(e.target as Node)) {
        setMonthOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search Input */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search task title"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-all"
        />
      </div>

      {/* Status Dropdown */}
      <div className="relative" ref={statusRef}>
        <button
          onClick={() => setStatusOpen(!statusOpen)}
          className={`w-full sm:w-auto px-4 py-2.5 text-sm border rounded-lg transition-colors flex items-center justify-between gap-2 ${
            selectedStatus
              ? 'bg-blue-900 text-white border-blue-900 hover:bg-blue-800'
              : 'bg-white text-gray-900 border-gray-200 hover:border-blue-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <span>{selectedStatus || 'Status'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${statusOpen ? 'rotate-180' : ''}`} />
        </button>

        {statusOpen && (
          <div className="absolute top-full mt-2 left-0 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
            <button
              onClick={() => {
                onStatusChange(null)
                setStatusOpen(false)
              }}
              className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors first:rounded-t-lg"
            >
              All Statuses
            </button>
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => {
                  onStatusChange(status)
                  setStatusOpen(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  selectedStatus === status
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Doer Dropdown - only show if doer props are provided */}
      {selectedDoer !== undefined && onDoerChange && (
        <div className="relative" ref={doerRef}>
          <button
            onClick={() => setDoerOpen(!doerOpen)}
            className={`w-full sm:w-auto px-4 py-2.5 text-sm border rounded-lg transition-colors flex items-center justify-between gap-2 ${
              selectedDoer
                ? 'bg-blue-900 text-white border-blue-900 hover:bg-blue-800'
                : 'bg-white text-gray-900 border-gray-200 hover:border-blue-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <span>{selectedDoer || 'Doer'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${doerOpen ? 'rotate-180' : ''}`} />
          </button>

          {doerOpen && (
            <div className="absolute top-full mt-2 left-0 w-48 bg-card border border-border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
              <button
                onClick={() => {
                  onDoerChange(null)
                  setDoerOpen(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors first:rounded-t-lg"
              >
                All Doers
              </button>
              {doers ? doers.map((doer) => (
                <button
                  key={doer}
                  onClick={() => {
                    onDoerChange(doer)
                    setDoerOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    selectedDoer === doer
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  {doer}
                </button>
              )) : teamMembers.map((doer) => (
                <button
                  key={doer}
                  onClick={() => {
                    onDoerChange(doer)
                    setDoerOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    selectedDoer === doer
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  {doer}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Month/Year Dropdown - only show if month props are provided */}
      {selectedMonth !== undefined && onMonthChange && (
        <div className="relative" ref={monthRef}>
          <button
            onClick={() => setMonthOpen(!monthOpen)}
            className={`w-full sm:w-auto px-4 py-2.5 text-sm border rounded-lg transition-colors flex items-center justify-between gap-2 ${
              selectedMonth
                ? 'bg-blue-900 text-white border-blue-900 hover:bg-blue-800'
                : 'bg-white text-gray-900 border-gray-200 hover:border-blue-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <span>{selectedMonth || 'Month'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${monthOpen ? 'rotate-180' : ''}`} />
          </button>

          {monthOpen && (
            <div className="absolute top-full mt-2 left-0 w-48 bg-card border border-border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
              {monthOptions.map((option) => (
                <button
                  key={option.monthKey}
                  onClick={() => {
                    onMonthChange(option.monthKey)
                    setMonthOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    selectedMonth === option.monthKey
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Only Toggle */}
      <button
        onClick={() => onActiveOnlyChange(!activeOnly)}
        className={`px-4 py-2.5 text-sm border rounded-lg transition-colors ${
          activeOnly
            ? 'bg-blue-900 text-white border-blue-900 hover:bg-blue-800'
            : 'bg-white text-gray-900 border-gray-200 hover:border-blue-300'
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
      >
        Active only
      </button>
    </div>
  )
}

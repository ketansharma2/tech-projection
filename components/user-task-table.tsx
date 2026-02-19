'use client'

import { useState, useEffect } from 'react'
import { Task, parseLinks } from '@/lib/tasks-data'

interface UserTaskTableProps {
  tasks: Task[]
  onTaskUpdate?: (updatedTask: Task) => void
}

const statusOptions = ['In Progress', 'Not Started', 'On Hold', 'Delegated', 'Done']

const getStatusColor = (status: string, isActive: boolean) => {
  // If inactive, return gray styling
  if (!isActive) {
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
  
  switch (status) {
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'Not Started':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    case 'On Hold':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    case 'Delegated':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'Done':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

interface EditValues {
  status: string
  progress_percent: number
  remarks: string
  links: { name: string; url: string }[]
}

export default function UserTaskTable({ tasks: initialTasks, onTaskUpdate }: UserTaskTableProps) {
  const [showAll, setShowAll] = useState(false)
  const [tasks, setTasks] = useState(initialTasks)
  const displayTasks = showAll ? tasks : tasks.slice(0, 10)
  const hasMore = tasks.length > 10

  // Sync tasks when initialTasks prop changes
  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])
  
  // Edit state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<EditValues>({
    status: '',
    progress_percent: 0,
    remarks: '',
    links: [],
  })
  const [isSaving, setIsSaving] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null)

  const handleEditClick = (task: Task) => {
    const parsedLinks = parseLinks(task.links)
    setEditingTaskId(task.id)
    setEditValues({
      status: task.status,
      progress_percent: task.progressPercent || 0,
      remarks: task.remarks || '',
      links: parsedLinks.length > 0 ? parsedLinks : [{ name: '', url: '' }],
    })
  }

  const handleCancelClick = () => {
    setEditingTaskId(null)
    setEditValues({
      status: '',
      progress_percent: 0,
      remarks: '',
      links: [],
    })
  }

  const handleSaveClick = async () => {
    if (!editingTaskId) return
    
    setIsSaving(true)
    try {
      const response = await fetch(`/api/user/tasks/${editingTaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: editValues.status,
          progress_percent: editValues.progress_percent,
          remarks: editValues.remarks,
          links: editValues.links.filter(l => l.url.trim()),
        }),
      })
      
      if (response.ok) {
        // Update local state immediately
        setTasks(prevTasks => prevTasks.map(task => 
          task.id === editingTaskId 
            ? {
                ...task,
                status: editValues.status as Task['status'],
                progressPercent: editValues.progress_percent,
                remarks: editValues.remarks,
                links: JSON.stringify(editValues.links.filter(l => l.url.trim())),
              }
            : task
        ))
        
        // Update local state if callback provided
        if (onTaskUpdate) {
          const updatedTask = tasks.find(t => t.id === editingTaskId)
          if (updatedTask) {
            onTaskUpdate({
              ...updatedTask,
              status: editValues.status as Task['status'],
              progressPercent: editValues.progress_percent,
              remarks: editValues.remarks,
              links: JSON.stringify(editValues.links.filter(l => l.url.trim())),
            })
          }
        }
        handleCancelClick()
      } else {
        console.error('Failed to update task')
      }
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const isEditing = (taskId: string) => editingTaskId === taskId

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider w-12">
                Sn
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Project/Task Title
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Deadline Date
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Working Freq
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Goal/Target
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Progress %
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Remarks
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Links
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Edit
              </th>
            </tr>
          </thead>
          <tbody>
            {displayTasks.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-muted-foreground text-sm">
                  No tasks found
                </td>
              </tr>
            ) : (
              displayTasks.map((task, index) => (
                <tr
                  key={task.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors bg-white dark:bg-gray-950"
                >
                  <td className="px-2 py-3 text-sm font-medium w-12 align-middle">
                    <span className={task.active === 'ON' ? 'text-black dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}>
                      {task.sn}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm leading-relaxed align-middle">
                    <span className={`font-medium ${task.active === 'ON' ? 'text-black dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                      {task.title}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm align-middle">
                    {isEditing(task.id) ? (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setStatusDropdownOpen(statusDropdownOpen === task.id ? null : task.id)}
                          className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full justify-between min-w-[140px] hover:border-blue-400 dark:hover:border-blue-500 transition-colors shadow-sm"
                        >
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(editValues.status, task.active === 'ON')}`}>
                            {editValues.status}
                          </span>
                          <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {statusDropdownOpen === task.id && (
                          <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl">
                            {statusOptions.map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  setEditValues({ ...editValues, status: option })
                                  setStatusDropdownOpen(null)
                                }}
                                className={`w-full text-left px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                                  editValues.status === option ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                              >
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(option, task.active === 'ON')}`}>
                                  {option}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status, task.active === 'ON')}`}>
                        {task.status}
                      </span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-sm align-middle ${task.active === 'ON' ? 'text-black dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{task.deadlineDate}</td>
                  <td className={`px-4 py-3 text-sm text-center align-middle ${task.active === 'ON' ? 'text-black dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${task.active === 'ON' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {task.workingFreq}
                      </span>
                    </td>
                  <td className={`px-4 py-3 text-sm text-center align-middle ${task.active === 'ON' ? 'text-black dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{task.goalTarget}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200 align-middle">
                    {isEditing(task.id) ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editValues.progress_percent}
                          onChange={(e) => setEditValues({ ...editValues, progress_percent: parseInt(e.target.value) || 0 })}
                          className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs w-16 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                        <span className="text-xs">%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className={`w-14 rounded-full h-2 ${task.active === 'ON' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-300 dark:bg-gray-600'}`}>
                          <div 
                            className={`h-2 rounded-full ${task.active === 'ON' ? 'bg-blue-600' : 'bg-gray-500'}`} 
                            style={{ width: `${task.progressPercent || 0}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs ${task.active === 'ON' ? 'text-black dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{task.progressPercent || 0}%</span>
                      </div>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-sm align-middle ${task.active === 'ON' ? 'text-black dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                    {isEditing(task.id) ? (
                      <input
                        type="text"
                        value={editValues.remarks}
                        onChange={(e) => setEditValues({ ...editValues, remarks: e.target.value })}
                        placeholder="Enter remarks"
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    ) : (
                      task.remarks || '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400 align-middle">
                    {isEditing(task.id) ? (
                      <div className="space-y-1">
                        {editValues.links.map((link, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <input
                              type="text"
                              value={link.name}
                              onChange={(e) => {
                                const newLinks = [...editValues.links]
                                newLinks[idx] = { ...newLinks[idx], name: e.target.value }
                                setEditValues({ ...editValues, links: newLinks })
                              }}
                              placeholder="Name"
                              className="border border-gray-300 dark:border-gray-600 rounded px-1 py-1 text-xs w-16 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => {
                                const newLinks = [...editValues.links]
                                newLinks[idx] = { ...newLinks[idx], url: e.target.value }
                                setEditValues({ ...editValues, links: newLinks })
                              }}
                              placeholder="https://..."
                              className="border border-gray-300 dark:border-gray-600 rounded px-1 py-1 text-xs w-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newLinks = editValues.links.filter((_, i) => i !== idx)
                                setEditValues({ ...editValues, links: newLinks })
                              }}
                              className="text-red-500 hover:text-red-700 text-xs"
                              title="Remove"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setEditValues({ ...editValues, links: [...editValues.links, { name: '', url: '' }] })
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 text-xs font-medium"
                        >
                          + Add Link
                        </button>
                      </div>
                    ) : (
                      parseLinks(task.links).length > 0 ? (
                        <div className="flex items-center gap-1">
                          {parseLinks(task.links).map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200"
                              title={link.name || link.url}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            </a>
                          ))}
                        </div>
                      ) : (
                        '—'
                      )
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm align-middle text-center">
                    {isEditing(task.id) ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={handleCancelClick}
                          disabled={isSaving}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 font-medium disabled:opacity-50"
                          title="Cancel"
                        >
                          ✕
                        </button>
                        <button
                          onClick={handleSaveClick}
                          disabled={isSaving}
                          className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-200 font-medium disabled:opacity-50"
                          title="Save"
                        >
                          {isSaving ? '...' : '✓'}
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleEditClick(task)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 font-medium"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View More Button */}
      {hasMore && !showAll && (
        <div className="hidden sm:flex justify-center py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20">
          <button
            onClick={() => setShowAll(true)}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 transition-colors"
          >
            View more ({tasks.length - 10} more tasks)
          </button>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3 px-4 py-4">
        {displayTasks.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">No tasks found</p>
        ) : (
          displayTasks.map((task) => (
            <div key={task.id} className="bg-background border border-border rounded-lg p-4 space-y-3">
              <div>
                <p className={`font-semibold text-sm ${task.active === 'ON' ? 'text-black dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>{task.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusColor(task.status, task.active === 'ON')}`}>
                    {task.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Freq</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${task.active === 'ON' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {task.workingFreq}
                  </span>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Goal</p>
                  <p className={`font-medium mt-1 ${task.active === 'ON' ? 'text-black dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>{task.goalTarget}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Deadline</p>
                  <p className={`font-medium mt-1 ${task.active === 'ON' ? 'text-black dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>{task.deadlineDate}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Progress</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`w-12 rounded-full h-1.5 ${task.active === 'ON' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-300 dark:bg-gray-600'}`}>
                      <div 
                        className={`h-1.5 rounded-full ${task.active === 'ON' ? 'bg-blue-600' : 'bg-gray-500'}`} 
                        style={{ width: `${task.progressPercent || 0}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs ${task.active === 'ON' ? 'text-black dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{task.progressPercent || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Mobile View More Button */}
        {hasMore && !showAll && (
          <div className="flex justify-center py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20">
            <button
              onClick={() => setShowAll(true)}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 transition-colors"
            >
              View more ({tasks.length - 10} more tasks)
            </button>
          </div>
        )}
      </div>
    </>
  )
}

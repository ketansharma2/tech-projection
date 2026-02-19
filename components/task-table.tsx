'use client'

import { useState } from 'react'
import { Task } from '@/lib/tasks-data'

interface TaskTableProps {
  tasks: Task[]
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'Not Started':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    case 'On Hold':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    case 'Delegated':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function TaskTable({ tasks }: TaskTableProps) {
  const [showAll, setShowAll] = useState(false)
  const displayTasks = showAll ? tasks : tasks.slice(0, 10)
  const hasMore = tasks.length > 10

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Sn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Project/Task Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Active
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Doer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Deadline Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Working Freq
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Goal/Target
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Progress %
              </th>
            </tr>
          </thead>
          <tbody>
            {displayTasks.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground text-sm">
                  No tasks found
                </td>
              </tr>
            ) : (
              displayTasks.map((task, index) => (
                <tr
                  key={task.id}
                  className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50 dark:bg-gray-900/20'
                  }`}
                >
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200 font-medium">{task.sn}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200 leading-relaxed">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{task.title}</span>
                      {task.company && (
                        <span className="inline-block bg-muted text-muted-foreground px-2 py-1 rounded text-xs font-medium">
                          {task.company}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                      {task.active}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm">
                    <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">{task.doer}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">{task.deadlineDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">{task.workingFreq}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200 text-right">{task.goalTarget}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${task.progressPercent || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{task.progressPercent || 0}%</span>
                    </div>
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
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{task.title}</p>
                {task.company && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 inline-block bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {task.company}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Active</p>
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 mt-1">
                    {task.active}
                  </span>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Doer</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium mt-1">{task.doer}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Freq</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium mt-1">{task.workingFreq}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Goal</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium mt-1">{task.goalTarget}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Deadline</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium mt-1">{task.deadlineDate}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Progress</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${task.progressPercent || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs">{task.progressPercent || 0}%</span>
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

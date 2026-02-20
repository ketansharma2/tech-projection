import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface RouteParams {
  params: Promise<{
    taskId: string
  }>
}

// Helper function to get only changed fields
function getChangedFields(oldData: Record<string, unknown>, newData: Record<string, unknown>): { old: Record<string, unknown> | null, new: Record<string, unknown> | null } {
  const changedOld: Record<string, unknown> = {}
  const changedNew: Record<string, unknown> = {}
  
  for (const key of Object.keys(newData)) {
    if (key === 'updated_at' || key === 'user_id' || key === 'edited_by_user_id') continue
    
    let oldValue = oldData?.[key]
    let newValue = newData[key]
    
    // Parse JSON strings for comparison (handles links field)
    if (typeof oldValue === 'string' && oldValue.startsWith('[')) {
      try { oldValue = JSON.parse(oldValue) } catch {}
    }
    if (typeof newValue === 'string' && newValue.startsWith('[')) {
      try { newValue = JSON.parse(newValue) } catch {}
    }
    
    // Check if value changed
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changedOld[key] = oldValue ?? null
      changedNew[key] = newValue ?? null
    }
  }
  
  return {
    old: Object.keys(changedOld).length > 0 ? changedOld : null,
    new: Object.keys(changedNew).length > 0 ? changedNew : null
  }
}

// Helper function to log task activity
async function logTaskActivity(
  taskId: string,
  editedByUserId: string,
  actionType: 'Edit' | 'Delete',
  oldData: Record<string, unknown> | null,
  newData: Record<string, unknown> | null
) {
  const { error } = await supabase
    .from('task_activity_log')
    .insert({
      task_id: taskId,
      edited_by_user_id: editedByUserId,
      action_type: actionType,
      old_data: oldData,
      new_data: newData
    })

  if (error) {
    console.error('Error logging task activity:', error)
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { taskId } = await params
  
  try {
    const body = await request.json()
    const {
      user_id, // Also accept user_id from frontend
      edited_by_user_id,
      title,
      doer_id,
      status,
      deadline_date,
      working_freq,
      goal_target,
      progress_percent,
      remarks,
      links,
    } = body

    // Build update object
    const updateData: Record<string, unknown> = {}
    
    if (title !== undefined) updateData.title = title
    if (doer_id !== undefined) updateData.assigned_to = doer_id
    if (status !== undefined) updateData.status = status
    if (deadline_date !== undefined) updateData.deadline_date = deadline_date
    if (working_freq !== undefined) updateData.working_freq = working_freq
    if (goal_target !== undefined) updateData.goal_target = goal_target
    if (progress_percent !== undefined) updateData.progress_percent = progress_percent
    if (remarks !== undefined) updateData.remarks = remarks
    if (links !== undefined) updateData.links = JSON.stringify(links)
    
    updateData.updated_at = new Date().toISOString()

    // Use either user_id or edited_by_user_id
    const userId = user_id || edited_by_user_id

    // Get old task data before update
    const { data: oldTask } = await supabase
      .from('tasks')
      .select('*')
      .eq('task_id', taskId)
      .single()

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('task_id', taskId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log activity if user_id provided
    if (userId && oldTask) {
      // Get only the changed fields
      const { old: changedOld, new: changedNew } = getChangedFields(oldTask, updateData)
      
      await logTaskActivity(
        taskId,
        userId,
        'Edit',
        changedOld,
        changedNew
      )
    }

    return NextResponse.json({ success: true, task: data })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { taskId } = await params
  
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('task_id', taskId)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ task: data })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { taskId } = await params
  
  try {
    // Get old task data before delete
    const { data: oldTask } = await supabase
      .from('tasks')
      .select('*')
      .eq('task_id', taskId)
      .single()

    // Get user_id from request body (accept both user_id and edited_by_user_id)
    const body = await request.json().catch(() => ({}))
    const editedByUserId = body.user_id || body.edited_by_user_id

    const { error } = await supabase
      .from('tasks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('task_id', taskId)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log activity if user_id provided
    if (editedByUserId) {
      await logTaskActivity(
        taskId,
        editedByUserId,
        'Delete',
        oldTask || null,
        null
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}

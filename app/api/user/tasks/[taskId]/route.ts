import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize admin client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// PUT - Update a specific task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    // Create Supabase client with service role key for server-side operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { taskId } = await params
    
    const body = await request.json()
    const { status, progress_percent, remarks, links } = body
    
    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    
    if (status !== undefined) {
      updateData.status = status
    }
    
    if (progress_percent !== undefined) {
      updateData.progress_percent = progress_percent
    }
    
    if (remarks !== undefined) {
      updateData.remarks = remarks
    }
    
    if (links !== undefined) {
      // If links is a string (JSON stringified), parse it; otherwise use as-is
      // This handles both string and object formats
      try {
        const parsedLinks = typeof links === 'string' ? JSON.parse(links) : links
        updateData.links = parsedLinks
      } catch (e) {
        // If parsing fails, store as string
        updateData.links = links
      }
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('task_id', taskId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating task:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ task: data, message: 'Task updated successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

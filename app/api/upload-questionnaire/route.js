import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { parseFile } from '@/lib/parsing'

export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const userIdHeader = request.headers.get('X-User-Id')
    
    console.log('Auth header:', authHeader ? 'present' : 'missing')
    console.log('User ID header:', userIdHeader)

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized - no token' }, { status: 401 })
    }

    if (!userIdHeader) {
      return NextResponse.json({ error: 'Unauthorized - no user ID' }, { status: 401 })
    }

    const userId = userIdHeader

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('Uploading questionnaire:', file.name, 'for user:', userId)
    const fileContent = await parseFile(file)

    const { data, error } = await supabaseAdmin
      .from('questionnaires')
      .insert([
        {
          user_id: userId,
          file_name: file.name,
          content: fileContent,
          created_at: new Date(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to upload: ' + error.message }, { status: 500 })
    }

    console.log('Questionnaire uploaded successfully:', data.id)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed: ' + error.message },
      { status: 500 }
    )
  }
}

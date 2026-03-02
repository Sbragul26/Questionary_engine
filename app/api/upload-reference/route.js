import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import { parseFile } from '@/lib/parsing'

export async function POST(request) {
  try {
    const userId = verifyToken(request).userId
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileContent = await parseFile(file)

    const { data, error } = await supabaseAdmin
      .from('reference_documents')
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
      return NextResponse.json({ error: 'Failed to upload' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}

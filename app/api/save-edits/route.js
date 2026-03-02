import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'

export async function POST(request) {
  try {
    const userId = verifyToken(request).userId
    const { answerId, updates } = await request.json()

    // Get current answers
    const { data: current, error: fetchError } = await supabaseAdmin
      .from('generated_answers')
      .select('*')
      .eq('id', answerId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !current) {
      return NextResponse.json(
        { error: 'Answer record not found' },
        { status: 404 }
      )
    }

    // Update answers
    const updatedAnswers = current.answers_json.map((answer, index) => {
      if (updates[index]) {
        return { ...answer, ...updates[index], edited: true }
      }
      return answer
    })

    // Save to edit history
    await supabaseAdmin
      .from('answer_edit_history')
      .insert([
        {
          answer_id: answerId,
          previous_answers: current.answers_json,
          updated_at: new Date(),
        },
      ])

    // Update answers
    const { data, error } = await supabaseAdmin
      .from('generated_answers')
      .update({
        answers_json: updatedAnswers,
        updated_at: new Date(),
      })
      .eq('id', answerId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to save edits' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Save edits error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

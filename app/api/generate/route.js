import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import { extractQuestions, searchRelevantChunks } from '@/lib/rag'
import { generateAnswer, calculateConfidenceScore } from '@/lib/openai'

export async function POST(request) {
  try {
    const userId = verifyToken(request).userId
    const { questionnaireId } = await request.json()

    // Get questionnaire
    const { data: questionnaire, error: qError } = await supabaseAdmin
      .from('questionnaires')
      .select('*')
      .eq('id', questionnaireId)
      .eq('user_id', userId)
      .single()

    if (qError || !questionnaire) {
      return NextResponse.json(
        { error: 'Questionnaire not found' },
        { status: 404 }
      )
    }

    // Get reference documents
    const { data: refDocs, error: rError } = await supabaseAdmin
      .from('reference_documents')
      .select('*')
      .eq('user_id', userId)

    if (rError || !refDocs || refDocs.length === 0) {
      return NextResponse.json(
        { error: 'No reference documents found' },
        { status: 400 }
      )
    }

    // Extract questions
    const questions = extractQuestions(questionnaire.content)

    // Generate answers for each question
    const answers = []

    for (const question of questions) {
      try {
        // Search for relevant chunks
        const relevantChunks = searchRelevantChunks(question, refDocs, 3)

        let answer = 'Not found in references.'
        let citations = []
        let confidenceScore = { level: 'Low', score: 0.1 }

        if (relevantChunks.length > 0 && relevantChunks[0].similarity > 0.1) {
          answer = await generateAnswer(question, relevantChunks)
          citations = relevantChunks.map((chunk) => ({
            documentName: chunk.documentName,
            similarity: chunk.similarity,
          }))
          confidenceScore = calculateConfidenceScore(relevantChunks)
        }

        answers.push({
          question,
          answer,
          citations,
          confidenceScore,
          relevantChunks,
        })
      } catch (qError) {
        console.error(`Error processing question "${question}":`, qError)
        answers.push({
          question,
          answer: 'Error generating answer',
          citations: [],
          confidenceScore: { level: 'Low', score: 0 },
        })
      }
    }

    // Save answers
    const { data: answerResult, error: saveError } = await supabaseAdmin
      .from('generated_answers')
      .insert([
        {
          user_id: userId,
          questionnaire_id: questionnaireId,
          answers_json: answers,
          created_at: new Date(),
        },
      ])
      .select()
      .single()

    if (saveError) {
      return NextResponse.json({ error: 'Failed to save answers' }, { status: 500 })
    }

    return NextResponse.json({
      id: answerResult.id,
      answers,
      totalQuestions: questions.length,
      answeredWithCitation: answers.filter((a) => a.citations.length > 0).length,
      notFound: answers.filter((a) => a.answer === 'Not found in references.').length,
    })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    )
  }
}

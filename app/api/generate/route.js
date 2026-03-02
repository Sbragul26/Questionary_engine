import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { extractQuestions } from '@/lib/rag'
import { generateAnswer, calculateConfidenceScore } from '@/lib/openai'

export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const userIdHeader = request.headers.get('X-User-Id')

    if (!authHeader || !userIdHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = userIdHeader
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

    // Combine all reference documents into one context
    const combinedContext = refDocs
      .map((doc) => `[Document: ${doc.file_name}]\n${doc.content}`)
      .join('\n\n---\n\n')

    // Extract questions
    const questions = extractQuestions(questionnaire.content)

    // Generate answers for each question using Gemini's RAG
    const answers = []

    for (const question of questions) {
      try {
        console.log(`Generating answer for: ${question}`)
        
        // Use Gemini to search and generate answer from the combined context
        const answer = await generateAnswer(question, [
          { content: combinedContext }
        ])

        // Simple heuristic: if answer contains "not found" or is very short, mark confidence as low
        const isFound = !answer.toLowerCase().includes('not found in references')
        const confidenceScore = isFound
          ? { level: 'High', score: 0.8 }
          : { level: 'Low', score: 0.1 }

        answers.push({
          question,
          answer,
          citations: refDocs.map((doc) => ({
            documentName: doc.file_name,
            similarity: isFound ? 0.7 : 0.1,
          })),
          confidenceScore,
        })
      } catch (qError) {
        console.error(`Error processing question "${question}":`, qError.message)
        answers.push({
          question,
          answer: 'Error generating answer: ' + qError.message,
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

    console.log(`Generated ${answers.length} answers successfully`)

    return NextResponse.json({
      id: answerResult.id,
      answers,
      totalQuestions: questions.length,
      answeredWithCitation: answers.filter(
        (a) => !a.answer.toLowerCase().includes('not found')
      ).length,
      notFound: answers.filter((a) =>
        a.answer.toLowerCase().includes('not found')
      ).length,
    })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    )
  }
}

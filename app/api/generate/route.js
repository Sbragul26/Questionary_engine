import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { extractQuestions, searchRelevantChunks } from '@/lib/rag'
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

    // Extract questions from questionnaire
    const questions = extractQuestions(questionnaire.content)

    // Generate answers for each question using RAG pipeline
    const answers = []

    for (const question of questions) {
      try {
        console.log(`Generating answer for: ${question}`)
        
        // Search for relevant chunks from reference documents using RAG
        const relevantChunks = searchRelevantChunks(question, refDocs, 3)

        // Generate answer from relevant chunks
        const answer = await generateAnswer(question, relevantChunks)

        // Calculate confidence score based on found chunks
        const confidenceScore = calculateConfidenceScore(relevantChunks)

        // Check if answer was found (not marked as "not found")
        const isFound = !answer.toLowerCase().includes('not found in the provided')
          && !answer.toLowerCase().includes('not found in references')
          && !answer.toLowerCase().includes('information is not available')
          && answer.length > 20

        answers.push({
          question,
          answer,
          citations: relevantChunks.map((chunk) => ({
            documentName: chunk.documentName,
            similarity: chunk.similarity,
          })),
          confidenceScore: isFound ? confidenceScore : { level: 'Low', score: 0.2 },
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

    // DO NOT save to database - return fresh answers immediately
    // This ensures answers reflect current questionnaire and references
    console.log(`Generated ${answers.length} answers successfully`)

    return NextResponse.json({
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      answers,
      totalQuestions: questions.length,
      answeredWithCitation: answers.filter(
        (a) => a.answer && a.answer.length > 20 
          && !a.answer.toLowerCase().includes('error')
          && !a.answer.toLowerCase().includes('not found')
      ).length,
      notFound: answers.filter((a) =>
        !a.answer || a.answer.length < 20
        || a.answer.toLowerCase().includes('not found')
        || a.answer.toLowerCase().includes('information is not available')
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

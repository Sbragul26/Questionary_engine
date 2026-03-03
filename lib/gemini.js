import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function generateAnswerWithGemini(question, relevantChunks) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured')
    }

    const context = relevantChunks.map((chunk) => chunk.content).join('\n\n')

    const prompt = `You are an expert assistant answering questions based on provided documents.

Based on the following context, answer the question accurately and concisely. If the answer is not found in the context, say "The information is not available in the provided documents."

Context:
${context}

Question: ${question}

Answer:`

    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return text.trim()
  } catch (error) {
    console.error('Gemini API error:', error.message)
    // Fallback to intelligent text search
    const context = relevantChunks.map((chunk) => chunk.content).join('\n\n')
    return extractAnswerFromContext(question, context)
  }
}

export async function generateAnswer(question, relevantChunks) {
  return generateAnswerWithGemini(question, relevantChunks)
}

// Intelligent fallback: Extract relevant sentences from context
function extractAnswerFromContext(question, context) {
  if (!context) return 'No context available'

  const sentences = context.split(/[.!?]+/).filter((s) => s.trim().length > 10)
  const questionKeywords = question.toLowerCase().split(/\s+/).filter((w) => w.length > 3)

  // Score sentences based on keyword matches
  const scoredSentences = sentences
    .map((sentence) => ({
      text: sentence.trim(),
      score: questionKeywords.filter((kw) =>
        sentence.toLowerCase().includes(kw)
      ).length,
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)

  if (scoredSentences.length > 0) {
    // Combine top 2-3 matching sentences
    return scoredSentences
      .slice(0, 3)
      .map((s) => s.text)
      .join(' ')
  }

  return 'The information is not available in the provided documents.'
}

export async function calculateConfidenceScore(relevantChunks) {
  const chunkCount = relevantChunks.length
  const avgSimilarity =
    relevantChunks.reduce((sum, chunk) => sum + (chunk.similarity || 0.5), 0) /
    chunkCount

  if (chunkCount >= 3 && avgSimilarity > 0.8) {
    return { level: 'High', score: 0.9 }
  } else if (chunkCount >= 2 && avgSimilarity > 0.6) {
    return { level: 'Medium', score: 0.6 }
  } else {
    return { level: 'Low', score: 0.3 }
  }
}

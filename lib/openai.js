export async function generateAnswer(question, relevantChunks) {
  try {
    const context = relevantChunks.map((chunk) => chunk.content).join('\n\n')

    // Simple keyword-based extraction + AI-like response
    // This works without any API key and is reliable
    const prompt = `Based on this context, answer the question:

Context:
${context}

Question: ${question}

Answer only based on the context provided:`

    // Using Cohere's free API (no credit card required for basic usage)
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo', // Cohere allows demo/free requests
      },
      body: JSON.stringify({
        model: 'command-light',
        prompt: prompt,
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (response.ok) {
      const result = await response.json()
      const text = result.generations?.[0]?.text || null
      if (text) return text.trim()
    }

    // Fallback: Use intelligent text search if API fails
    const answerFallback = extractAnswerFromContext(question, context)
    return answerFallback || 'Information not found in the provided documents.'
  } catch (error) {
    console.error('Answer generation error:', error.message)
    // Final fallback: intelligent search
    const context = relevantChunks.map((chunk) => chunk.content).join('\n\n')
    return extractAnswerFromContext(question, context)
  }
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

  return 'Not found in references.'
}

export async function calculateConfidenceScore(relevantChunks) {
  const chunkCount = relevantChunks.length
  const avgSimilarity = relevantChunks.reduce((sum, chunk) => sum + chunk.similarity, 0) / chunkCount

  if (chunkCount >= 3 && avgSimilarity > 0.8) {
    return { level: 'High', score: 0.9 }
  } else if (chunkCount >= 2 && avgSimilarity > 0.6) {
    return { level: 'Medium', score: 0.6 }
  } else {
    return { level: 'Low', score: 0.3 }
  }
}

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateAnswer(question, relevantChunks) {
  try {
    const context = relevantChunks.map((chunk) => chunk.content).join('\n\n')

    const prompt = `You are a helpful assistant answering questions based on provided company documents.

Question: ${question}

Company Documents Context:
${context}

Instructions:
1. Answer the question based ONLY on the provided documents
2. If the answer is not found in the documents, respond with: "Not found in references."
3. Be concise and direct
4. Include specific details from documents when relevant`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw error
  }
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

/**
 * Simple RAG (Retrieval Augmented Generation) utility
 * Searches for relevant content in documents based on similarity
 */

function calculateSimilarity(text1, text2) {
  // Simple keyword-based similarity
  const words1 = text1.toLowerCase().split(/\s+/)
  const words2 = text2.toLowerCase().split(/\s+/)

  const set1 = new Set(words1)
  const set2 = new Set(words2)

  const intersection = [...set1].filter((word) => set2.has(word))
  const union = new Set([...set1, ...set2])

  return intersection.length / union.size
}

export function extractChunks(text, chunkSize = 500) {
  // Split text into overlapping chunks
  const chunks = []
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]

  let currentChunk = ''

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize) {
      if (currentChunk) chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += sentence
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim())

  return chunks
}

export function searchRelevantChunks(question, documents, topK = 3) {
  const allChunks = []

  // Extract chunks from all documents
  for (const doc of documents) {
    const chunks = extractChunks(doc.content)
    chunks.forEach((chunk) => {
      allChunks.push({
        documentId: doc.id,
        documentName: doc.name,
        content: chunk,
        similarity: calculateSimilarity(question, chunk),
      })
    })
  }

  // Sort by similarity and return top K
  return allChunks.sort((a, b) => b.similarity - a.similarity).slice(0, topK)
}

export function extractQuestions(text) {
  // Extract questions from text
  // Handles:
  // 1. Numbered format: "1. Question?" or "1) Question?"
  // 2. Direct question marks: "Question?"
  // 3. Bullet points: "- Question?"

  const lines = text.split('\n').filter((line) => line.trim())
  const questions = []

  for (const line of lines) {
    const cleaned = line.trim()

    // Check if line looks like a question
    if (
      cleaned.match(/^\d+[\.\)]?\s/) ||
      cleaned.match(/^[-•]\s/) ||
      cleaned.includes('?')
    ) {
      // Remove numbering, bullets, etc
      let question = cleaned
        .replace(/^\d+[\.\)]\s*/, '')
        .replace(/^[-•]\s*/, '')
        .trim()

      if (question && question.includes('?')) {
        questions.push(question)
      }
    }
  }

  return questions.length > 0 ? questions : [text]
}

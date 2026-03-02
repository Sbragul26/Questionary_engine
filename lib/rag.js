/**
 * Simple RAG (Retrieval Augmented Generation) utility
 * Searches for relevant content in documents based on similarity
 */

function calculateSimilarity(text1, text2) {
  // Improved similarity using multiple strategies
  
  // Extract key terms (remove common words)
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
    'of', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'must', 'can', 'your', 'my', 'our', 'their', 'this', 'that', 'these',
    'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
    'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both'
  ])
  
  const text1Lower = text1.toLowerCase()
  const text2Lower = text2.toLowerCase()
  
  // Strategy 1: Exact substring match
  if (text2Lower.includes(text1Lower.split(/\s+/)[0])) {
    return 0.8
  }
  
  // Strategy 2: Word overlap with keyword filtering
  const words1 = text1Lower
    .split(/\s+/)
    .filter(w => w.length > 2 && !commonWords.has(w))
  const words2 = text2Lower
    .split(/\s+/)
    .filter(w => w.length > 2 && !commonWords.has(w))

  if (words1.length === 0 || words2.length === 0) return 0.1

  const set1 = new Set(words1)
  const set2 = new Set(words2)

  const intersection = [...set1].filter((word) => set2.has(word))
  const union = new Set([...set1, ...set2])

  const jaccardSimilarity = intersection.length / union.size
  
  // Strategy 3: Partial word matches (for variations like "encrypt" vs "encryption")
  let partialMatches = 0
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1.length > 3 && word2.length > 3) {
        if (word1.includes(word2) || word2.includes(word1)) {
          partialMatches++
          break
        }
      }
    }
  }
  
  const partialSimilarity = partialMatches / Math.max(words1.length, words2.length)
  
  // Combine scores: 70% jaccard, 30% partial
  return jaccardSimilarity * 0.7 + partialSimilarity * 0.3
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
      const similarity = calculateSimilarity(question, chunk)
      allChunks.push({
        documentId: doc.id,
        documentName: doc.file_name || doc.name,
        content: chunk,
        similarity: similarity,
      })
    })
  }

  // Sort by similarity and return top K (filter out very low scores)
  const filtered = allChunks.filter(chunk => chunk.similarity > 0.05)
  return filtered.sort((a, b) => b.similarity - a.similarity).slice(0, topK)
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

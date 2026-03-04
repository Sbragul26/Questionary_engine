'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Results() {
  const [answers, setAnswers] = useState([])
  const [editedAnswers, setEditedAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentData, setCurrentData] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const data = localStorage.getItem('currentAnswers')
    if (!data) {
      router.push('/dashboard')
      return
    }

    const parsed = JSON.parse(data)
    setCurrentData(parsed)
    setAnswers(parsed.answers)
  }, [router])

  const handleEditAnswer = (index, newAnswer) => {
    setEditedAnswers({
      ...editedAnswers,
      [index]: { answer: newAnswer },
    })
  }

  const handleSaveEdits = async () => {
    setLoading(true)
    setError('')

    try {
      // Update local storage instead of sending to server
      const updatedAnswers = answers.map((answer, index) => {
        if (editedAnswers[index]) {
          return { ...answer, answer: editedAnswers[index].answer, edited: true }
        }
        return answer
      })

      // Update localStorage with edited answers
      localStorage.setItem('currentAnswers', JSON.stringify({
        ...currentData,
        answers: updatedAnswers,
      }))

      // Update state
      setAnswers(updatedAnswers)
      setEditedAnswers({})
      alert('Edits saved to your local session!')
    } catch (err) {
      setError('Failed to save edits')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format) => {
    setLoading(true)
    setError('')

    try {
      // Prepare answers (include edited ones)
      const answersToExport = answers.map((answer, index) => {
        if (editedAnswers[index]) {
          return { ...answer, answer: editedAnswers[index].answer, edited: true }
        }
        return answer
      })

      // Generate export locally instead of server
      if (format === 'pdf') {
        await exportPDF(answersToExport)
      } else if (format === 'docx') {
        await exportDOCX(answersToExport)
      }
    } catch (err) {
      console.error('Export error:', err)
      setError('Failed to export')
    } finally {
      setLoading(false)
    }
  }

  // Simple PDF generation
  const exportPDF = (answersToExport) => {
    let content = 'QUESTIONNAIRE ANSWERS REPORT\n'
    content += '=' .repeat(40) + '\n\n'

    answersToExport.forEach((answer, index) => {
      content += `Q${index + 1}: ${answer.question}\n`
      content += '-'.repeat(40) + '\n'
      content += `Answer: ${answer.answer}\n`

      if (answer.citations && answer.citations.length > 0) {
        content += '\nCitations:\n'
        answer.citations.forEach((citation) => {
          content += `  • ${citation.documentName} (${(citation.similarity * 100).toFixed(0)}% match)\n`
        })
      }

      if (answer.confidenceScore) {
        content += `Confidence: ${answer.confidenceScore.level}\n`
      }

      content += '\n' + '='.repeat(40) + '\n\n'
    })

    // Download as text file for now (you can install pdfkit for proper PDF)
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `questionnaire-answers-${Date.now()}.txt`
    a.click()
  }

  // Simple DOCX generation
  const exportDOCX = (answersToExport) => {
    let content = 'QUESTIONNAIRE ANSWERS REPORT\n\n'

    answersToExport.forEach((answer, index) => {
      content += `Q${index + 1}: ${answer.question}\n`
      content += `Answer: ${answer.answer}\n`

      if (answer.citations && answer.citations.length > 0) {
        content += 'Citations:\n'
        answer.citations.forEach((citation) => {
          content += `• ${citation.documentName} (${(citation.similarity * 100).toFixed(0)}% match)\n`
        })
      }

      if (answer.confidenceScore) {
        content += `Confidence: ${answer.confidenceScore.level}\n`
      }

      content += '\n'
    })

    // Download as text file (docx requires external library)
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `questionnaire-answers-${Date.now()}.txt`
    a.click()
  }

  if (!currentData) {
    return <div className="container">Loading...</div>
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Generated Answers</h1>

      {error && <div className="error">{error}</div>}

      {/* Coverage Summary */}
      <div className="coverage-summary">
        <div className="coverage-title">📊 Coverage Summary</div>
        <div className="coverage-item">
          <span className="coverage-label">Total Questions</span>
          <span className="coverage-value">{currentData.totalQuestions}</span>
        </div>
        <div className="coverage-item">
          <span className="coverage-label">Answered with Citation</span>
          <span className="coverage-value" style={{ color: '#27ae60' }}>
            {currentData.answeredWithCitation}
          </span>
        </div>
        <div className="coverage-item">
          <span className="coverage-label">Not Found</span>
          <span className="coverage-value" style={{ color: '#e74c3c' }}>
            {currentData.notFound}
          </span>
        </div>
      </div>

      {/* Answers */}
      {answers.map((answer, index) => (
        <div key={index} className="answer-card">
          <div className="answer-question">Q{index + 1}: {answer.question}</div>

          <textarea
            value={editedAnswers[index]?.answer || answer.answer}
            onChange={(e) => handleEditAnswer(index, e.target.value)}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontFamily: 'inherit',
            }}
          />

          {answer.confidenceScore && answer.confidenceScore.level && (
            <span
              className={`confidence-badge confidence-${answer.confidenceScore.level.toLowerCase()}`}
            >
              {answer.confidenceScore.level}
            </span>
          )}

          {answer.citations && answer.citations.length > 0 && (
            <div className="citations">
              <div className="citations-title">📌 Citations</div>
              {answer.citations.map((citation, idx) => (
                <div key={idx} className="citation-item">
                  <span>•</span>
                  <span>{citation.documentName}</span>
                  <span>({(citation.similarity * 100).toFixed(0)}% match)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Actions */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {Object.keys(editedAnswers).length > 0 && (
          <button
            className="button-success"
            onClick={handleSaveEdits}
            disabled={loading}
          >
            💾 Save Edits
          </button>
        )}
        <button
          className="button-secondary"
          onClick={() => handleExport('pdf')}
          disabled={loading}
        >
          📥 Export as PDF
        </button>
        <button
          className="button-secondary"
          onClick={() => handleExport('docx')}
          disabled={loading}
        >
          📥 Export as DOCX
        </button>
        <button
          className="button-secondary"
          onClick={() => router.push('/dashboard')}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  )
}

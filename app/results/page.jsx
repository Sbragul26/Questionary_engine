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
      const token = localStorage.getItem('token')
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = userData.id
      const response = await fetch('/api/save-edits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-User-Id': userId,
        },
        body: JSON.stringify({
          answerId: currentData.id,
          updates: editedAnswers,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save')
      }

      const data = await response.json()
      setEditedAnswers({})
      alert('Edits saved successfully!')
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
      const token = localStorage.getItem('token')
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = userData.id
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-User-Id': userId,
        },
        body: JSON.stringify({
          answerId: currentData.id,
          format,
        }),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `questionnaire-answers.${format}`
      a.click()
    } catch (err) {
      setError('Failed to export')
    } finally {
      setLoading(false)
    }
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

          {answer.confidenceScore && (
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

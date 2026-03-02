'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [questionnaires, setQuestionnaires] = useState([])
  const [referenceFiles, setReferenceFiles] = useState([])
  const [activeTab, setActiveTab] = useState('questionnaire')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(userData))
  }, [router])

  const handleQuestionnaireUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      const response = await fetch('/api/upload-questionnaire', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setQuestionnaires([...questionnaires, data])
      setError('')
      alert('Questionnaire uploaded successfully!')
    } catch (err) {
      setError('Failed to upload questionnaire')
    } finally {
      setLoading(false)
    }
  }

  const handleReferenceUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      const response = await fetch('/api/upload-reference', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setReferenceFiles([...referenceFiles, data])
      alert('Reference document uploaded successfully!')
    } catch (err) {
      setError('Failed to upload reference document')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAnswers = async (questionnaireId) => {
    if (referenceFiles.length === 0) {
      setError('Please upload at least one reference document first')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questionnaireId }),
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const data = await response.json()
      localStorage.setItem('currentAnswers', JSON.stringify(data))
      router.push('/results')
    } catch (err) {
      setError('Failed to generate answers')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Dashboard</h1>
        <div>
          <span style={{ marginRight: '1rem', color: '#7f8c8d' }}>Welcome, {user.email}</span>
          <button
            className="button-secondary button-small"
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              router.push('/')
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div style={{ marginBottom: '2rem', borderBottom: '2px solid #ecf0f1' }}>
        <button
          onClick={() => setActiveTab('questionnaire')}
          style={{
            padding: '1rem',
            border: activeTab === 'questionnaire' ? '2px solid #3498db' : 'none',
            borderBottom: activeTab === 'questionnaire' ? '2px solid #3498db' : 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'questionnaire' ? '#3498db' : '#7f8c8d',
            fontWeight: activeTab === 'questionnaire' ? 'bold' : 'normal',
          }}
        >
          📝 Questionnaire
        </button>
        <button
          onClick={() => setActiveTab('reference')}
          style={{
            padding: '1rem',
            border: activeTab === 'reference' ? '2px solid #3498db' : 'none',
            borderBottom: activeTab === 'reference' ? '2px solid #3498db' : 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'reference' ? '#3498db' : '#7f8c8d',
            fontWeight: activeTab === 'reference' ? 'bold' : 'normal',
          }}
        >
          📚 Reference Documents
        </button>
      </div>

      {activeTab === 'questionnaire' && (
        <div>
          <h2>Upload Questionnaire</h2>
          <p style={{ color: '#7f8c8d', marginBottom: '1rem' }}>
            Upload a questionnaire file (PDF, DOCX, or TXT format)
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleQuestionnaireUpload}
              disabled={loading}
              style={{ marginBottom: '1rem' }}
            />
          </div>

          <h3>Your Questionnaires</h3>
          {questionnaires.length === 0 ? (
            <p style={{ color: '#7f8c8d' }}>No questionnaires uploaded yet</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Uploaded</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {questionnaires.map((q) => (
                  <tr key={q.id}>
                    <td>{q.file_name}</td>
                    <td>{new Date(q.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="button-small button-success"
                        onClick={() => handleGenerateAnswers(q.id)}
                        disabled={loading}
                      >
                        Generate Answers
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'reference' && (
        <div>
          <h2>Upload Reference Documents</h2>
          <p style={{ color: '#7f8c8d', marginBottom: '1rem' }}>
            Upload company documents that will be used to answer questions (PDF, DOCX, or TXT format)
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleReferenceUpload}
              disabled={loading}
              style={{ marginBottom: '1rem' }}
            />
          </div>

          <h3>Your Reference Documents</h3>
          {referenceFiles.length === 0 ? (
            <p style={{ color: '#7f8c8d' }}>No reference documents uploaded yet</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {referenceFiles.map((r) => (
                  <tr key={r.id}>
                    <td>{r.file_name}</td>
                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

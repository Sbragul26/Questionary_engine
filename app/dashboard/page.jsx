'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

function FileRow({ file, onRemove }) {
  return (
    <div style={styles.fileRow}>
      <div style={styles.fileInfo}>
        <div>
          <div style={styles.fileName}>{file.file_name}</div>
          <div style={styles.fileDate}>{new Date(file.created_at).toLocaleDateString()}</div>
        </div>
      </div>
      <button onClick={() => onRemove(file.id)} style={styles.removeBtn} title="Remove file">Remove</button>
    </div>
  )
}

function DropZone({ accept, onChange, loading, multiple = true }) {
  const inputRef = useRef()
  return (
    <div style={styles.dropZone} onClick={() => inputRef.current.click()}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onChange}
        disabled={loading}
        style={{ display: 'none' }}
      />
      <div style={styles.dropText}>
        {loading ? 'Uploading...' : 'Click to upload'}
      </div>
      <div style={styles.dropHint}>PDF, DOCX, TXT — multiple files OK</div>
    </div>
  )
}

export default function Dashboard() {

  const [user,           setUser]           = useState(null)
  const [questionnaires, setQuestionnaires] = useState([])
  const [referenceFiles, setReferenceFiles] = useState([])
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState('')
  const [message,        setMessage]        = useState('')

  const router = useRouter()

  useEffect(() => {
    const token    = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token) { router.push('/login'); return }
    setUser(JSON.parse(userData))
  }, [router])

  const getAuthHeaders = () => {
    const token    = localStorage.getItem('token')
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    return { Authorization: `Bearer ${token}`, 'X-User-Id': userData.id }
  }

  const handleQuestionnaireUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    setLoading(true); setError('')

    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload-questionnaire', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData,
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Upload failed')

        setQuestionnaires(prev => [...prev, data])

      } catch (err) {
        setError(`Could not upload "${file.name}": ${err.message}`)
      }
    }

    setLoading(false)
    e.target.value = ''
  }

  const handleReferenceUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    setLoading(true); setError('')

    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload-reference', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData,
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Upload failed')

        setReferenceFiles(prev => [...prev, data])

      } catch (err) {
        setError(`Could not upload "${file.name}": ${err.message}`)
      }
    }

    setLoading(false)
    e.target.value = ''
  }

  const removeQuestionnaire = (id) =>
    setQuestionnaires(prev => prev.filter(q => q.id !== id))

  const removeReference = (id) =>
    setReferenceFiles(prev => prev.filter(r => r.id !== id))

  const handleGenerateAnswers = async (questionnaireId) => {
    if (referenceFiles.length === 0) {
      setError('Please upload at least one reference document first.')
      return
    }

    setLoading(true); setError('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ questionnaireId }),
      })

      if (!response.ok) throw new Error('Generation failed')

      const data = await response.json()
      localStorage.setItem('currentAnswers', JSON.stringify(data))
      router.push('/results')

    } catch {
      setError('Could not generate answers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <div style={styles.loading}>Loading...</div>

  return (
    <div style={styles.page}>

      <header style={styles.header}>
        <span style={styles.logo}></span>
        <div style={styles.headerRight}>
          <span style={styles.welcome}>{user.email}</span>
          <button
            style={styles.logoutBtn}
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              router.push('/')
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div style={styles.errorBanner}>
          {error}
          <button onClick={() => setError('')} style={styles.closeBanner}>Dismiss</button>
        </div>
      )}

      <div style={styles.columns}>

        <section style={styles.panel}>
          <h2 style={styles.panelTitle}>Questionnaires</h2>
          <p style={styles.panelSub}>Upload the files you want answered</p>

          <DropZone
            accept=".pdf,.docx,.txt"
            onChange={handleQuestionnaireUpload}
            loading={loading}
          />

          <div style={styles.fileList}>
            {questionnaires.length === 0
              ? <p style={styles.emptyMsg}>No questionnaires yet</p>
              : questionnaires.map(q => (
                  <div key={q.id}>
                    <FileRow file={q} onRemove={removeQuestionnaire} />
                    <button
                      style={{ ...styles.generateBtn, opacity: loading ? 0.6 : 1 }}
                      disabled={loading}
                      onClick={() => handleGenerateAnswers(q.id)}
                    >
                      {loading ? 'Generating...' : 'Generate Answers'}
                    </button>
                  </div>
                ))
            }
          </div>

          <div style={styles.messageSection}>
            <label style={styles.messageLabel}>Chat Questions</label>
            <textarea
              style={styles.messageBox}
              placeholder="Type any notes or messages here..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </section>

        <section style={styles.panel}>
          <h2 style={styles.panelTitle}>Reference Documents</h2>
          <p style={styles.panelSub}>These teach the AI how to answer questions</p>

          <DropZone
            accept=".pdf,.docx,.txt"
            onChange={handleReferenceUpload}
            loading={loading}
          />

          <div style={styles.fileList}>
            {referenceFiles.length === 0
              ? <p style={styles.emptyMsg}>No reference docs yet</p>
              : referenceFiles.map(r => (
                  <FileRow key={r.id} file={r} onRemove={removeReference} />
                ))
            }
          </div>
        </section>

      </div>
    </div>
  )
}

const styles = {
  page:           { minHeight: '100vh', background: '#f4f6fa', fontFamily: 'Georgia, serif' },
  loading:        { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '1.2rem', color: '#888' },
  header:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1f36', color: 'white', padding: '1rem 2rem' },
  logo:           { fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '0.05em' },
  headerRight:    { display: 'flex', alignItems: 'center', gap: '1rem' },
  welcome:        { fontSize: '0.9rem', color: '#aab' },
  logoutBtn:      { background: 'transparent', border: '1px solid #556', color: '#ccd', padding: '0.35rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  errorBanner:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff0f0', color: '#c0392b', border: '1px solid #f5c6cb', padding: '0.8rem 1.5rem', margin: '1rem 2rem', borderRadius: '8px', fontSize: '0.9rem' },
  closeBanner:    { background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' },
  columns:        { display: 'flex', gap: '1.5rem', padding: '2rem', flexWrap: 'wrap' },
  panel:          { flex: 1, minWidth: '300px', background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  panelTitle:     { fontSize: '1.1rem', fontWeight: 'bold', color: '#1a1f36', marginBottom: '0.2rem' },
  panelSub:       { fontSize: '0.85rem', color: '#888', marginBottom: '1.2rem' },
  dropZone:       { border: '2px dashed #b0bbcc', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', marginBottom: '1.2rem', background: '#f8fafc' },
  dropText:       { fontWeight: 'bold', color: '#2c3e6e', fontSize: '0.95rem' },
  dropHint:       { fontSize: '0.78rem', color: '#999', marginTop: '0.2rem' },
  fileList:       { display: 'flex', flexDirection: 'column', gap: '0.7rem' },
  emptyMsg:       { color: '#bbb', fontSize: '0.88rem', textAlign: 'center', paddingTop: '0.5rem' },
  fileRow:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e4e9f0', borderRadius: '8px', padding: '0.6rem 0.8rem' },
  fileInfo:       { display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' },
  fileName:       { fontSize: '0.88rem', fontWeight: 'bold', color: '#2c3e6e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' },
  fileDate:       { fontSize: '0.75rem', color: '#aaa' },
  removeBtn:      { background: 'none', border: '1px solid #e4e9f0', color: '#e74c3c', cursor: 'pointer', fontSize: '0.78rem', flexShrink: 0, padding: '0.2rem 0.5rem', borderRadius: '4px' },
  generateBtn:    { width: '100%', marginTop: '0.4rem', marginBottom: '0.4rem', padding: '0.5rem', background: '#2c3e6e', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 'bold', letterSpacing: '0.03em' },
  messageSection: { marginTop: '1.8rem', borderTop: '1px solid #eee', paddingTop: '1.2rem' },
  messageLabel:   { display: 'block', fontSize: '0.88rem', fontWeight: 'bold', color: '#555', marginBottom: '0.5rem' },
  messageBox:     { width: '100%', borderRadius: '8px', border: '1px solid #d0d8e8', padding: '0.75rem', fontSize: '0.88rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', background: '#fafbfd', color: '#333' },
}
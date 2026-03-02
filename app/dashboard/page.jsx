'use client'

// Step 1: Import tools we need from React and Next.js
// useState  → lets us store data that can change (like a variable that updates the screen)
// useEffect → runs code when the page first loads
import { useState, useEffect } from 'react'

// useRouter → lets us move to a different page
import { useRouter } from 'next/navigation'

export default function Dashboard() {

  // --- VARIABLES (State) ---
  // Think of these like boxes that hold data.
  // When a box's value changes, the screen automatically updates.

  const [user, setUser] = useState(null)              // Who is logged in?
  const [questionnaires, setQuestionnaires] = useState([])  // List of uploaded questionnaires
  const [referenceFiles, setReferenceFiles] = useState([])  // List of uploaded reference docs
  const [activeTab, setActiveTab] = useState('questionnaire') // Which tab is open?
  const [loading, setLoading] = useState(false)        // Are we waiting for something?
  const [error, setError] = useState('')               // Any error message to show?

  const router = useRouter() // Tool to navigate between pages

  // --- ON PAGE LOAD ---
  // useEffect runs once when the page opens.
  // We check if the user is logged in by looking for a saved token.
  useEffect(() => {
    const token = localStorage.getItem('token')    // Get saved login token
    const userData = localStorage.getItem('user')  // Get saved user info

    if (!token) {
      router.push('/login') // No token? Send them to login page
      return
    }

    setUser(JSON.parse(userData)) // Save user info so we can show their name
  }, [router])

  // --- UPLOAD QUESTIONNAIRE ---
  // This runs when the user picks a questionnaire file
  const handleQuestionnaireUpload = async (e) => {
    const file = e.target.files?.[0] // Get the selected file
    if (!file) return                 // If no file, stop here

    setLoading(true)  // Show "loading..." state
    setError('')      // Clear old errors

    try {
      // FormData is like a package to send files to the server
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = userData.id

      // Send the file to our server using fetch (like making a phone call to the server)
      const response = await fetch('/api/upload-questionnaire', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'X-User-Id': userId,
        }, // Prove we're logged in
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed') // Show detailed error
      }

      setQuestionnaires([...questionnaires, data])              // Add new file to our list
      alert('Questionnaire uploaded!')
    } catch (err) {
      console.error('Upload error:', err)
      setError(`Could not upload questionnaire: ${err.message}`)
    } finally {
      setLoading(false) // Always stop loading, success or not
    }
  }

  // --- UPLOAD REFERENCE DOCUMENT ---
  // Same idea as above, but for reference documents
  const handleReferenceUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = userData.id

      const response = await fetch('/api/upload-reference', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'X-User-Id': userId,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setReferenceFiles([...referenceFiles, data])
      alert('Reference document uploaded!')
    } catch (err) {
      console.error('Upload error:', err)
      setError(`Could not upload reference document: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // --- GENERATE ANSWERS ---
  // When user clicks "Generate Answers" for a questionnaire
  const handleGenerateAnswers = async (questionnaireId) => {

    // First, make sure there is at least one reference document
    if (referenceFiles.length === 0) {
      setError('Please upload a reference document first.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = userData.id

      // Tell the server: "Please generate answers for this questionnaire"
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // We're sending JSON data
          Authorization: `Bearer ${token}`,
          'X-User-Id': userId,
        },
        body: JSON.stringify({ questionnaireId }), // Send the questionnaire's ID
      })

      if (!response.ok) throw new Error('Generation failed')

      const data = await response.json()
      localStorage.setItem('currentAnswers', JSON.stringify(data)) // Save answers
      router.push('/results') // Go to results page
    } catch (err) {
      setError('Could not generate answers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // --- SHOW LOADING SCREEN ---
  // If user data isn't loaded yet, show a simple message
  if (!user) {
    return <div>Loading...</div>
  }

  // --- THE SCREEN (what the user sees) ---
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'Arial' }}>

      {/* TOP BAR: Title + Welcome message + Logout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1>Dashboard</h1>
        <div>
          <span style={{ marginRight: '1rem', color: 'gray' }}>Welcome, {user.email}</span>
          <button
            onClick={() => {
              // Logout: clear saved data and go to home page
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              router.push('/')
            }}
            style={{ padding: '0.4rem 1rem', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ERROR BOX: Only shows if there is an error message */}
      {error && (
        <div style={{ background: '#ffe0e0', color: 'red', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {/* TABS: Two buttons to switch between sections */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #ccc', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('questionnaire')}
          style={{
            padding: '0.6rem 1.2rem',
            cursor: 'pointer',
            background: activeTab === 'questionnaire' ? '#3498db' : 'white',
            color: activeTab === 'questionnaire' ? 'white' : 'black',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        >
          Questionnaire
        </button>
        <button
          onClick={() => setActiveTab('reference')}
          style={{
            padding: '0.6rem 1.2rem',
            cursor: 'pointer',
            background: activeTab === 'reference' ? '#3498db' : 'white',
            color: activeTab === 'reference' ? 'white' : 'black',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        >
          Reference Documents
        </button>
      </div>

      {/* QUESTIONNAIRE TAB CONTENT */}
      {activeTab === 'questionnaire' && (
        <div>
          <h2>Upload Questionnaire</h2>
          <p style={{ color: 'gray' }}>Accepted formats: PDF, DOCX, TXT</p>

          {/* File input — triggers handleQuestionnaireUpload when a file is chosen */}
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleQuestionnaireUpload}
            disabled={loading}
            style={{ marginBottom: '1.5rem', display: 'block' }}
          />

          <h3>Your Questionnaires</h3>

          {/* If the list is empty, show a message. Otherwise show a table. */}
          {questionnaires.length === 0 ? (
            <p style={{ color: 'gray' }}>No questionnaires uploaded yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>File Name</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Uploaded On</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Loop through each questionnaire and show a row */}
                {questionnaires.map((q) => (
                  <tr key={q.id}>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{q.file_name}</td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                      {new Date(q.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                      <button
                        onClick={() => handleGenerateAnswers(q.id)}
                        disabled={loading}
                        style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}
                      >
                        {loading ? 'Generating...' : 'Generate Answers'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* REFERENCE DOCUMENTS TAB CONTENT */}
      {activeTab === 'reference' && (
        <div>
          <h2>Upload Reference Documents</h2>
          <p style={{ color: 'gray' }}>These documents will be used to answer the questionnaire questions.</p>

          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleReferenceUpload}
            disabled={loading}
            style={{ marginBottom: '1.5rem', display: 'block' }}
          />

          <h3>Your Reference Documents</h3>

          {referenceFiles.length === 0 ? (
            <p style={{ color: 'gray' }}>No reference documents uploaded yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>File Name</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Uploaded On</th>
                </tr>
              </thead>
              <tbody>
                {referenceFiles.map((r) => (
                  <tr key={r.id}>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{r.file_name}</td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
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
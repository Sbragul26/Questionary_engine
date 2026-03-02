'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1rem' }}>Welcome to Questionnaire AI</h1>
      <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: '#7f8c8d' }}>
        Automatically answer questionnaires using your company documents with AI-powered insights.
      </p>

      {!isAuthenticated ? (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/signup">
            <button className="button-success" style={{ marginRight: '1rem' }}>
              Get Started 🚀
            </button>
          </Link>
          <Link href="/login">
            <button className="button-secondary">Sign In</button>
          </Link>
        </div>
      ) : (
        <Link href="/dashboard">
          <button className="button-success">Go to Dashboard</button>
        </Link>
      )}

      <div style={{ marginTop: '3rem' }}>
        <h2>How it Works</h2>
        <ol style={{ marginTop: '1rem', lineHeight: '2' }}>
          <li>📝 Upload your questionnaire (PDF, DOCX, or TXT)</li>
          <li>📚 Upload your company reference documents</li>
          <li>🤖 AI automatically generates answers from your documents</li>
          <li>✏️ Review and edit answers as needed</li>
          <li>📄 Export the completed questionnaire</li>
        </ol>
      </div>

      <div style={{ marginTop: '3rem', padding: '1rem', backgroundColor: '#ecf0f1', borderRadius: '4px' }}>
        <h3>Sample Company: CloudTrack</h3>
        <p>
          CloudTrack is a SaaS company providing project management software for small businesses. It stores customer data securely in AWS and follows strict security practices including AES-256 encryption, MFA, and role-based access control.
        </p>
      </div>
    </div>
  )
}

'use client'

// useState  → stores data that can change (updates the screen when it changes)
// useEffect → runs code once when the page first loads
import { useState, useEffect } from 'react'

// Link → lets us create clickable links to other pages (like <a> but for Next.js)
import Link from 'next/link'

export default function Home() {

  // This variable tracks: is the user already logged in?
  // false = not logged in, true = logged in
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // This runs once when the page loads
  // We check localStorage (browser's storage) for a saved login token
  useEffect(() => {
    const token = localStorage.getItem('token') // Try to get the token
    setIsAuthenticated(!!token)
    // !! converts the value to true/false
    // If token exists  → !!token = true  (logged in)
    // If token is null → !!token = false (not logged in)
  }, [])

  // --- WHAT THE USER SEES ---
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem', fontFamily: 'Arial' }}>

      {/* Page Title */}
      <h1 style={{ marginBottom: '1rem' }}>Welcome to Questionnaire AI</h1>

      {/* Short description */}
      <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: 'gray' }}>
        Automatically answer questionnaires using your company documents.
      </p>

      {/* CONDITIONAL BUTTONS:
          If NOT logged in → show "Get Started" and "Sign In"
          If logged in     → show "Go to Dashboard"
          The ? and : below is a shorthand if/else in JavaScript */}
      {!isAuthenticated ? (
        <div style={{ display: 'flex', gap: '1rem' }}>

          {/* Link wraps the button to make the whole button clickable */}
          <Link href="/signup">
            <button style={{ padding: '0.6rem 1.2rem', cursor: 'pointer', background: 'green', color: 'white', border: 'none', borderRadius: '4px' }}>
              Get Started
            </button>
          </Link>

          <Link href="/login">
            <button style={{ padding: '0.6rem 1.2rem', cursor: 'pointer', background: 'white', border: '1px solid #ccc', borderRadius: '4px' }}>
              Sign In
            </button>
          </Link>

        </div>
      ) : (
        <Link href="/dashboard">
          <button style={{ padding: '0.6rem 1.2rem', cursor: 'pointer', background: 'green', color: 'white', border: 'none', borderRadius: '4px' }}>
            Go to Dashboard
          </button>
        </Link>
      )}

      {/* HOW IT WORKS SECTION */}
      <div style={{ marginTop: '3rem' }}>
        <h2>How it Works</h2>

        {/* ol = ordered list (numbered steps) */}
        <ol style={{ marginTop: '1rem', lineHeight: '2' }}>
          <li>Upload your questionnaire (PDF, DOCX, or TXT)</li>
          <li>Upload your company reference documents</li>
          <li>AI automatically generates answers from your documents</li>
          <li>Review and edit answers as needed</li>
          <li>Export the completed questionnaire</li>
        </ol>
      </div>

    </div>
  )
}
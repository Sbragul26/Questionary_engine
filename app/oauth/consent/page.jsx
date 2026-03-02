'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function OAuthConsent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clientName, setClientName] = useState('')
  const [requestedScopes, setRequestedScopes] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    // Parse OAuth parameters from URL
    const clientId = searchParams.get('client_id')
    const scope = searchParams.get('scope')
    const redirectUri = searchParams.get('redirect_uri')

    if (scope) {
      setRequestedScopes(scope.split(' '))
    }

    // In a real app, you'd fetch client details from your database
    setClientName(clientId ? `Application (${clientId})` : 'Unknown Application')
  }, [searchParams])

  const handleApprove = async () => {
    setLoading(true)
    setError('')

    try {
      // Get the authorization code from URL params
      const code = searchParams.get('code')
      const redirectUri = searchParams.get('redirect_uri')

      if (!code || !redirectUri) {
        throw new Error('Missing authorization parameters')
      }

      // Redirect to the callback with authorization code
      window.location.href = `${redirectUri}?code=${code}`
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleDeny = () => {
    const redirectUri = searchParams.get('redirect_uri')
    if (redirectUri) {
      window.location.href = `${redirectUri}?error=access_denied`
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="container" style={{ maxWidth: '500px', margin: '5rem auto' }}>
      <div className="consent-card" style={{ padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h1 style={{ marginBottom: '1rem' }}>Authorization Request</h1>
        
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          <strong>{clientName}</strong> is requesting access to your account.
        </p>

        {requestedScopes.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Requested Permissions:</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {requestedScopes.map((scope) => (
                <li key={scope} style={{ padding: '0.5rem 0', color: '#555' }}>
                  ✓ {scope}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#fee', color: '#c33', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleApprove}
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Processing...' : 'Approve'}
          </button>
          <button
            onClick={handleDeny}
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            Deny
          </button>
        </div>
      </div>
    </div>
  )
}

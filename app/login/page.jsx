'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Login failed:', data)
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      if (!data.token) {
        console.error('No token in response:', data)
        setError('Login failed - no token received')
        setLoading(false)
        return
      }

      console.log('Login successful, setting token and redirecting...')
      localStorage.setItem('token', data.token)
      // Set cookie for middleware
      document.cookie = `token=${data.token}; path=/; max-age=86400`
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // Small delay to ensure cookie is set
      setTimeout(() => {
        router.push('/dashboard')
      }, 100)
    } catch (err) {
      console.error('Login error:', err)
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '400px', margin: '3rem auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Log In</h1>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? <span className="loading"></span> : 'Log In'}
        </button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center', color: '#7f8c8d' }}>
        Don't have an account?{' '}
        <Link href="/signup" style={{ color: '#3498db', textDecoration: 'none' }}>
          Sign Up
        </Link>
      </p>
    </div>
  )
}

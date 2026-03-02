import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    // Use Supabase Auth's native signInWithPassword
    // This works with both admin and anon keys
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('Sign in error:', signInError)
      return NextResponse.json(
        { error: signInError.message || 'Invalid credentials' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      token: data.session.access_token,
      user: { id: data.user.id, email: data.user.email },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

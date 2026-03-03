import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function POST(request) {
  try {
    // Ensure content-type is JSON
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    // Try admin method if service role key is configured
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_service_role_key_here') {
      try {
        const { data, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        })

        if (signUpError) {
          console.error('Supabase signup error:', signUpError)
          return NextResponse.json(
            { error: signUpError.message || 'Signup failed' },
            { status: 400 }
          )
        }

        const user = data.user
        
        try {
          const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createSession(user.id)

          if (sessionError) {
            console.error('Session creation error:', sessionError)
            return NextResponse.json(
              { error: 'Failed to create session' },
              { status: 500 }
            )
          }

          return NextResponse.json({
            token: sessionData.session.access_token,
            user: { id: user.id, email: user.email },
          })
        } catch (sessionErr) {
          console.error('Session error caught:', sessionErr)
          // Return user created but session failed - frontend can handle this
          return NextResponse.json({
            token: null,
            user: { id: user.id, email: user.email },
            message: 'User created. Please log in.',
          }, { status: 201 })
        }
      } catch (adminErr) {
        console.error('Admin auth error:', adminErr)
        // Fallback to regular signup
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (signUpError) {
          console.error('Fallback signup error:', signUpError)
          return NextResponse.json(
            { error: signUpError.message || 'Signup failed' },
            { status: 400 }
          )
        }

        return NextResponse.json({
          message: 'Signup successful',
          user: { id: data.user?.id, email: data.user?.email },
        })
      }
    } else {
      // Fallback: Use client-side signup method
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        console.error('Client signup error:', signUpError)
        return NextResponse.json(
          { error: signUpError.message || 'Signup failed' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        message: 'Signup successful',
        user: { id: data.user?.id, email: data.user?.email },
      })
    }
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: error.message || 'Signup failed' }, { status: 500 })
  }
}

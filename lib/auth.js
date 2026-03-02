import { supabase, supabaseAdmin } from './supabase'

export async function verifyToken(request) {
  const token = request.headers.get('Authorization')?.split(' ')[1]

  if (!token) {
    throw new Error('No token provided')
  }

  try {
    // Try with service role if available
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_service_role_key_here') {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

      if (error || !user) {
        throw new Error('Invalid token')
      }

      return { userId: user.id, email: user.email }
    } else {
      // Fallback: Use anon key client
      const { data: { user }, error } = await supabase.auth.getUser(token)

      if (error || !user) {
        throw new Error('Invalid token')
      }

      return { userId: user.id, email: user.email }
    }
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

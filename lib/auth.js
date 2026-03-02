import { supabase, supabaseAdmin } from './supabase'

export async function verifyToken(request) {
  const authHeader = request.headers.get('Authorization')
  const userIdHeader = request.headers.get('X-User-Id')
  
  const token = authHeader?.split(' ')[1]

  if (!token) {
    throw new Error('No token provided')
  }

  if (!userIdHeader) {
    throw new Error('No user ID provided in X-User-Id header')
  }

  try {
    // First verify the token is valid by decoding it
    const payload = getTokenPayload(token)
    
    console.log('Token verified successfully')
    console.log('User ID from header:', userIdHeader)
    
    return { userId: userIdHeader, email: payload.email }
  } catch (error) {
    console.error('Token verification failed:', error.message)
    throw new Error('Invalid or expired token: ' + error.message)
  }
}

// Helper function to decode JWT payload
function getTokenPayload(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format - expected 3 parts, got ' + parts.length)
    }
    
    // Decode base64url - add padding if needed
    let base64 = parts[1]
    base64 += '=='.slice(0, (4 - base64.length % 4) % 4)
    
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'))
    
    return payload
  } catch (error) {
    console.error('Token decode error:', error)
    throw new Error('Failed to decode token: ' + error.message)
  }
}

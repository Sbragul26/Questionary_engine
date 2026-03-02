import { NextResponse } from 'next/server'

/**
 * OAuth Authorization Endpoint
 * Redirects user to consent screen
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const clientId = searchParams.get('client_id')
    const redirectUri = searchParams.get('redirect_uri')
    const scope = searchParams.get('scope')
    const state = searchParams.get('state')
    const responseType = searchParams.get('response_type')

    // Validate request
    if (!clientId || !redirectUri || responseType !== 'code') {
      return NextResponse.json(
        { error: 'invalid_request' },
        { status: 400 }
      )
    }

    // Build consent screen URL
    const consentUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/oauth/consent`)
    consentUrl.searchParams.append('client_id', clientId)
    consentUrl.searchParams.append('redirect_uri', redirectUri)
    consentUrl.searchParams.append('scope', scope || 'openid profile email')
    if (state) consentUrl.searchParams.append('state', state)

    return NextResponse.redirect(consentUrl.toString())
  } catch (error) {
    console.error('OAuth authorization error:', error)
    return NextResponse.json(
      { error: 'server_error' },
      { status: 500 }
    )
  }
}

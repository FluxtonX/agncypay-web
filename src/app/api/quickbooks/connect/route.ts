import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI;
  const environment = process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox';

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Missing QuickBooks configuration' }, { status: 500 });
  }

  // Create a secure state parameter containing the userId and a random nonce
  const nonce = crypto.randomBytes(16).toString('hex');
  const stateObj = { userId, nonce };
  const state = Buffer.from(JSON.stringify(stateObj)).toString('base64');

  const authEndpoint = environment === 'sandbox' 
    ? 'https://appcenter.intuit.com/connect/oauth2'
    : 'https://appcenter.intuit.com/connect/oauth2';

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope: 'com.intuit.quickbooks.accounting',
    redirect_uri: redirectUri,
    state: state,
  });

  const authUrl = `${authEndpoint}?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}

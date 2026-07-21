import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';
import { encryptToken } from '../../../../lib/crypto';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const realmId = searchParams.get('realmId');

  if (!code || !state || !realmId) {
    return NextResponse.json({ error: 'Missing required OAuth parameters' }, { status: 400 });
  }

  // Decode state to get userId
  let userId: string;
  try {
    const decodedState = Buffer.from(state, 'base64').toString('utf8');
    const stateObj = JSON.parse(decodedState);
    userId = stateObj.userId;
    if (!userId) throw new Error('Missing userId in state');
  } catch (error) {
    return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
  }

  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: 'Missing QuickBooks configuration' }, { status: 500 });
  }

  const tokenEndpoint = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('QuickBooks Token Error:', errorText);
      return NextResponse.json({ error: 'Failed to exchange token' }, { status: 500 });
    }

    const tokenData = await tokenResponse.json();

    // Encrypt tokens before saving
    const encryptedAccessToken = encryptToken(tokenData.access_token);
    const encryptedRefreshToken = encryptToken(tokenData.refresh_token);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + tokenData.expires_in * 1000);
    const refreshTokenExpiresAt = new Date(now.getTime() + tokenData.x_refresh_token_expires_in * 1000);

    // Save encrypted tokens to Firestore using admin SDK
    const integrationRef = adminDb.collection('integrations').doc(userId).collection('providers').doc('quickbooks');
    
    await integrationRef.set({
      providerId: 'quickbooks',
      realmId,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      expiresAt: expiresAt.toISOString(),
      refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
      connectedAt: now.toISOString(),
      lastSyncAt: now.toISOString(),
    });

    // Also update the user's document for easy UI rendering
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data() || {};
      const currentIntegrations = userData.connectedAccountingIntegrations || [];
      const newIntegrations = Array.from(new Set([...currentIntegrations, 'quickbooks']));
      
      await userRef.update({
        connectedAccountingIntegrations: newIntegrations,
        lastAccountingSync: now.toISOString(),
      });
    } else {
      await userRef.set({
        connectedAccountingIntegrations: ['quickbooks'],
        lastAccountingSync: now.toISOString(),
      }, { merge: true });
    }

    // Redirect back to dashboard
    return NextResponse.redirect(new URL('/branddashboard', request.url));
  } catch (error: any) {
    console.error('QuickBooks callback error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';
import { encryptToken, decryptToken } from '../../../../lib/crypto';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const clientId = process.env.QUICKBOOKS_CLIENT_ID;
    const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Missing QuickBooks configuration' }, { status: 500 });
    }

    const integrationRef = adminDb.collection('integrations').doc(userId).collection('providers').doc('quickbooks');
    const docSnap = await integrationRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'QuickBooks integration not found for user' }, { status: 404 });
    }

    const data = docSnap.data();
    if (!data?.refreshToken) {
      return NextResponse.json({ error: 'No refresh token available' }, { status: 400 });
    }

    const decryptedRefreshToken = decryptToken(data.refreshToken);

    const tokenEndpoint = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: decryptedRefreshToken,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('QuickBooks Refresh Error:', errorText);
      return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 });
    }

    const tokenData = await tokenResponse.json();

    const encryptedAccessToken = encryptToken(tokenData.access_token);
    const encryptedNewRefreshToken = encryptToken(tokenData.refresh_token);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + tokenData.expires_in * 1000);
    const refreshTokenExpiresAt = new Date(now.getTime() + tokenData.x_refresh_token_expires_in * 1000);

    await integrationRef.update({
      accessToken: encryptedAccessToken,
      refreshToken: encryptedNewRefreshToken,
      expiresAt: expiresAt.toISOString(),
      refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Token refreshed successfully' });
  } catch (error: any) {
    console.error('QuickBooks refresh route error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

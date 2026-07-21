import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Step 1: Ideally, we would refresh the token here or verify its expiration.
    // For this simulation, we'll call our internal refresh route.
    const baseUrl = new URL(request.url).origin;
    const refreshResponse = await fetch(`${baseUrl}/api/quickbooks/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!refreshResponse.ok) {
      const errorData = await refreshResponse.json();
      return NextResponse.json({ error: 'Sync failed during token refresh', details: errorData }, { status: 500 });
    }

    const now = new Date().toISOString();

    // Step 2: Update the last sync time in both the integration doc and user doc
    const integrationRef = adminDb.collection('integrations').doc(userId).collection('providers').doc('quickbooks');
    await integrationRef.update({
      lastSyncAt: now,
    });

    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update({
      lastAccountingSync: now,
    });

    return NextResponse.json({ success: true, message: 'QuickBooks synced successfully', lastSyncAt: now });
  } catch (error: any) {
    console.error('QuickBooks sync route error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

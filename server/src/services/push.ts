import admin from 'firebase-admin';
import path from 'path';
import db from '../db/connection';

let firebaseInitialized = false;

function initFirebase(): boolean {
  if (firebaseInitialized) return true;

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountPath) {
    console.warn('FIREBASE_SERVICE_ACCOUNT not set — push notifications disabled');
    return false;
  }

  try {
    const resolved = path.isAbsolute(serviceAccountPath)
      ? serviceAccountPath
      : path.join(__dirname, '..', '..', serviceAccountPath);

    const serviceAccount = require(resolved);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log('Firebase Admin initialized for push notifications');
    return true;
  } catch (err) {
    console.error('Failed to initialize Firebase Admin:', err);
    return false;
  }
}

// Initialize on import
initFirebase();

interface PushPayload {
  title: string;
  body: string;
  type: 'combat' | 'trade' | 'general';
  data?: Record<string, string>;
}

/**
 * Send a push notification to all devices registered to a player.
 * Silently does nothing if Firebase is not configured.
 */
export async function sendPushToPlayer(playerId: string, payload: PushPayload): Promise<void> {
  if (!firebaseInitialized) return;

  const devices = await db('player_devices').where({ player_id: playerId });
  if (devices.length === 0) return;

  const tokens = devices.map((d: any) => d.fcm_token);

  const message: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: {
      type: payload.type,
      ...(payload.data || {}),
    },
    android: {
      priority: payload.type === 'combat' ? 'high' : 'normal',
      notification: {
        channelId: `${payload.type}_alerts`,
      },
    },
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);

    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const invalidTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const code = resp.error?.code;
          if (
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(tokens[idx]);
          }
        }
      });

      if (invalidTokens.length > 0) {
        await db('player_devices')
          .where({ player_id: playerId })
          .whereIn('fcm_token', invalidTokens)
          .delete();
      }
    }
  } catch (err) {
    console.error('Push notification error:', err);
  }
}

/**
 * Send a push notification to multiple players.
 */
export async function sendPushToPlayers(playerIds: string[], payload: PushPayload): Promise<void> {
  await Promise.allSettled(playerIds.map((id) => sendPushToPlayer(id, payload)));
}

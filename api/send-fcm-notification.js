// Vercel Serverless Function: Send FCM Notification
// Path: api/send-fcm-notification.js

const admin = require('firebase-admin');

// Firebase Admin SDK initialization (only once)
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PROJECT_ID) {
      console.error('Missing Firebase Admin credentials');
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey
        })
      });
      console.log('Firebase Admin initialized successfully');
    }
  } catch (error) {
    console.error('Firebase Admin init error:', error);
  }
}

const db = admin.firestore();

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, questionText } = req.body;

    if (!username || !questionText) {
      return res.status(400).json({ error: 'Username and questionText required' });
    }

    console.log(`Sending notification to user: ${username}`);

    // Get user's FCM token
    const userDoc = await db.collection('users').doc(username).get();

    if (!userDoc.exists) {
      console.log(`User ${username} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;

    if (!fcmToken) {
      console.log(`User ${username} has no FCM token`);
      return res.status(200).json({
        success: true,
        message: 'No FCM token, notification not sent'
      });
    }

    console.log(`Sending FCM notification to token: ${fcmToken.substring(0, 20)}...`);

    // Send notification
    const message = {
      token: fcmToken,
      notification: {
        title: '💭 Yeni Soru!',
        body: questionText.substring(0, 100) + (questionText.length > 100 ? '...' : '')
      },
      data: {
        type: 'new_question',
        url: '/ask-secretly.html'
      },
      webpush: {
        fcmOptions: {
          link: 'https://hiddencrushbot.com/ask-secretly.html'
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);

    return res.status(200).json({
      success: true,
      messageId: response
    });

  } catch (error) {
    console.error('Send notification error:', error);

    // Invalid or expired token
    if (error.code === 'messaging/registration-token-not-registered' ||
        error.code === 'messaging/invalid-registration-token') {
      console.log('Invalid or expired FCM token, removing from database');

      try {
        const { username } = req.body;
        await db.collection('users').doc(username).update({
          fcmToken: admin.firestore.FieldValue.delete(),
          pushEnabled: false
        });
      } catch (dbError) {
        console.error('Error removing invalid token:', dbError);
      }

      return res.status(200).json({
        success: false,
        message: 'Token invalid, removed from database'
      });
    }

    return res.status(500).json({
      error: 'Failed to send notification',
      details: error.message,
      code: error.code
    });
  }
}

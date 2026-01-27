// Netlify Function: Send FCM Notification
// Path: netlify/functions/send-fcm-notification.js

const admin = require('firebase-admin');

// Firebase Admin SDK initialization (sadece bir kere)
if (!admin.apps.length) {
  try {
    // Private key'i düzgün parse et
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PROJECT_ID) {
      throw new Error('Missing Firebase Admin credentials in environment variables');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
    });
    
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin init error:', error);
    throw error;
  }
}

const db = admin.firestore();

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only POST allowed
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { username, questionText } = JSON.parse(event.body);

    if (!username || !questionText) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Username and questionText required' })
      };
    }

    console.log(`Sending notification to user: ${username}`);

    // Kullanıcının FCM token'ını al
    const userDoc = await db.collection('users').doc(username).get();
    
    if (!userDoc.exists) {
      console.log(`User ${username} not found`);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;

    if (!fcmToken) {
      console.log(`User ${username} has no FCM token`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'No FCM token, notification not sent' 
        })
      };
    }

    console.log(`Sending FCM notification to token: ${fcmToken.substring(0, 20)}...`);

    // Bildirim gönder
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        messageId: response 
      })
    };

  } catch (error) {
    console.error('Send notification error:', error);
    
    // Token geçersizse veya expired ise
    if (error.code === 'messaging/registration-token-not-registered' || 
        error.code === 'messaging/invalid-registration-token') {
      console.log('Invalid or expired FCM token, removing from database');
      
      try {
        const { username } = JSON.parse(event.body);
        await db.collection('users').doc(username).update({
          fcmToken: admin.firestore.FieldValue.delete(),
          pushEnabled: false
        });
      } catch (dbError) {
        console.error('Error removing invalid token:', dbError);
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: 'Token invalid, removed from database' 
        })
      };
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to send notification',
        details: error.message,
        code: error.code 
      })
    };
  }
};

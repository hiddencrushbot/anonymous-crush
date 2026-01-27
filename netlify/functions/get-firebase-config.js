// Netlify Function: Firebase Config'i güvenli şekilde döndür
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Firebase config'i environment variables'dan al
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID
    };

    // Eksik key var mı kontrol et
    const missingKeys = Object.entries(firebaseConfig)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingKeys.length > 0) {
      console.error('Missing Firebase config keys:', missingKeys);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Firebase configuration incomplete',
          missing: missingKeys 
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(firebaseConfig)
    };

  } catch (error) {
    console.error('Get Firebase config error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to get Firebase config',
        details: error.message 
      })
    };
  }
};

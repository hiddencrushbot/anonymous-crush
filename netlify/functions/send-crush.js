const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { username, message } = JSON.parse(event.body);

    if (!username) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Kullanıcı adı gerekli' })
      };
    }

    // Gmail SMTP ile email gönder
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.MAIL_TO,
      subject: `💕 Yeni Anonymous Crush - @${username}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #e7e9ea;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">💌 Yeni Crush Mesajı!</h1>
          </div>
          
          <div style="background: #1a1a1a; padding: 25px; border-radius: 12px; border: 1px solid #2f3336;">
            <p style="font-size: 16px; margin-bottom: 15px; color: #71767b;">
              <strong style="color: #e7e9ea;">Hedef:</strong> @${username}
            </p>
            
            ${message ? `
              <div style="background: #0a0a0a; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin-top: 20px;">
                <p style="font-size: 14px; color: #71767b; margin-bottom: 8px;">Mesaj:</p>
                <p style="font-size: 16px; color: #e7e9ea; line-height: 1.6; margin: 0;">${message}</p>
              </div>
            ` : '<p style="color: #71767b; font-style: italic;">Mesaj bırakılmadı</p>'}
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #2f3336;">
              <p style="font-size: 13px; color: #71767b; margin: 0;">
                🔒 Bu mesaj tamamen anonim gönderildi.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="font-size: 12px; color: #71767b;">
              © 2025 Anonymous Crush - hiddencrushbot.com
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Mesaj başarıyla gönderildi' 
      })
    };

  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Mesaj gönderilemedi',
        details: error.message 
      })
    };
  }
};

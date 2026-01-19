const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

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
                body: JSON.stringify({ error: 'Username gerekli' })
            };
        }

        // Gmail SMTP ayarları
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        // Email gönder
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER,
            subject: '💕 Yeni Anonymous Crush Mesajı!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #dc2626;">💕 Yeni Crush Mesajı!</h2>
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Twitter Kullanıcısı:</strong></p>
                        <p style="font-size: 18px; color: #1d9bf0;">@${username}</p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
                        <p><strong>Mesaj:</strong></p>
                        <p style="font-size: 16px;">${message || 'Mesaj yok - sadece crush bildirimi'}</p>
                    </div>
                    <p style="color: #666; font-size: 12px;">Bu mesaj hiddencrushbot.com üzerinden gönderildi.</p>
                </div>
            `
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Mesaj gönderildi!' })
        };

    } catch (error) {
        console.error('Email Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Email gönderilemedi', details: error.message })
        };
    }
};

// Netlify Function - EmailJS credentials gizli
exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // OPTIONS request for CORS
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

        // Gizli credentials - environment variables'dan
        const SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'service_r6mkdbr';
        const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || 'template_isbwifa';
        const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || 'FGTFMDef99U2v0EVg';

        // EmailJS API'ye direkt istek
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                service_id: SERVICE_ID,
                template_id: TEMPLATE_ID,
                user_id: PUBLIC_KEY,
                template_params: {
                    username: '@' + username.replace('@', ''),
                    email: message || 'Mesaj yok - sadece crush bildirimi'
                }
            })
        });

        if (response.ok) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: 'Mesaj gönderildi!' })
            };
        } else {
            const errorText = await response.text();
            console.error('EmailJS Error:', errorText);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Email gönderilemedi', details: errorText })
            };
        }

    } catch (error) {
        console.error('Function Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Sunucu hatası', details: error.message })
        };
    }
};

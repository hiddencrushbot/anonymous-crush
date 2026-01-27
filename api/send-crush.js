import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Sadece POST isteklerine izin ver
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, message } = req.body;

    if (!username) {
      return res.status(400).json({ 
        success: false, 
        error: 'Kullanıcı adı gerekli' 
      });
    }

    // Resend ile e-posta gönder
    const data = await resend.emails.send({
      from: 'Anonymous Crush <onboarding@resend.dev>',
      to: 'your-email@example.com', // BURAYA KENDİ E-POSTANIZI YAZIN
      subject: `💕 Yeni Crush Mesajı - @${username}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">💕 Yeni Anonim Crush Mesajı</h2>
          <p><strong>Twitter Kullanıcısı:</strong> @${username}</p>
          <p><strong>Mesaj:</strong></p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 10px 0;">
            ${message || '<em>Mesaj yok (sadece crush bildirimi)</em>'}
          </div>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            Bu mesaj HiddenCrushBot.com üzerinden gönderildi
          </p>
        </div>
      `
    });

    return res.status(200).json({ 
      success: true, 
      messageId: data.id 
    });

  } catch (error) {
    console.error('Resend Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'E-posta gönderilemedi'
    });
  }
}

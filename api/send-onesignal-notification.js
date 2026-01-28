export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { username, questionText } = req.body;
    if (!username || !questionText) return res.status(400).json({ error: 'Missing data' });

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        filters: [{ field: 'tag', key: 'username', relation: '=', value: username }],
        headings: { en: '💭 Yeni Soru!' },
        contents: { en: questionText.substring(0, 100) },
        url: 'https://hiddencrushbot.com/ask-secretly.html'
      })
    });

    const data = await response.json();
    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

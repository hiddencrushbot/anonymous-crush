export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { s, i } = req.query;
  const OMDB_KEY = process.env.OMDB_API_KEY || '59128d09';

  try {
    let url;
    if (i) {
      // Detay çek (imdbID ile)
      url = `https://www.omdbapi.com/?i=${i}&apikey=${OMDB_KEY}`;
    } else if (s) {
      // Arama
      url = `https://www.omdbapi.com/?s=${encodeURIComponent(s)}&apikey=${OMDB_KEY}`;
    } else {
      return res.status(400).json({ error: 'Parametre eksik' });
    }

    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
}

import https from 'https';
import http from 'http';

/**
 * GET /api/proxy-image?url=<encoded-url>
 * Fetches an image from bonettoconamor.com server-side (no CORS restriction)
 * and streams it back to the browser with proper CORS headers.
 * This allows react-pdf to embed remote images without CORS errors.
 */
export const proxyImage = (req, res) => {
  const { url } = req.query;

  // ── Validations ──────────────────────────────────────────────────────────
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(decodeURIComponent(url));
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Security: only proxy images from bonettoconamor.com
  if (!parsedUrl.hostname.endsWith('bonettoconamor.com')) {
    return res.status(403).json({ error: 'Only bonettoconamor.com images allowed' });
  }

  // Only allow image paths
  const validExtensions = /\.(png|jpg|jpeg|gif|webp|svg|ico)(\?.*)?$/i;
  if (!validExtensions.test(parsedUrl.pathname)) {
    return res.status(403).json({ error: 'Only image files allowed' });
  }

  // ── Fetch & stream ────────────────────────────────────────────────────────
  const client = parsedUrl.protocol === 'https:' ? https : http;

  const request = client.get(parsedUrl.toString(), (imageRes) => {
    if (imageRes.statusCode !== 200) {
      return res.status(imageRes.statusCode).json({ error: 'Image not found' });
    }

    const contentType = imageRes.headers['content-type'] || 'image/png';

    // CORS headers so the browser (react-pdf) can use the response
    res.setHeader('Access-Control-Allow-Origin', 'https://pedidos.bonettoconamor.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // cache 24h

    imageRes.pipe(res);
  });

  request.on('error', (err) => {
    console.error('[ImageProxy] Fetch error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Failed to fetch image from origin' });
    }
  });

  request.setTimeout(8000, () => {
    request.destroy();
    if (!res.headersSent) {
      res.status(504).json({ error: 'Image fetch timeout' });
    }
  });
};

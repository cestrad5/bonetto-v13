import https from 'https';
import http from 'http';
import sharp from 'sharp';

/**
 * GET /api/proxy-image?url=<encoded-url>
 * Fetches an image from bonettoconamor.com server-side, follows redirects,
 * converts WebP→JPEG, and streams the result back with CORS headers.
 * This allows @react-pdf/renderer to embed remote images without CORS errors.
 */

const MAX_REDIRECTS = 5;

/**
 * Recursively fetches a URL, following up to MAX_REDIRECTS redirects.
 * Resolves with the final IncomingMessage response.
 */
function fetchFollowingRedirects(urlString, redirectsLeft = MAX_REDIRECTS) {
  return new Promise((resolve, reject) => {
    if (redirectsLeft < 0) {
      return reject(new Error('Too many redirects'));
    }

    let parsed;
    try {
      parsed = new URL(urlString);
    } catch (e) {
      return reject(new Error('Invalid redirect URL'));
    }

    const client = parsed.protocol === 'https:' ? https : http;

    const req = client.get(
      {
        hostname: parsed.hostname,
        path:     parsed.pathname + parsed.search,
        protocol: parsed.protocol,
        headers:  { 'User-Agent': 'Mozilla/5.0 BonettoPDFProxy/1.0' },
      },
      (res) => {
        const { statusCode, headers } = res;

        // Follow 3xx redirects
        if ([301, 302, 303, 307, 308].includes(statusCode) && headers.location) {
          // Drain the redirect response body so the socket is freed
          res.resume();
          // Resolve the redirect URL (may be relative)
          const nextUrl = new URL(headers.location, urlString).toString();
          console.log(`[ImageProxy] Redirect ${statusCode}: ${urlString} → ${nextUrl}`);
          return resolve(fetchFollowingRedirects(nextUrl, redirectsLeft - 1));
        }

        resolve(res);
      }
    );

    req.on('error', reject);

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Image fetch timeout'));
    });
  });
}

export const proxyImage = async (req, res) => {
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

  // Security: only allow initial requests from bonettoconamor.com
  if (!parsedUrl.hostname.endsWith('bonettoconamor.com')) {
    return res.status(403).json({ error: 'Only bonettoconamor.com images allowed' });
  }

  // Only allow image paths
  const validExtensions = /\.(png|jpg|jpeg|gif|webp|svg|ico)(\?.*)?$/i;
  if (!validExtensions.test(parsedUrl.pathname)) {
    return res.status(403).json({ error: 'Only image files allowed' });
  }

  // ── Fetch (with redirect following) ──────────────────────────────────────
  try {
    const imageRes = await fetchFollowingRedirects(parsedUrl.toString());

    if (imageRes.statusCode !== 200) {
      console.warn(`[ImageProxy] Non-200 status ${imageRes.statusCode} for: ${url}`);
      return res.status(imageRes.statusCode).json({ error: 'Image not found at origin' });
    }

    const contentType = imageRes.headers['content-type'] || 'image/jpeg';

    // CORS headers — use * so react-pdf Web Workers can access the response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    // ── WebP → JPEG conversion (react-pdf/pdfkit only supports JPEG & PNG) ──
    if (contentType.includes('webp')) {
      console.log(`[ImageProxy] Converting WebP→JPEG for: ${url}`);
      res.setHeader('Content-Type', 'image/jpeg');
      imageRes.pipe(sharp().jpeg({ quality: 85 })).pipe(res);
    } else {
      res.setHeader('Content-Type', contentType);
      imageRes.pipe(res);
    }
  } catch (err) {
    console.error('[ImageProxy] Error:', err.message, '| URL:', url);
    if (!res.headersSent) {
      res.status(502).json({ error: err.message || 'Failed to fetch image' });
    }
  }
};

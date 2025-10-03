// api/flag.js
// Return flag if User-Agent contains "L4F" or if custom header/query param provided.
// Usage: GET /api/flag  or rewrite /flag -> /api/flag

module.exports = function handler(req, res) {
  const FLAG = process.env.FLAG || 'L4F{user-agent_mastery_L4F}';

  const uaHeader = (req.headers['user-agent'] || '');
  const uaQuery = (req.query && req.query.ua) ? String(req.query.ua) : '';
  const uaX = (req.headers['x-client-ua'] || '');

  // In Vercel serverless, req.query may not be available for raw handler in CommonJS.
  // Try to parse URL query manually if needed.
  let uaFromUrl = '';
  try {
    const url = new URL(req.url || '', `http://${req.headers.host || 'example.com'}`);
    uaFromUrl = url.searchParams.get('ua') || '';
  } catch (e) {
    uaFromUrl = uaQuery;
  }

  const uaCombined = [uaHeader, uaX, uaFromUrl].filter(Boolean).join(' ');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (uaCombined.includes('L4F')) {
    return res.end(`<!doctype html>
      <html><head><meta charset="utf-8"><title>Flag</title></head>
      <body style="font-family:system-ui,Arial;padding:24px;">
        <h1>Congrats!</h1>
        <p>Flag: <code>${escapeHtml(FLAG)}</code></p>
      </body></html>`);
  } else {
    return res.end(`<!doctype html>
      <html><head><meta charset="utf-8"><title>No Flag</title></head>
      <body style="font-family:system-ui,Arial;padding:24px;">
        <h1>Tidak ada flag di sini</h1>
      </body></html>`);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
};

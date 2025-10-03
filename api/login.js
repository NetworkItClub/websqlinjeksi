// api/login.js
// Pure-JS vulnerable handler (simulated SQL injection behavior).
// Accepts application/x-www-form-urlencoded POST body.

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.end('Method Not Allowed');
  }

  // Read body
  let body = '';
  req.on('data', (chunk) => body += chunk);
  req.on('end', () => {
    // Support both form-encoded and JSON (if client sends JSON)
    let params = {};
    const ct = (req.headers['content-type'] || '').toLowerCase();
    if (ct.includes('application/json')) {
      try { params = JSON.parse(body || '{}'); } catch (e) { params = {}; }
    } else {
      // parse x-www-form-urlencoded
      const sp = new URLSearchParams(body || '');
      for (const [k, v] of sp.entries()) params[k] = v;
    }

    const username = String(params.username || '');
    const password = String(params.password || '');
    const FLAG = process.env.FLAG || 'L4F{sql_injection_success}';

    // In-memory "users"
    const users = [
      { username: 'admin', password: 's3cret', flag: FLAG },
      { username: 'guest', password: 'guest', flag: '' }
    ];

    // Simulate vulnerable SQL behaviour (for CTF):
    // 1) admin' --  -> bypass password check
    // 2) tautology payloads like "' OR '1'='1" -> return first row (admin)
    // 3) else exact match

    let found = null;

    // pattern: admin' --  (allow variants with/without space)
    if (/^admin'?(\s)*--/i.test(username)) {
      found = users.find(u => u.username === 'admin');
    }

    // tautology pattern anywhere
    if (!found && (/'\s*or\s*'1'\s*=\s*'1/i.test(username) || /'\s*or\s*'1'\s*=\s*'1/i.test(password))) {
      found = users[0]; // first row (admin)
    }

    // exact match fallback
    if (!found) {
      found = users.find(u => u.username === username && u.password === password) || null;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    if (found && found.flag) {
      // Successful exploit/login returns flag
      return res.end(`<h1>Welcome ${escapeHtml(found.username)}</h1><p>Flag: <code>${escapeHtml(found.flag)}</code></p>`);
    } else if (found) {
      return res.end(`<h1>Welcome ${escapeHtml(found.username)}</h1><p>No flag for you.</p>`);
    } else {
      return res.end(`<h1>Login failed</h1>`);
    }
  });

  // simple HTML-escaping helper
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
};

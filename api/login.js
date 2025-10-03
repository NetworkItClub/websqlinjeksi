// api/login.js  (CommonJS)
const sqlite3 = require('sqlite3');

function initDb(cb) {
  // in-memory DB per invocation — fine for CTF/demo
  const db = new sqlite3.Database(':memory:', (err) => {
    if (err) return cb(err);
    db.serialize(() => {
      db.run(`CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, flag TEXT)`);
      db.run(`INSERT INTO users (username,password,flag) VALUES ('admin','s3cret','L4F{sql_injection_success}')`);
      db.run(`INSERT INTO users (username,password,flag) VALUES ('guest','guest','')`);
      cb(null, db);
    });
  });
}

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  // parse body (application/x-www-form-urlencoded)
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const params = {};
    body.split('&').forEach(pair => {
      const [k,v] = pair.split('=').map(decodeURIComponent);
      if (k) params[k] = v || '';
    });
    const username = params.username || '';
    const password = params.password || '';

    initDb((err, db) => {
      if (err) {
        res.statusCode = 500;
        return res.end('DB init error');
      }

      // <-- VULNERABLE: direct string concatenation into SQL
      const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}' LIMIT 1;`;
      console.log('SQL:', query);

      db.get(query, (err, row) => {
        if (err) {
          res.statusCode = 500;
          res.end('SQL error');
          db.close();
          return;
        }

        res.setHeader('Content-Type', 'text/html; charset=utf-8');

        if (row && row.flag) {
          res.end(`<h1>Welcome ${row.username}</h1><p>Flag: <code>${row.flag}</code></p>`);
        } else if (row) {
          res.end(`<h1>Welcome ${row.username}</h1><p>No flag for you.</p>`);
        } else {
          res.end(`<h1>Login failed</h1>`);
        }
        db.close();
      });
    });
  });
};
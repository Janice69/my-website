import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const contentPath = path.join(root, 'data', 'content.json');
const sessions = new Map();

function readContent() { return JSON.parse(fs.readFileSync(contentPath, 'utf8')); }
function writeContent(content) { fs.writeFileSync(contentPath, JSON.stringify(content, null, 2) + '\n', 'utf8'); }
function cookieValue(request, name) { return (request.headers.cookie || '').split(';').map((part) => part.trim().split('=')).find(([key]) => key === name)?.[1]; }
function currentUser(request) { const token = cookieValue(request, 'janice_admin'); return token && sessions.has(token) ? sessions.get(token) : null; }
function send(response, status, body, headers = {}) { response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers }); response.end(JSON.stringify(body)); }
function readBody(request) { return new Promise((resolve, reject) => { let raw = ''; request.on('data', (chunk) => { raw += chunk; if (raw.length > 2_000_000) request.destroy(); }); request.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('Invalid JSON')); } }); request.on('error', reject); }); }
function sameSecret(left, right) { const a = Buffer.from(left || ''); const b = Buffer.from(right || ''); return a.length === b.length && crypto.timingSafeEqual(a, b); }

const server = http.createServer(async (request, response) => {
  try {
    if (request.url === '/api/session' && request.method === 'GET') return send(response, 200, { user: currentUser(request) });
    if (request.url === '/api/login' && request.method === 'POST') {
      const body = await readBody(request);
      if (!process.env.ADMIN_PASSWORD) return send(response, 500, { error: 'ADMIN_PASSWORD is not configured on the server.' });
      if (!sameSecret(body.email, process.env.ADMIN_EMAIL || 'janice@example.com') || !sameSecret(body.password, process.env.ADMIN_PASSWORD)) return send(response, 401, { error: 'That email or password is not correct.' });
      const token = crypto.randomBytes(32).toString('hex'); sessions.set(token, { email: body.email });
      return send(response, 200, { user: { email: body.email } }, { 'Set-Cookie': `janice_admin=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800` });
    }
    if (request.url === '/api/logout' && request.method === 'POST') { const token = cookieValue(request, 'janice_admin'); if (token) sessions.delete(token); return send(response, 200, { ok: true }, { 'Set-Cookie': 'janice_admin=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' }); }
    if (request.url === '/api/content' && request.method === 'GET') { const content = readContent(); return send(response, 200, currentUser(request) ? content : { ...content, projects: content.projects.filter((project) => project.published !== false) }); }
    if (request.url === '/api/content' && request.method === 'PUT') { if (!currentUser(request)) return send(response, 401, { error: 'Please sign in first.' }); const next = await readBody(request); if (!next.about?.headline || !Array.isArray(next.projects)) return send(response, 400, { error: 'Please provide About content and a project list.' }); writeContent({ about: next.about, projects: next.projects.map((project, index) => ({ ...project, sort_order: index + 1 })) }); return send(response, 200, readContent()); }
    if (request.method !== 'GET') return send(response, 404, { error: 'Not found' });
    const requested = request.url === '/' ? '/index.html' : request.url.split('?')[0];
    const safePath = path.normalize(path.join(root, 'dist', requested));
    const filePath = safePath.startsWith(path.join(root, 'dist')) && fs.existsSync(safePath) && fs.statSync(safePath).isFile() ? safePath : path.join(root, 'dist', 'index.html');
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
    response.writeHead(200, { 'Content-Type': `${types[path.extname(filePath)] || 'application/octet-stream'}; charset=utf-8` }); response.end(fs.readFileSync(filePath));
  } catch (error) { send(response, 500, { error: error.message || 'Server error' }); }
});

server.listen(port, () => console.log(`Janice portfolio running at http://localhost:${port}`));

/* Utilitários compartilhados da API — conexão Postgres (Neon/Vercel) + tokens HMAC.
   Arquivos iniciados com "_" não viram rota na Vercel. */
const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');

const DB_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || '';
const sql = DB_URL ? neon(DB_URL) : null;

/* Segredo dos tokens: usa AUTH_SECRET se definido; senão deriva da própria URL do banco. */
const SECRET = crypto.createHash('sha256').update('gomes-buffet:' + (process.env.AUTH_SECRET || DB_URL || 'dev')).digest();

async function ensure() {
  await sql`CREATE TABLE IF NOT EXISTS app_state (
    id INT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
}

async function getState() {
  await ensure();
  const rows = await sql`SELECT data, updated_at FROM app_state WHERE id = 1`;
  return rows[0] || null;
}

async function putState(data) {
  await ensure();
  await sql`INSERT INTO app_state (id, data, updated_at) VALUES (1, ${JSON.stringify(data)}::jsonb, now())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`;
  const rows = await sql`SELECT updated_at FROM app_state WHERE id = 1`;
  return rows[0].updated_at;
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return body + '.' + mac;
}

function verify(token) {
  try {
    const [body, mac] = String(token || '').split('.');
    const good = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
    if (!mac || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(good))) return null;
    const p = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (!p.exp || p.exp < Date.now()) return null;
    return p;
  } catch (e) { return null; }
}

function authFrom(req) {
  const h = req.headers['authorization'] || '';
  return verify(h.replace(/^Bearer\s+/i, ''));
}

module.exports = { sql, getState, putState, sign, verify, authFrom, hasDb: !!DB_URL };

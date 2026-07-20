const db = require('./_db');

/* POST /api/auth { usuario, senha } → { token, user, state, updated_at }
   Primeira execução: cria o estado inicial com o administrador padrão. */
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  if (!db.hasDb) return res.status(500).json({ error: 'Banco de dados não conectado. No painel da Vercel: Storage → Create Database → Neon (Postgres) → Connect Project.' });
  try {
    const { usuario, senha } = req.body || {};
    let st = await db.getState();
    if (!st) {
      const fresh = {
        fresh: true,
        users: [{ id: 'u1', nome: 'Odair Matos', usuario: 'odair', senha: 'gomes2026', papel: 'Administrador',
                  perguntaSeg: 'Qual o nome da sua empresa de buffet?', respostaSeg: 'gomes' }]
      };
      const updated_at = await db.putState(fresh);
      st = { data: fresh, updated_at };
    }
    const u = (st.data.users || []).find(x =>
      x.usuario.toLowerCase() === String(usuario || '').trim().toLowerCase() && x.senha === senha);
    if (!u) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    const token = db.sign({ uid: u.id, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 });
    res.json({ token, user: { id: u.id }, state: st.data, updated_at: st.updated_at });
  } catch (e) {
    res.status(500).json({ error: 'Erro no servidor: ' + e.message });
  }
};

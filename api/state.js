const db = require('./_db');

/* GET /api/state → { state, updated_at }   |   PUT /api/state { data } → { ok, updated_at } */
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!db.hasDb) return res.status(500).json({ error: 'Banco de dados não conectado.' });
  const auth = db.authFrom(req);
  if (!auth) return res.status(401).json({ error: 'Não autenticado.' });
  try {
    if (req.method === 'GET') {
      const st = await db.getState();
      return res.json({ state: st ? st.data : null, updated_at: st ? st.updated_at : null });
    }
    if (req.method === 'PUT' || req.method === 'POST') {
      const data = req.body && req.body.data;
      if (!data || !Array.isArray(data.users) || !data.users.length)
        return res.status(400).json({ error: 'Estado inválido — precisa conter ao menos um usuário.' });
      if (!data.users.some(u => u.papel === 'Administrador'))
        return res.status(400).json({ error: 'Estado inválido — é preciso manter ao menos um administrador.' });
      const updated_at = await db.putState(data);
      return res.json({ ok: true, updated_at });
    }
    res.status(405).json({ error: 'Método não permitido' });
  } catch (e) {
    res.status(500).json({ error: 'Erro no servidor: ' + e.message });
  }
};

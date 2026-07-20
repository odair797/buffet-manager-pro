const db = require('./_db');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ ok: true, db: db.hasDb });
};

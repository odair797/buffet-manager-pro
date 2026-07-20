/* GET /api/preco?termo=carne
   Proxy da base aberta de preços do Paraná (Nota Paraná / Menor Preço) — dados reais de NFC-e.
   Serve como REFERÊNCIA NACIONAL de mercado (lojas do PR), editável pelo usuário.
   Filtra ruído e outliers e devolve mín/médio/máx + amostras. */
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const termo = String((req.query && req.query.termo) || '').trim();
  if (!termo) return res.status(400).json({ error: 'Informe o termo de pesquisa.' });
  // Centro em Curitiba (onde a base aberta tem dados), raio amplo p/ referência de mercado
  const url = 'https://menorpreco.notaparana.pr.gov.br/api/v1/produtos'
    + '?local=-25.4284,-49.2733&termo=' + encodeURIComponent(termo) + '&raio=50&pagina=1&ordem=0';
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 9000);
    const r = await fetch(url, { signal: ctl.signal, headers: { 'Accept': 'application/json' } });
    clearTimeout(t);
    if (!r.ok) throw new Error('fonte indisponível (' + r.status + ')');
    const data = await r.json();
    const prods = Array.isArray(data.produtos) ? data.produtos : [];
    // ruído comum que não é o ingrediente em si
    const RUIDO = ['SACHE','RACAO','RAÇÃO',' PET',' DOG','GATO','CACHORRO','FILHOTE','BISCOITO','PIPOCA','SALG','ADICIONAL',' ADC',' PORO'];
    let itens = prods.map(p => ({
      desc: p.desc || '',
      valor: parseFloat(String(p.valor).replace(',', '.')) || 0,
      estab: (p.estabelecimento && (p.estabelecimento.nm_fan || p.estabelecimento.nm_emp)) || '',
      mun: (p.estabelecimento && p.estabelecimento.mun) || '',
      uf: (p.estabelecimento && p.estabelecimento.uf) || ''
    })).filter(x => x.valor > 0 && !RUIDO.some(n => x.desc.toUpperCase().includes(n.trim())));
    // remove outliers por mediana
    const vals = itens.map(x => x.valor).sort((a, b) => a - b);
    let precos = { min: 0, med: 0, max: 0, n: 0 };
    if (vals.length) {
      const med0 = vals[Math.floor(vals.length / 2)];
      const trimmed = itens.filter(x => x.valor >= med0 / 4 && x.valor <= med0 * 4);
      const tv = trimmed.map(x => x.valor);
      if (tv.length) {
        const soma = tv.reduce((s, v) => s + v, 0);
        precos = {
          min: +Math.min(...tv).toFixed(2),
          max: +Math.max(...tv).toFixed(2),
          med: +(soma / tv.length).toFixed(2),
          n: tv.length
        };
        itens = trimmed;
      }
    }
    itens.sort((a, b) => a.valor - b.valor);
    res.json({ termo, fonte: 'Base aberta Nota Paraná (NFC-e) — referência nacional', precos, amostras: itens.slice(0, 20) });
  } catch (e) {
    res.status(502).json({ error: 'Não foi possível consultar a base de preços agora: ' + e.message });
  }
};

// POST/GET /api/login?email=...  — confere no Upstash se o e-mail comprou o Essencial (chave "apess:<email>").
const PREFIXO = 'apess:';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const email = (req.query.email || '').toString().toLowerCase().trim();
  if (!email) return res.json({ success: false, error: 'Email não informado.' });

  const UPSTASH_URL = process.env.KV_REST_API_URL || 'https://brave-squid-149229.upstash.io';
  const UPSTASH_TOKEN = process.env.KV_REST_API_READ_ONLY_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!UPSTASH_TOKEN) return res.json({ success: false, error: 'Erro ao verificar acesso. Tente novamente.' });

  try {
    const resp = await fetch(`${UPSTASH_URL}/get/${PREFIXO}${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      cache: 'no-store',
    });
    const data = await resp.json();
    if (!data.result) {
      return res.json({ success: false, error: 'Email não encontrado. Verifique se usou o mesmo email da compra.' });
    }
    const c = JSON.parse(data.result);
    if (!(c.base || c.limp || c.leg || c.upg)) {
      return res.json({ success: false, error: 'Acesso não disponível. Entre em contato com o suporte.' });
    }
    return res.json({
      success: true,
      permissions: { base: !!c.base, limp: !!c.limp, leg: !!c.leg, upg: !!c.upg },
    });
  } catch (e) {
    console.error('Login error:', e);
    return res.json({ success: false, error: 'Erro ao verificar acesso. Tente novamente.' });
  }
}

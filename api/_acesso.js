// Confere no Upstash se o e-mail tem o produto liberado. Compartilhado por download e conteudo.
const PREFIXO = 'apess:';
export async function temAcesso(email, produto) {
  const URL_ = process.env.KV_REST_API_URL || 'https://brave-squid-149229.upstash.io';
  const TOKEN = process.env.KV_REST_API_READ_ONLY_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!TOKEN) throw new Error('Banco de dados não configurado');
  const r = await fetch(`${URL_}/get/${PREFIXO}${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: 'no-store',
  });
  const d = await r.json();
  if (!d.result) return false;
  return !!JSON.parse(d.result)[produto];
}

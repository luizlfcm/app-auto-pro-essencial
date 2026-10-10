// GET /api/conteudo?k=base|limp|leg&email=... — entrega o conteúdo pago (JSON) só para quem comprou.
// As receitas pagas NÃO ficam no HTML do app, então não dá para ver pelo "código-fonte".
import fs from 'fs';
import path from 'path';
import { temAcesso } from './_acesso.js';

const ARQ = { base: 'base.json', limp: 'limp.json', leg: 'leg.json' };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const k = (req.query.k || '').toString();
  const email = (req.query.email || '').toString().trim().toLowerCase();
  if (!ARQ[k]) return res.status(400).json({ error: 'Conteúdo inválido' });
  if (!email) return res.status(401).json({ error: 'Email não informado' });
  try {
    if (!(await temAcesso(email, k))) return res.status(403).json({ error: 'Conteúdo não liberado para este email' });
    const txt = fs.readFileSync(path.join(process.cwd(), 'api', 'files', ARQ[k]), 'utf8');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(txt);
  } catch (e) {
    console.error('conteudo erro:', e);
    return res.status(500).json({ error: 'Erro ao carregar. Tente novamente.' });
  }
}

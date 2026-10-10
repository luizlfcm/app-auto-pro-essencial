// GET /api/download?produto=limp&email=... — serve os PDFs só para quem comprou.
import fs from 'fs';
import path from 'path';
import { temAcesso } from './_acesso.js';

const FILES = {
  base: { file: 'guia-essencial.pdf', name: 'Formula-Auto-Pro-Essencial-20-Receitas.pdf' },
  limp: { file: 'guia-limpeza.pdf', name: '50-Formulas-de-Limpeza.pdf' },
  leg: { file: 'guia-legalizacao.pdf', name: 'Guia-de-Legalizacao.pdf' },
};

export default async function handler(req, res) {
  const produto = (req.query.produto || '').toString();
  const email = (req.query.email || '').toString().trim().toLowerCase();
  const meta = FILES[produto];
  if (!meta) return res.status(400).json({ error: 'Produto inválido' });
  if (!email) return res.status(401).json({ error: 'Email não informado' });
  try {
    if (!(await temAcesso(email, produto))) return res.status(403).json({ error: 'Este produto não está liberado para este email' });
    const buf = fs.readFileSync(path.join(process.cwd(), 'api', 'files', meta.file));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${meta.name}"`);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buf);
  } catch (err) {
    console.error('download erro:', err);
    return res.status(500).json({ error: 'Erro ao entregar o arquivo. Tente novamente.' });
  }
}

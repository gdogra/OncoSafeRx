import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();

function parseChangelog(text) {
  // Find the first version section like: ## vX.Y.Z - YYYY-MM-DD
  const lines = text.split(/\r?\n/);
  let start = -1;
  let title = '';
  for (let i = 0; i < lines.length; i++) {
    const m = /^##\s+v(?<version>\d+\.\d+\.\d+)\s*-\s*(?<date>\d{4}-\d{2}-\d{2})/.exec(lines[i]);
    if (m) {
      start = i;
      title = lines[i];
      break;
    }
  }
  if (start === -1) return null;
  // Capture until next '## '
  let end = lines.length;
  for (let j = start + 1; j < lines.length; j++) {
    if (/^##\s+v\d+\.\d+\.\d+/.test(lines[j])) { end = j; break; }
  }
  const section = lines.slice(start, end).join('\n');
  // Extract subsections: Added, Changed, Fixed, Notes
  function extractBlock(header) {
    const re = new RegExp(`^###\\s+${header}\\s*$`, 'm');
    const m = re.exec(section);
    if (!m) return null;
    const from = m.index + m[0].length;
    const after = section.slice(from);
    const m2 = /^###\s+\w+/m.exec(after);
    const block = m2 ? after.slice(0, m2.index) : after;
    return block.trim();
  }
  const mtitle = /^##\s+(?<ver>v\d+\.\d+\.\d+)\s*-\s*(?<date>\d{4}-\d{2}-\d{2})/m.exec(section);
  return {
    version: mtitle?.groups?.ver || null,
    date: mtitle?.groups?.date || null,
    added: extractBlock('Added'),
    changed: extractBlock('Changed'),
    fixed: extractBlock('Fixed'),
    notes: extractBlock('Notes'),
    raw: section
  };
}

router.get('/release-notes', async (req, res) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const root = join(__dirname, '..', '..');
    const changelogPath = join(root, 'CHANGELOG.md');
    const fs = await import('fs');
    if (!fs.existsSync(changelogPath)) return res.status(404).json({ error: 'changelog_not_found' });
    const text = fs.readFileSync(changelogPath, 'utf8');
    const parsed = parseChangelog(text);
    if (!parsed) return res.status(404).json({ error: 'no_versions_found' });
    return res.json({ ...parsed, openapi: '/openapi.yaml' });
  } catch (e) {
    return res.status(500).json({ error: 'failed_to_parse', message: e?.message || String(e) });
  }
});

export default router;


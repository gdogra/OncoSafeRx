import axios from 'axios';

const COMMON_ONCO_TERMS = new Map([
  ['期', 'phase'],
  ['I期', 'Phase 1'],
  ['II期', 'Phase 2'],
  ['III期', 'Phase 3'],
  ['IV期', 'Phase 4'],
  ['招募中', 'Recruiting'],
  ['募集', 'Recruiting'],
  ['乳腺癌', 'Breast cancer'],
  ['肺癌', 'Lung cancer'],
  ['结直肠癌', 'Colorectal cancer'],
  ['胃癌', 'Gastric cancer'],
  ['肝癌', 'Liver cancer'],
  ['白血病', 'Leukemia'],
  ['リンパ腫', 'Lymphoma'],
  ['乳がん', 'Breast cancer'],
]);

function detectLanguage(text) {
  if (!text) return 'und';
  if(/[\u3040-\u30ff\u31f0-\u31ff]/.test(text)) return 'ja';
  if(/[\u4e00-\u9fff]/.test(text)) return 'zh';
  return 'en';
}

async function googleTranslate(text, target = 'en') {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) return null;
  try {
    const url = 'https://translation.googleapis.com/language/translate/v2';
    const resp = await axios.post(url, { q: text, target }, { params: { key }, timeout: 10000 });
    const translated = resp.data?.data?.translations?.[0]?.translatedText;
    return translated || null;
  } catch(_e) { return null; }
}

function glossaryTranslate(text) {
  if (!text) return text;
  let out = text;
  for (const [k, v] of COMMON_ONCO_TERMS.entries()) {
    out = out.replaceAll(k, v);
  }
  return out === text ? null : out;
}

export async function translateToEnglish(text) {
  if (!text) return { translated: '', language: 'und' };
  const lang = detectLanguage(text);
  if (lang === 'en') return { translated: text, language: 'en' };
  const gloss = glossaryTranslate(text);
  if (gloss) return { translated: gloss, language: lang };
  const g = await googleTranslate(text, 'en');
  return { translated: g || text, language: lang };
}

export function normalizeNFC(str) {
  try { return (str || '').normalize('NFC'); } catch { return str || ''; }
}


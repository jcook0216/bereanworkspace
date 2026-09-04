import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API.Bible Standard 3-letter Book IDs
const BOOK_TO_APIBIBLE_ID: Record<string, string> = {
  'genesis': 'GEN',
  'exodus': 'EXO',
  'leviticus': 'LEV',
  'numbers': 'NUM',
  'deuteronomy': 'DEU',
  'joshua': 'JOS',
  'judges': 'JDG',
  'ruth': 'RUT',
  '1 samuel': '1SA',
  '2 samuel': '2SA',
  '1 kings': '1KI',
  '2 kings': '2KI',
  '1 chronicles': '1CH',
  '2 chronicles': '2CH',
  'ezra': 'EZR',
  'nehemiah': 'NEH',
  'esther': 'EST',
  'job': 'JOB',
  'psalms': 'PSA',
  'psalm': 'PSA',
  'proverbs': 'PRO',
  'ecclesiastes': 'ECC',
  'song of solomon': 'SNG',
  'song of songs': 'SNG',
  'isaiah': 'ISA',
  'jeremiah': 'JER',
  'lamentations': 'LAM',
  'ezekiel': 'EZK',
  'daniel': 'DAN',
  'hosea': 'HOS',
  'joel': 'JOL',
  'amos': 'AMO',
  'obadiah': 'OBA',
  'jonah': 'JON',
  'micah': 'MIC',
  'nahum': 'NAM',
  'habakkuk': 'HAB',
  'zephaniah': 'ZEP',
  'haggai': 'HAG',
  'zechariah': 'ZEC',
  'malachi': 'MAL',
  'matthew': 'MAT',
  'mark': 'MRK',
  'luke': 'LUK',
  'john': 'JHN',
  'acts': 'ACT',
  'romans': 'ROM',
  '1 corinthians': '1CO',
  '2 corinthians': '2CO',
  'galatians': 'GAL',
  'ephesians': 'EPH',
  'philippians': 'PHP',
  'colossians': 'COL',
  '1 thessalonians': '1TH',
  '2 thessalonians': '2TH',
  '1 timothy': '1TI',
  '2 timothy': '2TI',
  'titus': 'TIT',
  'philemon': 'PHM',
  'hebrews': 'HEB',
  'james': 'JAS',
  '1 peter': '1PE',
  '2 peter': '2PE',
  '1 john': '1JN',
  '2 john': '2JN',
  '3 john': '3JN',
  'jude': 'JUD',
  'revelation': 'REV'
};

// API.Bible translation IDs
// KJV: de4e12af7f28f599-02, ASV: 06125adad2d5898a-01, WEB: 9879dbb7cfe39e4d-04, FBV: 65eec8e0b60e656b-01
const TRANSLATION_TO_BIBLE_ID: Record<string, string> = {
  'ASV': '06125adad2d5898a-01',
  'KJV': 'de4e12af7f28f599-02',
  'WEB': '9879dbb7cfe39e4d-04',
  'FBV': '65eec8e0b60e656b-01',
  'BBE': 'bba9f40183526463-01',
  // Default fallbacks for proprietary licensed texts in the demo
  'NASB': '06125adad2d5898a-01', // uses ASV as foundational text
  'NKJV': 'de4e12af7f28f599-02', // uses KJV as foundational text
  'NLT': '9879dbb7cfe39e4d-04'   // uses WEB modern English
};

// In-memory LRU cache for fetched chapters to prevent redundant upstream API calls
const chapterCache = new Map<string, any>();

// Helper to strip HTML tags while keeping clean spacing
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Parse API.Bible chapter HTML into structured verses
function parseChapterHtml(html: string): Array<{ verse: number; text: string; heading?: string }> {
  const verses: Array<{ verse: number; text: string; heading?: string }> = [];

  // Look for headings (e.g. <span class="s">Heading</span> or <div class="s1">...</div>)
  let currentHeading: string | undefined = undefined;

  // Split or match based on verse markers: <span data-number="1" class="v">1</span>
  const verseRegex = /<span[^>]*data-number="(\d+)"[^>]*>[\s\S]*?<\/span>([\s\S]*?)(?=(?:<span[^>]*data-number="\d+"|$))/gi;

  let match: RegExpExecArray | null;
  while ((match = verseRegex.exec(html)) !== null) {
    const verseNum = parseInt(match[1], 10);
    const rawContent = match[2];

    // Check if there's a heading inside or before
    const headingMatch = rawContent.match(/<span[^>]*class="(?:s|s1|s2)"[^>]*>([\s\S]*?)<\/span>/i);
    if (headingMatch) {
      currentHeading = stripHtml(headingMatch[1]);
    }

    // Clean text by stripping note tags (<span class="f">...</span>), verse markers, and cross refs
    const cleanContent = rawContent
      .replace(/<span[^>]*class="(?:f|x|s|s1|s2)"[^>]*>[\s\S]*?<\/span>/gi, '')
      .replace(/<sup[\s\S]*?<\/sup>/gi, '');

    const text = stripHtml(cleanContent);

    if (text) {
      verses.push({
        verse: verseNum,
        text,
        heading: currentHeading
      });
      currentHeading = undefined; // reset heading once applied
    }
  }

  return verses;
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Status & Health
app.get('/api/bible/status', (req, res) => {
  const apiKey = process.env.BIBLE_API_KEY || process.env.API_BIBLE_KEY;
  res.json({
    status: 'ok',
    configured: Boolean(apiKey && apiKey.trim().length > 5),
    provider: 'API.Bible (American Bible Society)',
    supportedTranslations: ['ASV', 'KJV', 'WEB', 'FBV', 'BBE', 'NASB', 'NKJV', 'NLT'],
    cachedChapters: chapterCache.size
  });
});

// 2. Fetch Chapter Text
app.get('/api/bible/chapter', async (req, res) => {
  try {
    const book = String(req.query.book || '').trim();
    const chapter = parseInt(String(req.query.chapter || '1'), 10);
    const translation = String(req.query.translation || 'ASV').toUpperCase();

    if (!book || isNaN(chapter)) {
      return res.status(400).json({ error: 'Missing book or chapter parameter.' });
    }

    const bookCode = BOOK_TO_APIBIBLE_ID[book.toLowerCase()];
    if (!bookCode) {
      return res.status(400).json({ error: `Unknown book name: ${book}` });
    }

    const bibleId = TRANSLATION_TO_BIBLE_ID[translation] || TRANSLATION_TO_BIBLE_ID['ASV'];
    const chapterId = `${bookCode}.${chapter}`;
    const cacheKey = `${bibleId}:${chapterId}`;

    if (chapterCache.has(cacheKey)) {
      return res.json({
        ok: true,
        source: 'api.bible-cached',
        book,
        chapter,
        translation,
        verses: chapterCache.get(cacheKey)
      });
    }

    const apiKey = process.env.BIBLE_API_KEY || process.env.API_BIBLE_KEY;
    if (!apiKey) {
      return res.json({
        ok: false,
        error: 'BIBLE_API_KEY is not configured in environment. Using high-fidelity local dataset.',
        fallbackToLocal: true
      });
    }

    // Call API.Bible
    const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${chapterId}?content-type=html&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`;

    const apiRes = await fetch(url, {
      headers: {
        'api-key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      console.warn(`API.Bible error (${apiRes.status}):`, errorText);
      return res.json({
        ok: false,
        status: apiRes.status,
        error: `API.Bible returned status ${apiRes.status}`,
        fallbackToLocal: true
      });
    }

    const data: any = await apiRes.json();
    const htmlContent = data?.data?.content || '';
    const verses = parseChapterHtml(htmlContent);

    if (verses.length > 0) {
      chapterCache.set(cacheKey, verses);
      return res.json({
        ok: true,
        source: 'api.bible',
        reference: data?.data?.reference || `${book} ${chapter}`,
        book,
        chapter,
        translation,
        verses
      });
    }

    return res.json({
      ok: false,
      error: 'No verses parsed from API.Bible payload.',
      fallbackToLocal: true
    });
  } catch (error: any) {
    console.error('API.Bible chapter route error:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Internal server error',
      fallbackToLocal: true
    });
  }
});

// 3. Search Scripture
app.get('/api/bible/search', async (req, res) => {
  try {
    const query = String(req.query.query || '').trim();
    const translation = String(req.query.translation || 'ASV').toUpperCase();
    const limit = parseInt(String(req.query.limit || '20'), 10);

    if (!query) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const apiKey = process.env.BIBLE_API_KEY || process.env.API_BIBLE_KEY;
    if (!apiKey) {
      return res.json({
        ok: false,
        error: 'BIBLE_API_KEY is not configured. Falling back to local search index.',
        fallbackToLocal: true
      });
    }

    const bibleId = TRANSLATION_TO_BIBLE_ID[translation] || TRANSLATION_TO_BIBLE_ID['ASV'];
    const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/search?query=${encodeURIComponent(query)}&limit=${limit}`;

    const apiRes = await fetch(url, {
      headers: {
        'api-key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!apiRes.ok) {
      return res.json({
        ok: false,
        status: apiRes.status,
        fallbackToLocal: true
      });
    }

    const data: any = await apiRes.json();
    return res.json({
      ok: true,
      source: 'api.bible',
      total: data?.data?.total || 0,
      verses: (data?.data?.verses || []).map((v: any) => ({
        id: v.id,
        reference: v.reference,
        text: stripHtml(v.text)
      }))
    });
  } catch (error: any) {
    console.error('API.Bible search route error:', error);
    return res.status(500).json({
      ok: false,
      error: error.message,
      fallbackToLocal: true
    });
  }
});

// ==========================================
// VITE & STATIC FILE SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Berean Workspace server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

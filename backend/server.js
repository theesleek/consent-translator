/**
 * Consent Translator — Final Version
 * Uses Groq API (free, no credit card needed)
 * Get your key at: console.groq.com
 */

const express  = require('express');
const cors     = require('cors');
const axios    = require('axios');
const cheerio  = require('cheerio');

const gateway  = express();
const portNum  = process.env.PORT || 4000;
const GROQ_KEY = process.env.GROQ_API_KEY;

gateway.use(cors());
gateway.use(express.json({ limit: '2mb' }));

/* ─── Fetch and clean text from a URL ─────────────────── */
async function pullPolicyText(targetUrl) {
  try { new URL(targetUrl); } catch {
    throw new Error('Invalid URL format.');
  }

  // Try multiple user agents in case one gets blocked
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0',
  ];

  let lastError = null;

  for (const agent of userAgents) {
    try {
      const resp = await axios.get(targetUrl, {
        timeout: 25000,
        maxRedirects: 10,
        headers: {
          'User-Agent': agent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'no-cache',
        },
      });

      const dom = cheerio.load(resp.data);
      dom('script, style, nav, footer, header, aside, noscript, iframe, svg').remove();
      const rawText = dom('body').text()
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, ' ')
        .trim();

      if (rawText.length < 100) {
        throw new Error('Page has no readable text. Try pasting the policy text directly.');
      }

      return rawText.slice(0, 12000);

    } catch (err) {
      lastError = err;
      // Try next user agent
      continue;
    }
  }

  // All user agents failed
  throw new Error(
    'Website is blocking automated access. Please copy and paste the policy text manually instead of using a URL.'
  );
}

/* ─── Build the AI prompt ─────────────────────────────── */
function buildPrompt(policyContent) {
  return `You are a privacy-rights analyst specialising in Indian apps.
Analyse this privacy policy and return ONLY a valid JSON object.
No markdown, no backticks, no explanation — just the raw JSON.

Required JSON format:
{
  "appGuess": "name of app or Unknown",
  "overallRisk": "Low or Medium or High or Critical",
  "oneLineSummary": "max 20 words plain language summary",
  "dataCollected": ["item1", "item2", "item3"],
  "purposeOfUse": ["item1", "item2", "item3"],
  "retentionPeriod": "plain language or Not stated",
  "thirdPartySharing": "plain language description",
  "topAlarmingClauses": [
    { "clause": "first alarming clause paraphrase", "whyItMatters": "plain explanation under 30 words" },
    { "clause": "second alarming clause paraphrase", "whyItMatters": "plain explanation under 30 words" },
    { "clause": "third alarming clause paraphrase", "whyItMatters": "plain explanation under 30 words" }
  ],
  "shouldYouWorry": "one sentence verdict",
  "hindiSummary": "2-3 sentences in Hindi script",
  "score": 45
}

Important rules:
- score must be a plain integer between 0 and 100 (100 = safest, 0 = worst)
- overallRisk must be exactly one of: Low, Medium, High, Critical
- topAlarmingClauses must have exactly 3 items
- All strings must use double quotes
- No trailing commas
- Output raw JSON only — nothing before or after it

Privacy policy text:
${policyContent}`;
}

/* ─── Try to salvage broken JSON from AI output ───────── */
function extractJSON(text) {
  try { return JSON.parse(text); } catch {}
  const stripped = text.replace(/```json|```/gi, '').trim();
  try { return JSON.parse(stripped); } catch {}
  const start = stripped.indexOf('{');
  const end   = stripped.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    try { return JSON.parse(stripped.slice(start, end + 1)); } catch {}
  }
  return null;
}

/* ─── Routes ──────────────────────────────────────────── */

gateway.get('/ping', (_req, res) => res.json({ status: 'alive' }));

gateway.post('/analyse', async (req, res) => {
  try {
    if (!GROQ_KEY) {
      return res.status(500).json({
        error: 'GROQ_API_KEY is not set. Run: set GROQ_API_KEY=your-key-here'
      });
    }

    const { url: suppliedUrl, rawText: suppliedText } = req.body;

    if (!suppliedUrl && !suppliedText) {
      return res.status(400).json({ error: 'Please provide a URL or paste policy text.' });
    }

    let policyContent = suppliedText ? suppliedText.trim() : '';

    if (suppliedUrl) {
      try {
        policyContent = await pullPolicyText(suppliedUrl.trim());
      } catch (fetchErr) {
        return res.status(422).json({ error: fetchErr.message });
      }
    }

    if (policyContent.length < 80) {
      return res.status(422).json({ error: 'Text is too short to analyse. Paste more content.' });
    }

    let groqResp;
    try {
      groqResp = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: buildPrompt(policyContent) }],
          temperature: 0.1,
          max_tokens: 1500,
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );
    } catch (apiErr) {
      const msg = apiErr.response?.data?.error?.message || apiErr.message;
      return res.status(500).json({ error: `Groq API error: ${msg}` });
    }

    const rawOutput = groqResp.data?.choices?.[0]?.message?.content?.trim();

    if (!rawOutput) {
      return res.status(500).json({ error: 'Groq returned empty response. Try again.' });
    }

    const parsed = extractJSON(rawOutput);

    if (!parsed) {
      return res.status(500).json({
        error: 'Could not parse AI response. Please try again.',
      });
    }

    parsed.score = Math.min(100, Math.max(0, parseInt(parsed.score) || 50));

    if (!Array.isArray(parsed.topAlarmingClauses)) {
      parsed.topAlarmingClauses = [];
    }
    while (parsed.topAlarmingClauses.length < 3) {
      parsed.topAlarmingClauses.push({
        clause: 'Not enough clauses found',
        whyItMatters: 'Policy may be incomplete or too short.'
      });
    }

    return res.json({ ok: true, analysis: parsed });

  } catch (err) {
    console.error('[/analyse]', err.message);
    return res.status(500).json({ error: 'Unexpected error: ' + err.message });
  }
});

gateway.listen(portNum, () => {
  console.log(`✅ Consent Translator running on port ${portNum}`);
  if (!GROQ_KEY) console.warn(`⚠️  GROQ_API_KEY not set! Run: set GROQ_API_KEY=your-key`);
});

/**
 * Vercel Serverless API：網路搜尋 + OpenAI 綜合回覆（Perplexity 風格）
 * - 若有 SERPER_API_KEY：先呼叫 Serper 搜尋，再以搜尋結果為脈絡用 OpenAI 生成圖文並茂回覆
 * - 若無：僅用 OpenAI（行為與原本相同）
 * 環境變數：OPENAI_API_KEY、SERPER_API_KEY（選用）
 */
const SERPER_SEARCH_URL = 'https://serper.dev/search';
const SERPER_IMAGES_URL = 'https://serper.dev/images';

const systemPromptNoSearch = `你是一位永續建材檢索助理。根據使用者的描述，推薦合適的材質並簡要說明理由（強度、耐候、環保、成本等）。回答請簡潔、條列，並註明可參考的標準或認證（如 ASTM、ISO、CNS）若適用。`;

const systemPromptWithSearch = `你是一位永續建材檢索助理，會根據「搜尋到的網路資料」回答使用者。
請用以下搜尋結果作為依據，整理成簡潔、條列式的回覆，並註明可參考的標準或認證（如 ASTM、ISO、CNS）若適用。
若搜尋結果中有圖片或具體產品/規格，可在回答中提及。
回答請圖文並茂：用 Markdown 格式（**粗體**、列表、段落），並在適當處註明資料來源（例如「根據 [來源標題](連結)」）。
不要捏造搜尋結果中沒有的內容。`;

async function serperSearch(query, apiKey, num = 8) {
  const res = await fetch(SERPER_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify({ q: query, num }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Serper search failed: ${res.status} ${t}`);
  }
  return res.json();
}

async function serperImages(query, apiKey, num = 4) {
  const res = await fetch(SERPER_IMAGES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify({ q: query, num }),
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return data?.images?.slice(0, num) || null;
}

function buildSearchContext(serperData) {
  const organic = serperData?.organic || [];
  const parts = organic.slice(0, 8).map((o, i) => {
    const title = o.title || '';
    const link = o.link || '';
    const snippet = o.snippet || '';
    return `[${i + 1}] 標題: ${title}\n連結: ${link}\n摘要: ${snippet}`;
  });
  return parts.join('\n\n');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const message = body?.message?.trim();
  if (!message) {
    return res.status(400).json({ error: '缺少 message 欄位' });
  }

  const MAX_HISTORY = 20;
  const rawHistory = Array.isArray(body?.history) ? body.history : [];
  const history = rawHistory
    .slice(-MAX_HISTORY)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: String(m.content).trim() }))
    .filter((m) => m.content.length > 0);

  const openaiKey = body?.apiKey?.trim() || process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return res.status(500).json({
      error: '請先設定 API Key（Study Control Bar 儲存至本機後使用）',
    });
  }

  const serperKey = process.env.SERPER_API_KEY || '';
  let searchContext = '';
  let sources = [];
  let images = [];

  if (serperKey) {
    try {
      const [searchData, imageData] = await Promise.all([
        serperSearch(message, serperKey),
        serperImages(message, serperKey).catch(() => null),
      ]);
      searchContext = buildSearchContext(searchData);
      const organic = searchData?.organic || [];
      sources = organic.slice(0, 8).map((o) => ({ title: o.title || o.link || '', url: o.link || '' }));

      const pickImageUrl = (img) =>
        img.imageUrl || img.image || img.link || img.url
          || img.originalImageUrl || img.thumbnailUrl
          || img.original_image_url || img.thumbnail_url;
      const pickImageTitle = (img) => img.title || img.snippet || img.text || img.site_title || '';

      let imageList = Array.isArray(imageData) ? imageData : imageData?.images;
      if (!imageList?.length && searchData?.images?.length) imageList = searchData.images;
      if (imageList && imageList.length) {
        images = imageList.slice(0, 6).map((img) => ({
          url: pickImageUrl(img),
          title: pickImageTitle(img),
        })).filter((img) => img.url);
      }
    } catch (err) {
      console.warn('[api/chat] Serper error (continuing without search):', err.message);
    }
  }

  const systemPrompt = searchContext
    ? `${systemPromptWithSearch}\n\n--- 搜尋結果 ---\n${searchContext}\n---`
    : systemPromptNoSearch;

  const userContent = searchContext
    ? `使用者問題：${message}\n\n請根據上方搜尋結果回答，並在回答中適當引用來源。`
    : message;

  const openaiMessages = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userContent },
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openaiMessages,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errMsg = data?.error?.message || data?.error?.code || `HTTP ${response.status}`;
      throw new Error(errMsg);
    }

    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error('OpenAI 未回傳文字');
    }

    return res.status(200).json({
      text,
      sources: sources.length ? sources : undefined,
      images: images.length ? images : undefined,
    });
  } catch (err) {
    console.error('[api/chat]', err);
    const errMessage = err?.message || '檢索失敗';
    return res.status(500).json({ error: errMessage });
  }
};

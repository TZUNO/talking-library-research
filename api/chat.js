/**
 * Vercel Serverless API：網路搜尋 + OpenAI 綜合回覆（Perplexity 風格）
 * - 若有 SERPER_API_KEY：先呼叫 Serper 搜尋，再以搜尋結果為脈絡用 OpenAI 生成圖文並茂回覆
 * - 若無：僅用 OpenAI（行為與原本相同）
 * 環境變數：OPENAI_API_KEY（僅伺服器端，勿由前端傳入）、SERPER_API_KEY（選用）
 */
/** Serper 實際 API 在 google.serper.dev；serper.dev/search 會回 Next.js 404 HTML */
const SERPER_SEARCH_URL = 'https://google.serper.dev/search';
const SERPER_IMAGES_URL = 'https://google.serper.dev/images';

const systemPromptNoSearch = `你是一位永續建材檢索助理。根據使用者的描述，推薦合適的材質並簡要說明理由（強度、耐候、環保、成本等）。回答請簡潔、條列，並註明可參考的標準或認證（如 ASTM、ISO、CNS）若適用。
回答的最後一句請用一句簡短反問鼓勵繼續提問，每次換不同說法，例如：「想進一步了解可以再問～」「有其他想比較的材質也可以問」「想多了解規格或認證的話歡迎再問」等，依回答內容自然變化，不要每次都說一樣的話。`;

const systemPromptWithSearch = `你是一位永續建材檢索助理，會根據「搜尋到的網路資料」回答使用者。
請用以下搜尋結果作為依據，整理成簡潔、條列式的回覆，並註明可參考的標準或認證（如 ASTM、ISO、CNS）若適用。
若搜尋結果中有圖片或具體產品/規格，可在回答中提及。
回答請圖文並茂：用 Markdown 格式（**粗體**、# 標題、列表、段落），並在適當處註明資料來源（例如「根據 [來源標題](連結)」）。
不要捏造搜尋結果中沒有的內容。
回答的最後一句請用一句簡短反問鼓勵繼續提問，每次換不同說法，例如：「想進一步了解可以再問～」「有其他想比較的材質也可以問」「想多了解規格或認證的話歡迎再問」等，依回答內容自然變化，不要每次都說一樣的話。`;

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

function normalizeSerperImageList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.images)) return data.images;
  if (Array.isArray(data.imageResults)) return data.imageResults;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

/** Serper 各端點回傳欄位名稱可能不同，盡量收斂成可當 <img src> 的 URL */
function pickImageUrlFromRaw(img) {
  if (!img || typeof img !== 'object') return '';
  const candidates = [
    img.imageUrl,
    img.originalImageUrl,
    img.original_image_url,
    img.thumbnailUrl,
    img.thumbnail_url,
    img.image,
    img.src,
    img.url,
    img.link,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && /^https?:\/\//i.test(c.trim())) return c.trim();
  }
  return '';
}

async function serperImages(query, apiKey, num = 8) {
  const res = await fetch(SERPER_IMAGES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify({ q: query, num }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    console.warn('[api/chat] Serper images HTTP', res.status, t.slice(0, 200));
    return null;
  }
  const data = await res.json().catch(() => null);
  const list = normalizeSerperImageList(data);
  /** 成功但無結果時回傳 []，與 HTTP 失敗的 null 區分 */
  return list.length ? list.slice(0, num) : [];
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

/** 將搜尋到的圖片 URL 交給模型，要求以 Markdown 圖片語法寫入正文 */
function buildImagePromptBlock(images) {
  if (!images?.length) return '';
  const lines = images
    .filter((img) => img && img.url)
    .map((img, i) => `${i + 1}. ${img.title ? `${img.title} — ` : ''}${img.url}`)
    .join('\n');
  if (!lines) return '';
  return (
    '\n\n--- 搜尋到的相關圖片（必須使用）---\n' +
    '以下為 Serper 圖片搜尋結果。請在回答**正文**中穿插至少 2～3 張，使用 Markdown：`![材質或場景簡短說明](完整圖片URL)`，放在對應材料段落旁，勿只列連結、勿全部堆在文末。\n' +
    lines
  );
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

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return res.status(500).json({
      error: '伺服器未設定 OPENAI_API_KEY，請於部署環境（如 Vercel）設定後重新部署。',
    });
  }

  /** Vercel / 本機需在環境變數設定 SERPER_API_KEY（名稱須完全一致，部署後需重新部署） */
  const serperKey = (process.env.SERPER_API_KEY || '').trim();
  let searchContext = '';
  let sources = [];
  let images = [];
  /** 診斷用（不含金鑰）：為何沒有圖片時可對照 Response.meta */
  let serperDiag = {
    serperEnvSet: Boolean(serperKey),
    serperSearchOk: false,
    serperImagesHttpOk: null,
    rawImageRowsBeforeMap: 0,
    serperCatchMessage: null,
  };

  if (serperKey) {
    try {
      /** 分開呼叫：避免 /search 失敗時整段 Promise.all 失敗，導致 /images 完全沒跑 */
      let searchData = null;
      let imageData = null;

      try {
        searchData = await serperSearch(message, serperKey);
        serperDiag.serperSearchOk = true;
      } catch (err) {
        serperDiag.serperCatchMessage = `search: ${String(err?.message || err)}`;
        console.warn('[api/chat] Serper /search failed:', err?.message || err);
      }

      try {
        imageData = await serperImages(message, serperKey, 8);
        serperDiag.serperImagesHttpOk = imageData != null;
      } catch (err) {
        serperDiag.serperCatchMessage = `images: ${String(err?.message || err)}`;
        console.warn('[api/chat] Serper /images threw:', err?.message || err);
      }

      if (searchData) {
        searchContext = buildSearchContext(searchData);
        const organic = searchData?.organic || [];
        sources = organic.slice(0, 8).map((o) => ({ title: o.title || o.link || '', url: o.link || '' }));
      }

      const pickImageTitle = (img) =>
        (typeof img?.title === 'string' && img.title) ||
        (typeof img?.snippet === 'string' && img.snippet) ||
        (typeof img?.text === 'string' && img.text) ||
        (typeof img?.site_title === 'string' && img.site_title) ||
        '';

      let imageList = Array.isArray(imageData) ? imageData : normalizeSerperImageList(imageData);
      if (!imageList?.length && searchData?.images?.length) imageList = searchData.images;
      if (imageList && imageList.length) {
        serperDiag.rawImageRowsBeforeMap = imageList.length;
        images = imageList.slice(0, 8).map((img) => ({
          url: pickImageUrlFromRaw(img),
          title: pickImageTitle(img),
        })).filter((img) => img.url);
      }
      if (!images.length && serperKey) {
        try {
          const retry = await serperImages(`${message} 建材 材質`, serperKey, 8);
          const list2 = Array.isArray(retry) ? retry : normalizeSerperImageList(retry);
          if (list2?.length) {
            images = list2.slice(0, 8).map((img) => ({
              url: pickImageUrlFromRaw(img),
              title: pickImageTitle(img),
            })).filter((img) => img.url);
          }
        } catch {
          /* ignore */
        }
      }
    } catch (err) {
      serperDiag.serperCatchMessage = String(err?.message || err || 'unknown');
      console.warn('[api/chat] Serper error (continuing without search):', err.message);
    }
  }

  const imageBlockForModel = buildImagePromptBlock(images);

  const webContextParts = [];
  if (searchContext) {
    webContextParts.push(`--- 搜尋結果 ---\n${searchContext}\n---`);
  }
  if (imageBlockForModel) {
    webContextParts.push(imageBlockForModel.trim());
  }

  const systemPrompt =
    webContextParts.length > 0
      ? `${systemPromptWithSearch}\n\n${webContextParts.join('\n\n')}`
      : systemPromptNoSearch;

  const userContent =
    webContextParts.length > 0
      ? `使用者問題：${message}\n\n請根據上方搜尋結果與圖片 URL 回答，並在回答中適當引用來源；若有提供圖片 URL，務必在正文中以 Markdown 圖片語法插入。`
      : message;

  const openaiMessages = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userContent },
  ];

  const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: openaiModel,
        messages: openaiMessages,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errMsg = data?.error?.message || data?.error?.code || `HTTP ${response.status}`;
      throw new Error(errMsg);
    }

    let text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error('OpenAI 未回傳文字');
    }

    /** 保證前端一定收到可渲染的圖片：Serper 有圖時附加 Markdown（模型常省略 ![...]()） */
    if (images.length) {
      const hasMdImg = /!\[[^\]]*\]\(https?:\/\//.test(text);
      if (!hasMdImg) {
        const esc = (s) => String(s || '圖片').replace(/[[\]]/g, '');
        const block = images
          .filter((im) => im && im.url)
          .slice(0, 6)
          .map((im) => `![${esc(im.title)}](${im.url})`)
          .join('\n\n');
        if (block) {
          text = `${text}\n\n### 相關圖片\n\n${block}`;
        }
      }
    }

    return res.status(200).json({
      text,
      model: openaiModel,
      sources,
      images,
      meta: {
        ...serperDiag,
        sourcesCount: sources.length,
        imagesCount: images.length,
        /** 若為 true 代表 Vercel 未讀到 SERPER_API_KEY（或名稱錯誤）；與 Serper 官網額度無關。 */
        hint:
          !serperKey
            ? 'Set SERPER_API_KEY in Vercel Environment Variables (Production) and redeploy.'
            : images.length === 0 && serperDiag.rawImageRowsBeforeMap > 0
              ? 'Serper returned image rows but URLs failed to parse; check Serper response format.'
              : images.length === 0 && serperDiag.serperSearchOk && !serperDiag.serperImagesHttpOk
                ? 'Serper /images request failed (see server logs).'
                : undefined,
      },
    });
  } catch (err) {
    console.error('[api/chat]', err);
    const errMessage = err?.message || '檢索失敗';
    return res.status(500).json({ error: errMessage });
  }
};

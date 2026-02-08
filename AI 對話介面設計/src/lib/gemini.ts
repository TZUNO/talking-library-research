/**
 * 材質檢索對話 API
 * 一律呼叫 /api/chat；API Key 可從 Study Control Bar 傳入（存 localStorage），否則後端用 env
 * 回覆可含網路搜尋來源與圖片（Perplexity 風格）
 */
export interface ChatSource {
  title: string;
  url: string;
}

export interface ChatImage {
  url: string;
  title: string;
}

export interface ChatResponse {
  text: string;
  sources?: ChatSource[];
  images?: ChatImage[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * 發送使用者輸入，取得材質檢索回覆（單輪，含搜尋結果時為圖文並茂）
 */
export async function chatMaterialQuery(
  userMessage: string,
  apiKey?: string
): Promise<ChatResponse> {
  const payload: { message: string; apiKey?: string } = { message: userMessage };
  if (apiKey) payload.apiKey = apiKey;

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data?.error as string) || `HTTP ${res.status}`);
  }
  if (!data?.text) {
    throw new Error((data?.error as string) || '未取得回覆');
  }
  return {
    text: data.text as string,
    sources: data.sources,
    images: data.images,
  };
}

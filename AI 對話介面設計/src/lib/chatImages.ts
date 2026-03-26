export interface MergedImage {
  url: string;
  title: string;
}

/**
 * 若字串開頭（略過前導空白）為整行 Markdown 圖片，回傳 URL 與需消耗的字元長度（支援 URL 內含 ) 時取至行末最後一個 )）
 */
export function consumeLeadingMarkdownImage(remaining: string): {
  alt: string;
  url: string;
  rawLength: number;
} | null {
  const offset = remaining.length - remaining.trimStart().length;
  const trimmed = remaining.slice(offset);
  if (!trimmed.startsWith('![')) return null;
  const nl = trimmed.indexOf('\n');
  const line = nl === -1 ? trimmed : trimmed.slice(0, nl);
  const close = line.indexOf('](');
  if (close === -1) return null;
  const alt = line.slice(2, close);
  const after = line.slice(close + 2);
  if (!/^https?:\/\//i.test(after)) return null;
  const last = after.lastIndexOf(')');
  if (last <= 0) return null;
  const url = after.slice(0, last).trim();
  if (!/^https?:\/\//i.test(url)) return null;
  const tail = line.slice(close + 2 + last + 1);
  if (tail.trim().length > 0) return null;
  return { alt, url, rawLength: offset + line.length };
}

/**
 * 從 Markdown 內容擷取 ![alt](https://...)（含 URL 內含 ) 的常見情況：整行僅一張圖時用 ]( 到行尾最後一個 )）
 */
function extractImagesLineWise(content: string): MergedImage[] {
  const out: MergedImage[] = [];
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line.startsWith('![')) continue;
    const close = line.indexOf('](');
    if (close === -1) continue;
    const alt = line.slice(2, close);
    const after = line.slice(close + 2);
    if (!/^https?:\/\//i.test(after)) continue;
    const last = after.lastIndexOf(')');
    if (last <= 0) continue;
    const url = after.slice(0, last).trim();
    if (!/^https?:\/\//i.test(url)) continue;
    out.push({ url, title: alt });
  }
  return out;
}

/** 全域比對 ![...](https://...)（不含 URL 內第一個 ) 之後仍為網址者） */
function extractImagesRegexGlobal(content: string, seen: Set<string>): MergedImage[] {
  const out: MergedImage[] = [];
  const re = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const url = m[2];
    if (seen.has(url)) continue;
    seen.add(url);
    out.push({ url, title: m[1] || '' });
  }
  return out;
}

/**
 * 合併 API 回傳的 images 與正文中的 Markdown 圖片，去重後供「相關圖片」區塊使用。
 * （即使後端 images 為空，只要正文有 ![...](...) 仍會顯示。）
 */
export function mergeDisplayImages(api: MergedImage[] | undefined, content: string): MergedImage[] {
  const seen = new Set<string>();
  const out: MergedImage[] = [];

  for (const img of api ?? []) {
    const url = typeof img?.url === 'string' ? img.url.trim() : '';
    if (!url || !/^https?:\/\//i.test(url) || seen.has(url)) continue;
    seen.add(url);
    out.push({
      url,
      title: typeof img?.title === 'string' ? img.title : '',
    });
  }

  for (const img of extractImagesRegexGlobal(content, seen)) {
    out.push(img);
  }
  for (const img of extractImagesLineWise(content)) {
    if (!seen.has(img.url)) {
      seen.add(img.url);
      out.push(img);
    }
  }
  return out;
}

/**
 * 從 AI 回應文字抽取可能出現的建材／材質詞（供第二輪提示詞帶入）
 * 關鍵字由長到短比對，避免「石膏板」被拆成「石膏」重複計入
 */

const MATERIAL_KEYWORDS = [
  '矽酸鈣板',
  '礦纖板',
  '石膏板',
  '塑膠地板',
  '強化玻璃',
  '不鏽鋼',
  '不銹鋼',
  '壓克力',
  '亞克力',
  'PVC板',
  '木地板',
  '木皮',
  '木質',
  '實木',
  '混凝土',
  '磁磚',
  '瓷磚',
  '紡織',
  '織品',
  '布料',
  '棉麻',
  '壁紙',
  '矽利康',
  '刨花板',
  '夾板',
  '合板',
  'PVC',
  '木材',
  '石膏',
  '塑膠',
  '金屬',
  '鋁合金',
  '鋁',
  '鐵',
  '黃銅',
  '玻璃',
  '水泥',
  '塗料',
  '油漆',
] as const;

const SORTED_BY_LENGTH = [...MATERIAL_KEYWORDS].sort((a, b) => b.length - a.length);

/**
 * 依文中出現順序回傳最多 `max` 個材質詞（較長詞覆蓋較短子字串）
 */
export function extractMaterialLabels(text: string, max = 3): string[] {
  if (!text?.trim()) return [];

  const labels: string[] = [];

  for (const kw of SORTED_BY_LENGTH) {
    if (!text.includes(kw)) continue;

    const replaceIdx = labels.findIndex((l) => kw.includes(l) && l !== kw);
    if (replaceIdx >= 0) {
      labels[replaceIdx] = kw;
      continue;
    }

    if (labels.some((l) => l.includes(kw) && l !== kw)) continue;

    if (labels.includes(kw)) continue;

    if (labels.length >= max) continue;

    labels.push(kw);
  }

  labels.sort((a, b) => text.indexOf(a) - text.indexOf(b));
  return labels.slice(0, max);
}

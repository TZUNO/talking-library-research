/**
 * 動態提示生成：三個面向（情境／氛圍、性能／條件、比較／決策）
 *
 * 邏輯：
 * 1. 第一輪（尚無 AI 回應）：預設三項，不隨打字變動
 * 2. 第二輪起：依「上一則 AI 回應」抽取材質詞，產生帶入木材／石膏板／塑膠等的三句；
 *    僅在 AI 回應更新時重算，不依輸入框內容變動
 */

import { extractMaterialLabels } from './materialHints';

/**
 * templateId 使用數字字串 1／2／3，與 GAS 點擊路徑代號一致：
 * 1＝情境／氛圍、2＝性能／條件、3＝比較／決策
 */
export interface DynamicPrompt {
  category: '情境／氛圍' | '性能／條件' | '比較／決策';
  prompt: string;
  templateId: '1' | '2' | '3';
}

/** 預設提示（尚未有對話或輸入時） */
const DEFAULT_PROMPTS: DynamicPrompt[] = [
  {
    category: '情境／氛圍',
    templateId: '1',
    prompt: '幫我找適合百貨展示牆的材料，營造安定、親和的空間氛圍。',
  },
  {
    category: '性能／條件',
    templateId: '2',
    prompt: '幫我找適合百貨展示牆的材料，要容易清潔、耐用、低維護。',
  },
  {
    category: '比較／決策',
    templateId: '3',
    prompt: '請比較兩種適合百貨專櫃展示牆的材料，說明優缺點與適用理由。',
  },
];

/** 第二輪起：無法從上一則辨識材質詞時的備用三句 */
const FOLLOW_UP_FALLBACK: DynamicPrompt[] = [
  {
    category: '情境／氛圍',
    templateId: '1',
    prompt:
      '請根據你上一則回應中提到的材料，從觸感與空間氛圍來看，可能各自帶給使用者什麼感受？',
  },
  {
    category: '性能／條件',
    templateId: '2',
    prompt: '請補充上一則提到的材料在耐用、防火、防潮、維護與環保等條件上的重點。',
  },
  {
    category: '比較／決策',
    templateId: '3',
    prompt: '請比較上一則中主要提到的兩種材料，說明優缺點與適用情境。',
  },
];

function buildPromptsFromLabels(labels: string[]): DynamicPrompt[] {
  if (labels.length >= 2) {
    const [a, b] = [labels[0], labels[1]];
    const pair = labels.slice(0, Math.min(3, labels.length)).join('、');
    return [
      {
        category: '情境／氛圍',
        templateId: '1',
        prompt: `從觸感與空間氛圍來看，${a} 與 ${b} 各自能營造什麼樣的感受？若想更親和舒適，該怎麼選？`,
      },
      {
        category: '性能／條件',
        templateId: '2',
        prompt: `請補充 ${pair} 在耐用、防火、防潮、可回收與維護等條件上的差異。`,
      },
      {
        category: '比較／決策',
        templateId: '3',
        prompt: `若從觸感與舒適度來看，${a} 與 ${b} 哪一種更讓人覺得舒服？請分析並給適用建議。`,
      },
    ];
  }

  if (labels.length === 1) {
    const m = labels[0];
    return [
      {
        category: '情境／氛圍',
        templateId: '1',
        prompt: `從觸感與視覺氛圍來看，${m} 在空間裡通常給人什麼樣的感受？若想調整親和度可以怎麼思考？`,
      },
      {
        category: '性能／條件',
        templateId: '2',
        prompt: `請補充 ${m} 在耐用、防火、防潮、維護與環保（含塑化劑／回收等）方面的條件重點。`,
      },
      {
        category: '比較／決策',
        templateId: '3',
        prompt: `若還有與 ${m} 功能或情境相近的替代材質，請比較優缺點與適用理由。`,
      },
    ];
  }

  return FOLLOW_UP_FALLBACK;
}

/**
 * 產生三個面向的提示（第二輪起依上一則 AI 全文抽材質詞；不依輸入框）
 */
export function generateDynamicPrompts(lastAssistantContent?: string): DynamicPrompt[] {
  const raw = lastAssistantContent?.trim() ?? '';
  if (!raw.length) {
    return DEFAULT_PROMPTS;
  }

  const labels = extractMaterialLabels(raw, 3);
  return buildPromptsFromLabels(labels);
}

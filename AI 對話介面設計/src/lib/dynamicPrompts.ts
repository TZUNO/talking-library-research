/**
 * 動態提示生成：三個面向（情境／氛圍、性能／條件、比較／決策）
 *
 * 邏輯：
 * 1. 第一輪（尚無 AI 回應）：一律顯示預設三項，不隨使用者打字改變
 * 2. 第二輪起（已有 AI 回應）：固定顯示「依上一則 AI 回應延伸」的三句，不隨輸入框內容變動
 */

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

/** 第二輪起：固定依「上一則 AI 回應」延伸的三面向（不隨輸入框文字變動） */
const FOLLOW_UP_PROMPTS: DynamicPrompt[] = [
  {
    category: '情境／氛圍',
    templateId: '1',
    prompt: `從上述回應延伸：我想營造更親和的空間氛圍，該選哪種材料？`,
  },
  {
    category: '性能／條件',
    templateId: '2',
    prompt: `補充上述材料的耐用、防火、可回收等條件說明`,
  },
  {
    category: '比較／決策',
    templateId: '3',
    prompt: `請比較上述回應中提到的兩種材質，說明優缺點`,
  },
];

/**
 * 產生三個面向的提示（第二輪起僅依「是否有上一則 AI 回應」，不依輸入框文字）
 *
 * @param lastAssistantContent 最後一則 AI 回應的純文字（可選）
 */
export function generateDynamicPrompts(lastAssistantContent?: string): DynamicPrompt[] {
  const hasAiResponse = lastAssistantContent && lastAssistantContent.trim().length > 0;

  if (!hasAiResponse) {
    return DEFAULT_PROMPTS;
  }

  return FOLLOW_UP_PROMPTS;
}

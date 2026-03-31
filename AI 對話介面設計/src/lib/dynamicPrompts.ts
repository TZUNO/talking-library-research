/**
 * 動態提示生成：根據「最後一則 AI 回應」或使用者輸入產生三個面向的提示
 * 三個面向固定為：情境／氛圍、性能／條件、比較／決策
 *
 * 邏輯：
 * 1. 第一輪（尚無 AI 回應）：一律顯示預設三項，不隨使用者打字改變
 * 2. 第二輪起（已有 AI 回應）：以 AI 回應為脈絡，產生後續提問提示
 * 3. 第二輪起、若使用者自行輸入（非提示格式）：以輸入為脈絡產生提示
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

/** 輸入是否為已點選的提示（避免巢狀套用） */
function isPromptLike(text: string): boolean {
  return (
    text.startsWith('從氛圍與情境延伸：') ||
    text.startsWith('補充「') ||
    text.startsWith('比較兩種符合「') ||
    text.startsWith('幫我找適合') ||
    text.startsWith('請比較兩種') ||
    text.startsWith('從上述回應延伸：') ||
    text.startsWith('補充上述') ||
    text.startsWith('請比較上述')
  );
}

/**
 * 根據使用者輸入與最後一則 AI 回應產生三個面向的動態提示
 * 優先以「最後 AI 回應」為脈絡；若無則以輸入為脈絡；皆無則顯示預設
 *
 * @param inputText 使用者目前輸入框中的內容
 * @param lastAssistantContent 最後一則 AI 回應的純文字（可選）
 * @returns 三個面向的提示陣列
 */
export function generateDynamicPrompts(
  inputText: string,
  lastAssistantContent?: string
): DynamicPrompt[] {
  const trimmed = inputText.trim();
  const hasAiResponse = lastAssistantContent && lastAssistantContent.trim().length > 0;

  // 第一輪：尚無 AI 回應 → 一律顯示預設，不隨打字內容改變
  if (!hasAiResponse) {
    return DEFAULT_PROMPTS;
  }

  // 第二輪起：已有 AI 回應
  // 若輸入為空或已是提示格式 → 以 AI 回應為脈絡的後續提問
  if (!trimmed || isPromptLike(trimmed)) {
    return [
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
  }

  // 第二輪起：使用者自行輸入（非提示格式）→ 以輸入為脈絡
  const context = trimmed.length > 50 ? trimmed.slice(0, 50) + '…' : trimmed;
  return [
    {
      category: '情境／氛圍',
      templateId: '1',
      prompt: `從氛圍與情境延伸：「${context}」`,
    },
    {
      category: '性能／條件',
      templateId: '2',
      prompt: `補充「${context}」的耐用、防火、可回收等條件`,
    },
    {
      category: '比較／決策',
      templateId: '3',
      prompt: `比較兩種符合「${context}」的材料，說明優缺點`,
    },
  ];
}

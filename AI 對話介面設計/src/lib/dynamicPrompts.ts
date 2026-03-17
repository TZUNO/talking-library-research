/**
 * 動態提示生成：根據使用者輸入產生三個面向的提示
 * 三個面向固定為：情境／氛圍、性能／條件、比較／決策
 *
 * 若要調整提示模板，請修改：
 * - DEFAULT_PROMPTS：使用者尚未輸入時的預設提示
 * - generateDynamicPrompts 內 return 的 prompt 字串：有輸入時的動態模板
 */

export interface DynamicPrompt {
  category: '情境／氛圍' | '性能／條件' | '比較／決策';
  prompt: string;
  templateId: string;
}

/** 預設提示（使用者尚未輸入時） */
const DEFAULT_PROMPTS: DynamicPrompt[] = [
  {
    category: '情境／氛圍',
    templateId: 'template-1',
    prompt: '幫我找適合百貨展示牆的材料，營造安定、親和的空間氛圍。',
  },
  {
    category: '性能／條件',
    templateId: 'template-2',
    prompt: '幫我找適合百貨展示牆的材料，要容易清潔、耐用、低維護。',
  },
  {
    category: '比較／決策',
    templateId: 'template-3',
    prompt: '請比較兩種適合百貨專櫃展示牆的材料，說明優缺點與適用理由。',
  },
];

/**
 * 根據使用者輸入產生三個面向的動態提示
 * @param inputText 使用者目前輸入框中的內容
 * @returns 三個面向的提示陣列
 */
export function generateDynamicPrompts(inputText: string): DynamicPrompt[] {
  const trimmed = inputText.trim();
  if (!trimmed) {
    return DEFAULT_PROMPTS;
  }

  const context = trimmed.length > 50 ? trimmed.slice(0, 50) + '…' : trimmed;

  return [
    {
      category: '情境／氛圍',
      templateId: 'template-1',
      prompt: `從氛圍與情境延伸：「${context}」`,
    },
    {
      category: '性能／條件',
      templateId: 'template-2',
      prompt: `補充「${context}」的耐用、防火、可回收等條件`,
    },
    {
      category: '比較／決策',
      templateId: 'template-3',
      prompt: `比較兩種符合「${context}」的材料，說明優缺點`,
    },
  ];
}

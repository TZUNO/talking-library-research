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
    prompt: '幫我找適合百貨展示牆的材料，需營造安定、親和與生活感的空間氛圍。',
  },
  {
    category: '性能／條件',
    templateId: 'template-2',
    prompt: '幫我找適合百貨展示牆的材料，條件包含容易清潔、耐用、低維護與施工可行。',
  },
  {
    category: '比較／決策',
    templateId: 'template-3',
    prompt: '請比較兩種適合百貨專櫃展示牆的材料，並說明各自的優缺點與適用理由。',
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

  // 若輸入過長，擷取前 80 字作為上下文（避免提示過長）
  const context = trimmed.length > 80 ? trimmed.slice(0, 80) + '…' : trimmed;

  return [
    {
      category: '情境／氛圍',
      templateId: 'template-1',
      prompt: `從空間氛圍與使用情境的角度，幫我延伸「${context}」的思考。`,
    },
    {
      category: '性能／條件',
      templateId: 'template-2',
      prompt: `從材料性能與實務條件，幫我補充「${context}」的考量，如耐用性、防火、可回收、施工可行性等。`,
    },
    {
      category: '比較／決策',
      templateId: 'template-3',
      prompt: `請比較兩種符合「${context}」的材料，並說明各自的優缺點與適用理由。`,
    },
  ];
}

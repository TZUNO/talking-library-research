import { useMemo } from 'react';
import { generateDynamicPrompts } from '../lib/dynamicPrompts';

interface TemplateCardProps {
  /** 最後一則 AI 回應的純文字；有值時顯示「延伸 AI」三提示，否則顯示預設三提示 */
  lastAssistantContent?: string;
  /** templateId 為面向代號 1／2／3（與 GAS、dynamicPrompts 一致） */
  onTemplateClick: (prompt: string, templateId: '1' | '2' | '3') => void;
}

export function TemplateCard({ lastAssistantContent, onTemplateClick }: TemplateCardProps) {
  const prompts = useMemo(
    () => generateDynamicPrompts(lastAssistantContent),
    [lastAssistantContent]
  );

  return (
    <div className="flex flex-row items-center gap-x-3 flex-nowrap overflow-x-auto min-h-0 py-1">
      {prompts.map((item) => (
        <button
          key={item.templateId}
          type="button"
          onClick={() => onTemplateClick(item.prompt, item.templateId)}
          className="group flex-shrink-0 min-h-[40px] h-auto py-2.5 inline-flex items-center justify-center rounded-full border border-border bg-background hover:bg-accent text-foreground transition-all duration-200 hover:border-emerald-500/30 px-4"
        >
          <span className="text-sm font-medium leading-snug group-hover:text-emerald-400 transition-colors duration-200 text-left max-w-[240px] block line-clamp-2">
            {item.prompt}
          </span>
        </button>
      ))}
    </div>
  );
}
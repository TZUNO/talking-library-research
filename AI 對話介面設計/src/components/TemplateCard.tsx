import { useMemo } from 'react';
import { generateDynamicPrompts } from '../lib/dynamicPrompts';

interface TemplateCardProps {
  inputValue: string;
  /** 最後一則 AI 回應的純文字，用於產生後續提問提示 */
  lastAssistantContent?: string;
  onTemplateClick: (prompt: string, templateId: string) => void;
}

export function TemplateCard({ inputValue, lastAssistantContent, onTemplateClick }: TemplateCardProps) {
  const prompts = useMemo(
    () => generateDynamicPrompts(inputValue, lastAssistantContent),
    [inputValue, lastAssistantContent]
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
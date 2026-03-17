import { useMemo } from 'react';
import { Sparkles, Wrench, GitCompare } from 'lucide-react';
import { generateDynamicPrompts } from '../lib/dynamicPrompts';

const CATEGORY_ICONS = {
  '情境／氛圍': Sparkles,
  '性能／條件': Wrench,
  '比較／決策': GitCompare,
};

interface TemplateCardProps {
  inputValue: string;
  onTemplateClick: (prompt: string, templateId: string) => void;
}

export function TemplateCard({ inputValue, onTemplateClick }: TemplateCardProps) {
  const prompts = useMemo(() => generateDynamicPrompts(inputValue), [inputValue]);

  return (
    <div className="flex flex-row items-center gap-x-3 flex-nowrap overflow-x-auto min-h-0 py-1">
      {prompts.map((item) => {
        const Icon = CATEGORY_ICONS[item.category];
        return (
          <button
            key={item.templateId}
            type="button"
            onClick={() => onTemplateClick(item.prompt, item.templateId)}
            className="group flex-shrink-0 min-h-[40px] h-11 inline-flex items-center justify-center gap-2.5 rounded-full border border-border bg-background hover:bg-accent text-foreground transition-all duration-200 hover:border-emerald-500/30 px-4 py-2.5"
          >
            <span className="flex-shrink-0 inline-flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 transition-all duration-200">
              <Icon className="w-4 h-4" />
            </span>
            <span className="text-sm font-medium leading-normal group-hover:text-emerald-400 transition-colors duration-200 whitespace-nowrap max-w-[180px] truncate" title={item.prompt}>
              {item.category}
            </span>
          </button>
        );
      })}
    </div>
  );
}
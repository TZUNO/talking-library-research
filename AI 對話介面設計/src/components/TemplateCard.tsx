import { useState } from 'react';
import { 
  Hammer, 
  Shapes, 
  Layers, 
  Recycle, 
  FileText
} from 'lucide-react';

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

interface Template {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  prompt: string;
}

const templates: Template[] = [
  {
    id: '1',
    icon: <Hammer className="w-4 h-4" />,
    title: '展示牆氛圍感',
    description: '安定、親和、生活感',
    prompt: '幫我找適合百貨展示牆的材料，需營造安定、親和與生活感的空間氛圍。'
  },
  {
    id: '2',
    icon: <Shapes className="w-4 h-4" />,
    title: '商業展示牆面',
    description: '被服務、安心、有質感',
    prompt: '請推薦適合商業展示空間的牆面材料，讓顧客感受到被服務、安心且有質感。'
  },
  {
    id: '3',
    icon: <Layers className="w-4 h-4" />,
    title: '比較兩種展示牆',
    description: '氛圍、質感、使用情境',
    prompt: '我想比較兩種適合百貨專櫃展示牆的材料，請從氛圍、質感與使用情境分析差異。'
  },
  {
    id: '4',
    icon: <Recycle className="w-4 h-4" />,
    title: '易清潔耐用',
    description: '清潔、耐用、低維護、施工',
    prompt: '幫我找適合百貨展示牆的材料，條件包含容易清潔、耐用、低維護與施工可行。'
  },
  {
    id: '5',
    icon: <FileText className="w-4 h-4" />,
    title: '防火可回收',
    description: '防火 A1、可回收、商業空間',
    prompt: '請推薦符合防火 A1、可回收且適合商業空間使用的展示牆材料，並比較兩種選項。'
  }
];

interface TemplateCardProps {
  onTemplateClick: (prompt: string, templateId: string) => void;
}

export function TemplateCard({ onTemplateClick }: TemplateCardProps) {
  const [displayTemplates] = useState(() => shuffleArray(templates));
  return (
    <div className="flex flex-row items-center gap-x-3 flex-nowrap overflow-x-auto min-h-0 py-1">
      {displayTemplates.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => onTemplateClick(template.prompt, `template-${template.id}`)}
          className="group flex-shrink-0 min-h-[40px] h-11 inline-flex items-center justify-center gap-2.5 rounded-full border border-border bg-background hover:bg-accent text-foreground transition-all duration-200 hover:border-emerald-500/30 px-4 py-2.5"
        >
          <span className="flex-shrink-0 inline-flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 transition-all duration-200">
            {template.icon}
          </span>
          <span className="text-sm font-medium leading-normal group-hover:text-emerald-400 transition-colors duration-200 whitespace-nowrap">
            {template.title}
          </span>
        </button>
      ))}
    </div>
  );
}
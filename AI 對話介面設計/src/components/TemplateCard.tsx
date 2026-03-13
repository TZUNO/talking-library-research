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
    title: '金屬材質篩選',
    description: '強度、耐腐蝕性、散熱性、加工性、使用情境',
    prompt: '我想找金屬材質，需求包含強度、耐腐蝕性、散熱性、加工性，以及預計使用情境：'
  },
  {
    id: '2',
    icon: <Shapes className="w-4 h-4" />,
    title: '塑膠／橡膠比較',
    description: '彈性、耐化學性、耐候性、成本範圍、產品用途',
    prompt: '我想比較塑膠或橡膠材質，考量包含彈性、耐化學性、耐候性、成本範圍，以及產品用途：'
  },
  {
    id: '3',
    icon: <Layers className="w-4 h-4" />,
    title: '複合材質分析',
    description: '纖維類型、結構形式、強度表現、耐久性、應用方向',
    prompt: '我想分析木頭加金屬的複合材質，包含纖維類型、結構形式、強度表現、耐久性，以及應用方向：'
  },
  {
    id: '4',
    icon: <Recycle className="w-4 h-4" />,
    title: '環保材質推薦',
    description: '可回收性、碳足跡、生物基、可分解性、環境認證',
    prompt: '我想找環保材質，考量包含可回收性、碳足跡、生物基含量、可分解性、環境認證，以及產品類別：'
  },
  {
    id: '6',
    icon: <FileText className="w-4 h-4" />,
    title: '規格標準查詢',
    description: 'ASTM、ISO、DIN、CNS、測試方法、認證、品質規範',
    prompt: '我想查詢材質相關標準，例如 ASTM／ISO／DIN／CNS、測試方法、認證要求、品質規範，以及材質類型'
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
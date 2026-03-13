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
    description: '強度、硬度、耐腐蝕性、熱傳導、加工性',
    prompt: '我需要尋找金屬材質，要求：[強度等級]、[耐腐蝕程度]、[熱傳導係數]、[加工難易度]、應用於 [使用場景]。'
  },
  {
    id: '2',
    icon: <Shapes className="w-4 h-4" />,
    title: '塑膠橡膠比較',
    description: '彈性、韌性、耐化學、耐候性、成本',
    prompt: '比較不同塑膠/橡膠材質，需考慮：[彈性模數]、[耐化學性]、[耐候性]、[成本範圍]、適用於 [產品類型]。'
  },
  {
    id: '3',
    icon: <Layers className="w-4 h-4" />,
    title: '複合材質分析',
    description: '纖維方向、層壓、強度模量、疲勞壽命',
    prompt: '分析複合材質，參數：[纖維類型]、[層壓結構]、[強度模量]、[疲勞壽命]、[應力-應變特性]、用途 [應用類型]。'
  },
  {
    id: '4',
    icon: <Recycle className="w-4 h-4" />,
    title: '環保材質推薦',
    description: '可回收性、碳足跡、生物基、可分解性',
    prompt: '推薦環保材質，要求：[可回收等級]、[碳足跡數值]、[生物基含量]、[可分解性]、[環境認證]、應用於 [產品類別]。'
  },
  {
    id: '6',
    icon: <FileText className="w-4 h-4" />,
    title: '規格標準查詢',
    description: 'ASTM、ISO、DIN、CNS標準、測試方法',
    prompt: '查詢材質標準，需要：[ASTM/ISO/DIN/CNS] 標準、[測試方法]、[認證要求]、[品質規範]、材質類型 [金屬/塑膠/其他]。'
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
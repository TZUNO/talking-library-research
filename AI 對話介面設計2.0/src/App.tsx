import { useState } from 'react';
import { TemplateCard } from './components/TemplateCard';
import { ConversationInput } from './components/ConversationInput';
import { HistoryPanel } from './components/HistoryPanel';
import { ChatHistory } from './components/ChatHistory';
import { SettingsDrawer } from './components/SettingsDrawer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function App() {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleTemplateClick = (template: string) => {
    setInputValue(template);
    // 自動聚焦到輸入框
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      textarea?.focus();
    }, 100);
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isSubmitting) return;
    
    // 添加用戶訊息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSubmitting(true);
    
    // 模擬 API 請求
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 添加 AI 回覆
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `根據您的需求「${userMessage.content}」，我為您找到以下材質選項：\n\n1. **鋁合金 7075-T6**\n   - 強度: 570 MPa\n   - 密度: 2.81 g/cm³\n   - 耐腐蝕性: 優良\n   - 應用: 航空結構件\n\n2. **碳纖維複合材料 (CFRP)**\n   - 強度: 600-800 MPa\n   - 密度: 1.6 g/cm³\n   - 重量比強度: 極優\n   - 應用: 高性能結構`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      {/* 主容器 */}
      <div className="flex h-screen">
        {/* 左側檢索記錄 - Desktop */}
        <div className="hidden lg:block">
          <HistoryPanel />
        </div>

        {/* 主內容區 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 頂部標題 */}
          <header className="px-6 pt-6 pb-4 border-b border-border flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold mb-1">
                材質檢索系統
              </h1>
              <p className="text-muted-foreground text-sm">
                透過智能提示，快速找到最適合的材質
              </p>
            </div>
            
            {/* 隱藏的設置按鈕 */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-2 h-8 bg-transparent hover:bg-muted/50 transition-colors rounded-sm"
              aria-label="開啟設定"
            />
          </header>

          {/* 對話歷史區域 */}
          <div className="flex-1 overflow-y-auto">
            <ChatHistory messages={messages} isSubmitting={isSubmitting} />
          </div>

          {/* 底部輸入區域 */}
          <div className="border-t border-border bg-card/30 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
              {/* 輸入框 */}
              <ConversationInput
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
              
              {/* 範本按鈕 */}
              <TemplateCard onTemplateClick={handleTemplateClick} />
            </div>
          </div>
        </div>
      </div>

      {/* 左側檢索記錄抽屜 - Mobile/Tablet */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div 
            className="absolute left-0 top-0 h-full w-80 bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <HistoryPanel />
          </div>
        </div>
      )}

      {/* 移動端檢索記錄按鈕 */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 left-6 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg flex items-center justify-center hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 hover:shadow-emerald-500/30 z-30"
        aria-label="開啟檢索記錄"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
          <path d="M12 7v5l4 2"/>
        </svg>
      </button>

      {/* 設定抽屜 */}
      <SettingsDrawer 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

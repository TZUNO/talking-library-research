import { useRef, useEffect, useState } from 'react';
import { Send, Loader2, Mic } from 'lucide-react';

interface ConversationInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ConversationInput({
  value,
  onChange,
  onSubmit,
  isSubmitting
}: ConversationInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isListening, setIsListening] = useState(false);

  // 自動調整 textarea 高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + Enter 送出
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // 模擬語音輸入
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        console.log('語音輸入功能 (需要瀏覽器支援 Web Speech API)');
      }, 2000);
    }
  };

  return (
    <div className="relative group">
      {/* 輸入框容器 */}
      <div className="relative rounded-2xl border border-border bg-card transition-all duration-300 focus-within:border-emerald-500 focus-within:shadow-lg focus-within:shadow-emerald-500/10">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="輸入材質需求或點擊下方範本，例如：'需要耐高溫、耐腐蝕的航空級鋁合金'"
          className="w-full min-h-[80px] max-h-[120px] p-4 pr-28 bg-transparent text-foreground placeholder:text-muted-foreground/60 resize-none outline-none rounded-2xl"
          rows={2}
        />

        {/* 按鈕組 */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {/* 語音輸入按鈕 */}
          <button
            onClick={handleVoiceInput}
            disabled={isSubmitting}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-muted text-muted-foreground hover:bg-emerald-500/20 hover:text-emerald-500'
            }`}
            aria-label="語音輸入"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* 送出按鈕 */}
          <button
            onClick={onSubmit}
            disabled={!value.trim() || isSubmitting}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95"
            aria-label={isSubmitting ? '搜尋中' : '開始檢索'}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* 提示文字 */}
      <div className="mt-2 px-2 text-xs text-muted-foreground text-right">
        <kbd className="px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">⌘</kbd> + 
        <kbd className="ml-1 px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">Enter</kbd> 送出
      </div>
    </div>
  );
}

import { useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ConversationInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  /** 輸入框 placeholder，依模式可不同 */
  placeholder?: string;
  /** 是否允許使用者手動調整輸入框高度（Free-form 模式） */
  allowResize?: boolean;
  /** 首次鍵盤輸入時呼叫（用於 thoughtTime） */
  onFirstKeystroke?: () => void;
  /** 首次有字元時呼叫（用於 inputDuration） */
  onFirstChar?: () => void;
  /** 按鈕點擊時呼叫，傳入按鈕 id（用於 clickPath） */
  onButtonClick?: (buttonId: string) => void;
}

const DEFAULT_PLACEHOLDER = "輸入材質需求或點擊下方範本，例如：'需要耐高溫、耐腐蝕的航空級鋁合金'";

export function ConversationInput({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  placeholder = DEFAULT_PLACEHOLDER,
  allowResize = false,
  onFirstKeystroke,
  onFirstChar,
  onButtonClick,
}: ConversationInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自動調整 textarea 高度（僅在非可調整模式；Free-form 由使用者手動調整）
  useEffect(() => {
    if (allowResize) return;
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [value, allowResize]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    onFirstKeystroke?.();
    // Enter 送出，Shift+Enter 換行
    if (e.key === 'Enter') {
      if (e.shiftKey) return; // Shift+Enter 保留預設換行
      e.preventDefault();
      onSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    if (v.length > 0) onFirstChar?.();
    onChange(v);
  };

  return (
    <div className="relative group shrink-0">
      <div className="relative rounded-xl border border-border bg-card transition-all duration-200 focus-within:border-emerald-500 focus-within:shadow focus-within:shadow-emerald-500/10">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`input-scrollbar w-full min-h-[80px] px-4 py-3 pr-24 leading-6 bg-transparent text-foreground text-sm placeholder:text-muted-foreground/70 outline-none rounded-xl ${
            allowResize ? 'resize-y max-h-[300px]' : 'resize-none max-h-[120px]'
          }`}
          rows={3}
        />

        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            onClick={() => {
              onButtonClick?.('submit');
              onSubmit();
            }}
            disabled={!value.trim() || isSubmitting}
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 hover:shadow hover:shadow-emerald-500/30 active:scale-95"
            aria-label={isSubmitting ? '搜尋中' : '開始檢索'}
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </div>

        {isSubmitting && (
          <div className="absolute bottom-14 right-3 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs">
            搜尋中...
          </div>
        )}
      </div>

      <div className="mt-2 px-2 text-xs text-muted-foreground text-right">
        <kbd className="px-1.5 py-0.5 rounded bg-muted/80 border border-border">Enter</kbd> 送出 · <kbd className="rounded bg-muted/80 border border-border px-1.5 py-0.5">Shift</kbd>+<kbd className="rounded bg-muted/80 border border-border px-1.5 py-0.5">Enter</kbd> 換行
      </div>
    </div>
  );
}

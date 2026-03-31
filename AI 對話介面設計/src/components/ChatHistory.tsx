import { Loader2, User, Bot, Image as ImageIcon } from 'lucide-react';
import { simpleMarkdownToReact } from '../lib/simpleMarkdown';
import { mergeDisplayImages } from '../lib/chatImages';

export interface ChatSource {
  title: string;
  url: string;
}

export interface ChatImage {
  url: string;
  title: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  images?: ChatImage[];
}

interface ChatHistoryProps {
  messages: ChatMessage[];
  isSubmitting: boolean;
  /** 站內圖片預覽（不另開分頁），供實驗紀錄觀看時長 */
  onImagePreview?: (url: string, title: string, source: 'markdown' | 'related-grid') => void;
}

export function ChatHistory({ messages, isSubmitting, onImagePreview }: ChatHistoryProps) {
  if (messages.length === 0 && !isSubmitting) {
    return (
      <div className="flex items-center justify-center h-full px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Bot className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl mb-2 text-foreground">開始材質檢索</h3>
          <p className="text-muted-foreground text-sm">
            選擇下方範本或直接輸入您的材質需求
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {messages.map((message, i) => {
        const displayImages =
          message.role === 'assistant'
            ? mergeDisplayImages(message.images, message.content)
            : [];
        return (
        <div key={i} className="mb-6 last:mb-0">
          <div
            className={`flex gap-4 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
          {message.role === 'assistant' && (
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-emerald-500" />
            </div>
          )}

          <div
            className={`max-w-[80%] rounded-2xl px-5 py-4 ${
              message.role === 'user'
                ? 'bg-emerald-600 text-white'
                : 'bg-card border border-border text-foreground'
            }`}
          >
            <div className={`break-words ${message.role === 'assistant' ? 'text-base leading-8 tracking-wide' : 'text-sm leading-loose'}`}>
              {message.role === 'assistant' ? (
                <div className="space-y-5">
                  {message.content.split(/\n\n+/).map((paragraph, j) => (
                    <div key={j} className="m-0">
                      {simpleMarkdownToReact(paragraph.trim(), {
                        onImagePreview: onImagePreview
                          ? (url, alt) => onImagePreview(url, alt, 'markdown')
                          : undefined,
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="m-0">
                  {message.content.split('\n').map((line, j) => (
                    <span key={j}>
                      {j > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </p>
              )}
            </div>
            {message.role === 'assistant' && (message.sources?.length ?? 0) > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {message.sources.map((s, j) => (
                  <a
                    key={j}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.title || s.url}
                    className="relative z-10 inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-semibold leading-none cursor-pointer hover:bg-emerald-500/30 transition-colors"
                  >
                    {j + 1}
                  </a>
                ))}
              </div>
            )}
            {message.role === 'assistant' && displayImages.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  相關圖片
                </p>
                <div className="app-image-grid">
                  {displayImages.map((img, j) => (
                    <button
                      key={`${img.url}-${j}`}
                      type="button"
                      title={img.title || '點擊預覽大圖'}
                      aria-label={img.title ? `開啟圖片預覽：${img.title}` : '開啟圖片預覽'}
                      className="app-image-grid-cell min-h-0"
                      onClick={() =>
                        onImagePreview?.(img.url, img.title || '', 'related-grid')
                      }
                    >
                      <img
                        src={img.url}
                        alt={img.title || ''}
                        className="app-image-thumb"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        decoding="async"
                        onError={(e) => {
                          const el = e.currentTarget;
                          el.style.opacity = '0.35';
                          el.alt = '圖片無法載入（可能被來源網站阻擋）';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {message.role === 'user' && (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          </div>
        </div>
        );
      })}

      {isSubmitting && (
        <div className="mb-0 flex gap-4 justify-start">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">正在搜尋網路並分析材質數據...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

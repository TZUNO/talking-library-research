import { Loader2, User, Bot, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { simpleMarkdownToReact } from '../lib/simpleMarkdown';

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
}

export function ChatHistory({ messages, isSubmitting }: ChatHistoryProps) {
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
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {messages.map((message, i) => (
        <div
          key={i}
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
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              message.role === 'user'
                ? 'bg-emerald-600 text-white'
                : 'bg-card border border-border text-foreground'
            }`}
          >
            <div className="text-sm break-words">
              {message.role === 'assistant'
                ? simpleMarkdownToReact(message.content)
                : message.content.split('\n').map((line, j) => (
                    <span key={j}>
                      {j > 0 && <br />}
                      {line}
                    </span>
                  ))}
            </div>
            {message.role === 'assistant' && (message.sources?.length ?? 0) > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5" />
                  參考來源
                </p>
                <ul className="space-y-1.5">
                  {message.sources.map((s, j) => (
                    <li key={j}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-500 hover:text-emerald-400 underline truncate block max-w-full"
                        title={s.title}
                      >
                        {s.title || s.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {message.role === 'assistant' && (message.images?.length ?? 0) > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  相關圖片
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {message.images.map((img, j) => (
                    <a
                      key={j}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg overflow-hidden border border-border bg-muted aspect-square"
                    >
                      <img
                        src={img.url}
                        alt={img.title || ''}
                        className="w-full h-full object-cover"
                      />
                    </a>
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
      ))}

      {isSubmitting && (
        <div className="flex gap-4 justify-start">
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

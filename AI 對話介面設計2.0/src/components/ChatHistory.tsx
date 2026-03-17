import { Loader2, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatHistoryProps {
  messages: Message[];
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
      {messages.map((message) => (
        <div
          key={message.id}
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
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </div>
            <div className={`text-xs mt-2 ${
              message.role === 'user' ? 'text-emerald-100' : 'text-muted-foreground'
            }`}>
              {message.timestamp.toLocaleTimeString('zh-TW', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
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
              <span className="text-sm">正在分析材質數據...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

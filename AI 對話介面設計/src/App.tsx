import { useState, useCallback, useEffect } from 'react';
import { TemplateCard } from './components/TemplateCard';
import { ConversationInput } from './components/ConversationInput';
import { HistoryPanel } from './components/HistoryPanel';
import { ChatHistory, type ChatMessage } from './components/ChatHistory';
import { StudyControlPopover } from './components/StudyControlPopover';
import { useExperimentTracking } from './hooks/useExperimentTracking';
import { logExperimentData, type InterfaceType } from './lib/experimentLog';
import { chatMaterialQuery } from './lib/gemini';

const STORAGE_PARTICIPANT_ID = 'study_participant_id';
const STORAGE_API_KEY = 'study_api_key';

function loadStoredParticipantId(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(STORAGE_PARTICIPANT_ID) ?? '';
  } catch {
    return '';
  }
}

function loadStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(STORAGE_API_KEY) ?? '';
  } catch {
    return '';
  }
}

export default function App() {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [interfaceType, setInterfaceType] = useState<InterfaceType>('Template');
  const [participantId, setParticipantId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const tracking = useExperimentTracking();

  useEffect(() => {
    setParticipantId(loadStoredParticipantId());
    setApiKey(loadStoredApiKey());
  }, []);

  const handleTemplateClick = useCallback(
    (prompt: string, templateId: string) => {
      tracking.recordClick(templateId);
      setInputValue(prompt);
      setTimeout(() => {
        const textarea = document.querySelector('textarea');
        (textarea as HTMLTextAreaElement)?.focus();
      }, 100);
    },
    [tracking]
  );

  const handleSubmit = useCallback(async () => {
    if (!inputValue.trim() || isSubmitting) return;

    const pid = participantId.trim();
    if (!pid) {
      alert('請輸入受測者編號');
      return;
    }
    if (!apiKey) {
      alert('請先設定 API Key');
      return;
    }

    const userText = inputValue.trim();
    const thoughtTime = tracking.getThoughtTimeSeconds();
    const inputDuration = tracking.getInputDurationSeconds();
    const clickPath = tracking.getClickPath();
    const timestamp = new Date().toISOString();

    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setInputValue('');
    setIsSubmitting(true);

    try {
      const reply = await chatMaterialQuery(userText, apiKey, messages);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply.text,
          sources: reply.sources,
          images: reply.images,
        },
      ]);
      logExperimentData({
        userId: pid,
        interfaceType,
        inputText: userText,
        thoughtTime,
        inputDuration,
        clickPath,
        timestamp,
        responseStatus: 'success',
        responseLength: reply.text.length,
      }).catch(() => {});
    } catch (err) {
      const msg = err instanceof Error ? err.message : '檢索時發生錯誤，請稍後再試。';
      setMessages((prev) => [...prev, { role: 'assistant', content: '檢索失敗：' + msg }]);
      logExperimentData({
        userId: pid,
        interfaceType,
        inputText: userText,
        thoughtTime,
        inputDuration,
        clickPath,
        timestamp,
        responseStatus: 'error',
        errorMessage: msg,
      }).catch(() => {});
    } finally {
      setIsSubmitting(false);
      tracking.resetForNextTurn(false);
    }
  }, [inputValue, isSubmitting, participantId, apiKey, interfaceType, tracking]);

  const inputPlaceholder =
    interfaceType === 'Free-form'
      ? '請自由描述材質需求'
      : "輸入材質需求或點擊下方範本，例如：'需要耐高溫、耐腐蝕的航空級鋁合金'";

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <div className="flex h-screen">
        <div className="hidden lg:block">
          <HistoryPanel />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <header className="px-6 pt-6 pb-4 border-b border-border flex items-center justify-between shrink-0 gap-4">
            <div>
              <h1 className="text-2xl font-semibold mb-1">材質檢索系統</h1>
              <p className="text-muted-foreground text-sm">
                透過智能提示，快速找到最適合的材質
              </p>
            </div>
            <StudyControlPopover
              interfaceType={interfaceType}
              onInterfaceTypeChange={setInterfaceType}
              participantId={participantId}
              onParticipantIdChange={setParticipantId}
              apiKey={apiKey}
              onApiKeyChange={setApiKey}
            />
          </header>

          <div className="flex-1 overflow-y-auto">
            <ChatHistory messages={messages} isSubmitting={isSubmitting} />
          </div>

          {/* 底部輸入區：輸入框 + Template chips（模式在右上角 Popover 切換） */}
          <div
            className={`border-t border-border bg-card/30 backdrop-blur-sm shrink-0 max-h-[28vh] min-h-0 flex flex-col ${interfaceType === 'Free-form' ? 'min-h-[200px]' : ''}`}
          >
            <div className="max-w-4xl mx-auto px-4 py-3 space-y-3 overflow-y-auto min-h-0 flex-1 w-full">
              <ConversationInput
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                placeholder={inputPlaceholder}
                onFirstKeystroke={tracking.recordFirstKeystroke}
                onFirstChar={tracking.recordFirstChar}
                onButtonClick={tracking.recordClick}
              />

              {interfaceType === 'Template' && (
                <TemplateCard onTemplateClick={handleTemplateClick} />
              )}
            </div>
          </div>
        </div>
      </div>

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
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M12 7v5l4 2" />
        </svg>
      </button>
    </div>
  );
}

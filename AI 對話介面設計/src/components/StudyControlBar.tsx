import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, Save } from 'lucide-react';

const STORAGE_PARTICIPANT_ID = 'study_participant_id';
const STORAGE_API_KEY = 'study_api_key';

interface StudyControlBarProps {
  participantId: string;
  onParticipantIdChange: (v: string) => void;
  apiKey: string;
  onApiKeyChange: (v: string) => void;
}

export function StudyControlBar({
  participantId,
  onParticipantIdChange,
  apiKey,
  onApiKeyChange,
}: StudyControlBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    try {
      if (participantId.trim()) localStorage.setItem(STORAGE_PARTICIPANT_ID, participantId.trim());
      if (apiKey) localStorage.setItem(STORAGE_API_KEY, apiKey);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const hasStored = typeof window !== 'undefined' && (
    !!localStorage.getItem(STORAGE_PARTICIPANT_ID) || !!localStorage.getItem(STORAGE_API_KEY)
  );

  return (
    <div className="rounded-lg border border-border bg-card/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2 text-left text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
      >
        <span>Study Control Bar</span>
        <span className="text-xs text-muted-foreground mr-2">
          {hasStored ? '已載入' : '未設定'}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Participant ID（必填）
            </label>
            <input
              type="text"
              value={participantId}
              onChange={(e) => onParticipantIdChange(e.target.value)}
              placeholder="例如 P001、001"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="儲存後僅存於本機"
                className="w-full px-3 py-2 pr-10 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowApiKey((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground"
                aria-label={showApiKey ? '隱藏' : '顯示'}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saved ? '已儲存' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
}

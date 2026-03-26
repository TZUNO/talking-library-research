import { useState } from 'react';
import { ChevronDown, ChevronUp, Save } from 'lucide-react';

const STORAGE_PARTICIPANT_ID = 'study_participant_id';

interface StudyControlBarProps {
  participantId: string;
  onParticipantIdChange: (v: string) => void;
}

export function StudyControlBar({
  participantId,
  onParticipantIdChange,
}: StudyControlBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    try {
      if (participantId.trim()) localStorage.setItem(STORAGE_PARTICIPANT_ID, participantId.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const hasStored =
    typeof window !== 'undefined' && !!localStorage.getItem(STORAGE_PARTICIPANT_ID);

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

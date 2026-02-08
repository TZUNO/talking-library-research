import { useState } from 'react';
import { FlaskConical, Eye, EyeOff, Save } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import type { InterfaceType } from '../lib/experimentLog';

const STORAGE_PARTICIPANT_ID = 'study_participant_id';
const STORAGE_API_KEY = 'study_api_key';

interface StudyControlPopoverProps {
  interfaceType: InterfaceType;
  onInterfaceTypeChange: (v: InterfaceType) => void;
  participantId: string;
  onParticipantIdChange: (v: string) => void;
  apiKey: string;
  onApiKeyChange: (v: string) => void;
}

export function StudyControlPopover({
  interfaceType,
  onInterfaceTypeChange,
  participantId,
  onParticipantIdChange,
  apiKey,
  onApiKeyChange,
}: StudyControlPopoverProps) {
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

  const hasAllSet = !!participantId.trim() && !!apiKey;
  const showBadge = !hasAllSet;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative shrink-0 w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/30 hover:border-emerald-500/60 transition-colors flex items-center justify-center"
          aria-label="研究控制面板"
        >
          <FlaskConical className="w-5 h-5" />
          {showBadge && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-background" aria-hidden />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 z-[100]" align="end" side="bottom" sideOffset={8}>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">模式</p>
            <div className="flex rounded-lg border border-border p-0.5 bg-muted/30">
              <button
                type="button"
                onClick={() => onInterfaceTypeChange('Template')}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
                  interfaceType === 'Template'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Template
              </button>
              <button
                type="button"
                onClick={() => onInterfaceTypeChange('Free-form')}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
                  interfaceType === 'Free-form'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Free-form
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              受測者編號 / Participant ID（必填）
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
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="儲存後僅存於本機"
                className="w-full px-3 py-2 pr-9 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-emerald-500"
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

          <p className="text-xs text-muted-foreground text-center">
            {hasAllSet ? '已設定' : '未設定'}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

import { useState } from 'react';
import { FlaskConical, Save } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import type { InterfaceType } from '../lib/experimentLog';

const STORAGE_PARTICIPANT_ID = 'study_participant_id';
const STORAGE_FINAL_MATERIAL = 'study_final_selected_material';

interface StudyControlPopoverProps {
  interfaceType: InterfaceType;
  onInterfaceTypeChange: (v: InterfaceType) => void;
  participantId: string;
  onParticipantIdChange: (v: string) => void;
  finalSelectedMaterial: string;
  onFinalSelectedMaterialChange: (v: string) => void;
}

export function StudyControlPopover({
  interfaceType,
  onInterfaceTypeChange,
  participantId,
  onParticipantIdChange,
  finalSelectedMaterial,
  onFinalSelectedMaterialChange,
}: StudyControlPopoverProps) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    try {
      if (participantId.trim()) localStorage.setItem(STORAGE_PARTICIPANT_ID, participantId.trim());
      localStorage.setItem(STORAGE_FINAL_MATERIAL, finalSelectedMaterial.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const hasParticipantId = !!participantId.trim();
  const showBadge = !hasParticipantId;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative shrink-0 w-12 h-12 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/30 hover:border-emerald-500/60 transition-colors flex items-center justify-center"
          aria-label="研究控制面板"
        >
          <FlaskConical className="w-6 h-6" />
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
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
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
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
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
              最終選定材料（選填）
            </label>
            <p className="text-[11px] text-white mb-1.5 leading-snug">
              實驗結束時請填寫您最後決定的材質，供研究確認是否達成目標。
            </p>
            <textarea
              value={finalSelectedMaterial}
              onChange={(e) => onFinalSelectedMaterialChange(e.target.value)}
              placeholder="例如：低甲醛合板、304 不鏽鋼、壓克力板…"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-emerald-500 resize-y min-h-[2.5rem] max-h-24"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors"
          >
            <Save className="w-5 h-5" />
            {saved ? '已儲存' : 'Save'}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            {hasParticipantId ? '已填受測者編號' : '請填受測者編號'}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

import { X, FileText, Hash } from 'lucide-react';
import type { InterfaceType } from '../lib/experimentLog';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  interfaceType: InterfaceType;
  onInterfaceTypeChange: (v: InterfaceType) => void;
  userId: string;
  onUserIdChange: (v: string) => void;
}

export function SettingsDrawer({
  isOpen,
  onClose,
  interfaceType,
  onInterfaceTypeChange,
  userId,
  onUserIdChange,
}: SettingsDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">研究設定</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block flex items-center gap-2">
              <FileText className="w-4 h-4" />
              輸入模式
            </label>
            <div className="space-y-2">
              <button
                onClick={() => onInterfaceTypeChange('Template')}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  interfaceType === 'Template'
                    ? 'border-emerald-500 bg-emerald-500/10 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-emerald-500/30'
                }`}
              >
                <div className="font-medium mb-1">Template 模式</div>
                <div className="text-xs opacity-70">使用預設範本進行檢索</div>
              </button>
              <button
                onClick={() => onInterfaceTypeChange('Free-form')}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  interfaceType === 'Free-form'
                    ? 'border-emerald-500 bg-emerald-500/10 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-emerald-500/30'
                }`}
              >
                <div className="font-medium mb-1">Free-form 模式</div>
                <div className="text-xs opacity-70">自由輸入檢索條件</div>
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block flex items-center gap-2">
              <Hash className="w-4 h-4" />
              受測者編號
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => onUserIdChange(e.target.value)}
              placeholder="輸入受測者編號，或從網址 ?userId= 帶入"
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500 transition-colors"
            />
            {userId && (
              <div className="mt-2 text-xs text-muted-foreground">
                當前受測者: <span className="text-emerald-500 font-medium">{userId}</span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
              <p className="font-medium text-foreground">研究人員須知：</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>此設定僅供研究人員使用</li>
                <li>受測者編號將記錄在所有檢索日誌中</li>
                <li>Template 模式提供引導式範本</li>
                <li>Free-form 模式允許完全自由輸入</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border space-y-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors font-medium"
          >
            儲存設定
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </>
  );
}

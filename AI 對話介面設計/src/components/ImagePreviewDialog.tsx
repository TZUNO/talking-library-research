import { useState, useEffect, useCallback } from 'react';
import { XIcon } from 'lucide-react';

export interface ImagePreviewState {
  url: string;
  title: string;
  source: 'markdown' | 'related-grid';
}

interface ImagePreviewDialogProps {
  preview: ImagePreviewState | null;
  onClose: () => void;
}

export function ImagePreviewDialog({ preview, onClose }: ImagePreviewDialogProps) {
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoadError(false);
  }, [preview?.url]);

  // Escape 鍵關閉
  useEffect(() => {
    if (!preview) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [preview, onClose]);

  // 開啟時鎖住背景捲動
  useEffect(() => {
    if (!preview) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [preview]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!preview) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={preview.title ? `圖片預覽：${preview.title}` : '圖片預覽'}
      style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      className="flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={handleBackdropClick}
    >
      {/* 關閉按鈕 */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
        aria-label="關閉預覽"
      >
        <XIcon className="w-5 h-5" />
      </button>

      {loadError ? (
        <div className="text-center text-sm text-white/80 px-4">
          <p className="mb-3">無法載入圖片（來源網站可能阻擋嵌入）。</p>
          <a
            href={preview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md bg-emerald-600 px-4 py-2 text-white text-sm hover:bg-emerald-500 transition-colors"
          >
            在新分頁開啟圖片
          </a>
        </div>
      ) : (
        <img
          key={preview.url}
          src={preview.url}
          alt={preview.title || '預覽圖'}
          referrerPolicy="no-referrer"
          decoding="async"
          loading="eager"
          style={{
            maxWidth: '92vw',
            maxHeight: '88vh',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            borderRadius: '0.5rem',
          }}
          onError={() => {
            if (!loadError) setLoadError(true);
          }}
        />
      )}
    </div>
  );
}

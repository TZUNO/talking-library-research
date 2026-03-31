import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from './ui/dialog';

export interface ImagePreviewState {
  url: string;
  title: string;
  source: 'markdown' | 'related-grid';
}

interface ImagePreviewDialogProps {
  preview: ImagePreviewState | null;
  onClose: () => void;
}

/**
 * 站內大圖預覽（不另開分頁，便於紀錄觀看時長）
 *
 * 注意：預覽內 img 不使用 no-referrer，否則多數圖床／搜尋縮圖會拒絕載入（只見底色不見圖）。
 */
export function ImagePreviewDialog({ preview, onClose }: ImagePreviewDialogProps) {
  const open = preview != null;
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoadError(false);
  }, [preview?.url]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        className="!flex !max-w-[min(96vw,72rem)] sm:!max-w-[min(96vw,72rem)] w-[min(96vw,72rem)] max-h-[90vh] flex-col overflow-y-auto overflow-x-hidden p-2 pt-10 sm:p-3 sm:pt-11 gap-2 border-border bg-background/95 backdrop-blur-sm"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">
          {preview?.title ? `圖片預覽：${preview.title}` : '圖片預覽'}
        </DialogTitle>
        {preview && (
          <div className="flex min-h-[min(40vh,400px)] w-full flex-1 items-center justify-center">
            {loadError ? (
              <div className="text-center text-sm text-muted-foreground px-4">
                <p className="mb-2">無法在此視窗載入圖片（來源網站可能阻擋嵌入）。</p>
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-500 underline hover:text-emerald-400"
                >
                  在新分頁開啟圖片
                </a>
              </div>
            ) : (
              <img
                key={preview.url}
                src={preview.url}
                alt={preview.title || '預覽圖'}
                className="max-h-[min(85vh,1200px)] w-auto max-w-full object-contain"
                referrerPolicy="no-referrer"
                decoding="async"
                loading="eager"
                fetchPriority="high"
                onError={() => {
                  if (!loadError) setLoadError(true);
                }}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

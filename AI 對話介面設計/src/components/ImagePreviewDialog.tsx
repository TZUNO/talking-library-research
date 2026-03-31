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
 */
export function ImagePreviewDialog({ preview, onClose }: ImagePreviewDialogProps) {
  const open = preview != null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        className="max-w-[min(96vw,72rem)] w-auto max-h-[90vh] overflow-hidden p-2 sm:p-3 gap-0 border-border bg-background/95 backdrop-blur-sm"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">
          {preview?.title ? `圖片預覽：${preview.title}` : '圖片預覽'}
        </DialogTitle>
        {preview && (
          <div className="flex max-h-[85vh] w-full items-center justify-center overflow-auto">
            <img
              src={preview.url}
              alt={preview.title || '預覽圖'}
              className="max-h-[85vh] w-auto max-w-full object-contain"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

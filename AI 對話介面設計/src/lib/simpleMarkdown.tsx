import React from 'react';
import { consumeLeadingMarkdownImage } from './chatImages';

export interface SimpleMarkdownOptions {
  /** 若提供，圖片改為站內預覽（不另開分頁），便於實驗紀錄觀看時長 */
  onImagePreview?: (url: string, alt: string) => void;
}

/**
 * 簡易 Markdown 轉 React（支援 **粗體**、# 標題、- 列表、[文字](連結)、![說明](圖片URL)）
 * 顯示時不露出原始符號，以易讀的格式呈現
 */
export function simpleMarkdownToReact(text: string, options?: SimpleMarkdownOptions): React.ReactNode {
  if (!text) return null;
  const lines = text.split('\n');
  let key = 0;
  const onImagePreview = options?.onImagePreview;

  const renderInline = (line: string): React.ReactNode => {
    const result: React.ReactNode[] = [];
    let remaining = line;

    while (remaining.length > 0) {
      const leadingImg = consumeLeadingMarkdownImage(remaining);
      if (leadingImg) {
        const alt = leadingImg.alt || '';
        const k = `img-${key++}`;
        if (onImagePreview) {
          result.push(
            <button
              key={k}
              type="button"
              className="app-image-wrap"
              onClick={() => onImagePreview(leadingImg.url, alt)}
              aria-label={alt ? `開啟圖片預覽：${alt}` : '開啟圖片預覽'}
              title="點擊預覽大圖"
            >
              <img
                src={leadingImg.url}
                alt={alt}
                className="app-image-content"
                loading="lazy"
                referrerPolicy="no-referrer"
                decoding="async"
              />
            </button>
          );
        } else {
          result.push(
            <a
              key={k}
              href={leadingImg.url}
              target="_blank"
              rel="noopener noreferrer"
              className="app-image-wrap"
              title="點擊在新分頁開啟大圖"
            >
              <img
                src={leadingImg.url}
                alt={alt}
                className="app-image-content"
                loading="lazy"
                referrerPolicy="no-referrer"
                decoding="async"
              />
            </a>
          );
        }
        remaining = remaining.slice(leadingImg.rawLength);
        continue;
      }

      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      const imageMatch = remaining.match(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/);
      const linkMatch = remaining.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
      let match: RegExpMatchArray | null = null;
      let type: 'bold' | 'image' | 'link' = 'bold';
      let index = remaining.length;

      if (boldMatch && boldMatch.index !== undefined) {
        index = boldMatch.index;
        match = boldMatch;
        type = 'bold';
      }
      if (imageMatch && imageMatch.index !== undefined && imageMatch.index < index) {
        index = imageMatch.index;
        match = imageMatch;
        type = 'image';
      }
      if (linkMatch && linkMatch.index !== undefined && linkMatch.index < index) {
        index = linkMatch.index;
        match = linkMatch;
        type = 'link';
      }

      if (match && match.index !== undefined) {
        if (match.index > 0) {
          result.push(remaining.slice(0, match.index));
        }
        if (type === 'bold') {
          result.push(<strong key={`b-${key++}`}>{match[1]}</strong>);
        } else if (type === 'image') {
          const url = match[2];
          const alt = match[1] || '';
          const k = `img-${key++}`;
          if (onImagePreview) {
            result.push(
              <button
                key={k}
                type="button"
                className="app-image-wrap"
                onClick={() => onImagePreview(url, alt)}
                aria-label={alt ? `開啟圖片預覽：${alt}` : '開啟圖片預覽'}
                title="點擊預覽大圖"
              >
                <img
                  src={url}
                  alt={alt}
                  className="app-image-content"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  decoding="async"
                />
              </button>
            );
          } else {
            result.push(
              <a
                key={k}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="app-image-wrap"
                title="點擊在新分頁開啟大圖"
              >
                <img
                  src={url}
                  alt={alt}
                  className="app-image-content"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  decoding="async"
                />
              </a>
            );
          }
        } else {
          result.push(
            <a
              key={`a-${key++}`}
              href={match[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 text-emerald-500 underline hover:text-emerald-400 cursor-pointer"
            >
              {match[1]}
            </a>
          );
        }
        remaining = remaining.slice(match.index + match[0].length);
      } else {
        result.push(remaining);
        break;
      }
    }
    return <>{result}</>;
  };

  return (
    <>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        const headerMatch = trimmed.match(/^#{1,6}\s+(.+)$/);
        const listMatch = trimmed.match(/^[-*]\s+(.+)$/);

        if (headerMatch) {
          return (
            <div key={i} className="font-semibold text-foreground mt-2 first:mt-0">
              {renderInline(headerMatch[1])}
            </div>
          );
        }
        if (listMatch) {
          return (
            <div key={i} className="flex gap-2 mt-1">
              <span className="text-emerald-500 shrink-0">•</span>
              <span>{renderInline(listMatch[1])}</span>
            </div>
          );
        }
        return (
          <React.Fragment key={i}>
            {i > 0 && <br />}
            {renderInline(line)}
          </React.Fragment>
        );
      })}
    </>
  );
}

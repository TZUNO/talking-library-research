import React from 'react';

/**
 * 簡易 Markdown 轉 React（支援 **粗體**、# 標題、- 列表、[文字](連結)）
 * 顯示時不露出原始符號，以易讀的格式呈現
 */
export function simpleMarkdownToReact(text: string): React.ReactNode {
  if (!text) return null;
  const lines = text.split('\n');
  const parts: React.ReactNode[] = [];
  let key = 0;

  const renderInline = (line: string): React.ReactNode => {
    const result: React.ReactNode[] = [];
    let remaining = line;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      const linkMatch = remaining.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
      let match: RegExpMatchArray | null = null;
      let type: 'bold' | 'link' = 'bold';
      let index = remaining.length;

      if (boldMatch && boldMatch.index !== undefined) {
        index = boldMatch.index;
        match = boldMatch;
        type = 'bold';
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
        } else {
          result.push(
            <a
              key={`a-${key++}`}
              href={match[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500 underline hover:text-emerald-400"
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

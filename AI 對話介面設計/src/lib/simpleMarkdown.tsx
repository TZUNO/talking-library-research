import React from 'react';

/**
 * 簡易 Markdown 轉 React（支援 **粗體**、[文字](連結)、換行）
 */
export function simpleMarkdownToReact(text: string): React.ReactNode {
  if (!text) return null;
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const pushText = (raw: string) => {
    if (!raw) return;
    parts.push(
      <span key={key++}>
        {raw.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 && <br />}
            {line}
          </React.Fragment>
        ))}
      </span>
    );
  };

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
      pushText(remaining.slice(0, match.index));
      if (type === 'bold') {
        parts.push(<strong key={key++}>{match[1]}</strong>);
      } else {
        parts.push(
          <a
            key={key++}
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
      pushText(remaining);
      break;
    }
  }

  return <>{parts}</>;
}

import React from 'react';

export default function FormattedMessage({ text }) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];
  let listItems = [];

  function parseInline(line) {
    const parts = [];
    const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      const val = match[0];
      if (val.startsWith("**") && val.endsWith("**")) {
        parts.push(<strong key={match.index}>{val.slice(2, -2)}</strong>);
      } else if (val.startsWith("`") && val.endsWith("`")) {
        parts.push(<code key={match.index} className="chat-inline-code">{val.slice(1, -1)}</code>);
      } else if (val.startsWith("*") && val.endsWith("*")) {
        parts.push(<em key={match.index}>{val.slice(1, -1)}</em>);
      } else {
        parts.push(val);
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }
    return parts.length > 0 ? parts : line;
  }

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="chat-message-list">
          {listItems.map((item, i) => (
            <li key={i}>{parseInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || /^\d+\.\s/.test(trimmed)) {
      listItems.push(trimmed.replace(/^[-*\d.]+\s*/, ""));
    } else {
      flushList();
      if (trimmed.startsWith("> ")) {
        elements.push(
          <blockquote key={idx} className="chat-blockquote">
            {parseInline(trimmed.slice(2))}
          </blockquote>
        );
      } else if (trimmed.startsWith("### ")) {
        elements.push(<h4 key={idx} className="chat-h4">{parseInline(trimmed.slice(4))}</h4>);
      } else if (trimmed.startsWith("## ")) {
        elements.push(<h3 key={idx} className="chat-h3">{parseInline(trimmed.slice(3))}</h3>);
      } else if (trimmed === "") {
        elements.push(<div key={idx} style={{ height: "4px" }} />);
      } else {
        elements.push(<p key={idx} className="chat-p">{parseInline(trimmed)}</p>);
      }
    }
  });
  flushList();

  return <div className="chat-formatted-body">{elements}</div>;
}

import type { ReactNode } from "react";

// Lightweight formatting for admin-entered free text, so co-hosts can
// structure a description in a plain textarea without learning markdown:
//   - a short line ending in ":" becomes a subheading ("Court rental:")
//   - lines starting with "- " or "• " become a bulleted list
//   - every other line becomes its own paragraph
// Text without line breaks renders exactly as a single paragraph did before.
const HEADING_MAX_LENGTH = 40;

export function FormattedText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = () => {
    if (bullets.length === 0) return;
    blocks.push(
      <ul className="formatted-list" key={blocks.length}>
        {bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>,
    );
    bullets = [];
  };

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flushBullets();
      continue;
    }
    const bullet = line.match(/^[-•]\s+(.*)$/);
    if (bullet) {
      bullets.push(bullet[1]);
      continue;
    }
    flushBullets();
    if (line.endsWith(":") && line.length <= HEADING_MAX_LENGTH) {
      blocks.push(<p className="formatted-heading" key={blocks.length}>{line.slice(0, -1)}</p>);
    } else {
      blocks.push(<p key={blocks.length}>{line}</p>);
    }
  }
  flushBullets();

  return <div className="formatted-text">{blocks}</div>;
}

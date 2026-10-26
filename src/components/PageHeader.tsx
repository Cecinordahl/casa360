import type { ReactNode } from "react";

/** Editorial header shared by every interior page: an uppercase tracker
 * ("Directory / Gastronomy"), a large serif title and a hairline rule. */
export function PageHeader({
  tracker,
  title,
  children,
}: {
  tracker: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-header">
      <p className="micro-label">{tracker}</p>
      <h1>{title}</h1>
      {children}
    </header>
  );
}

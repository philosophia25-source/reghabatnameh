import { LegalShell } from "@/components/legal-shell";
import "./articles/articles.css";

export default function LegalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <LegalShell>{children}</LegalShell>;
}

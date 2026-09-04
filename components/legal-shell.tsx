import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function LegalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="legal-site">
      <SiteHeader variant="legal" />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </div>
  );
}

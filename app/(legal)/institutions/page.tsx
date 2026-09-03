import type { Metadata } from "next";
import Link from "next/link";
import { toFaDigits } from "@/app/text";
import {
  documentsForInstitution,
  publishedInstitutionalDomains,
  publishedInstitutions,
} from "@/lib/knowledge/queries";

export const metadata: Metadata = {
  title: "نهادهای رقابت و تنظیم‌گری",
  description: "نهادهای منتخب رقابت و تنظیم‌گری و اسناد مهم مرتبط با هر نهاد",
  alternates: { canonical: "/institutions" },
};

export default function InstitutionsPage() {
  return (
    <section className="shell listing-page knowledge-index-page">
      <p className="kicker">نهادها</p>
      <h1>نهادهای رقابت و تنظیم‌گری</h1>
      <p className="lead">فقط نهادهایی در این فهرست نمایش داده می‌شوند که سند واقعی و قابل مطالعه دارند. دامنه پوشش هر مجموعه در صفحه همان نهاد توضیح داده شده است.</p>
      {publishedInstitutionalDomains.map((domain) => {
        const members = publishedInstitutions.filter((institution) => domain.memberIds.includes(institution.id));
        return (
          <section className="knowledge-domain" key={domain.id}>
            <div className="knowledge-domain-heading"><span>حوزه نهادی</span><h2>{domain.name}</h2><p>{domain.description}</p></div>
            <div className="knowledge-card-grid">
              {members.map((institution) => {
                const documents = documentsForInstitution(institution.id);
                const count = documents.length;
                const label = documents.some((document) => !document.curated) ? "سند" : "سند منتخب";
                return (
                  <Link className="knowledge-card" href={institution.route} key={institution.id}>
                    <small>نهاد</small><h3>{institution.name}</h3><p>{institution.description}</p><b>{toFaDigits(count)} {label} ←</b>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </section>
  );
}

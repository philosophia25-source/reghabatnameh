import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { EditorialMeta } from "@/components/editorial-meta";
import { JsonLd } from "@/components/json-ld";
import { PrinciplesNav } from "@/components/principles-nav";
import { toFaDigits } from "@/app/text";
import {
  COMPETITION_PRINCIPLES_DESCRIPTION,
  COMPETITION_PRINCIPLES_ROUTE,
  COMPETITION_PRINCIPLES_TITLE,
  readCompetitionPrinciples,
} from "@/lib/competition-principles";
import { AUTHOR, SITE_NAME, SITE_URL } from "@/lib/site";

export function CompetitionPrinciplesPage() {
  const sections = readCompetitionPrinciples();

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "خانه", href: "/" },
        { name: "قوانین و شرح", href: "/laws" },
        { name: COMPETITION_PRINCIPLES_TITLE, href: COMPETITION_PRINCIPLES_ROUTE },
      ]} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: COMPETITION_PRINCIPLES_TITLE,
        description: COMPETITION_PRINCIPLES_DESCRIPTION,
        inLanguage: "fa-IR",
        mainEntityOfPage: `${SITE_URL}${COMPETITION_PRINCIPLES_ROUTE}`,
        author: { "@type": "Person", name: AUTHOR.name, url: `${SITE_URL}${AUTHOR.route}` },
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      }} />
      <section className="decision-hero knowledge-hero principles-hero">
        <div className="breadcrumbs">
          <Link href="/">خانه</Link><span>←</span><Link href="/laws">قوانین و شرح</Link><span>←</span><b>اصول عمومی</b>
        </div>
        <p className="eyebrow">مبانی مشترک تحلیل</p>
        <h1>{COMPETITION_PRINCIPLES_TITLE}</h1>
        <p>{COMPETITION_PRINCIPLES_DESCRIPTION}</p>
        <div className="law-meta">
          <span>نوع محتوا <b>تحلیل حقوقی</b></span>
          <span>نویسنده <b>{AUTHOR.name}</b></span>
          <span>ساختار <b>مقدمه و هشت اصل</b></span>
        </div>
      </section>
      <section className="legal-content principles-content">
        <div className="commentary-layout part-layout principles-layout">
          <PrinciplesNav sections={sections.map(({ id, title }) => ({ id, title }))} />
          <article className="commentary-body principles-body">
            <EditorialMeta citation={`${AUTHOR.name}، «${COMPETITION_PRINCIPLES_TITLE}»، ${SITE_NAME}، ${SITE_URL}${COMPETITION_PRINCIPLES_ROUTE}`} />
            {sections.map((section, index) => (
              <section id={section.id} className={index === 0 ? "principles-introduction" : undefined} key={section.id}>
                <p className="commentary-kicker">{index === 0 ? "مقدمه" : `اصل ${toFaDigits(index)}`}</p>
                <h2>{section.title.replace(/^[۰-۹0-9]+\.\s*/, "")}</h2>
                {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
              </section>
            ))}
          </article>
        </div>
      </section>
    </>
  );
}

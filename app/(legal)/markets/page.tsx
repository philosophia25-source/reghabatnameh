import type { Metadata } from "next";
import Link from "next/link";
import { toFaDigits } from "@/app/text";
import { documentsForMarket, publishedMarkets } from "@/lib/knowledge/queries";

export const metadata: Metadata = { title: "بازارها و صنایع", description: "دسترسی به اسناد حقوق رقابت و تنظیم‌گری بر اساس بازار و صنعت", alternates: { canonical: "/markets" } };

export default function MarketsPage() {
  return <section className="shell listing-page knowledge-index-page"><p className="kicker">شبکه بازارها</p><h1>بازارها و صنایع</h1><p className="lead">این طبقه‌بندی از موضوع حقوقی جداست و پرونده‌های هر صنعت را مستقل از عنوان تخلف کنار هم می‌گذارد.</p><div className="knowledge-card-grid knowledge-card-grid-three">{publishedMarkets.map((market) => <Link className="knowledge-card" href={market.route} key={market.id}><small>بازار</small><h2>{market.title}</h2><p>{market.description}</p><b>{toFaDigits(documentsForMarket(market.id).length)} سند منتخب ←</b></Link>)}</div></section>;
}

import type { MetadataRoute } from "next";
import {
  publishedDocuments,
  publishedInstitutions,
  publishedLegalSources,
  publishedMarkets,
  publishedProvisions,
  publishedTopics,
} from "@/lib/knowledge/queries";

const BASE_URL = "https://naderjafari.com";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const fixedRoutes = [
    "",
    "/laws",
    "/laws/article-44/commentary",
    "/laws/article-44/decisions",
    "/decisions",
    "/institutions",
    "/topics",
    "/markets",
    "/about",
    "/contact",
  ];

  const contentRoutes = [
    ...publishedLegalSources.map((item) => item.route),
    ...publishedProvisions.map((item) => item.route),
    ...publishedDocuments.map((item) => item.route),
    ...publishedInstitutions.map((item) => item.route),
    ...publishedTopics.map((item) => item.route),
    ...publishedMarkets.map((item) => item.route),
  ];

  return Array.from(new Set([...fixedRoutes, ...contentRoutes])).map((route) => ({
    url: `${BASE_URL}${route}`,
  }));
}

import type { MetadataRoute } from "next";
import {
  publishedDocuments,
  publishedCases,
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
    "/laws/general-policies-44/article-44/commentary",
    "/laws/general-policies-44/article-44/decisions",
    "/laws/general-policies-44/article-45/commentary",
    "/laws/general-policies-44/article-45/decisions",
    "/decisions",
    "/resolutions",
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
    ...publishedCases.map((item) => item.route),
    ...publishedInstitutions.map((item) => item.route),
    ...publishedTopics.map((item) => item.route),
    ...publishedMarkets.map((item) => item.route),
  ];

  return Array.from(new Set([...fixedRoutes, ...contentRoutes])).map((route) => ({
    url: `${BASE_URL}${route}`,
  }));
}

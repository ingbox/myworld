import { MetadataRoute } from "next";
import { getBaseUrl } from "@/src/util/shared/url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/chat/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
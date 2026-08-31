import { MetadataRoute } from "next";
import { getBaseUrl } from "@/app/actions/url";

const staticRoutes = [
  "/cy/home",
  "/cy/board",
  "/cy/diary",
  "/cy/profile",
  "/cy/profile/intro/my",
  "/cy/profile/intro/keyword",
  "/cy/profile/intro/history",
  "/cy/profile/intro/42",
  "/cy/jukebox",
  "/cy/visitor",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();

  return staticRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));
}

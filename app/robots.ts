import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://celobuilder.vercel.app"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/test-compile/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

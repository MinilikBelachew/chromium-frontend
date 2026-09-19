import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: "https://virwo.learnica.net",
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
    ];
}

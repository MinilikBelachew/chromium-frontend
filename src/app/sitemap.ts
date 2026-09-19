import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: "http://virwo.learnica.net",
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
    ];
}

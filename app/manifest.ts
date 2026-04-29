import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cenate AI",
    short_name: "Cenate",
    description:
      "Cenate AI generates production-ready web experiences for small businesses from a single prompt.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#0D0D0D",
    background_color: "#0D0D0D",
    categories: ["productivity", "developer", "business"],
    icons: [
      {
        src: "/Favicon.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/cenate-mark.png",
        sizes: "any",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/cenate-og-v2.png",
        sizes: "1200x630",
        type: "image/png",
        form_factor: "wide",
        label: "Cenate AI workspace",
      },
      {
        src: "/cenate-og-v2.png",
        sizes: "1200x630",
        type: "image/png",
        form_factor: "narrow",
        label: "Cenate AI workspace",
      },
    ],
  };
}

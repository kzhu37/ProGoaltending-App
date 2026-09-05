import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PRO Goaltending — Training",
    short_name: "PRO Training",
    description: "Fictional athlete development product demo.",
    start_url: "/",
    display: "standalone",
    background_color: "#07101d",
    theme_color: "#0b66ff",
    orientation: "portrait",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" }],
  };
}

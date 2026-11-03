import type { MetadataRoute } from "next";

/** Lets the app be added to a phone's home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sketchbook",
    short_name: "Sketchbook",
    description: "Personal Excalidraw notes.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

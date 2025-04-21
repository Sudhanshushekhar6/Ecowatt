import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ecowatt",
    short_name: "Ecowatt",
    description:
      "Your all-in-one solution for optimizing solar energy usage, reducing electricity bills, and contributing to a greener future.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
  };
}

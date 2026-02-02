import type { Metadata } from "next";
import "../../app/globals.css";
import { firaMono, firaSans } from "@/lib/fonts";

const siteUrl = "https://ryn.phytertek.com";
const siteTitle = "Ryan Lowe | AI Engineering Leader";
const siteDescription =
  "AI Engineering Leader managing teams of AI agents to deliver 10x development velocity. Pioneering AI-native workflows that combine unprecedented speed, quality, and cost efficiency.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Ryan Lowe",
  },
  description: siteDescription,
};

export default function StandaloneLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          defer
          src="https://umami.phytertek.com/script.js"
          data-website-id="81d82483-e533-456e-beaa-85e1c2858092"
        ></script>
      </head>
      <body
        className={`${firaSans.variable} ${firaMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

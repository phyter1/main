import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Navigation } from "@/components/layout/Navigation";
import { firaMono, firaSans } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Ryan Lowe | Full-Stack Engineer & Infrastructure Architect",
  description:
    "Senior software engineer specializing in TypeScript, React, Next.js, and AWS. Building scalable healthcare technology and developer tools.",
  openGraph: {
    title: "Ryan Lowe | Full-Stack Engineer",
    description:
      "Senior software engineer specializing in TypeScript, React, Next.js, and AWS.",
    type: "website",
  },
};

export default function RootLayout({
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
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

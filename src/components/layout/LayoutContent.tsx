"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { Navigation } from "./Navigation";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isResumePage = pathname === "/resume";

  if (isResumePage) {
    return children;
  }

  return (
    <>
      <Navigation />
      <main>{children}</main>
      <Footer />
    </>
  );
}

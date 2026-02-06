/**
 * Admin Blog Layout (T015)
 *
 * Layout wrapper for admin blog pages using authenticated layout.
 * Ensures all blog admin pages require authentication.
 */

import { AuthenticatedLayout } from "@/app/admin/agent-workbench/authenticated-layout";

interface BlogLayoutProps {
  children: React.ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

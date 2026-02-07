/**
 * Admin Agent Workbench Layout
 * Provides authenticated layout with sidebar navigation
 * Authentication is handled by middleware - this just wraps with layout
 */

import { AuthenticatedLayout } from "../authenticated-layout";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // Middleware handles authentication, just wrap with layout
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

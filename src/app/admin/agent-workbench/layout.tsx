/**
 * Admin Agent Workbench Layout
 * Provides authentication-protected layout with sidebar navigation
 */

import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { AuthenticatedLayout } from "./authenticated-layout";
import { LoginForm } from "./login-form";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Check for session cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  const sessionToken = sessionCookie?.value;

  // Verify session
  const isAuthenticated = sessionToken && verifySessionToken(sessionToken);

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // If authenticated, show layout with sidebar
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

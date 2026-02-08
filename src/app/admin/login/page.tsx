/**
 * Admin Login Page
 * Standalone login page for admin authentication
 * Supports ?redirect= query param to return user to original page after login
 */

import { Suspense } from "react";
import { LoginForm } from "@/components/admin/auth/LoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

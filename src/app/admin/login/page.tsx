/**
 * Admin Login Page
 * Standalone login page for admin authentication
 * Supports ?redirect= query param to return user to original page after login
 */

import { LoginForm } from "@/components/admin/auth/LoginForm";

export default function AdminLoginPage() {
  return <LoginForm />;
}

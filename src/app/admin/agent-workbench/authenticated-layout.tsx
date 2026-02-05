"use client";

/**
 * Authenticated Layout Component
 * Layout with sidebar navigation for authenticated admin users
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./logout-button";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Chat Agent", href: "/admin/agent-workbench" },
  { label: "Job Fit Agent", href: "/admin/agent-workbench/job-fit" },
  { label: "Resume Data", href: "/admin/agent-workbench/resume" },
  { label: "Test Suite", href: "/admin/agent-workbench/tests" },
  { label: "History", href: "/admin/agent-workbench/history" },
];

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <nav className="flex w-64 flex-col border-r bg-muted/40">
        {/* Header */}
        <div className="border-b p-6">
          <h1 className="text-xl font-bold">Agent Workbench</h1>
          <p className="text-sm text-muted-foreground">Admin Dashboard</p>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Logout Button */}
        <div className="border-t p-4">
          <LogoutButton />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}

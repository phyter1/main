"use client";

import { Menu, Terminal, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Principles", href: "/principles" },
  { label: "Stack", href: "/stack" },
  { label: "Projects", href: "/projects" },
  { label: "Chat", href: "/chat" },
  { label: "Fit Assessment", href: "/fit-assessment" },
];

/**
 * Navigation - Fixed top navigation with backdrop blur on scroll
 */
export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Don't render on admin routes
  if (pathname.startsWith("/admin")) {
    return null;
  }

  // biome-ignore lint/correctness/useHookAtTopLevel: Early return for admin routes is intentional and safe here
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-border/40 bg-background/80 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-lg font-bold"
          >
            <Terminal className="h-5 w-5 text-accent-vibrant" />
            <span className="text-foreground">Ryan Lowe</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-vibrant" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ThemeToggle and CTA Button */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <ThemeToggle />
            <Button size="sm" variant="vibrant" asChild>
              <a href="/assets/ryan_lowe_resume_2025v2.pdf" download>
                Resume
              </a>
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-md md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-base font-medium ${
                    isActive
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="flex items-center gap-4 pt-2">
              <ThemeToggle />
              <Button size="sm" variant="vibrant" className="flex-1" asChild>
                <a href="/assets/ryan_lowe_resume_2025v2.pdf" download>
                  Resume
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

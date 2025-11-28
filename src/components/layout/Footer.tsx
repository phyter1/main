import Link from "next/link";
import {
  AiOutlineGithub,
  AiOutlineLinkedin,
  AiOutlineMail,
  AiOutlineWhatsApp,
} from "react-icons/ai";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/phyter1",
    icon: AiOutlineGithub,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/phytertek",
    icon: AiOutlineLinkedin,
  },
  {
    name: "Mobile",
    href: "https://wa.link/8ps16z",
    icon: AiOutlineWhatsApp,
  },
  {
    name: "Email",
    href: "mailto:ryan.phyter.1@gmail.com",
    icon: AiOutlineMail,
  },
];

const techStack = [
  "Next.js",
  "TypeScript",
  "React",
  "Tailwind CSS",
  "Shadcn UI",
];

/**
 * Footer - Minimal footer with social links and tech stack
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* About */}
          <div>
            <h3 className="mb-4 font-mono text-sm font-semibold text-foreground">
              Ryan Lowe
            </h3>
            <p className="text-sm text-muted-foreground">
              Full-Stack Engineer & Infrastructure Architect. Building scalable
              systems with modern web technologies.
            </p>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="mb-4 font-mono text-sm font-semibold text-foreground">
              Connect
            </h3>
            <div className="flex gap-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={link.name}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Built With */}
          <div>
            <h3 className="mb-4 font-mono text-sm font-semibold text-foreground">
              Built With
            </h3>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Copyright */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© {currentYear} Ryan Lowe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

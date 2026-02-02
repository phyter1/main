"use client";

import { Download, FileText, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";

export default function ResumePage() {
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    fetch("/assets/ryan_lowe_resume_2026_ai_first.md")
      .then((res) => res.text())
      .then((text) => setMarkdown(text));
  }, []);

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ryan_lowe_resume.md";
    a.click();
    URL.revokeObjectURL(url);
  };


  const printPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar - hide when printing */}
      <div className="sticky top-0 z-50 border-b border-border bg-background print:hidden">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Resume</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadMarkdown}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Markdown
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={printPdf}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Resume content */}
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 print:py-0">
        <div
          id="resume-content"
          className="prose prose-neutral dark:prose-invert mx-auto max-w-none"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      </div>

      {/* Custom resume styles */}
      <style jsx global>{`
        #resume-content h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        #resume-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid hsl(var(--primary) / 0.2);
        }

        #resume-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: hsl(var(--foreground) / 0.9);
        }

        #resume-content p {
          margin: 0.75rem 0;
          line-height: 1.75;
        }

        #resume-content strong {
          font-weight: 600;
          color: hsl(var(--foreground));
        }

        #resume-content ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        #resume-content li {
          margin: 0.5rem 0;
          line-height: 1.75;
        }

        #resume-content a {
          color: hsl(var(--primary));
          text-decoration: none;
        }

        #resume-content a:hover {
          text-decoration: underline;
        }

        @media print {
          body {
            background: white;
          }
          #resume-content {
            font-size: 10pt;
          }
          #resume-content h1 {
            font-size: 18pt;
            margin-bottom: 0.25rem;
          }
          #resume-content h2 {
            font-size: 14pt;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
          }
          #resume-content h3 {
            font-size: 12pt;
            margin-top: 0.75rem;
            margin-bottom: 0.25rem;
          }
          #resume-content p {
            margin: 0.25rem 0;
          }
          #resume-content ul {
            margin: 0.25rem 0;
          }
        }
      `}</style>
    </div>
  );
}

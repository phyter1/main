"use client";

import { Download, FileText, FileType, Printer } from "lucide-react";
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

  const downloadDocx = async () => {
    // @ts-expect-error - html-docx-js types are incomplete
    const htmlDocx = (await import("html-docx-js/dist/html-docx")).default;
    const resumeElement = document.getElementById("resume-content");
    if (!resumeElement) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            h1 { font-size: 24pt; margin-bottom: 5pt; }
            h2 { font-size: 16pt; margin-top: 15pt; margin-bottom: 5pt; }
            h3 { font-size: 14pt; margin-top: 10pt; margin-bottom: 5pt; }
            p { margin: 5pt 0; }
            ul { margin: 5pt 0; padding-left: 20pt; }
          </style>
        </head>
        <body>
          ${resumeElement.innerHTML}
        </body>
      </html>
    `;

    const docx = htmlDocx.asBlob(html);
    const url = URL.createObjectURL(docx);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ryan_lowe_resume.docx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar - hide when printing */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
        <div className="container flex h-16 items-center justify-between">
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
              variant="outline"
              size="sm"
              onClick={downloadDocx}
              className="gap-2"
            >
              <FileType className="h-4 w-4" />
              DOCX
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
      <div className="container max-w-4xl py-8 print:py-0">
        <div
          id="resume-content"
          className="prose prose-neutral dark:prose-invert mx-auto max-w-none print:prose-print"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .prose {
            max-width: 100% !important;
            font-size: 10pt;
          }
          .prose h1 {
            font-size: 18pt;
            margin-bottom: 0.25rem;
          }
          .prose h2 {
            font-size: 14pt;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
          }
          .prose h3 {
            font-size: 12pt;
            margin-top: 0.75rem;
            margin-bottom: 0.25rem;
          }
          .prose p {
            margin: 0.25rem 0;
          }
          .prose ul {
            margin: 0.25rem 0;
          }
        }
      `}</style>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PromptDiffProps {
  original: string;
  proposed: string;
  originalTokenCount?: number;
  proposedTokenCount?: number;
}

type DiffType = "added" | "removed" | "modified" | "unchanged";

interface DiffLine {
  text: string;
  type: DiffType;
}

function computeDiff(
  original: string,
  proposed: string,
): {
  originalLines: DiffLine[];
  proposedLines: DiffLine[];
} {
  const originalLineArray = original ? original.split("\n") : [""];
  const proposedLineArray = proposed ? proposed.split("\n") : [""];

  // Simple LCS-based diff algorithm with modification detection
  const origLength = originalLineArray.length;
  const propLength = proposedLineArray.length;

  // Build LCS matrix
  const lcs: number[][] = Array(origLength + 1)
    .fill(0)
    .map(() => Array(propLength + 1).fill(0));

  for (let i = 1; i <= origLength; i++) {
    for (let j = 1; j <= propLength; j++) {
      if (originalLineArray[i - 1] === proposedLineArray[j - 1]) {
        lcs[i][j] = lcs[i - 1][j - 1] + 1;
      } else {
        lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff
  const originalLines: DiffLine[] = [];
  const proposedLines: DiffLine[] = [];

  let i = origLength;
  let j = propLength;

  const edits: Array<{
    type: "match" | "add" | "remove";
    i: number;
    j: number;
  }> = [];

  while (i > 0 || j > 0) {
    if (
      i > 0 &&
      j > 0 &&
      originalLineArray[i - 1] === proposedLineArray[j - 1]
    ) {
      edits.unshift({ type: "match", i: i - 1, j: j - 1 });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      edits.unshift({ type: "add", i: -1, j: j - 1 });
      j--;
    } else {
      edits.unshift({ type: "remove", i: i - 1, j: -1 });
      i--;
    }
  }

  // Convert edits to diff lines with modification detection
  let idx = 0;
  while (idx < edits.length) {
    const edit = edits[idx];

    if (edit.type === "match") {
      originalLines.push({
        text: originalLineArray[edit.i],
        type: "unchanged",
      });
      proposedLines.push({
        text: proposedLineArray[edit.j],
        type: "unchanged",
      });
      idx++;
    } else if (
      edit.type === "remove" &&
      idx + 1 < edits.length &&
      edits[idx + 1].type === "add"
    ) {
      // Remove followed by add -> modification
      originalLines.push({ text: originalLineArray[edit.i], type: "modified" });
      proposedLines.push({
        text: proposedLineArray[edits[idx + 1].j],
        type: "modified",
      });
      idx += 2; // Skip both remove and add
    } else if (edit.type === "remove") {
      // Pure removal
      originalLines.push({ text: originalLineArray[edit.i], type: "removed" });
      proposedLines.push({ text: "", type: "removed" });
      idx++;
    } else {
      // Pure addition
      originalLines.push({ text: "", type: "added" });
      proposedLines.push({ text: proposedLineArray[edit.j], type: "added" });
      idx++;
    }
  }

  return { originalLines, proposedLines };
}

function DiffLine({ text, type }: DiffLine) {
  const bgClass = cn({
    "bg-green-500/20": type === "added",
    "bg-red-500/20": type === "removed",
    "bg-yellow-500/20": type === "modified",
  });

  return (
    <div
      className={cn(
        "px-2 py-0.5 font-mono text-sm whitespace-pre-wrap",
        bgClass,
      )}
    >
      {text || "\u00A0"}
    </div>
  );
}

export function PromptDiff({
  original,
  proposed,
  originalTokenCount,
  proposedTokenCount,
}: PromptDiffProps) {
  const { originalLines, proposedLines } = computeDiff(original, proposed);

  const tokenDiff =
    originalTokenCount !== undefined && proposedTokenCount !== undefined
      ? proposedTokenCount - originalTokenCount
      : null;

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Original Prompt</CardTitle>
            {originalTokenCount !== undefined && (
              <CardDescription>{originalTokenCount} tokens</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {originalLines.map((line, index) => (
              <DiffLine key={`original-${index}-${line.type}`} {...line} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proposed Prompt</CardTitle>
            {proposedTokenCount !== undefined && (
              <CardDescription>{proposedTokenCount} tokens</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {proposedLines.map((line, index) => (
              <DiffLine key={`proposed-${index}-${line.type}`} {...line} />
            ))}
          </CardContent>
        </Card>
      </div>

      {tokenDiff !== null && (
        <div className="mt-4 text-center">
          <Badge variant={tokenDiff < 0 ? "secondary" : "default"}>
            {tokenDiff > 0 ? "+" : ""}
            {tokenDiff} tokens
          </Badge>
        </div>
      )}
    </div>
  );
}

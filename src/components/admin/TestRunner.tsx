/**
 * TestRunner Component
 * Interface for defining and running test cases against AI prompts
 * Used in admin workbench for prompt validation and refinement
 */

"use client";

import { useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AgentType, Criterion, TestCase } from "@/lib/test-runner";

/**
 * Props for TestRunner component
 */
interface TestRunnerProps {
  agentType: AgentType;
  promptText: string;
}

/**
 * Test result structure from API
 */
interface TestResult {
  testCaseId: string;
  passed: boolean;
  response: string;
  tokenCount: number;
  latencyMs: number;
  failedCriteria?: Array<{
    type: string;
    value: string | number;
    reason: string;
  }>;
}

/**
 * Test summary metrics from API
 */
interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  avgTokens: number;
  avgLatencyMs: number;
}

/**
 * TestRunner component for managing and executing test cases
 */
export default function TestRunner({ agentType, promptText }: TestRunnerProps) {
  const questionId = useId();
  const criterionTypeId = useId();
  const criterionValueId = useId();

  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<TestSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form state for adding/editing test cases
  const [formQuestion, setFormQuestion] = useState("");
  const [formCriteria, setFormCriteria] = useState<Criterion[]>([]);
  const [showCriterionForm, setShowCriterionForm] = useState(false);
  const [criterionType, setCriterionType] =
    useState<Criterion["type"]>("contains");
  const [criterionValue, setCriterionValue] = useState("");

  /**
   * Add a new criterion to the current test case form
   */
  const handleAddCriterion = () => {
    // Validate: first-person doesn't need a value, others do
    if (
      criterionType !== "first-person" &&
      (!criterionValue || !criterionValue.trim())
    ) {
      return;
    }

    const newCriterion: Criterion = {
      type: criterionType,
      value:
        criterionType === "first-person"
          ? ""
          : criterionType === "token-limit" || criterionType === "max-length"
            ? Number(criterionValue)
            : criterionValue,
    };

    setFormCriteria([...formCriteria, newCriterion]);
    setCriterionValue("");
    setShowCriterionForm(false);
  };

  /**
   * Save the current test case (add or edit)
   */
  const handleSaveTestCase = () => {
    setValidationError(null);

    if (!formQuestion.trim()) {
      setValidationError("Question is required");
      return;
    }

    const newTestCase: TestCase = {
      id: editingTestId || `test-${Date.now()}`,
      question: formQuestion,
      expectedCriteria: formCriteria,
    };

    if (editingTestId) {
      // Update existing test case
      setTestCases(
        testCases.map((tc) => (tc.id === editingTestId ? newTestCase : tc)),
      );
      setEditingTestId(null);
    } else {
      // Add new test case
      setTestCases([...testCases, newTestCase]);
    }

    // Reset form
    setFormQuestion("");
    setFormCriteria([]);
    setShowAddForm(false);
  };

  /**
   * Delete a test case
   */
  const handleDeleteTestCase = (id: string) => {
    setTestCases(testCases.filter((tc) => tc.id !== id));
    setTestResults(testResults.filter((tr) => tr.testCaseId !== id));
  };

  /**
   * Edit an existing test case
   */
  const handleEditTestCase = (testCase: TestCase) => {
    setEditingTestId(testCase.id);
    setFormQuestion(testCase.question);
    setFormCriteria(testCase.expectedCriteria);
    setShowAddForm(true);
  };

  /**
   * Run all test cases against the current prompt
   */
  const handleRunTests = async () => {
    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/test-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promptText,
          agentType,
          testCases,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to run tests");
      }

      const data = await response.json();
      setTestResults(data.results);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run tests");
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * Get the result for a specific test case
   */
  const getResultForTest = (testId: string): TestResult | undefined => {
    return testResults.find((r) => r.testCaseId === testId);
  };

  /**
   * Calculate pass rate percentage
   */
  const getPassRate = (): string => {
    if (!summary || summary.totalTests === 0) return "0%";
    return `${Math.round((summary.passed / summary.totalTests) * 100)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Test Runner</h2>
          <p className="text-muted-foreground text-sm">
            Agent Type: <span className="capitalize">{agentType}</span>
          </p>
        </div>
        <Button
          onClick={() => {
            setShowAddForm(true);
            setEditingTestId(null);
            setFormQuestion("");
            setFormCriteria([]);
            setValidationError(null);
          }}
        >
          Add Test Case
        </Button>
      </div>

      {/* Add/Edit Test Case Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingTestId ? "Edit Test Case" : "Add Test Case"}
            </CardTitle>
            <CardDescription>
              Define a question and expected criteria for testing the prompt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Question Input */}
            <div className="space-y-2">
              <Label htmlFor={questionId}>Question</Label>
              <Input
                id={questionId}
                value={formQuestion}
                onChange={(e) => setFormQuestion(e.target.value)}
                placeholder="What is your TypeScript experience?"
              />
            </div>

            {/* Criteria List */}
            <div className="space-y-2">
              <Label>Expected Criteria</Label>
              <div className="flex flex-wrap gap-2">
                {formCriteria.map((criterion, index) => (
                  <Badge
                    key={`${criterion.type}-${criterion.value}-${index}`}
                    variant="secondary"
                  >
                    {criterion.type}
                    {criterion.type === "contains" && `: ${criterion.value}`}
                    <button
                      type="button"
                      onClick={() =>
                        setFormCriteria(
                          formCriteria.filter((_, i) => i !== index),
                        )
                      }
                      className="ml-1 text-xs"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Add Criterion Button */}
              {!showCriterionForm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCriterionForm(true)}
                >
                  Add Criterion
                </Button>
              )}

              {/* Criterion Form */}
              {showCriterionForm && (
                <div className="space-y-2 rounded border p-3">
                  <div className="space-y-2">
                    <Label htmlFor={criterionTypeId}>Criterion Type</Label>
                    <select
                      id={criterionTypeId}
                      value={criterionType}
                      onChange={(e) =>
                        setCriterionType(e.target.value as Criterion["type"])
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="contains">Contains Text</option>
                      <option value="first-person">First Person</option>
                      <option value="token-limit">Token Limit</option>
                      <option value="max-length">Max Length</option>
                    </select>
                  </div>

                  {(criterionType === "contains" ||
                    criterionType === "token-limit" ||
                    criterionType === "max-length") && (
                    <div className="space-y-2">
                      <Label htmlFor={criterionValueId}>Criterion Value</Label>
                      <Input
                        id={criterionValueId}
                        type={
                          criterionType === "token-limit" ||
                          criterionType === "max-length"
                            ? "number"
                            : "text"
                        }
                        value={criterionValue}
                        onChange={(e) => setCriterionValue(e.target.value)}
                        placeholder={
                          criterionType === "contains"
                            ? "Text to search for"
                            : "Number value"
                        }
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddCriterion}>
                      Save Criterion
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowCriterionForm(false);
                        setCriterionValue("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Validation Error */}
            {validationError && (
              <p className="text-sm text-destructive">{validationError}</p>
            )}

            {/* Save/Cancel Buttons */}
            <div className="flex gap-2">
              <Button onClick={handleSaveTestCase}>Save Test Case</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingTestId(null);
                  setFormQuestion("");
                  setFormCriteria([]);
                  setValidationError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Cases List */}
      <Card>
        <CardHeader>
          <CardTitle>Test Cases</CardTitle>
          <CardDescription>
            {testCases.length === 0
              ? "No test cases defined yet"
              : `${testCases.length} test case${testCases.length === 1 ? "" : "s"} defined`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testCases.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No test cases. Click "Add Test Case" to create one.
            </p>
          ) : (
            <div className="space-y-2">
              {testCases.map((testCase) => {
                const result = getResultForTest(testCase.id);
                return (
                  <div
                    key={testCase.id}
                    className="rounded border p-3 flex items-start justify-between"
                  >
                    <div className="space-y-1 flex-1">
                      <p className="font-medium">{testCase.question}</p>
                      <div className="flex flex-wrap gap-1">
                        {testCase.expectedCriteria.map((criterion, index) => (
                          <Badge
                            key={`${testCase.id}-${criterion.type}-${criterion.value}-${index}`}
                            variant="outline"
                          >
                            {criterion.type}
                            {criterion.type === "contains" &&
                              `: ${criterion.value}`}
                          </Badge>
                        ))}
                      </div>
                      {result && (
                        <p
                          className={`text-sm ${result.passed ? "text-success" : "text-destructive"}`}
                        >
                          {result.passed ? "✅ Pass" : "❌ Fail"}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTestCase(testCase)}
                        aria-label="Edit test case"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTestCase(testCase.id)}
                        aria-label="Delete test case"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Run Tests Button */}
      <div>
        <Button
          onClick={handleRunTests}
          disabled={testCases.length === 0 || isRunning}
          size="lg"
        >
          {isRunning ? "Running Tests..." : "Run Tests"}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Results from the latest test run
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Criteria</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Response</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testResults.map((result) => {
                    const testCase = testCases.find(
                      (tc) => tc.id === result.testCaseId,
                    );
                    return (
                      <TableRow key={result.testCaseId}>
                        <TableCell>{testCase?.question || "Unknown"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {testCase?.expectedCriteria.map(
                              (criterion, index) => (
                                <Badge
                                  key={`result-${result.testCaseId}-${criterion.type}-${index}`}
                                  variant="secondary"
                                >
                                  {criterion.type}
                                </Badge>
                              ),
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              result.passed
                                ? "text-success font-medium"
                                : "text-destructive font-medium"
                            }
                          >
                            {result.passed ? "✅ Pass" : "❌ Fail"}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {result.response}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Metrics */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Pass Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{getPassRate()}</p>
                  <p className="text-muted-foreground text-sm">
                    {summary.passed} of {summary.totalTests} passed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Avg Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{summary.avgTokens}</p>
                  <p className="text-muted-foreground text-sm">
                    Average token usage per response
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Avg Latency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{summary.avgLatencyMs}ms</p>
                  <p className="text-muted-foreground text-sm">
                    Average response time
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

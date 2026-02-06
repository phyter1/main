/**
 * BlogPostEditor Component Tests
 *
 * Comprehensive test suite for the BlogPostEditor component covering:
 * - Component rendering with all required elements
 * - Title, excerpt, and content editing functionality
 * - Auto-save functionality (every 30 seconds)
 * - MDX live preview rendering
 * - Character and word count display
 * - Markdown toolbar interactions
 * - Tiptap editor integration
 */

import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { BlogPostEditor } from "./BlogPostEditor";
import type { BlogPost } from "@/types/blog";

describe("BlogPostEditor", () => {
	let user: ReturnType<typeof userEvent.setup>;

	beforeEach(() => {
		user = userEvent.setup();
		// Reset all timers before each test
		mock.restore();
		// Clean up DOM from previous tests
		cleanup();
	});

	afterEach(() => {
		// Clean up any pending timers and DOM
		mock.restore();
		cleanup();
	});

	describe("Component Rendering", () => {
		it("should render with empty form for new post", () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			expect(screen.getByLabelText("Title")).toBeDefined();
			expect(screen.getByLabelText("Excerpt")).toBeDefined();
			expect(screen.getByRole("textbox", { name: /content/i })).toBeDefined();
		});

		it("should render with existing post data", () => {
			const existingPost: Partial<BlogPost> = {
				title: "Existing Post Title",
				excerpt: "This is an existing excerpt",
				content: "# Existing Content\n\nThis is the existing content.",
			};

			render(<BlogPostEditor post={existingPost} onSave={mock(() => {})} />);

			const titleInput = screen.getByLabelText("Title") as HTMLInputElement;
			const excerptInput = screen.getByLabelText(
				"Excerpt",
			) as HTMLTextAreaElement;

			expect(titleInput.value).toBe("Existing Post Title");
			expect(excerptInput.value).toBe("This is an existing excerpt");
		});

		it("should render side-by-side editor and preview layout", () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			const editorPanel = screen.getByTestId("editor-panel");
			const previewPanel = screen.getByTestId("preview-panel");

			expect(editorPanel).toBeDefined();
			expect(previewPanel).toBeDefined();
		});

		it("should display markdown toolbar with common formatting buttons", () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			expect(screen.getByRole("button", { name: /bold/i })).toBeDefined();
			expect(screen.getByRole("button", { name: /italic/i })).toBeDefined();
			expect(screen.getByRole("button", { name: /heading/i })).toBeDefined();
			expect(screen.getByRole("button", { name: /link/i })).toBeDefined();
			expect(screen.getByRole("button", { name: /code/i })).toBeDefined();
		});

		it("should display character and word count", () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			expect(screen.getByText(/\d+ characters?/i)).toBeDefined();
			expect(screen.getByText(/\d+ words?/i)).toBeDefined();
		});
	});

	describe("Title Editing", () => {
		it("should update title when user types", async () => {
			const onSave = mock(() => {});
			render(<BlogPostEditor onSave={onSave} />);

			const titleInput = screen.getByLabelText("Title");
			await user.type(titleInput, "My New Blog Post");

			expect((titleInput as HTMLInputElement).value).toBe("My New Blog Post");
		});
	});

	describe("Excerpt Editing", () => {
		it("should update excerpt when user types", async () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			const excerptInput = screen.getByLabelText("Excerpt");
			await user.type(excerptInput, "This is a test excerpt");

			expect((excerptInput as HTMLTextAreaElement).value).toBe(
				"This is a test excerpt",
			);
		});

		it("should show warning when excerpt exceeds recommended length", async () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			const excerptInput = screen.getByLabelText("Excerpt");
			const longExcerpt = "a".repeat(201); // More than 200 characters
			await user.type(excerptInput, longExcerpt);

			expect(
				screen.getByText(/excerpt is longer than recommended/i),
			).toBeDefined();
		});
	});

	describe("Content Editing with Tiptap", () => {
		it("should initialize Tiptap editor", () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			const editor = screen.getByRole("textbox", { name: /content/i });
			expect(editor).toBeDefined();
			expect(editor.classList.contains("ProseMirror")).toBe(true);
		});

		it("should update content when user types in editor", async () => {
			const onSave = mock(() => {});
			render(<BlogPostEditor onSave={onSave} />);

			const editor = screen.getByRole("textbox", { name: /content/i });
			await user.click(editor);
			await user.type(editor, "Test content");

			expect(editor.textContent).toContain("Test content");
		});

		it("should update word count when content changes", async () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			const editor = screen.getByRole("textbox", { name: /content/i });
			await user.click(editor);
			await user.type(editor, "one two three four");

			expect(screen.getByText(/4 words/i)).toBeDefined();
		});

		it("should update character count when content changes", async () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			const editor = screen.getByRole("textbox", { name: /content/i });
			await user.click(editor);
			await user.type(editor, "hello");

			expect(screen.getByText(/5 characters/i)).toBeDefined();
		});
	});

	describe("Markdown Toolbar", () => {
		it("should apply bold formatting when bold button clicked", async () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			const editor = screen.getByRole("textbox", { name: /content/i });
			const boldButton = screen.getByRole("button", { name: /bold/i });

			await user.click(editor);
			await user.type(editor, "bold text");
			// Select all text
			await user.keyboard("{Control>}a{/Control}");
			await user.click(boldButton);

			// Tiptap wraps bold text with <strong> tags
			expect(editor.innerHTML).toContain("<strong>bold text</strong>");
		});

		it("should apply italic formatting when italic button clicked", async () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			const editor = screen.getByRole("textbox", { name: /content/i });
			const italicButton = screen.getByRole("button", { name: /italic/i });

			await user.click(editor);
			await user.type(editor, "italic text");
			await user.keyboard("{Control>}a{/Control}");
			await user.click(italicButton);

			expect(editor.innerHTML).toContain("<em>italic text</em>");
		});

		it("should apply heading formatting when heading button clicked", async () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			const editor = screen.getByRole("textbox", { name: /content/i });
			const headingButton = screen.getByRole("button", { name: /heading/i });

			await user.click(editor);
			await user.type(editor, "My Heading");
			await user.keyboard("{Control>}a{/Control}");
			await user.click(headingButton);

			expect(editor.innerHTML).toContain("<h2>My Heading</h2>");
		});

		it("should insert link when link button clicked", async () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			const editor = screen.getByRole("textbox", { name: /content/i });
			const linkButton = screen.getByRole("button", { name: /link/i });

			await user.click(editor);
			await user.type(editor, "link text");
			await user.keyboard("{Control>}a{/Control}");
			await user.click(linkButton);

			// Link dialog should appear
			const urlInput = screen.getByPlaceholderText(/enter url/i);
			expect(urlInput).toBeDefined();
		});

		it("should apply code formatting when code button clicked", async () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			const editor = screen.getByRole("textbox", { name: /content/i });
			const codeButton = screen.getByRole("button", { name: /code/i });

			await user.click(editor);
			await user.type(editor, "code");
			await user.keyboard("{Control>}a{/Control}");
			await user.click(codeButton);

			expect(editor.innerHTML).toContain("<code>code</code>");
		});
	});

	describe("MDX Live Preview", () => {
		it("should render preview panel with initial content", () => {
			const initialPost: Partial<BlogPost> = {
				title: "Preview Test",
				content: "# Heading\n\nThis is a paragraph.",
			};

			render(<BlogPostEditor post={initialPost} onSave={mock(() => {})} />);

			const previewPanel = screen.getByTestId("preview-panel");
			expect(previewPanel.innerHTML).toContain("<h1>Heading</h1>");
			expect(previewPanel.innerHTML).toContain("This is a paragraph");
		});

		it("should update preview when content changes", async () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			const editor = screen.getByRole("textbox", { name: /content/i });
			await user.click(editor);
			await user.type(editor, "# Dynamic Content");

			await waitFor(() => {
				const previewPanel = screen.getByTestId("preview-panel");
				expect(previewPanel.innerHTML).toContain("<h1>Dynamic Content</h1>");
			});
		});

		it("should render markdown syntax in preview", async () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			const editor = screen.getByRole("textbox", { name: /content/i });
			await user.click(editor);
			await user.type(editor, "**bold** and *italic*");

			await waitFor(() => {
				const previewPanel = screen.getByTestId("preview-panel");
				expect(previewPanel.innerHTML).toContain("<strong>bold</strong>");
				expect(previewPanel.innerHTML).toContain("<em>italic</em>");
			});
		});

		it("should render code blocks with syntax highlighting in preview", async () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			const editor = screen.getByRole("textbox", { name: /content/i });
			await user.click(editor);
			await user.type(
				editor,
				"```javascript\nconst x = 42;\nconsole.log(x);\n```",
			);

			await waitFor(() => {
				const previewPanel = screen.getByTestId("preview-panel");
				expect(previewPanel.innerHTML).toContain("<code");
				expect(previewPanel.innerHTML).toContain("const x = 42");
			});
		});

		it("should handle MDX components in preview", async () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			const editor = screen.getByRole("textbox", { name: /content/i });
			await user.click(editor);
			await user.type(editor, "<CustomComponent prop='value' />");

			await waitFor(() => {
				const previewPanel = screen.getByTestId("preview-panel");
				// MDX should process the component
				expect(previewPanel).toBeDefined();
			});
		});
	});

	describe("Auto-Save Functionality", () => {
		it("should trigger save after 30 seconds of inactivity", async () => {
			const onSave = mock(() => {});
			render(<BlogPostEditor onSave={onSave} />);

			const titleInput = screen.getByLabelText("Title");
			await user.type(titleInput, "Auto-save test");

			// Fast-forward time by 30 seconds
			await waitFor(
				() => {
					expect(onSave).toHaveBeenCalled();
				},
				{ timeout: 31000 },
			);
		});

		it("should reset auto-save timer when user types", async () => {
			const onSave = mock(() => {});
			render(<BlogPostEditor onSave={onSave} />);

			const titleInput = screen.getByLabelText("Title");

			// Type something
			await user.type(titleInput, "First");

			// Wait 15 seconds
			await new Promise((resolve) => setTimeout(resolve, 15000));

			// Type again (should reset timer)
			await user.type(titleInput, " Second");

			// Wait 15 more seconds (total 30, but timer was reset)
			await new Promise((resolve) => setTimeout(resolve, 15000));

			// Should not have saved yet
			expect(onSave).not.toHaveBeenCalled();

			// Wait final 15 seconds (30 since last input)
			await waitFor(
				() => {
					expect(onSave).toHaveBeenCalled();
				},
				{ timeout: 16000 },
			);
		});

		it("should display auto-save indicator when saving", async () => {
			const onSave = mock(() => new Promise((resolve) => setTimeout(resolve, 100)));
			render(<BlogPostEditor onSave={onSave} />);

			const titleInput = screen.getByLabelText("Title");
			await user.type(titleInput, "Test");

			// Trigger auto-save
			await waitFor(
				() => {
					expect(screen.getByText(/saving/i)).toBeDefined();
				},
				{ timeout: 31000 },
			);
		});

		it("should display saved indicator after successful save", async () => {
			const onSave = mock(() => Promise.resolve());
			render(<BlogPostEditor onSave={onSave} />);

			const titleInput = screen.getByLabelText("Title");
			await user.type(titleInput, "Test");

			// Wait for auto-save to complete
			await waitFor(
				() => {
					expect(screen.getByText(/saved/i)).toBeDefined();
				},
				{ timeout: 32000 },
			);
		});

		it("should pass current post data to onSave callback", async () => {
			const onSave = mock(() => Promise.resolve());
			render(<BlogPostEditor onSave={onSave} />);

			const titleInput = screen.getByLabelText("Title");
			const excerptInput = screen.getByLabelText("Excerpt");
			const editor = screen.getByRole("textbox", { name: /content/i });

			await user.type(titleInput, "Test Title");
			await user.type(excerptInput, "Test Excerpt");
			await user.click(editor);
			await user.type(editor, "Test Content");

			// Wait for auto-save
			await waitFor(
				() => {
					expect(onSave).toHaveBeenCalled();
				},
				{ timeout: 31000 },
			);

			const savedData = onSave.mock.calls[0][0];
			expect(savedData.title).toBe("Test Title");
			expect(savedData.excerpt).toBe("Test Excerpt");
			expect(savedData.content).toContain("Test Content");
		});
	});

	describe("Character and Word Count", () => {
		it("should count words correctly", async () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			const editor = screen.getByRole("textbox", { name: /content/i });
			await user.click(editor);
			await user.type(editor, "one two three four five");

			expect(screen.getByText(/5 words/i)).toBeDefined();
		});

		it("should count characters correctly", async () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			const editor = screen.getByRole("textbox", { name: /content/i });
			await user.click(editor);
			await user.type(editor, "hello world");

			expect(screen.getByText(/11 characters/i)).toBeDefined();
		});

		it("should not count whitespace-only as words", async () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			const editor = screen.getByRole("textbox", { name: /content/i });
			await user.click(editor);
			await user.type(editor, "   ");

			expect(screen.getByText(/0 words/i)).toBeDefined();
		});

		it("should update counts in real-time as user types", async () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			const editor = screen.getByRole("textbox", { name: /content/i });
			await user.click(editor);

			await user.type(editor, "word");
			expect(screen.getByText(/1 word/i)).toBeDefined();

			await user.type(editor, " count");
			expect(screen.getByText(/2 words/i)).toBeDefined();
		});
	});

	describe("Client Component Directive", () => {
		it("should have 'use client' directive in component file", async () => {
			// Read the component file to verify directive
			const componentFilePath =
				"/Users/ryanlowe/code/code-ripper/workspace/workspace/phyter1-main/src/components/admin/blog/BlogPostEditor.tsx";
			const componentFile = await Bun.file(componentFilePath).text();

			expect(componentFile.trim().startsWith('"use client"')).toBe(true);
		});
	});

	describe("Accessibility", () => {
		it("should have proper labels for all form inputs", () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			expect(screen.getByLabelText("Title")).toBeDefined();
			expect(screen.getByLabelText("Excerpt")).toBeDefined();
			expect(screen.getByRole("textbox", { name: /content/i })).toBeDefined();
		});

		it("should have proper button labels for toolbar", () => {
			render(<BlogPostEditor onSave={mock(() => {})} />);

			expect(screen.getByRole("button", { name: /bold/i })).toBeDefined();
			expect(screen.getByRole("button", { name: /italic/i })).toBeDefined();
		});
	});
});

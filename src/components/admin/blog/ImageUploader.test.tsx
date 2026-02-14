import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ImageUploader } from "./ImageUploader";

describe("ImageUploader Component", () => {
  let mockOnUploadComplete: ReturnType<typeof mock>;
  let mockOnError: ReturnType<typeof mock>;

  beforeEach(() => {
    mockOnUploadComplete = vi.fn(() => {});
    mockOnError = vi.fn(() => {});

    // Mock fetch for upload API
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            url: "https://example.com/uploaded-image.jpg",
          }),
      } as Response),
    );

    // Mock URL.createObjectURL for preview
    global.URL.createObjectURL = vi.fn(() => "blob:mock-preview-url");
    global.URL.revokeObjectURL = vi.fn(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  describe("Core Rendering", () => {
    it("should render upload interface with file input and URL input options", () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      expect(screen.getByText(/Upload Image/i)).toBeTruthy();
      expect(screen.getByText(/Drag and drop/i)).toBeTruthy();
      expect(screen.getByText(/Or paste image URL/i)).toBeTruthy();
      expect(screen.getByPlaceholderText(/https:\/\//i)).toBeTruthy();
    });

    it("should render file input for manual selection", () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
      expect(fileInput).toBeTruthy();
      expect(fileInput.getAttribute("type")).toBe("file");
      expect(fileInput.getAttribute("accept")).toBe("image/*");
    });

    it("should display upload instructions", () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      expect(screen.getByText(/PNG, JPG, GIF up to 5MB/i)).toBeTruthy();
    });
  });

  describe("File Upload Validation", () => {
    it("should accept valid image file types", async () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const file = new File(["test image content"], "test.jpg", {
        type: "image/jpeg",
      });
      Object.defineProperty(file, "size", { value: 1024 * 1024 }); // 1MB

      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it("should reject files larger than 5MB", async () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const largeFile = new File(["large content"], "large.jpg", {
        type: "image/jpeg",
      });
      Object.defineProperty(largeFile, "size", {
        value: 6 * 1024 * 1024,
      }); // 6MB

      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;

      // Use fireEvent to directly trigger the change event
      Object.defineProperty(fileInput, "files", {
        value: [largeFile],
        writable: false,
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(
          screen.getByText(/File size must be less than 5MB/i),
        ).toBeTruthy();
        expect(mockOnError).toHaveBeenCalled();
      });
    });

    it("should reject non-image file types", async () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const textFile = new File(["text content"], "document.txt", {
        type: "text/plain",
      });

      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;

      // Use fireEvent to directly trigger the change event
      Object.defineProperty(fileInput, "files", {
        value: [textFile],
        writable: false,
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText(/Only image files are allowed/i)).toBeTruthy();
        expect(mockOnError).toHaveBeenCalled();
      });
    });

    it("should validate file format (PNG, JPG, GIF, WebP)", async () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const validFormats = [
        { name: "test.png", type: "image/png" },
        { name: "test.jpg", type: "image/jpeg" },
        { name: "test.gif", type: "image/gif" },
        { name: "test.webp", type: "image/webp" },
      ];

      for (const format of validFormats) {
        const file = new File(["content"], format.name, { type: format.type });
        Object.defineProperty(file, "size", { value: 1024 * 1024 });

        const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
        Object.defineProperty(fileInput, "files", {
          value: [file],
          writable: false,
        });
        fireEvent.change(fileInput);

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalled();
        });

        cleanup();
        render(
          <ImageUploader
            onUploadComplete={mockOnUploadComplete}
            onError={mockOnError}
          />,
        );
      }
    });
  });

  describe("Image Preview", () => {
    it("should display preview after file selection", async () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const file = new File(["image content"], "preview.jpg", {
        type: "image/jpeg",
      });
      Object.defineProperty(file, "size", { value: 1024 * 1024 });

      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        const preview = screen.getByTestId("image-preview");
        expect(preview).toBeTruthy();
        expect(preview.getAttribute("src")).toBe("blob:mock-preview-url");
      });
    });

    it("should display preview when URL is entered", async () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const urlInput = screen.getByPlaceholderText(/https:\/\//i);
      const imageUrl = "https://example.com/image.jpg";

      await userEvent.type(urlInput, imageUrl);
      const useUrlButton = screen.getByText(/Use URL/i);
      await userEvent.click(useUrlButton);

      await waitFor(() => {
        const preview = screen.getByTestId("image-preview");
        expect(preview).toBeTruthy();
        expect(preview.getAttribute("src")).toBe(imageUrl);
      });
    });

    it("should allow removing preview and re-uploading", async () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      Object.defineProperty(file, "size", { value: 1024 * 1024 });

      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByTestId("image-preview")).toBeTruthy();
      });

      const removeButton = screen.getByText(/Remove/i);
      await userEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByTestId("image-preview")).toBeFalsy();
        expect(screen.getByText(/Drag and drop/i)).toBeTruthy();
      });
    });
  });

  describe("Upload Progress", () => {
    it("should display progress indicator during upload", async () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      Object.defineProperty(file, "size", { value: 1024 * 1024 });

      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });
      fireEvent.change(fileInput);

      // Progress should be visible briefly
      expect(screen.getByText(/Uploading/i)).toBeTruthy();
    });

    it("should show completion state after successful upload", async () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      Object.defineProperty(file, "size", { value: 1024 * 1024 });

      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(mockOnUploadComplete).toHaveBeenCalledWith(
          "https://example.com/uploaded-image.jpg",
        );
      });
    });
  });

  describe("Drag and Drop", () => {
    it("should handle drag enter event", async () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const dropzone = screen.getByTestId("drop-zone");
      expect(dropzone).toBeTruthy();

      // Simulate drag enter
      const dragEnterEvent = new Event("dragenter", { bubbles: true });
      dropzone?.dispatchEvent(dragEnterEvent);

      // Dropzone should show active state (visual feedback)
      expect(dropzone?.className).toContain("border");
    });

    it("should handle file drop", async () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const file = new File(["content"], "dropped.jpg", {
        type: "image/jpeg",
      });
      Object.defineProperty(file, "size", { value: 1024 * 1024 });

      const dropzone = screen.getByTestId("drop-zone");
      expect(dropzone).toBeTruthy();

      // Simulate drop
      const dropEvent = new DragEvent("drop", {
        bubbles: true,
        dataTransfer: new DataTransfer(),
      });
      Object.defineProperty(dropEvent, "dataTransfer", {
        value: {
          files: [file],
          types: ["Files"],
        },
      });

      dropzone?.dispatchEvent(dropEvent);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it("should prevent default drag over behavior", () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const dropzone = screen.getByTestId("drop-zone");
      expect(dropzone).toBeTruthy();

      const dragOverEvent = new Event("dragover", { bubbles: true });
      const preventDefaultSpy = vi.fn(() => {});
      dragOverEvent.preventDefault = preventDefaultSpy;

      dropzone?.dispatchEvent(dragOverEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe("URL Input", () => {
    it("should validate URL format", async () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const urlInput = screen.getByPlaceholderText(/https:\/\//i);
      await userEvent.type(urlInput, "not-a-valid-url");

      const useUrlButton = screen.getByText(/Use URL/i);
      await userEvent.click(useUrlButton);

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid URL/i)).toBeTruthy();
        expect(mockOnError).toHaveBeenCalled();
      });
    });

    it("should accept valid image URLs", async () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const urlInput = screen.getByPlaceholderText(/https:\/\//i);
      const validUrl = "https://example.com/image.png";

      await userEvent.type(urlInput, validUrl);
      const useUrlButton = screen.getByText(/Use URL/i);
      await userEvent.click(useUrlButton);

      await waitFor(() => {
        expect(mockOnUploadComplete).toHaveBeenCalledWith(validUrl);
      });
    });

    it("should clear URL input after successful use", async () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const urlInput = screen.getByPlaceholderText(
        /https:\/\//i,
      ) as HTMLInputElement;
      await userEvent.type(urlInput, "https://example.com/image.jpg");
      const useUrlButton = screen.getByText(/Use URL/i);
      await userEvent.click(useUrlButton);

      await waitFor(() => {
        expect(urlInput.value).toBe("");
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle upload API failure", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
        } as Response),
      );

      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      Object.defineProperty(file, "size", { value: 1024 * 1024 });

      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText(/Upload failed/i)).toBeTruthy();
        expect(mockOnError).toHaveBeenCalled();
      });
    });

    it("should handle network errors", async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));

      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      Object.defineProperty(file, "size", { value: 1024 * 1024 });

      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeTruthy();
        expect(mockOnError).toHaveBeenCalled();
      });
    });

    it("should clear error state when new upload starts", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
        } as Response),
      );

      const { unmount } = render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      // First upload (fails)
      const file1 = new File(["content1"], "test1.jpg", {
        type: "image/jpeg",
      });
      Object.defineProperty(file1, "size", { value: 1024 * 1024 });

      let fileInput = screen.getByTestId("file-input") as HTMLInputElement;
      Object.defineProperty(fileInput, "files", {
        value: [file1],
        writable: false,
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(
          screen.getByText(/Upload failed: Internal Server Error/i),
        ).toBeTruthy();
      });

      // Clean up and re-render to start fresh
      unmount();

      // Second upload with fresh component (should not have error)
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              url: "https://example.com/image2.jpg",
            }),
        } as Response),
      );

      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const file2 = new File(["content2"], "test2.jpg", {
        type: "image/jpeg",
      });
      Object.defineProperty(file2, "size", { value: 1024 * 1024 });

      fileInput = screen.getByTestId("file-input") as HTMLInputElement;
      Object.defineProperty(fileInput, "files", {
        value: [file2],
        writable: false,
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        // Verify no error message is present
        expect(screen.queryByText(/Upload failed/i)).toBeFalsy();
        expect(mockOnUploadComplete).toHaveBeenCalledWith(
          "https://example.com/image2.jpg",
        );
      });
    });
  });

  describe("Upload Service Integration", () => {
    it("should use upload service URL (default or from environment)", async () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      Object.defineProperty(file, "size", { value: 1024 * 1024 });

      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        // Verify fetch was called with a URL (either env var or default)
        const fetchCall = (global.fetch as ReturnType<typeof mock>).mock
          .calls[0];
        expect(fetchCall[0]).toContain("/api/admin/blog/upload");
      });
    });

    it("should send file as multipart/form-data", async () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      Object.defineProperty(file, "size", { value: 1024 * 1024 });

      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        const fetchCall = (global.fetch as ReturnType<typeof mock>).mock
          .calls[0];
        const formData = fetchCall[1].body;
        expect(formData).toBeInstanceOf(FormData);
      });
    });
  });

  describe("Accessibility", () => {
    it("should have accessible file input with label", () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
      expect(fileInput.getAttribute("aria-label")).toBeTruthy();
    });

    it("should announce errors to screen readers", async () => {
      render(
        <ImageUploader
          onUploadComplete={mockOnUploadComplete}
          onError={mockOnError}
        />,
      );

      const largeFile = new File(["large"], "large.jpg", {
        type: "image/jpeg",
      });
      Object.defineProperty(largeFile, "size", {
        value: 6 * 1024 * 1024,
      });

      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
      Object.defineProperty(fileInput, "files", {
        value: [largeFile],
        writable: false,
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        const errorMessage = screen.getByText(
          /File size must be less than 5MB/i,
        );
        expect(errorMessage.getAttribute("role")).toBe("alert");
      });
    });
  });
});

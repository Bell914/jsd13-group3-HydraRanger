import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, afterEach } from "vitest";
import ImageDropzone from "./ImageDropzone.jsx";
import { uploadImage } from "../services/uploadService.js";

vi.mock("../services/uploadService.js", () => ({
  uploadImage: vi.fn(),
}));

const pngFile = new File(["mock-content"], "shirt.png", { type: "image/png" });
const txtFile = new File(["mock-content"], "notes.txt", { type: "text/plain" });

function selectFile(input, file) {
  fireEvent.change(input, { target: { files: [file] } });
}

describe("ImageDropzone", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dropzone label and a file input", () => {
    const { container } = render(<ImageDropzone label="อัปโหลดเสื้อ / ท่อนบน" />);

    expect(
      screen.getByRole("button", { name: "อัปโหลดเสื้อ / ท่อนบน" }),
    ).toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
  });

  it("uploads a selected image and notifies the parent with its URL", async () => {
    const onChange = vi.fn();
    uploadImage.mockResolvedValue("/collection-2026/mixandmatch/mixmatch-1.png");

    const { container } = render(
      <ImageDropzone label="shirt" onChange={onChange} />,
    );
    selectFile(container.querySelector('input[type="file"]'), pngFile);

    expect(uploadImage).toHaveBeenCalledWith(pngFile);
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(
        "/collection-2026/mixandmatch/mixmatch-1.png",
      ),
    );

    const preview = screen.getByRole("button", { name: "shirt" });
    expect(within(preview).getByAltText("shirt").getAttribute("src")).toMatch(
      /^blob:/,
    );
    expect(screen.getByRole("button", { name: "ลบรูป" })).toBeInTheDocument();
  });

  it("rejects files that are not images", async () => {
    const onChange = vi.fn();

    const { container } = render(<ImageDropzone onChange={onChange} />);
    selectFile(container.querySelector('input[type="file"]'), txtFile);

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WebP, GIF)");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("reports an upload failure without notifying the parent", async () => {
    const onChange = vi.fn();
    uploadImage.mockRejectedValue(new Error("upload failed"));

    const { container } = render(<ImageDropzone onChange={onChange} />);
    selectFile(container.querySelector('input[type="file"]'), pngFile);

    expect(await screen.findByRole("alert")).toHaveTextContent("upload failed");
    expect(onChange).not.toHaveBeenCalledWith(expect.any(String));
  });

  it("removing the image clears the preview and notifies null", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    uploadImage.mockResolvedValue("/collection-2026/mixandmatch/mixmatch-1.png");

    const { container } = render(
      <ImageDropzone label="shirt" onChange={onChange} />,
    );
    selectFile(container.querySelector('input[type="file"]'), pngFile);
    await waitFor(() => expect(onChange).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: "ลบรูป" }));

    expect(screen.queryByAltText("shirt")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "shirt" }),
    ).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});
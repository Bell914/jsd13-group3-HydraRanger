import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { uploadImage } from "../services/uploadService.js";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCEPT_STRING = ".jpg,.jpeg,.png,.webp,.gif";
const MAX_SIZE_MB = 5;

const ImageDropzone = ({
  assets,
  label = "ลากรูปมาที่นี่",
  onChange,
  onFileChange,
  persistUpload = true,
  className = "",
}) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const notify = useCallback((url) => onChange?.(url), [onChange]);
  const notifyFile = useCallback(
    (file) => onFileChange?.(file || null),
    [onFileChange],
  );

  const handleFiles = useCallback(
    async (files) => {
      const file = files?.[0];
      if (!file) return;

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WebP, GIF)");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`ไฟล์มีขนาดใหญ่เกินไป (สูงสุด ${MAX_SIZE_MB}MB)`);
        return;
      }

      setError("");
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      const previewUrl = URL.createObjectURL(file);
      setFileUrl(previewUrl);
      notify(persistUpload ? null : previewUrl);
      notifyFile(file);

      // Recommendation images go directly to /recommend. They do not need to
      // be stored in the public product-image folder first.
      if (!persistUpload) return;

      setUploading(true);

      try {
        const url = await uploadImage(file);
        notify(url);
      } catch (err) {
        setError(err?.message || "อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        notify(null);
        notifyFile(null);
      } finally {
        setUploading(false);
      }
    },
    [fileUrl, notify, notifyFile, persistUpload],
  );

  const clearImage = useCallback(() => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl("");
    setError("");
    setDragOver(false);
    notify(null);
    notifyFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [fileUrl, notify, notifyFile]);

  const openPicker = () => inputRef.current?.click();

  const onDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setDragOver(false);
    }
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    handleFiles(event.dataTransfer.files);
  };

  const borderClass = fileUrl
    ? "border-white/10"
    : dragOver
      ? "border-solid border-primary bg-primary/20"
      : "border-dashed border-white/40";

  return (
    <div className={className}>
      <button
        type="button"
        onClick={openPicker}
        disabled={uploading}
        aria-busy={uploading}
        aria-label={label}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative flex h-56 w-full items-center justify-center overflow-hidden rounded-xl border-2 bg-secondary/80 text-white transition hover:bg-secondary lg:bg-gray-600 ${borderClass}`}
      >
        {fileUrl ? (
          <>
            <img
              src={fileUrl}
              alt={label}
              className="h-full w-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>กำลังอัปโหลด...</span>
              </div>
            )}
          </>
        ) : (
          <span className="flex flex-col items-center gap-2">
            <span className="flex items-center gap-3">
              <img
                src={assets?.camera}
                alt=""
                className="h-6 w-6 object-contain"
              />
              <span className="font-medium">{label}</span>
            </span>
            <span className="text-xs opacity-70">
              หรือคลิกเพื่อเลือกไฟล์ (สูงสุด {MAX_SIZE_MB}MB)
            </span>
          </span>
        )}
      </button>

      {fileUrl && (
        <div className="mt-2 flex items-center justify-center gap-3 text-white">
          <button
            type="button"
            onClick={openPicker}
            disabled={uploading}
            className="btn btn-ghost btn-xs text-white"
          >
            เปลี่ยนรูป
          </button>
          <button
            type="button"
            onClick={clearImage}
            disabled={uploading}
            className="btn btn-ghost btn-xs text-white"
          >
            ลบรูป
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-center text-xs text-red-300">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_STRING}
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
};

export default ImageDropzone;

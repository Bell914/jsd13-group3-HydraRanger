import { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";
const IMAGE_SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, "");
export const GetFullImage = () => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${IMAGE_SERVER_URL}${imageUrl}`;
};

export function ImagePreview({ imageUrl, label }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  if (!imageUrl) {
    return (
      <p className="text-sm text-gray-400 italic">
        กรอก URL แล้วรูปจะแสดงตรงนี้
      </p>
    );
  }

  if (imageFailed) {
    return (
      <p className="text-sm text-red-500">
        ไม่สามารถแสดงรูปนี้ได้ กรุณาตรวจสอบ URL
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-2">
      <img
        src={getFullImageUrl(imageUrl)}
        alt={label}
        onError={() => setImageFailed(true)}
        className="max-h-48 w-full object-contain"
      />
    </div>
  );
}

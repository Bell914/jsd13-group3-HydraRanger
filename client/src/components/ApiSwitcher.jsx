import { useState } from "react";
import {
  LOCAL_API_URL,
  REMOTE_API_URL,
  getApiBaseUrl,
  resetApiBaseUrl,
  setApiBaseUrl,
} from "../services/api.js";

const isLocalTarget = (url) =>
  String(url || "").includes("localhost") || String(url || "").includes("127.0.0.1");

const isLocalHost = () =>
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const TargetButton = ({ active, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={
      active
        ? "rounded bg-accent px-2 py-1 text-xs font-bold text-white"
        : "rounded px-2 py-1 text-xs text-occasion-text/80 hover:bg-accent/10"
    }
  >
    {label}
  </button>
);

function ApiSwitcher() {
  const [current] = useState(() => getApiBaseUrl());
  const host = current.replace(/^https?:\/\//, "").split("/")[0];
  const localTarget = isLocalTarget(current);

  if (!isLocalHost()) return null;

  return (
    <div className="fixed bottom-2 right-2 z-[100] flex flex-col items-end gap-1">
      <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-background/95 px-2 py-1 shadow-md backdrop-blur">
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-occasion-text/60">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              localTarget ? "bg-green-500" : "bg-accent"
            }`}
          />
          API {host}
        </span>
        <TargetButton
          active={localTarget}
          label="Local"
          onClick={() => setApiBaseUrl(LOCAL_API_URL) || window.location.reload()}
        />
        <TargetButton
          active={!localTarget}
          label="Render"
          onClick={() => setApiBaseUrl(REMOTE_API_URL) || window.location.reload()}
        />
        {!localTarget && (
          <button
            type="button"
            title="กลับไปใช้ค่าเริ่มต้นจาก .env"
            onClick={() => resetApiBaseUrl() || window.location.reload()}
            className="px-2 py-1 text-xs font-bold text-accent hover:underline"
          >
            Auto
          </button>
        )}
      </div>
      {!localTarget && (
        <p className="max-w-[240px] rounded bg-accent/10 px-2 py-1 text-[10px] leading-tight text-occasion-text/70">
          ถ้าต้องการเรียก Render backend จากหน้าเว็บที่เปิดใน localhost ต้องเพิ่ม origin
          http://localhost:5173 ใน env CLIENT_URL {`(`}หรือ ADMIN_CLIENT_URL{`)`}
          ของ Render ด้วย ไม่งั้น browser จะ block ด้วย CORS
        </p>
      )}
    </div>
  );
}

export default ApiSwitcher;
const OVERRIDE_KEY = "occasion_api_url";
const REMOTE_API_URL = "https://jsd13-group3-hydraranger.onrender.com/api";

const ENV_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "";

const normalizeApiUrl = (raw) => {
  if (!raw) return "";
  const clean = String(raw).replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
};

// If the frontend itself is served from the Render backend host,
// derive the API URL from the current origin automatically.
const detectSameOriginApi = () => {
  if (typeof window === "undefined") return "";
  const { hostname, origin } = window.location;
  if (!hostname) return "";
  if (hostname.endsWith(".onrender.com")) {
    return `${origin}/api`;
  }
  return "";
};

export const resolveApiUrl = () => {
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  // 1. Runtime override (switchable without rebuilding)
  if (typeof window !== "undefined") {
    try {
      const override = localStorage.getItem(OVERRIDE_KEY);
      if (override) {
        const normalized = normalizeApiUrl(override);
        // Only accept localhost override if actually on localhost
        if (isLocalhost || (!normalized.includes("localhost") && !normalized.includes("127.0.0.1"))) {
          return normalized;
        }
      }
    } catch {
      /* ignore storage access errors */
    }
  }

  // 2. Build-time env: VITE_API_BASE_URL / VITE_API_URL
  const envUrl = normalizeApiUrl(ENV_BASE_URL);
  if (envUrl) {
    // If running in production (Vercel/Render), never use localhost
    if (isLocalhost || (!envUrl.includes("localhost") && !envUrl.includes("127.0.0.1"))) {
      return envUrl;
    }
  }

  // 3. Same-origin detection when deployed on the Render backend host
  const sameOrigin = detectSameOriginApi();
  if (sameOrigin) return sameOrigin;

  // 4. If on localhost and no envUrl specified, use local server
  if (isLocalhost) {
    return "http://localhost:5001/api";
  }

  // 5. Fallback: the deployed (real) backend on Render
  return REMOTE_API_URL;
};


export const API_URL = resolveApiUrl();

export const getApiBaseUrl = () => resolveApiUrl();

export const setApiBaseUrl = (url) => {
  try {
    if (url) {
      localStorage.setItem(OVERRIDE_KEY, url);
    } else {
      localStorage.removeItem(OVERRIDE_KEY);
    }
  } catch {
    /* ignore storage access errors */
  }
};

export const resetApiBaseUrl = () => {
  try {
    localStorage.removeItem(OVERRIDE_KEY);
  } catch {
    /* ignore storage access errors */
  }
};

class ApiClient {
  getHeaders(customHeaders = {}) {
    return {
      "Content-Type": "application/json",
      ...customHeaders,
    };
  }

  async request(endpoint, options = {}, _retried = false) {
    const url = `${resolveApiUrl()}${endpoint}`;
    const headers = this.getHeaders(options.headers);

    const config = {
      ...options,
      headers,
      credentials: "include",
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      // Expired token → try to refresh once, then retry the original request
      if (
        response.status === 401 &&
        !_retried &&
        endpoint !== "/auth/refresh" &&
        endpoint !== "/auth/login" &&
        endpoint !== "/auth/register"
      ) {
        const refreshed = await this.tryRefresh();
        if (refreshed) {
          return this.request(endpoint, options, true);
        }
      }

      if (!response.ok) {
        const error = new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error(
        `API Error on [${options.method || "GET"} ${endpoint}]:`,
        error,
      );
      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        const netError = new Error(
          "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (เซิร์ฟเวอร์อาจกำลังเริ่มต้นทำงานบน Render กรุณารอประมาณ 30-60 วินาทีแล้วลองใหม่อีกครั้ง)",
        );
        netError.originalError = error;
        throw netError;
      }
      throw error;
    }
  }

  async tryRefresh() {
    try {
      const response = await fetch(`${resolveApiUrl()}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        localStorage.removeItem("occasion_user");
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

export const api = new ApiClient();
export default api;

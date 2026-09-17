const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://jsd13-group3-hydraranger.onrender.com/api";

const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, "");
const BASE_URL = cleanBaseUrl.endsWith("/api")
  ? cleanBaseUrl
  : `${cleanBaseUrl}/api`;

export const API_URL = BASE_URL;

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  getToken() {
    return localStorage.getItem("occasion_token");
  }

  setToken(token) {
    if (token) {
      localStorage.setItem("occasion_token", token);
    } else {
      localStorage.removeItem("occasion_token");
    }
  }

  getHeaders(customHeaders = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}, _retried = false) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(options.headers);

    const config = {
      ...options,
      headers,
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
      throw error;
    }
  }

  async tryRefresh() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        this.setToken(null);
        localStorage.removeItem("occasion_user");
        return false;
      }

      const data = await response.json().catch(() => ({}));
      if (data?.data?.token) {
        this.setToken(data.data.token);
        return true;
      }
      return false;
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

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

export const api = new ApiClient(BASE_URL);

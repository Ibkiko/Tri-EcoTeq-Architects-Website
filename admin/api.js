(() => {
  if (!window.ADMIN_CONFIG) {
    console.error("ADMIN_CONFIG is missing. Create admin/config.js from config.example.js.");
    return;
  }

  const { apiBaseUrl, authToken } = window.ADMIN_CONFIG;

  const baseHeaders = {
    "Content-Type": "application/json"
  };

  if (authToken) {
    baseHeaders.Authorization = authToken;
  }

  async function apiRequest(path, options = {}) {
    const url = `${apiBaseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: { ...baseHeaders, ...(options.headers || {}) }
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const body = isJson ? await response.json().catch(() => null) : await response.text();

    if (!response.ok) {
      const message = isJson && body && body.message ? body.message : response.statusText;
      throw new Error(message || `Request failed (${response.status})`);
    }

    return body;
  }

  window.AdminApi = {
    fetchProjects: () => apiRequest("/projects"),
    createProject: (data) =>
      apiRequest("/projects", { method: "POST", body: JSON.stringify(data) }),
    updateProject: (id, data) =>
      apiRequest(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteProject: (id) => apiRequest(`/projects/${id}`, { method: "DELETE" })
  };
})();

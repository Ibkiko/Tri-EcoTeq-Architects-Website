(() => {
  const statusEl = document.querySelector("[data-status]");
  const listEl = document.querySelector("[data-project-list]");
  const formEl = document.querySelector("#project-form");
  const submitBtn = formEl.querySelector("[data-submit]");
  const resetBtn = formEl.querySelector("[data-reset]");

  let editId = null;

  function disableForm() {
    formEl.querySelectorAll("input, textarea, select, button").forEach((el) => {
      el.disabled = true;
    });
  }

  function setStatus(message, tone = "info") {
    statusEl.textContent = message;
    statusEl.dataset.tone = tone;
  }

  function clearForm() {
    formEl.reset();
    editId = null;
    submitBtn.textContent = "Create Project";
    resetBtn.style.display = "none";
  }

  function projectRow(project) {
    const li = document.createElement("li");
    li.className = "project-row";
    li.dataset.id = project.id;
    li.innerHTML = `
      <div class="project-main">
        <strong>${project.name || "Untitled"}</strong>
        <span>${project.description || ""}</span>
        <small>ID: ${project.id}</small>
      </div>
      <div class="project-actions">
        <button type="button" class="ghost" data-edit>Edit</button>
        <button type="button" class="danger" data-delete>Delete</button>
      </div>
    `;
    return li;
  }

  async function loadProjects() {
    try {
      setStatus("Loading projects...");
      const data = await window.AdminApi.fetchProjects();
      const projects = Array.isArray(data) ? data : [];
      listEl.innerHTML = "";
      projects.forEach((project) => listEl.appendChild(projectRow(project)));
      setStatus(`Loaded ${projects.length} projects.`);
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Failed to load projects", "error");
    }
  }

  function handleEdit(projectEl) {
    const id = projectEl.dataset.id;
    const name = projectEl.querySelector("strong").textContent;
    const description = projectEl.querySelector("span").textContent;

    formEl.name.value = name;
    formEl.description.value = description;
    editId = id;
    submitBtn.textContent = "Update Project";
    resetBtn.style.display = "inline-flex";
    setStatus(`Editing project ${id}`);
  }

  async function handleDelete(projectEl) {
    const id = projectEl.dataset.id;
    const name = projectEl.querySelector("strong").textContent;
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      setStatus(`Deleting ${name}...`);
      await window.AdminApi.deleteProject(id);
      projectEl.remove();
      setStatus(`Deleted ${name}.`);
      if (editId === id) clearForm();
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Failed to delete", "error");
    }
  }

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(formEl);
    const payload = {
      name: formData.get("name").trim(),
      description: formData.get("description").trim(),
      imageUrl: formData.get("imageUrl").trim(),
      status: formData.get("status")
    };

    try {
      if (editId) {
        setStatus("Updating project...");
        await window.AdminApi.updateProject(editId, payload);
      } else {
        setStatus("Creating project...");
        await window.AdminApi.createProject(payload);
      }
      clearForm();
      await loadProjects();
      setStatus(editId ? "Project updated." : "Project created.");
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Save failed", "error");
    }
  });

  resetBtn.addEventListener("click", (event) => {
    event.preventDefault();
    clearForm();
    setStatus("Ready.");
  });

  listEl.addEventListener("click", (event) => {
    const projectEl = event.target.closest("li.project-row");
    if (!projectEl) return;
    if (event.target.matches("[data-edit]")) {
      handleEdit(projectEl);
    } else if (event.target.matches("[data-delete]")) {
      handleDelete(projectEl);
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    const apiReady = window.AdminApi && typeof window.AdminApi.fetchProjects === "function";
    if (!apiReady) {
      disableForm();
      listEl.innerHTML =
        '<li class="project-row"><div class="project-main"><strong>Admin API not configured</strong><span>Add admin/config.js (copy config.example.js) and set apiBaseUrl/authToken.</span></div></li>';
      setStatus("Admin API not configured. Create admin/config.js from config.example.js.", "error");
      return;
    }
    clearForm();
    loadProjects();
  });
})();

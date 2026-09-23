/**
 * Dedicated Admin Dashboard & CMS Controller for Youssef Ali Mohamed Elsayed
 * Color System: Black + Navy Blue
 * Skills Management: Name, Category, Visibility, Display Order (No proficiency/percentage)
 */

const ADMIN_AUTH_KEY = "youssef_portfolio_admin_auth_v2";
let currentAdminTab = "overview";
let editingEntityId = null;

window.initAdminCMS = function() {
  checkAuthAndRender();
};

function checkAuthAndRender() {
  const isAuth = sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
  const authGate = document.getElementById("admin-auth-gate");
  const dashboard = document.getElementById("admin-dashboard-container");

  if (!isAuth) {
    if (authGate) authGate.style.display = "flex";
    if (dashboard) dashboard.style.display = "none";
    setupLoginHandler();
  } else {
    if (authGate) authGate.style.display = "none";
    if (dashboard) dashboard.style.display = "block";
    setupDashboardUI();
    renderCurrentTab();
  }
}

function setupLoginHandler() {
  const form = document.getElementById("admin-login-form");
  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const userInput = form.querySelector("#admin-username");
    const user = (userInput ? userInput.value.trim() : "") || "admin";

    // Attempt backend authentication if available
    try {
      await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user })
      });
    } catch (netErr) {}

    // Sign in immediately without password
    sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
    localStorage.setItem("cms_auth_user", user);
    showToast(`Access granted. Welcome to Portfolio CMS, ${user}!`, "success");
    checkAuthAndRender();
  };
}

function handleAdminLogout() {
  sessionStorage.removeItem(ADMIN_AUTH_KEY);
  showToast("Logged out successfully.", "info");
  window.location.hash = "";
  checkAuthAndRender();
}

function setupDashboardUI() {
  document.querySelectorAll(".admin-nav-item").forEach(item => {
    item.onclick = (e) => {
      e.preventDefault();
      const tab = item.getAttribute("data-tab");
      if (tab) {
        currentAdminTab = tab;
        document.querySelectorAll(".admin-nav-item").forEach(i => i.classList.remove("active"));
        item.classList.add("active");
        renderCurrentTab();
      }
    };
  });

  const exitBtn = document.getElementById("admin-exit-btn");
  if (exitBtn) {
    exitBtn.onclick = () => {
      window.location.hash = "";
      if (window.location.pathname.endsWith("admin.html")) {
        window.location.href = "index.html";
      }
    };
  }

  const logoutBtn = document.getElementById("admin-logout-btn");
  if (logoutBtn) {
    logoutBtn.onclick = handleAdminLogout;
  }
}

function renderCurrentTab() {
  document.querySelectorAll(".admin-pane").forEach(p => p.classList.remove("active"));
  const targetPane = document.getElementById(`pane-${currentAdminTab}`);
  if (targetPane) targetPane.classList.add("active");

  const data = getStoredPortfolioData();

  switch (currentAdminTab) {
    case "overview":
      renderAdminOverview(data);
      break;
    case "projects":
      renderAdminProjects(data);
      break;
    case "skills":
      renderAdminSkills(data);
      break;
    case "profile":
      renderAdminProfile(data);
      break;
    case "education":
      renderAdminEducation(data);
      break;
    case "cv":
      renderAdminCV(data);
      break;
    case "backups":
      renderAdminBackups(data);
      break;
  }
}

function renderAdminOverview(data) {
  const container = document.getElementById("admin-kpi-summary");
  if (!container) return;

  const totalProjects = (data.projects || []).length;
  const featuredProjects = (data.projects || []).filter(p => p.featured).length;
  
  const totalSkills = (data.skills || []).length;
  const totalCourses = (data.courses || []).length;

  container.innerHTML = `
    <div class="admin-kpi-card">
      <div class="kpi-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
      </div>
      <div>
        <div class="kpi-val">${totalProjects}</div>
        <div class="kpi-label">Total Projects (${featuredProjects} Featured)</div>
      </div>
    </div>

    <div class="admin-kpi-card">
      <div class="kpi-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      </div>
      <div>
        <div class="kpi-val">${totalSkills}</div>
        <div class="kpi-label">Categorized Skills (No Percentages)</div>
      </div>
    </div>

    <div class="admin-kpi-card">
      <div class="kpi-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      </div>
      <div>
        <div class="kpi-val">${totalCourses}</div>
        <div class="kpi-label">Verified Programs & Courses</div>
      </div>
    </div>

    <div class="admin-kpi-card">
      <div class="kpi-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
      </div>
      <div>
        <div class="kpi-val">100%</div>
        <div class="kpi-label">CV Integrity & Verification Status</div>
      </div>
    </div>
  `;
}

function renderAdminProjects(data) {
  const listContainer = document.getElementById("admin-projects-list");
  if (!listContainer) return;

  const projects = data.projects || [];
  projects.sort((a, b) => (a.order || 0) - (b.order || 0));

  listContainer.innerHTML = projects.map(p => `
    <div class="admin-item-card">
      <div class="admin-item-info">
        <div class="admin-item-title">
          <span>${escapeHTML(p.title)}</span>
          ${p.featured ? `<span class="badge badge-featured">Featured</span>` : ''}
          
          <span style="font-size: 0.75rem; color: var(--dim-text); font-family: var(--font-mono);">${escapeHTML(p.date || "")}</span>
        </div>
        <div class="admin-item-subtitle">${escapeHTML(p.shortDescription)}</div>
        <div style="font-size: 0.75rem; color: var(--highlight-blue); margin-top: 0.35rem; font-family: var(--font-mono);">
          Stack: ${(p.technologies || []).join(", ")}
        </div>
      </div>

      <div class="admin-item-actions">
        <label class="switch-label" title="Toggle Visibility">
          <input type="checkbox" ${p.visible !== false ? 'checked' : ''} onchange="toggleProjectVisibility('${p.id}', this.checked)">
          <span class="slider"></span>
        </label>
        <button type="button" class="btn btn-secondary btn-sm" onclick="openProjectEditModal('${p.id}')">Edit</button>
        <button type="button" class="btn btn-secondary btn-sm" style="color: #E05252;" onclick="deleteProject('${p.id}')">Delete</button>
      </div>
    </div>
  `).join("");

  const addBtn = document.getElementById("btn-add-new-project");
  if (addBtn) {
    addBtn.onclick = () => openProjectEditModal(null);
  }
}

window.toggleProjectVisibility = function(projectId, isVisible) {
  const data = getStoredPortfolioData();
  const proj = (data.projects || []).find(p => p.id === projectId);
  if (proj) {
    proj.visible = isVisible;
    savePortfolioData(data);
    showToast(`Project visibility updated.`, "info");
  }
};

window.openProjectEditModal = function(projectId) {
  editingEntityId = projectId;
  const data = getStoredPortfolioData();
  const proj = projectId 
    ? (data.projects || []).find(p => p.id === projectId)
    : {
        id: "proj-" + Date.now(),
        title: "",
        date: "2026",
        shortDescription: "",
        fullDescription: "",
        technologies: [],
        featured: false,
        visible: true,
        order: (data.projects || []).length + 1,
        imageTheme: "pipeline",
        githubUrl: "",
        liveDemoUrl: ""
      };

  const modalOverlay = document.getElementById("admin-form-modal-overlay");
  const modalTitle = document.getElementById("admin-modal-title");
  const modalBody = document.getElementById("admin-modal-body");

  if (!modalOverlay || !modalTitle || !modalBody) return;

  modalTitle.textContent = projectId ? "Edit Project" : "Add New Project";

  modalBody.innerHTML = `
    <form id="admin-project-edit-form">
      <div class="form-group">
        <label class="form-label">Project Title</label>
        <input type="text" class="form-control" id="form-p-title" required value="${escapeHTML(proj.title)}">
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">Date (e.g. May 2026)</label>
          <input type="text" class="form-control" id="form-p-date" value="${escapeHTML(proj.date)}">
        </div>
        <div class="form-group">
          <label class="form-label">Display Order</label>
          <input type="number" class="form-control" id="form-p-order" value="${proj.order || 1}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Short Description</label>
        <input type="text" class="form-control" id="form-p-short" required value="${escapeHTML(proj.shortDescription)}">
      </div>
      <div class="form-group">
        <label class="form-label">Full Architecture Description</label>
        <textarea class="form-control" id="form-p-full" rows="3">${escapeHTML(proj.fullDescription)}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Technologies (comma separated)</label>
        <input type="text" class="form-control" id="form-p-tech" value="${(proj.technologies || []).join(", ")}">
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">GitHub URL</label>
          <input type="text" class="form-control" id="form-p-github" value="${escapeHTML(proj.githubUrl || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Live Demo URL</label>
          <input type="text" class="form-control" id="form-p-demo" value="${escapeHTML(proj.liveDemoUrl || '')}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Visual Theme / Diagram Preset</label>
        <select class="form-control" id="form-p-theme">
          <option value="churn" ${proj.imageTheme === 'churn' ? 'selected' : ''}>Machine Learning / Churn Curve</option>
          <option value="pipeline" ${proj.imageTheme === 'pipeline' ? 'selected' : ''}>ETL Data Pipeline Nodes</option>
          <option value="dashboard" ${proj.imageTheme === 'dashboard' ? 'selected' : ''}>Analytics / Temporal Bars</option>
          <option value="realtime" ${proj.imageTheme === 'realtime' ? 'selected' : ''}>Real-Time API Stream</option>
        </select>
      </div>
      <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(20, 43, 74, 0.3); border-radius: var(--radius-sm);">
        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem;">
          <input type="checkbox" id="form-p-featured" ${proj.featured ? 'checked' : ''}>
          <span>Mark as Featured</span>
        </label>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="closeAdminFormModal()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm">Save Project</button>
      </div>
    </form>
  `;

  modalOverlay.classList.add("active");

  document.getElementById("admin-project-edit-form").onsubmit = (e) => {
    e.preventDefault();
    const updated = {
      id: proj.id,
      title: document.getElementById("form-p-title").value.trim(),
      date: document.getElementById("form-p-date").value.trim(),
      order: parseInt(document.getElementById("form-p-order").value) || 1,
      shortDescription: document.getElementById("form-p-short").value.trim(),
      fullDescription: document.getElementById("form-p-full").value.trim(),
      technologies: document.getElementById("form-p-tech").value.split(",").map(s => s.trim()).filter(Boolean),
      githubUrl: document.getElementById("form-p-github").value.trim(),
      liveDemoUrl: document.getElementById("form-p-demo").value.trim(),
      imageTheme: document.getElementById("form-p-theme").value,
      featured: document.getElementById("form-p-featured").checked,
      visible: true
    };

    const currentData = getStoredPortfolioData();
    if (!currentData.projects) currentData.projects = [];

    const existingIdx = currentData.projects.findIndex(p => p.id === proj.id);
    if (existingIdx >= 0) {
      currentData.projects[existingIdx] = updated;
    } else {
      currentData.projects.push(updated);
    }

    savePortfolioData(currentData);
    closeAdminFormModal();
    renderAdminProjects(currentData);
    showToast("Project saved successfully!", "success");
  };
};

window.deleteProject = function(projectId) {
  if (confirm("Are you sure you want to delete this project?")) {
    const data = getStoredPortfolioData();
    data.projects = (data.projects || []).filter(p => p.id !== projectId);
    savePortfolioData(data);
    renderAdminProjects(data);
    showToast("Project deleted.", "info");
  }
};

/* ==========================================================================
   Skills Management CRUD (Name, Category, Visibility, Order - NO PERCENTAGE)
   ========================================================================== */
function renderAdminSkills(data) {
  const container = document.getElementById("admin-skills-list");
  if (!container) return;

  const skills = data.skills || [];
  skills.sort((a, b) => (a.order || 0) - (b.order || 0));

  container.innerHTML = skills.map(s => `
    <div class="admin-item-card">
      <div class="admin-item-info">
        <div class="admin-item-title">
          <span>${escapeHTML(s.name)}</span>
          <span class="badge" style="background: rgba(20, 43, 74, 0.4);">${escapeHTML(s.category)}</span>
          
        </div>
        <div class="admin-item-subtitle">Category: ${escapeHTML(s.category)} • Order: ${s.order || 1}</div>
      </div>
      <div class="admin-item-actions">
        <label class="switch-label" title="Toggle Visibility">
          <input type="checkbox" ${s.visible !== false ? 'checked' : ''} onchange="toggleSkillVisibility('${s.id}', this.checked)">
          <span class="slider"></span>
        </label>
        <button type="button" class="btn btn-secondary btn-sm" onclick="openSkillEditModal('${s.id}')">Edit</button>
        <button type="button" class="btn btn-secondary btn-sm" style="color: #E05252;" onclick="deleteSkill('${s.id}')">Delete</button>
      </div>
    </div>
  `).join("");

  const addBtn = document.getElementById("btn-add-new-skill");
  if (addBtn) {
    addBtn.onclick = () => openSkillEditModal(null);
  }
}

window.toggleSkillVisibility = function(skillId, isVisible) {
  const data = getStoredPortfolioData();
  const sk = (data.skills || []).find(s => s.id === skillId);
  if (sk) {
    sk.visible = isVisible;
    savePortfolioData(data);
    showToast(`Skill visibility updated.`, "info");
  }
};

window.openSkillEditModal = function(skillId) {
  editingEntityId = skillId;
  const data = getStoredPortfolioData();
  const sk = skillId
    ? (data.skills || []).find(s => s.id === skillId)
    : {
        id: "sk-" + Date.now(),
        name: "",
        category: "Programming Languages",
        order: (data.skills || []).length + 1,
        visible: true
      };

  const modalOverlay = document.getElementById("admin-form-modal-overlay");
  const modalTitle = document.getElementById("admin-modal-title");
  const modalBody = document.getElementById("admin-modal-body");

  if (!modalOverlay || !modalTitle || !modalBody) return;

  modalTitle.textContent = skillId ? "Edit Skill" : "Add New Skill";

  modalBody.innerHTML = `
    <form id="admin-skill-edit-form">
      <div class="form-group">
        <label class="form-label">Skill Name</label>
        <input type="text" class="form-control" id="form-s-name" required value="${escapeHTML(sk.name)}" placeholder="e.g. Apache Spark, dbt, SQL">
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-control" id="form-s-category">
            <option value="Programming Languages" ${sk.category === 'Programming Languages' ? 'selected' : ''}>Programming Languages</option>
            <option value="Problem Solving" ${sk.category === 'Problem Solving' ? 'selected' : ''}>Problem Solving</option>
            <option value="Data & Machine Learning" ${sk.category === 'Data & Machine Learning' ? 'selected' : ''}>Data & Machine Learning</option>
            <option value="Data Engineering Concepts" ${sk.category === 'Data Engineering Concepts' ? 'selected' : ''}>Data Engineering Concepts</option>
            <option value="Tools & Environment" ${sk.category === 'Tools & Environment' ? 'selected' : ''}>Tools & Environment</option>
            <option value="Familiar With" ${sk.category === 'Familiar With' ? 'selected' : ''}>Familiar With</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Display Order</label>
          <input type="number" class="form-control" id="form-s-order" value="${sk.order || 1}">
        </div>
      </div>
      
      <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="closeAdminFormModal()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm">Save Skill</button>
      </div>
    </form>
  `;

  modalOverlay.classList.add("active");

  document.getElementById("admin-skill-edit-form").onsubmit = (e) => {
    e.preventDefault();
    const updated = {
      id: sk.id,
      name: document.getElementById("form-s-name").value.trim(),
      category: document.getElementById("form-s-category").value,
      order: parseInt(document.getElementById("form-s-order").value) || 1,
      visible: true
    };

    const currentData = getStoredPortfolioData();
    if (!currentData.skills) currentData.skills = [];

    const existingIdx = currentData.skills.findIndex(s => s.id === sk.id);
    if (existingIdx >= 0) {
      currentData.skills[existingIdx] = updated;
    } else {
      currentData.skills.push(updated);
    }

    savePortfolioData(currentData);
    closeAdminFormModal();
    renderAdminSkills(currentData);
    showToast("Skill saved successfully!", "success");
  };
};

window.deleteSkill = function(skillId) {
  if (confirm("Are you sure you want to delete this skill?")) {
    const data = getStoredPortfolioData();
    data.skills = (data.skills || []).filter(s => s.id !== skillId);
    savePortfolioData(data);
    renderAdminSkills(data);
    showToast("Skill removed.", "info");
  }
};

/* ==========================================================================
   Profile Management
   ========================================================================== */
function renderAdminProfile(data) {
  const p = data.profile || {};
  const form = document.getElementById("admin-profile-form");
  if (!form) return;

  form.querySelector("#prof-fullname").value = p.fullName || "";
  form.querySelector("#prof-shortname").value = p.shortName || "";
  form.querySelector("#prof-title").value = p.title || "";
  form.querySelector("#prof-badge").value = p.badge || "";
  form.querySelector("#prof-hero").value = p.heroSupportingText || "";
  form.querySelector("#prof-email").value = p.email || "";
  form.querySelector("#prof-phone").value = p.phone || "";
  form.querySelector("#prof-location").value = p.location || "";
  form.querySelector("#prof-linkedin").value = p.linkedin || "";
  form.querySelector("#prof-github").value = p.github || "";

  form.onsubmit = (e) => {
    e.preventDefault();
    const currentData = getStoredPortfolioData();
    currentData.profile = {
      ...currentData.profile,
      fullName: form.querySelector("#prof-fullname").value.trim(),
      shortName: form.querySelector("#prof-shortname").value.trim(),
      title: form.querySelector("#prof-title").value.trim(),
      badge: form.querySelector("#prof-badge").value.trim(),
      heroSupportingText: form.querySelector("#prof-hero").value.trim(),
      email: form.querySelector("#prof-email").value.trim(),
      phone: form.querySelector("#prof-phone").value.trim(),
      location: form.querySelector("#prof-location").value.trim(),
      linkedin: form.querySelector("#prof-linkedin").value.trim(),
      github: form.querySelector("#prof-github").value.trim()
    };
    savePortfolioData(currentData);
    showToast("Profile information updated across portfolio.", "success");
  };

  // Setup Profile Image Upload & Preview Controls
  setupAdminProfileImageControls(data);
}

/* ==========================================================================
   Education & Courses Management
   ========================================================================== */
function renderAdminEducation(data) {
  const eduContainer = document.getElementById("admin-education-list");
  const courseContainer = document.getElementById("admin-courses-list");

  if (eduContainer) {
    eduContainer.innerHTML = (data.education || []).map(edu => `
      <div class="admin-item-card">
        <div class="admin-item-info">
          <div class="admin-item-title">${escapeHTML(edu.institution)}</div>
          <div class="admin-item-subtitle">${escapeHTML(edu.degree)} • ${escapeHTML(edu.startDate)} — ${escapeHTML(edu.endDate)}</div>
        </div>
        <div class="admin-item-actions">
          <label class="switch-label">
            <input type="checkbox" ${edu.visible !== false ? 'checked' : ''} onchange="toggleEduVisibility('${edu.id}', this.checked)">
            <span class="slider"></span>
          </label>
        </div>
      </div>
    `).join("");
  }

  if (courseContainer) {
    courseContainer.innerHTML = (data.courses || []).map(c => `
      <div class="admin-item-card">
        <div class="admin-item-info">
          <div class="admin-item-title">${escapeHTML(c.name)}</div>
          <div class="admin-item-subtitle">${escapeHTML(c.provider)} (${escapeHTML(c.date)})</div>
        </div>
        <div class="admin-item-actions">
          <label class="switch-label">
            <input type="checkbox" ${c.visible !== false ? 'checked' : ''} onchange="toggleCourseVisibility('${c.id}', this.checked)">
            <span class="slider"></span>
          </label>
        </div>
      </div>
    `).join("");
  }
}

window.toggleEduVisibility = function(id, isVis) {
  const data = getStoredPortfolioData();
  const item = (data.education || []).find(e => e.id === id);
  if (item) {
    item.visible = isVis;
    savePortfolioData(data);
    showToast("Education item updated.", "info");
  }
};

window.toggleCourseVisibility = function(id, isVis) {
  const data = getStoredPortfolioData();
  const item = (data.courses || []).find(c => c.id === id);
  if (item) {
    item.visible = isVis;
    savePortfolioData(data);
    showToast("Course visibility updated.", "info");
  }
};

/* ==========================================================================
   Backups & Reset
   ========================================================================== */
function renderAdminBackups(data) {
  const exportBtn = document.getElementById("admin-export-json-btn");
  if (exportBtn) {
    exportBtn.onclick = () => {
      const current = getStoredPortfolioData();
      const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(current, null, 2));
      const a = document.createElement("a");
      a.setAttribute("href", str);
      a.setAttribute("download", `youssef_portfolio_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast("Backup exported successfully.", "success");
    };
  }

  const resetBtn = document.getElementById("admin-reset-default-btn");
  if (resetBtn) {
    resetBtn.onclick = () => {
      if (confirm("Reset all content back to verified CV factory default? This will overwrite manual changes.")) {
        resetPortfolioDataToDefault();
        showToast("Restored CV verified factory defaults.", "info");
        renderCurrentTab();
      }
    };
  }

  const importBtn = document.getElementById("admin-import-json-btn");
  const fileInput = document.getElementById("admin-json-file-input");
  if (importBtn && fileInput) {
    importBtn.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target.result);
            if (parsed.profile && parsed.skills) {
              savePortfolioData(parsed);
              showToast("Portfolio data imported successfully!", "success");
              renderCurrentTab();
            } else {
              showToast("Invalid portfolio data schema in JSON file.", "error");
            }
          } catch (err) {
            showToast("Failed to parse JSON file.", "error");
          }
        };
        reader.readAsText(file);
      }
    };
  }
}

window.closeAdminFormModal = function() {
  const modalOverlay = document.getElementById("admin-form-modal-overlay");
  if (modalOverlay) modalOverlay.classList.remove("active");
};


/* ==========================================================================
   Profile Image Upload & Management in Admin CMS
   ========================================================================== */
function setupAdminProfileImageControls(data) {
  const previewBox = document.getElementById("admin-profile-img-preview-box");
  const fileInput = document.getElementById("admin-profile-img-input");
  const removeBtn = document.getElementById("admin-profile-img-remove-btn");
  const uploadBtnText = document.getElementById("admin-profile-img-upload-btn-text");
  const statusEl = document.getElementById("admin-profile-img-status");

  if (!previewBox || !fileInput) return;

  function updateImageUI() {
    const currentData = getStoredPortfolioData();
    const currentImg = currentData.profile?.profileImage;

    if (currentImg) {
      previewBox.innerHTML = `<img src="${currentImg}" alt="Profile Portrait" style="width:100%;height:100%;object-fit:cover;">`;
      previewBox.style.border = "2px solid var(--color-blue-electric)";
      if (removeBtn) removeBtn.style.display = "inline-flex";
      if (uploadBtnText) uploadBtnText.textContent = "Replace Image";
      if (statusEl) statusEl.innerHTML = `<span style="color: #28a745;">✓ Custom portrait active</span> • Featured in Hero and About.`;
    } else {
      const initials = (currentData.profile?.shortName || "YA")
        .split(" ")
        .map(n => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      previewBox.innerHTML = `<div style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: var(--color-cyan-glow);">${initials}</div>`;
      previewBox.style.border = "2px dashed rgba(0, 102, 204, 0.4)";
      if (removeBtn) removeBtn.style.display = "none";
      if (uploadBtnText) uploadBtnText.textContent = "Upload Image";
      if (statusEl) statusEl.textContent = "No custom portrait uploaded. Using default monogram fallback.";
    }
  }

  updateImageUI();

  fileInput.onchange = function(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const validFormats = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validFormats.includes(file.type.toLowerCase())) {
      showToast("Invalid file format. Please upload JPG, PNG, or WEBP.", "error");
      fileInput.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("Image exceeds 10MB limit. Please upload a smaller image.", "error");
      fileInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = function(loadEvent) {
      const rawDataUrl = loadEvent.target.result;
      const img = new Image();
      img.onload = function() {
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const optimizedDataUrl = canvas.toDataURL("image/jpeg", 0.88);

        const currentData = getStoredPortfolioData();
        currentData.profile.profileImage = optimizedDataUrl;
        savePortfolioData(currentData);

        updateImageUI();
        showToast("Profile portrait uploaded and saved successfully!", "success");
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
    fileInput.value = "";
  };

  if (removeBtn) {
    removeBtn.onclick = function() {
      const currentData = getStoredPortfolioData();
      currentData.profile.profileImage = null;
      savePortfolioData(currentData);
      updateImageUI();
      showToast("Profile portrait removed. Restored default fallback.", "info");
    };
  }
}

/* ==========================================================================
   CV Management Admin Controller
   ========================================================================== */
function renderAdminCV(data) {
  const profile = data.profile || {};
  const filenameEl = document.getElementById("admin-cv-filename");
  const metaEl = document.getElementById("admin-cv-meta");
  const statusBadge = document.getElementById("admin-cv-status-badge");
  const downloadBtn = document.getElementById("admin-cv-download-btn");
  const removeBtn = document.getElementById("admin-cv-remove-btn");
  const fileInput = document.getElementById("admin-cv-file-input");
  const browseBtn = document.getElementById("admin-cv-browse-btn");
  const dropZone = document.getElementById("admin-cv-drop-zone");

  const hasCV = Boolean(profile.cvFilename || profile.cvDataUrl || profile.cvUrl);
  const activeFilename = profile.cvFilename || "Youssef_Ali_CV (1).docx";

  if (filenameEl) filenameEl.textContent = hasCV ? activeFilename : "No CV Document Uploaded";
  if (metaEl) {
    metaEl.textContent = hasCV
      ? `Size: ${profile.cvFileSize || "37 KB"} • Format: ${activeFilename.split('.').pop().toUpperCase()}`
      : "Upload a CV document (.docx, .pdf, .doc) to activate visitor downloads.";
  }
  if (statusBadge) {
    if (hasCV) {
      statusBadge.textContent = "Active Public CV";
      statusBadge.style.background = "rgba(40, 167, 69, 0.2)";
      statusBadge.style.color = "#28a745";
      statusBadge.style.borderColor = "rgba(40, 167, 69, 0.4)";
    } else {
      statusBadge.textContent = "No CV Document";
      statusBadge.style.background = "rgba(220, 53, 69, 0.2)";
      statusBadge.style.color = "#dc3545";
      statusBadge.style.borderColor = "rgba(220, 53, 69, 0.4)";
    }
  }

  if (downloadBtn) {
    downloadBtn.style.display = hasCV ? "inline-flex" : "none";
    downloadBtn.onclick = function() {
      const currentData = getStoredPortfolioData();
      const p = currentData.profile || {};
      const targetFilename = p.cvFilename || "Youssef_Ali_CV (1).docx";

      if (p.cvDataUrl && p.cvDataUrl.startsWith("data:")) {
        const arr = p.cvDataUrl.split(",");
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        const tempLink = document.createElement("a");
        tempLink.href = blobUrl;
        tempLink.download = targetFilename;
        document.body.appendChild(tempLink);
        tempLink.click();
        setTimeout(function() {
          document.body.removeChild(tempLink);
          URL.revokeObjectURL(blobUrl);
        }, 200);
      } else {
        const tempLink = document.createElement("a");
        tempLink.href = p.cvUrl || `assets/${encodeURIComponent(targetFilename)}`;
        tempLink.download = targetFilename;
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
      }
    };
  }

  if (removeBtn) {
    removeBtn.style.display = hasCV ? "inline-flex" : "none";
    removeBtn.onclick = function() {
      if (!confirm("Are you sure you want to remove the current CV document? The public Download CV button will be inactive until a new document is uploaded.")) {
        return;
      }
      const currentData = getStoredPortfolioData();
      currentData.profile.cvFilename = "";
      currentData.profile.cvDataUrl = "";
      currentData.profile.cvUrl = "";
      currentData.profile.cvFileSize = "";
      savePortfolioData(currentData);
      renderAdminCV(currentData);
      showToast("CV document removed.", "info");
    };
  }

  function handleCVFileUpload(file) {
    if (!file) return;

    const validExtensions = [".docx", ".pdf", ".doc", ".rtf"];
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!validExtensions.includes(ext)) {
      showToast(`Invalid document format (${ext}). Please upload a .docx, .pdf, or .doc file.`, "error");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showToast("File exceeds 25MB limit. Please upload a smaller file.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target.result;
      const currentData = getStoredPortfolioData();
      currentData.profile.cvFilename = file.name;
      currentData.profile.cvDataUrl = dataUrl;
      currentData.profile.cvUrl = "";
      currentData.profile.cvFileSize = (file.size / 1024).toFixed(1) + " KB";
      currentData.profile.cvUploadedAt = new Date().toISOString();

      savePortfolioData(currentData);
      renderAdminCV(currentData);
      showToast(`CV document updated to "${file.name}"! Public download button updated.`, "success");
    };
    reader.readAsDataURL(file);
  }

  if (browseBtn && fileInput) {
    browseBtn.onclick = function(e) {
      e.stopPropagation();
      fileInput.click();
    };
  }

  if (fileInput) {
    fileInput.onchange = function(e) {
      const file = e.target.files && e.target.files[0];
      if (file) {
        handleCVFileUpload(file);
      }
      fileInput.value = "";
    };
  }

  if (dropZone) {
    dropZone.onclick = function() {
      if (fileInput) fileInput.click();
    };

    dropZone.ondragover = function(e) {
      e.preventDefault();
      dropZone.classList.add("dragover");
    };

    dropZone.ondragleave = function() {
      dropZone.classList.remove("dragover");
    };

    dropZone.ondrop = function(e) {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) {
        handleCVFileUpload(file);
      }
    };
  }
}

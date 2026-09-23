if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
/**
 * Public Portfolio Client Application for Youssef Ali Mohamed Elsayed
 * Color System: Black + Navy Blue
 * Rich Animations: Hero entrance, Staggered scroll reveals, Card hover physics
 */

document.addEventListener("DOMContentLoaded", () => {
  handleInitialScrollPosition();
  initPortfolio();
});

window.addEventListener("load", () => {
  handleInitialScrollPosition(true);
});

function handleInitialScrollPosition(isPageLoad = false) {
  const hash = (window.location.hash || "").toLowerCase().replace("#", "");
  const path = (window.location.pathname || "").replace(/^\/+|\/+$/g, "").toLowerCase();

  // If Admin route, let admin route handler take care of it
  if (hash === "admin" || path.includes("admin")) {
    return;
  }

  const validSections = ["about", "skills", "projects", "education", "languages", "contact"];
  let targetSection = null;

  if (hash && validSections.includes(hash)) {
    targetSection = hash;
  } else if (path && validSections.includes(path)) {
    targetSection = path;
  }

  if (targetSection) {
    const targetEl = document.getElementById(targetSection);
    if (targetEl) {
      setTimeout(() => {
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }, 50);
      return;
    }
  }

  // Root URL / or default: Strictly start at Home / Hero section at the very top (0, 0)
  window.scrollTo(0, 0);
  const heroEl = document.getElementById("home");
  if (heroEl) {
    heroEl.scrollIntoView({ block: "start", behavior: "instant" });
  }
  window.scrollTo(0, 0);
}

function initPortfolio() {
  renderAllPortfolioContent();
  setupNavigation();
  setupRichScrollAnimations();
  setupContactForm();
  setupPrivateAdminRoute();

  // Listen for real-time data changes from Admin CMS
  window.addEventListener("portfolioDataChanged", () => {
    renderAllPortfolioContent();
  });
}

function renderAllPortfolioContent() {
  const data = getStoredPortfolioData();
  renderProfileData(data.profile);
  renderBentoStats(data.profile.stats);
  renderCategorizedSkills(data.skills);
  renderProjects(data.projects);
  renderEducation(data.education);
  renderCourses(data.courses);
  renderLanguages(data.languages);
  // Re-attach observer for all newly rendered cards
  setupRichScrollAnimations();
}

/* ==========================================================================
   Render Profile & Bento Stats
   ========================================================================== */
function renderProfileData(profile) {
  const heroNameEl = document.getElementById("hero-name");
  const heroTitleEl = document.getElementById("hero-title");
  const heroDescEl = document.getElementById("hero-desc");
  const heroBadgeEl = document.getElementById("hero-badge-text");

  if (heroNameEl) heroNameEl.textContent = profile.shortName || "Youssef Ali";
  if (heroTitleEl) heroTitleEl.textContent = profile.title || "Aspiring Data Engineer";
  if (heroDescEl) heroDescEl.textContent = profile.heroSupportingText || "";
  if (heroBadgeEl) heroBadgeEl.textContent = profile.badge || "CS Student @ Qena University";

  const aboutContainer = document.getElementById("about-paragraphs");
  if (aboutContainer && profile.aboutParagraphs) {
    aboutContainer.innerHTML = profile.aboutParagraphs
      .map(p => `<p>${escapeHTML(p)}</p>`)
      .join("");
  }

  renderHeroProfileVisual(profile);
  renderAboutAuthorBadge(profile);
  updateCVDownloadButton(profile);

  const emailEl = document.getElementById("contact-email");
  const phoneEl = document.getElementById("contact-phone");
  const locEl = document.getElementById("contact-location");

  if (emailEl) {
    emailEl.textContent = profile.email;
    emailEl.href = `mailto:${profile.email}`;
  }
  if (phoneEl) {
    phoneEl.textContent = profile.phone;
    phoneEl.href = `tel:${profile.phone}`;
  }
  if (locEl) locEl.textContent = profile.location;

  const linkedinLinks = document.querySelectorAll(".link-linkedin");
  const githubLinks = document.querySelectorAll(".link-github");

  linkedinLinks.forEach(el => el.href = profile.linkedin || "#");
  githubLinks.forEach(el => el.href = profile.github || "#");
}

function renderBentoStats(stats) {
  const container = document.getElementById("bento-stats-container");
  if (!container) return;

  const iconMap = {
    academic: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
    code: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    database: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
    cpu: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>`
  };

  container.innerHTML = (stats || []).map(st => `
    <div class="glass-card bento-stat-card scroll-reveal">
      <div class="stat-icon">
        ${iconMap[st.icon] || iconMap.code}
      </div>
      <div>
        <div class="stat-value">${escapeHTML(st.value)}</div>
        <div class="stat-label">${escapeHTML(st.label)}</div>
        ${st.highlight ? `<div class="stat-highlight">// ${escapeHTML(st.highlight)}</div>` : ""}
      </div>
    </div>
  `).join("");
}

/* ==========================================================================
   Categorized Skills Presentation (No Percentages, Clean Tags / Glass Pills)
   ========================================================================== */
function renderCategorizedSkills(skills) {
  const container = document.getElementById("skills-categories-container");
  if (!container) return;

  const visibleSkills = (skills || []).filter(s => s.visible !== false);

  // Group skills by category while preserving order
  const categories = {};
  visibleSkills.forEach(s => {
    const cat = s.category || "General";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(s);
  });

  const categoryIcons = {
    "Programming Languages": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    "Problem Solving": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`,
    "Data & Machine Learning": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>`,
    "Data Engineering Concepts": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
    "Tools & Environment": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    "Familiar With": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  };

  container.innerHTML = Object.entries(categories).map(([catName, catSkills]) => {
    catSkills.sort((a, b) => (a.order || 0) - (b.order || 0));

    const pillsHtml = catSkills.map(skill => {
      return `
        <div class="skill-pill" title="${escapeHTML(skill.name)}">
          <span class="skill-dot"></span>
          <span>${escapeHTML(skill.name)}</span>
        </div>
      `;
    }).join("");

    return `
      <div class="skills-category-group scroll-reveal">
        <h3 class="skills-category-title">
          ${categoryIcons[catName] || categoryIcons["Familiar With"]}
          <span>${escapeHTML(catName.toUpperCase())}</span>
        </h3>
        <div class="skills-tags-cluster">
          ${pillsHtml}
        </div>
      </div>
    `;
  }).join("");
}

/* ==========================================================================
   Render Portfolio Projects
   ========================================================================== */
function renderProjects(projects) {
  const container = document.getElementById("projects-grid-container");
  if (!container) return;

  const visibleProjects = (projects || [])
    .filter(p => p.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  container.innerHTML = visibleProjects.map(proj => {
    const badgesHtml = proj.featured 
      ? `<div class="project-badges"><span class="badge badge-featured">★ Featured Project</span></div>`
      : '';

    const svgArtwork = getProjectSvgVisual(proj.imageTheme || "pipeline", proj.title);
    const tagsHtml = (proj.technologies || []).map(t => `<span class="tag-item">${escapeHTML(t)}</span>`).join("");

    return `
      <article class="glass-card project-card scroll-reveal" data-project-id="${proj.id}">
        <div class="project-visual">
          ${badgesHtml}
          ${svgArtwork}
        </div>
        <div class="project-body">
          <div>
            <div class="project-date">${escapeHTML(proj.date || "")}</div>
            <h3 class="project-title">${escapeHTML(proj.title)}</h3>
            <p class="project-desc">${escapeHTML(proj.shortDescription)}</p>
          </div>
          <div>
            <div class="project-tags">${tagsHtml}</div>
            <div class="project-actions">
              <button type="button" class="btn btn-outline-navy btn-sm view-project-btn" data-id="${proj.id}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                Details
              </button>
              ${proj.githubUrl ? `
                <a href="${proj.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" title="View Source Code">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                  GitHub
                </a>
              ` : ''}
              ${proj.liveDemoUrl ? `
                <button type="button" class="btn btn-primary btn-sm demo-preview-btn" data-id="${proj.id}">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Live Demo
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");

  container.querySelectorAll(".view-project-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const targetProj = visibleProjects.find(p => p.id === id);
      if (targetProj) openProjectDetailsModal(targetProj);
    });
  });

  container.querySelectorAll(".demo-preview-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const targetProj = visibleProjects.find(p => p.id === id);
      if (targetProj) openLiveDemoModal(targetProj);
    });
  });
}

function getProjectSvgVisual(theme, title) {
  if (theme === "churn") {
    return `
      <svg class="project-svg-graphic" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="220" fill="#080D18"/>
        <line x1="40" y1="180" x2="360" y2="180" stroke="#17243A" stroke-width="1.5"/>
        <line x1="40" y1="40" x2="40" y2="180" stroke="#17243A" stroke-width="1.5"/>
        <path d="M40 180 Q 130 170, 190 115 T 360 48" stroke="url(#navyGradCurve)" stroke-width="3.5" fill="none"/>
        <circle cx="190" cy="115" r="5" fill="#3B82C4"/>
        <circle cx="280" cy="70" r="5" fill="#1D4E89"/>
        <text x="50" y="32" fill="#5A6B82" font-family="monospace" font-size="11">ML CLASSIFICATION // CHURN RISK MATRIX</text>
        <rect x="250" y="125" width="110" height="38" rx="6" fill="#0D1524" stroke="#17243A"/>
        <text x="262" y="148" fill="#3B82C4" font-family="monospace" font-size="11">AUC = 0.89</text>
        <defs>
          <linearGradient id="navyGradCurve" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#142B4A"/>
            <stop offset="50%" stop-color="#1D4E89"/>
            <stop offset="100%" stop-color="#3B82C4"/>
          </linearGradient>
        </defs>
      </svg>
    `;
  } else if (theme === "pipeline") {
    return `
      <svg class="project-svg-graphic" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="220" fill="#080D18"/>
        <text x="30" y="32" fill="#5A6B82" font-family="monospace" font-size="11">ETL PIPELINE // E-COMMERCE INGESTION</text>
        <rect x="35" y="85" width="80" height="52" rx="8" fill="#0D1524" stroke="#1D4E89" stroke-width="1.5"/>
        <text x="47" y="116" fill="#8B9BB0" font-family="monospace" font-size="11">SOURCE</text>
        <path d="M115 111 L 160 111" stroke="#3B82C4" stroke-width="2" stroke-dasharray="3 3"/>
        <rect x="165" y="80" width="90" height="62" rx="8" fill="#0D1524" stroke="#3B82C4" stroke-width="1.5"/>
        <text x="175" y="116" fill="#3B82C4" font-family="monospace" font-size="11">TRANSFORM</text>
        <path d="M255 111 L 295 111" stroke="#3B82C4" stroke-width="2" stroke-dasharray="3 3"/>
        <rect x="300" y="85" width="80" height="52" rx="8" fill="#0D1524" stroke="#142B4A" stroke-width="1.5"/>
        <text x="312" y="116" fill="#60A5FA" font-family="monospace" font-size="11">PG_SQL</text>
      </svg>
    `;
  } else if (theme === "dashboard") {
    return `
      <svg class="project-svg-graphic" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="220" fill="#080D18"/>
        <text x="30" y="32" fill="#5A6B82" font-family="monospace" font-size="11">SALES KPI // TEMPORAL AGGREGATIONS</text>
        <rect x="50" y="130" width="25" height="50" rx="3" fill="#142B4A"/>
        <rect x="90" y="105" width="25" height="75" rx="3" fill="#17243A"/>
        <rect x="130" y="75" width="25" height="105" rx="3" fill="#1D4E89"/>
        <rect x="170" y="90" width="25" height="90" rx="3" fill="#142B4A"/>
        <rect x="210" y="55" width="25" height="125" rx="3" fill="#1D4E89"/>
        <rect x="250" y="42" width="25" height="138" rx="3" fill="#3B82C4"/>
        <rect x="290" y="68" width="25" height="112" rx="3" fill="#17243A"/>
      </svg>
    `;
  } else {
    return `
      <svg class="project-svg-graphic" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="220" fill="#080D18"/>
        <text x="30" y="32" fill="#5A6B82" font-family="monospace" font-size="11">STREAM CONSUMER // REST API BUFFER</text>
        <circle cx="80" cy="115" r="30" stroke="#1D4E89" stroke-width="2" fill="#0D1524"/>
        <text x="68" y="120" fill="#3B82C4" font-family="monospace" font-size="12">API</text>
        <path d="M120 115 Q 180 85, 240 115 T 340 115" stroke="#3B82C4" stroke-width="2" stroke-dasharray="4 4" fill="none"/>
        <circle cx="340" cy="115" r="16" fill="#1D4E89" opacity="0.35"/>
        <circle cx="340" cy="115" r="8" fill="#3B82C4"/>
      </svg>
    `;
  }
}

function renderEducation(eduList) {
  const container = document.getElementById("education-timeline");
  if (!container) return;

  const visible = (eduList || []).filter(e => e.visible !== false);

  container.innerHTML = visible.map((item, idx) => `
    <div class="timeline-item scroll-reveal" style="--reveal-delay: ${150 + idx * 150}ms;">
      <div class="timeline-dot">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
      </div>
      <div class="glass-card timeline-card">
        <div class="timeline-date">${escapeHTML(item.startDate)} — ${escapeHTML(item.endDate)}</div>
        <h4 class="timeline-name">${escapeHTML(item.institution)}</h4>
        <div class="timeline-provider">${escapeHTML(item.degree)} • ${escapeHTML(item.location)}</div>
        <p class="timeline-desc">${escapeHTML(item.description)}</p>
      </div>
    </div>
  `).join("");
}

function renderCourses(coursesList) {
  const container = document.getElementById("courses-timeline");
  if (!container) return;

  const visible = (coursesList || []).filter(c => c.visible !== false);

  container.innerHTML = visible.map((c, idx) => `
    <div class="timeline-item scroll-reveal" style="--reveal-delay: ${150 + idx * 150}ms;">
      <div class="timeline-dot">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      </div>
      <div class="glass-card timeline-card">
        <div class="timeline-date">${escapeHTML(c.date)}</div>
        <h4 class="timeline-name">${escapeHTML(c.name)}</h4>
        <div class="timeline-provider">${escapeHTML(c.provider)}</div>
        <p class="timeline-desc">${escapeHTML(c.description)}</p>
      </div>
    </div>
  `).join("");
}

function renderLanguages(languages) {
  const container = document.getElementById("languages-container");
  if (!container) return;

  container.innerHTML = (languages || []).map(lang => {
    let dotsHtml = "";
    for (let i = 1; i <= 5; i++) {
      dotsHtml += `<div class="lang-dot ${i <= lang.dots ? 'filled' : ''}"></div>`;
    }

    return `
      <div class="glass-card language-card scroll-reveal">
        <div class="lang-flag-badge">${escapeHTML(lang.code || 'LN')}</div>
        <div class="lang-info">
          <div class="lang-name">${escapeHTML(lang.name)}</div>
          <div class="lang-level">${escapeHTML(lang.proficiency)}</div>
          <div class="lang-dots">${dotsHtml}</div>
        </div>
      </div>
    `;
  }).join("");
}

function openProjectDetailsModal(project) {
  const modalOverlay = document.getElementById("project-modal-overlay");
  const modalTitle = document.getElementById("modal-project-title");
  const modalBody = document.getElementById("modal-project-body");

  if (!modalOverlay || !modalTitle || !modalBody) return;

  modalTitle.textContent = project.title;

  const isFeatured = project.featured;
  

  modalBody.innerHTML = `
    <div style="margin-bottom: 1.25rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
      ${project.featured ? `<span class="badge badge-featured">★ Featured Project</span>` : ''}
      <span class="badge" style="background: rgba(20, 43, 74, 0.4); color: var(--secondary-text);">${escapeHTML(project.date || "")}</span>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <h4 style="font-size: 0.9375rem; color: var(--highlight-blue); font-family: var(--font-mono); margin-bottom: 0.5rem;">// ARCHITECTURE & OBJECTIVE</h4>
      <p style="font-size: 1rem; line-height: 1.7; color: var(--main-text); margin-bottom: 1rem;">
        ${escapeHTML(project.fullDescription || project.shortDescription)}
      </p>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <h4 style="font-size: 0.9375rem; color: var(--highlight-blue); font-family: var(--font-mono); margin-bottom: 0.5rem;">// TECHNOLOGIES UTILIZED</h4>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        ${(project.technologies || []).map(t => `<span class="tag-item" style="color: var(--highlight-blue);">${escapeHTML(t)}</span>`).join("")}
      </div>
    </div>

    <div style="background: rgba(8, 13, 24, 0.7); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-top: 1.5rem;">
      <div style="font-size: 0.8125rem; color: var(--dim-text); margin-bottom: 0.75rem; font-family: var(--font-mono);">SOURCE CODE & REPOSITORY</div>
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        ${project.githubUrl ? `
          <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
            Browse Repository
          </a>
        ` : ''}
        ${project.liveDemoUrl ? `
          <button type="button" class="btn btn-outline-navy btn-sm open-inline-demo-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Interactive Demo Sandbox
          </button>
        ` : ''}
      </div>
    </div>
  `;

  modalOverlay.classList.add("active");

  const demoBtn = modalBody.querySelector(".open-inline-demo-btn");
  if (demoBtn) {
    demoBtn.addEventListener("click", () => {
      closeProjectModal();
      openLiveDemoModal(project);
    });
  }
}

function openLiveDemoModal(project) {
  const modalOverlay = document.getElementById("project-modal-overlay");
  const modalTitle = document.getElementById("modal-project-title");
  const modalBody = document.getElementById("modal-project-body");

  if (!modalOverlay || !modalTitle || !modalBody) return;

  modalTitle.textContent = `${project.title} — Interactive Simulator`;

  modalBody.innerHTML = `
    <div style="background: #05070D; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.5rem; font-family: var(--font-mono); font-size: 0.8125rem;">
      <div style="color: var(--highlight-blue); margin-bottom: 0.75rem;">$ python run_pipeline.py --env=production</div>
      <div style="color: var(--secondary-text); margin-bottom: 0.5rem;">[INFO] Ingesting telemetry & records...</div>
      <div style="color: #34D399; margin-bottom: 0.5rem;">[OK] Validating schema constraints: 100% passed</div>
      <div style="color: var(--secondary-text); margin-bottom: 0.5rem;">[INFO] Applying data cleansing & transformation rules...</div>
      <div style="color: var(--highlight-blue); margin-bottom: 0.5rem;">[DEBUG] Output metrics written to staging cluster: 1,420 records processed</div>
      <div style="color: #60A5FA; margin-top: 1rem; border-top: 1px dashed #17243A; padding-top: 0.75rem;">
        Pipeline execution simulated successfully in browser environment.
      </div>
    </div>
    <div style="margin-top: 1.5rem; text-align: right;">
      <button type="button" class="btn btn-secondary btn-sm" id="close-demo-modal-btn">Close Sandbox</button>
    </div>
  `;

  modalOverlay.classList.add("active");

  const closeBtn = modalBody.querySelector("#close-demo-modal-btn");
  if (closeBtn) closeBtn.addEventListener("click", closeProjectModal);
}

function closeProjectModal() {
  const modalOverlay = document.getElementById("project-modal-overlay");
  if (modalOverlay) modalOverlay.classList.remove("active");
}

/* ==========================================================================
   Navigation & Sticky Header
   ========================================================================== */
function setupNavigation() {
  const header = document.querySelector(".site-header");
  const mobileToggle = document.querySelector(".mobile-nav-toggle");
  const mobileDrawer = document.querySelector(".mobile-drawer");
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }
  });

  mobileToggle?.addEventListener("click", () => {
    mobileDrawer?.classList.toggle("open");
  });

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId && targetId.startsWith("#")) {
        e.preventDefault();
        mobileDrawer?.classList.remove("open");
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          const headerOffset = 80;
          const elementPosition = targetEl.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }
    });
  });

  const sections = document.querySelectorAll("section[id]");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach(link => {
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          } else if (link.getAttribute("href")?.startsWith("#")) {
            link.classList.remove("active");
          }
        });
      }
    });
  }, { threshold: 0.25 });

  sections.forEach(s => observer.observe(s));

  document.querySelectorAll(".modal-close-btn").forEach(btn => {
    btn.addEventListener("click", closeProjectModal);
  });

  const modalOverlay = document.getElementById("project-modal-overlay");
  modalOverlay?.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeProjectModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeProjectModal();
  });

  // CV download is handled dynamically by updateCVDownloadButton(profile)
}

/* ==========================================================================
   Rich Scroll-Based Reveals (IntersectionObserver)
   ========================================================================== */
function setupRichScrollAnimations() {
  const elements = document.querySelectorAll(".scroll-reveal:not(.is-revealed)");
  if (!elements.length) return;

  if (!("IntersectionObserver" in window)) {
    elements.forEach(el => el.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px"
  });

  elements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   Contact Form Simulator
   ========================================================================== */
function setupContactForm() {
  const form = document.getElementById("portfolio-contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.querySelector("#sender-name")?.value;
    const email = form.querySelector("#sender-email")?.value;
    const message = form.querySelector("#sender-message")?.value;

    if (!name || !email || !message) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Sending...</span>`;
    }

    setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Message Sent!</span>`;
      }
      form.reset();
      showToast(`Thank you, ${name}! Your message has been prepared. Youssef will be in touch shortly.`, "success");

      const mailtoUrl = `mailto:yousif.aly.09@gmail.com?subject=Contact from Portfolio (${encodeURIComponent(name)})&body=${encodeURIComponent(message)}`;
      const mailtoNotice = document.getElementById("contact-fallback-link");
      if (mailtoNotice) {
        mailtoNotice.href = mailtoUrl;
        mailtoNotice.style.display = "inline-block";
      }
    }, 700);
  });
}

function openResumeViewer() {
  const data = getStoredPortfolioData();
  const modalOverlay = document.getElementById("project-modal-overlay");
  const modalTitle = document.getElementById("modal-project-title");
  const modalBody = document.getElementById("modal-project-body");

  if (!modalOverlay || !modalTitle || !modalBody) return;

  modalTitle.textContent = "Curriculum Vitae — Youssef Ali Mohamed Elsayed";

  modalBody.innerHTML = `
    <div style="font-family: var(--font-body); font-size: 0.9375rem; color: var(--main-text);">
      <div style="border-bottom: 1px solid var(--border-subtle); padding-bottom: 1rem; margin-bottom: 1rem;">
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff;">${escapeHTML(data.profile.fullName)}</h3>
        <p style="color: var(--highlight-blue); font-family: var(--font-mono); font-size: 0.875rem;">${escapeHTML(data.profile.title)}</p>
        <p style="color: var(--secondary-text); font-size: 0.8125rem;">${escapeHTML(data.profile.location)} • ${escapeHTML(data.profile.email)} • ${escapeHTML(data.profile.phone)}</p>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <h4 style="font-size: 0.875rem; font-family: var(--font-mono); color: var(--highlight-blue); margin-bottom: 0.5rem;">EDUCATION</h4>
        <div style="font-weight: 600;">Faculty of Computers and Information Sciences, Qena University</div>
        <div style="color: var(--secondary-text); font-size: 0.8125rem;">2024 — Present</div>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <h4 style="font-size: 0.875rem; font-family: var(--font-mono); color: var(--highlight-blue); margin-bottom: 0.5rem;">COURSES & SPECIALIZATIONS</h4>
        <ul style="list-style: disc; padding-left: 1.25rem; color: var(--secondary-text); font-size: 0.875rem; display: flex; flex-direction: column; gap: 0.35rem;">
          <li><strong style="color: #fff;">Problem Solving</strong> — Coach Academy (August 2025)</li>
          <li><strong style="color: #fff;">GCI Program</strong> — University of Tokyo (July 2026)</li>
          <li><strong style="color: #fff;">Exploratory Data Analysis for Machine Learning</strong> — IBM / Coursera (July 2026)</li>
        </ul>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <h4 style="font-size: 0.875rem; font-family: var(--font-mono); color: var(--highlight-blue); margin-bottom: 0.5rem;">FEATURED PROJECT</h4>
        <div style="font-weight: 600;">Customer Churn Prediction (May 2026)</div>
        <p style="color: var(--secondary-text); font-size: 0.8125rem;">Built a machine learning model to analyze customer behavior and predict churn using Python, Pandas, Scikit-learn, and SQL.</p>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <h4 style="font-size: 0.875rem; font-family: var(--font-mono); color: var(--highlight-blue); margin-bottom: 0.5rem;">CORE SKILLS</h4>
        <p style="color: var(--secondary-text); font-size: 0.8125rem;">Python, SQL, Pandas, NumPy, Matplotlib, Scikit-learn, C++, Problem Solving, HTML, CSS, JavaScript.</p>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
        <button type="button" class="btn btn-primary btn-sm" onclick="window.print()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print / Save PDF
        </button>
      </div>
    </div>
  `;

  modalOverlay.classList.add("active");
}

/* ==========================================================================
   Private Dedicated Admin Route Handling (No Public Button)
   ========================================================================== */
function setupPrivateAdminRoute() {
  function checkRoute() {
    const path = window.location.pathname.replace(/\/$/, "");
    if (window.location.hash === "#admin" || path.endsWith("/admin") || path.endsWith("admin.html")) {
      openAdminView();
    } else {
      closeAdminView();
    }
  }

  window.addEventListener("hashchange", checkRoute);
  window.addEventListener("popstate", checkRoute);
  checkRoute();
}

function openAdminView() {
  const adminWrapper = document.getElementById("admin-app-root");
  const siteWrapper = document.querySelector(".site-wrapper");
  if (adminWrapper) {
    adminWrapper.classList.add("active");
    if (siteWrapper) siteWrapper.style.display = "none";
    if (window.initAdminCMS) window.initAdminCMS();
  }
}

function closeAdminView() {
  const adminWrapper = document.getElementById("admin-app-root");
  const siteWrapper = document.querySelector(".site-wrapper");
  if (adminWrapper) {
    adminWrapper.classList.remove("active");
    if (siteWrapper) siteWrapper.style.display = "block";
  }
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
    <span>${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}


/* ==========================================================================
   Hero & About Profile Portrait Rendering (With Fallback)
   ========================================================================== */
function renderHeroProfileVisual(profile) {
  const container = document.getElementById("hero-profile-container");
  if (!container) return;

  const initials = (profile.shortName || "Youssef Ali")
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const title = profile.title || "Aspiring Data Engineer";
  const name = profile.shortName || "Youssef Ali";

  if (profile.profileImage) {
    container.innerHTML = `
      <div class="hero-profile-card">
        <div class="hero-profile-img-wrapper">
          <img src="${profile.profileImage}" alt="${escapeHTML(name)}" class="hero-profile-img">
        </div>
        <div class="hero-profile-name">${escapeHTML(name)}</div>
        <div class="hero-profile-tagline">${escapeHTML(title)}</div>
        <div class="hero-profile-status">
          <span class="status-dot"></span>
          <span>Data Engineering Track</span>
        </div>
      </div>
    `;
  } else {
    // Elegant fallback design
    container.innerHTML = `
      <div class="hero-profile-card">
        <div class="hero-profile-img-wrapper">
          <div class="hero-profile-fallback">
            <div class="fallback-initials">${escapeHTML(initials)}</div>
          </div>
        </div>
        <div class="hero-profile-name">${escapeHTML(name)}</div>
        <div class="hero-profile-tagline">${escapeHTML(title)}</div>
        <div class="hero-profile-status">
          <span class="status-dot"></span>
          <span>Python • SQL • Machine Learning</span>
        </div>
      </div>
    `;
  }
}

function renderAboutAuthorBadge(profile) {
  const container = document.getElementById("about-author-badge");
  if (!container) return;

  const initials = (profile.shortName || "YA")
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarHtml = profile.profileImage
    ? `<img src="${profile.profileImage}" alt="${escapeHTML(profile.shortName)}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--color-blue-electric); box-shadow: 0 0 16px rgba(0,102,204,0.3);">`
    : `<div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--color-navy-light), var(--color-navy-dark)); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; border: 1px solid rgba(0,204,255,0.3); font-size: 1.1rem;">${escapeHTML(initials)}</div>`;

  container.innerHTML = `
    ${avatarHtml}
    <div>
      <div style="font-weight: 600; color: #fff; font-size: 1rem;">${escapeHTML(profile.fullName || profile.shortName)}</div>
      <div style="font-size: 0.8rem; color: var(--color-blue-electric);">${escapeHTML(profile.title || "Aspiring Data Engineer")}</div>
    </div>
  `;
}

function updateCVDownloadButton(profile) {
  const cvBtn = document.getElementById("hero-cv-btn");
  if (!cvBtn) return;

  const cvFilename = profile.cvFilename || "Youssef_Ali_CV (1).docx";
  const downloadUrl = profile.cvDataUrl || profile.cvUrl || `assets/${encodeURIComponent(cvFilename)}`;

  cvBtn.setAttribute("href", downloadUrl);
  cvBtn.setAttribute("download", cvFilename);

  cvBtn.onclick = (e) => {
    if (!profile.cvFilename && !profile.cvDataUrl && !profile.cvUrl) {
      e.preventDefault();
      alert("No CV document is currently uploaded.");
      return;
    }

    if (profile.cvDataUrl && profile.cvDataUrl.startsWith("data:")) {
      e.preventDefault();
      try {
        const arr = profile.cvDataUrl.split(",");
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
        tempLink.download = cvFilename;
        document.body.appendChild(tempLink);
        tempLink.click();
        setTimeout(() => {
          document.body.removeChild(tempLink);
          URL.revokeObjectURL(blobUrl);
        }, 250);
      } catch (err) {
        console.warn("Direct blob download error, falling back to anchor:", err);
        const tempLink = document.createElement("a");
        tempLink.href = profile.cvDataUrl;
        tempLink.download = cvFilename;
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
      }
    }
  };
}

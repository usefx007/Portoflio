# Premium Data Engineer Portfolio & Admin Dashboard
**Developer:** Youssef Ali Mohamed Elsayed  
**Specialization:** Aspiring Data Engineer & Computer Science Student (Faculty of Computers and Information Sciences, Qena University)

---

## 1. Project Overview
This production-quality portfolio is tailored specifically to the identity of a modern Data Engineer and Computer Science student. It balances recruiter-ready technical credibility with visual sophistication:
- **Visual Identity:** Dark, technical, minimal, and visually rich without feeling like a gaming site.
- **Aurora Glow Engine:** Multi-layered CSS blurred gradient orbs with subtle ambient animation and grid overlay.
- **Glass / Soft UI:** Tactile backdrop-filter cards, subtle borders, gentle elevations, and cyan/blue hover states.
- **Data Integrity Guarantee:** Zero fabricated professional experience, companies, or grades. Projects showcase real and architectural data engineering solutions with consistent card structure and clean technology tags.
- **Integrated Admin CMS:** Separate authenticated dashboard for full CRUD management of projects, skills, profile information, and education/courses, complete with live JSON backup/restore.

---

## 2. Color Palette & Typography
- **Background Main:** `#0A0E14`
- **Surface / Cards:** `#111827` / `rgba(17, 24, 39, 0.75)`
- **Elevated Surfaces:** `#161F30`
- **Primary Blue:** `#3B82F6`
- **Cyan Accent:** `#22D3EE`
- **Subtle Gradient:** `#3B82F6` → `#22D3EE` (utilized sparingly on CTAs, active states, and highlights)
- **Main Text:** `#F8FAFC`
- **Secondary Text:** `#94A3B8`
- **Borders:** `#1E293B`
- **Headings Font:** `Manrope` (ExtraBold / Bold / SemiBold)
- **Body Font:** `Inter` (Regular / Medium)
- **Code / Monospace:** `JetBrains Mono`

---

## 3. Architecture & File Structure
```
portfolio/
├── index.html          # Unified semantic HTML containing public portfolio and CMS SPA views
├── admin.html          # Direct link route helper to the admin portal
├── server.py           # Lightweight Python HTTP server for local testing
├── README.md           # Documentation and evaluation guide
├── css/
│   └── styles.css      # Core design system, aurora animations, responsive grids & modals
└── js/
    ├── data.js         # Default CV facts, seed projects, skills & LocalStorage persistence layer
    ├── app.js          # Public portfolio interactions, category filtering, modals, smooth scroll
    └── admin.js        # Admin CMS authentication, KPI aggregation, CRUD workflows, JSON backups
```

---

## 4. Admin Dashboard Credentials
To access the Admin CMS:
1. Click the **"Youssef.Ali"** logo in the Navbar/Header, or navigate directly to `/admin` or `index.html#admin`.
2. Enter the credentials:
   - Enter your administrator username and password into the login form. The form starts with empty fields and requires manual credential entry.

### CMS Capabilities:
- **Overview:** Instant KPI counts for total projects, featured flags, demo tags, skills, and courses.
- **Projects CRUD:** Add new projects, edit titles, dates, descriptions, technology tags, themes, and GitHub/Demo URLs. Toggle visibility and reorder.
- **Skills Management:** Add, edit, delete skills, assign categories, and adjust proficiency sliders.
- **Profile Management:** Edit name, professional title, bio, contact details, and social links in real time.
- **Education & Courses:** Manage university programs and certifications.
- **Backups & JSON:** Export full database state to a JSON file, upload/import external JSON configs, or restore factory CV defaults.

---

## 5. Running the Portfolio Locally
To run using Python's built-in HTTP server:
```bash
cd portfolio
python3 server.py 8000
```
Then visit `http://localhost:8000/` in any browser.

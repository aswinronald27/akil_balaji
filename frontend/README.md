# IntelliDesk — Smart IT Incident Intelligence Platform
## SUBMISSION 1: Frontend Module (React.js + TypeScript + CSS)

IntelliDesk is an enterprise-grade AI-powered platform that assists IT organizations and SRE teams to identify technical failures, investigate root causes using evidence-grounded RAG, execute controlled remediation procedures, and eliminate repeat troubleshooting through verified knowledge retrieval.

This package fulfills **SUBMISSION 1 – FRONTEND Deliverable (`frontend.zip`)** specified in Section 5 of the IntelliDesk Project Document.

---

### 📦 Deliverable Contents Checklist

| Required Item | Status | Location / Artifact |
|---|:---:|---|
| **Complete React source folder** | ✅ | `src/` (Components, Pages, Layouts, Services, Types, Context, Styles) |
| **All components and pages** | ✅ | `src/components/` & `src/pages/` (All 9 requested views + detailed sub-views) |
| **CSS and assets** | ✅ | `src/styles/` (`theme.css`, `components.css`), `public/`, `src/assets/` |
| **package.json** | ✅ | `package.json` (React 19, TypeScript, Vite, Lucide Icons) |
| **Frontend README** | ✅ | `README.md` (Complete architectural, setup, and submission documentation) |
| **Screenshots of working pages** | ✅ | `screenshots/` (22 high-resolution screenshots covering all workflows & tabs) |

---

## 📸 Screenshots Gallery (`screenshots/`)

All 22 pages and section tabs were rendered and captured in high resolution:

| # | Screenshot File | View / Feature | Key Capabilities Demonstrated |
|---|---|---|---|
| **01** | `01_login_page.png` | **Login Portal** | Clean pure white enterprise authentication with 4 quick demo personas (Incident Commander, Senior SRE, DevOps Lead, Support Engineer). |
| **02** | `02_main_dashboard_triage.png` | **Dashboard: Triage Queue** | Collapsible KPI telemetry bar (Section 12), AI root-cause alert banner, and prioritized incident queue with severity tags. |
| **03** | `03_dashboard_system_health.png` | **Dashboard: System Health** | Live microservice telemetry (latency, error rate, uptime percentage, 99.94% monthly SLA tracker). |
| **04** | `04_dashboard_analytics_trends.png` | **Dashboard: Analytics** | Incident category distribution charts, resolution velocity, and 78% noise reduction metrics (Feature 3). |
| **05** | `05_dashboard_recurring_problems.png` | **Dashboard: Recurring Risks** | Chronic failure pattern detector, 30-day occurrence frequency, and permanent fix tracker. |
| **06** | `06_dashboard_executive_overview.png` | **Dashboard: Executive View** | High-density 2-column layout showing triage, recurring issues, system health, and analytics simultaneously. |
| **07** | `07_incident_intake_create.png` | **Unified Incident Intake** | Multi-channel reporting (Description, Stack Trace, Log File, Webhook) with real-time **AI Classification** and engineer manual override. |
| **08** | `08_incident_management_listing.png` | **Incident Catalog & Queue** | Live data table with multi-dimensional filtering (Status, Priority, Category, Search query) and alert deduplication counters. |
| **09** | `09_incident_details_root_cause.png` | **Investigation: AI Root-Cause** | Grounded RAG analysis for INC-2024-1042: Ranked causes with 94% confidence, supporting log evidence, and controlled recovery actions. |
| **10** | `10_incident_details_timeline.png` | **Investigation: Timeline** | Chronological event timeline with automated detection, engineer assignment, alert escalation, and remediation logs. |
| **11** | `11_incident_details_service_topology.png` | **Investigation: Service Topology** | Interactive microservice dependency graph mapping upstream callers, downstream databases, and blast radius (Feature 9). |
| **12** | `12_incident_details_change_correlation.png` | **Investigation: Deployments** | Deployment & configuration change correlation comparing ArgoCD releases against incident onset (Feature 8). |
| **13** | `13_incident_details_prevention_tasks.png` | **Investigation: Prevention** | Permanent fix tracking modal, action items, assigned engineering teams, due dates, and closure evidence requirements (Feature 14). |
| **14** | `14_log_upload_redaction.png` | **Log Upload & Ingestion** | Drag-and-drop log uploader with automated client-side **Sensitive Data Redaction** (masks passwords, API keys, bearer tokens). |
| **15** | `15_log_analysis_anomaly_spikes.png` | **Log Analysis: Anomaly Spikes** | Error frequency spike chart (88% anomaly index) isolating the 16:39–16:41 UTC connection pool exhaustion burst. |
| **16** | `16_log_analysis_error_stacks.png` | **Log Analysis: Error Clusters** | Deduplicated exception signatures with expandable stack traces and 1-click clipboard copying. |
| **17** | `17_log_analysis_interactive_explorer.png` | **Log Analysis: Log Explorer** | Full syntax-highlighted log stream terminal with log level filters (FATAL, ERROR, WARN, INFO) and inline redaction tags. |
| **18** | `18_log_analysis_security_redaction.png` | **Log Analysis: Redactions** | Compliance audit breakdown of masked credentials (passwords, tokens, internal IPs) fulfilling Section 11.2 security requirements. |
| **19** | `19_ai_root_cause_ranked_causes.png` | **AI Root Cause: Ranked Causes** | Multi-cause diagnosis with probability rankings, uncertainty checklists, and engineer feedback buttons. |
| **20** | `20_ai_root_cause_recovery_actions.png` | **AI Root Cause: Recovery** | Human-in-the-loop controlled automated recovery procedures (restart pooler, scale replicas) with authorization guards. |
| **21** | `21_historical_incident_search.png` | **Historical Incident Search** | Multi-modal vector similarity search matching symptoms, error codes, and descriptions even when wording differs. |
| **22** | `22_knowledge_base_verified_solutions.png` | **Verified Knowledge Base** | Peer-reviewed solution catalog, category tags, helpfulness votes, and interactive **Guided Runbooks** with copyable commands. |

---

## 🎨 Enterprise Design & Sectioned Architecture

In compliance with user requirements:
- **Pure White Background (`#ffffff`)**: Modern, crisp, enterprise IT aesthetic without dark/neon clutter.
- **Sectioned Layout (No Endless Scrolling)**: Pages are divided into clean, organized tabs and segmented pill switchers (`.section-pills`):
  - **Dashboard**: `Active Triage & Priority Queue` | `System & Services Health` | `Incident Analytics & Trends` | `Recurring Problems & Risk` | `Executive Overview (All)`. Includes a collapsible KPI summary strip.
  - **Log Analysis**: `Anomaly & Spike Timeline` | `Error Signatures & Stacks` | `Interactive Log Explorer` | `Security & Redactions` | `Full Dossier (All)`.
  - **AI Root Cause**: `Ranked Probable Causes` | `Controlled Recovery Actions` | `Full Investigation Dossier (All)`.
  - **Incident Workspace**: 7 deep-dive investigation tabs.

---

## 📁 Repository Directory Structure

```text
IntelliDesk/
└── frontend/
    ├── screenshots/                # All 22 captured working page screenshots
    │   ├── 01_login_page.png
    │   ├── 02_main_dashboard_triage.png
    │   ├── ...
    │   └── 22_knowledge_base_verified_solutions.png
    ├── public/
    │   ├── logo.svg
    │   └── favicon.svg
    ├── src/
    │   ├── assets/
    │   │   └── logo.svg
    │   ├── components/
    │   │   ├── common/             # Reusable UI primitives (Badge, Button, Card, Modal, Tabs, etc.)
    │   │   ├── dashboard/          # StatCard, PriorityQueueWidget, SystemHealthWidget, etc.
    │   │   ├── incident/           # IncidentTable, FilterBar, Timeline, DependencyGraph, PreventionModal
    │   │   ├── log/                # LogViewer (with redaction tags), LogAnomaliesChart
    │   │   ├── ai/                 # RootCauseCard, RecoveryActionCard, RecommendationFeedback
    │   │   └── kb/                 # SolutionCard, RunbookViewer
    │   ├── context/
    │   │   ├── AuthContext.tsx     # Session management & live role switching
    │   │   └── ThemeContext.tsx    # Light/Dark theme toggle with localStorage persistence
    │   ├── layouts/
    │   │   ├── MainLayout.tsx      # Main application frame with sticky nav and sidebar
    │   │   ├── Navbar.tsx          # Incident ticker, global actions, user persona switcher
    │   │   ├── Sidebar.tsx         # Collapsible navigation drawer
    │   │   └── Footer.tsx          # Architecture status & mock indicator
    │   ├── pages/
    │   │   ├── LoginPage.tsx
    │   │   ├── DashboardPage.tsx
    │   │   ├── IncidentListPage.tsx
    │   │   ├── IncidentCreatePage.tsx
    │   │   ├── IncidentDetailPage.tsx
    │   │   ├── LogUploadPage.tsx
    │   │   ├── LogAnalysisPage.tsx
    │   │   ├── AiRootCausePage.tsx
    │   │   ├── HistoricalSearchPage.tsx
    │   │   ├── KnowledgeBasePage.tsx
    │   │   └── NotFoundPage.tsx
    │   ├── services/
    │   │   ├── apiClient.ts        # Centralized HTTP client (Mock Mode + FastAPI passthrough)
    │   │   ├── authService.ts      # Authentication & role permissions
    │   │   ├── incidentService.ts  # Incident CRUD & AI classification
    │   │   ├── logService.ts       # Log upload, parsing & secret redaction
    │   │   ├── aiService.ts        # RAG root cause retrieval & controlled actions
    │   │   ├── historicalSearchService.ts # Vector similarity matching
    │   │   ├── knowledgeBaseService.ts    # Solutions & runbook execution
    │   │   ├── systemHealthService.ts     # Telemetry & KPI calculations
    │   │   └── mockData/           # Realistic enterprise mock datasets
    │   ├── styles/
    │   │   ├── theme.css           # Pure white background, design tokens, and color palettes
    │   │   └── components.css      # Component layouts, section pills, tables, and typography
    │   ├── types/
    │   │   └── index.ts            # Complete TypeScript domain contracts
    │   ├── App.tsx                 # Route declarations & top-level providers
    │   ├── index.css
    │   └── main.tsx
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── README.md
```

---

## 🔌 Agreed Backend API Endpoints (FastAPI Contract)

All API communication is isolated in `src/services/` and routed via `apiClient.ts`. The endpoints match the agreed FastAPI backend specifications:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticate user and issue JWT token |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile and roles |
| `GET` | `/api/v1/dashboard/stats` | Fetch aggregate MTTA, MTTR, and queue metrics |
| `GET` | `/api/v1/dashboard/system-health` | Real-time OpenTelemetry service health probes |
| `GET` | `/api/v1/incidents` | List incidents with query filters (`status`, `priority`, `service`, `search`) |
| `POST` | `/api/v1/incidents` | Create an incident via Unified Intake |
| `GET` | `/api/v1/incidents/{id}` | Retrieve incident details, dependencies, and timeline |
| `PATCH`| `/api/v1/incidents/{id}/status` | Transition incident status (New, Investigating, Waiting, Resolved, Reopened) |
| `POST` | `/api/v1/incidents/{id}/prevention-tasks` | Create a permanent fix task (Feature 14) |
| `POST` | `/api/v1/logs/upload` | Ingest log file or raw snippet with redaction |
| `GET` | `/api/v1/logs/{id}/analysis` | Retrieve parsed log anomalies and event timeline |
| `GET` | `/api/v1/ai/root-cause-analysis` | Retrieve grounded RAG causes and recovery actions |
| `POST` | `/api/v1/ai/recommendation-feedback` | Record engineer feedback (useful, unsuccessful, outdated, unsafe) |
| `POST` | `/api/v1/ai/recovery-action/{id}/execute` | Trigger controlled recovery action with sign-off |
| `GET` | `/api/v1/historical/search` | Perform vector similarity search on past incidents |
| `GET` | `/api/v1/knowledge-base/solutions` | Search peer-verified solutions and runbooks |
| `POST` | `/api/v1/knowledge-base/solutions/{id}/vote` | Submit helpfulness vote on verified fix |

### Switching Between Mock Mode and Live Backend
- **Mock Mode (Default)**: Runs 100% in-browser with zero external dependencies. State changes (creating incidents, uploading logs, changing status, submitting feedback) persist in `localStorage` for realistic testing.
- **Connecting to FastAPI Backend**:
  Create an `.env` file in `frontend/`:
  ```bash
  VITE_API_BASE_URL=http://localhost:8000/api/v1
  VITE_USE_MOCK=false
  ```
  `apiClient.ts` will automatically route all requests to the live FastAPI server with Bearer token authentication headers.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js `v18+` or `v20+` (Tested on Node `v24`)
- npm or pnpm or yarn

### Installation
```bash
# Navigate to the frontend directory
cd frontend

# Install project dependencies
npm install
```

### Running Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Building for Production
```bash
npm run build
```
Generates a type-checked, highly-optimized production build in `dist/`.

### Previewing Production Build
```bash
npm run preview
```
Open `http://localhost:4173` in your browser.

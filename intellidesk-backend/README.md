# IntelliDesk Backend API & Fullstack Server

A high-performance Node.js / Express backend tailored specifically for the **IntelliDesk — Smart IT Incident Intelligence Platform** frontend.

This backend implements 100% of the API endpoints, data models, AI heuristics, log sanitization, and real-time incident tracking expected by the IntelliDesk React frontend without needing any frontend modifications.

---

## ⚡ Quick Start

### Windows (One-Click)
Double-click `start.bat`. It will automatically:
1. Verify Node.js
2. Install dependencies (if not already installed)
3. Launch the server on `http://localhost:3000`
4. Open the frontend directly in your default browser

### Manual Start (Any Platform)
```bash
# 1. Install dependencies
npm install

# 2. Start the backend server
npm start
```

Once running:
- **Web Application**: [http://localhost:3000](http://localhost:3000)
- **API Base URL**: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
- **Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 📁 Project Structure

```
intellidesk-backend/
├── package.json               # Node.js project manifest & dependencies
├── server.js                  # Main Express application entrypoint
├── start.bat                  # One-click Windows runner
├── public/                    # Static frontend files served at root (/)
│   ├── index.html             # IntelliDesk React 19 Frontend
│   └── IntelliDesk-Direct.html
└── src/
    ├── data/
    │   ├── initialData.js     # Seed database (Incidents, Services, Users, Solutions)
    │   ├── db.js              # Persistence layer with database.json fallback
    │   └── database.json      # Runtime database file (created automatically)
    ├── routes/
    │   ├── auth.routes.js         # Authentication & user profile endpoints
    │   ├── dashboard.routes.js    # MTTA, MTTR, metrics & service health
    │   ├── incidents.routes.js    # Incident lifecycle, CRUD, AI classifier & tasks
    │   ├── ai.routes.js           # Root cause analysis & recovery actions
    │   ├── logs.routes.js         # Log ingestion, secret redactor & anomaly scoring
    │   ├── historical.routes.js   # Incident similarity search & postmortems
    │   └── knowledgeBase.routes.js# Solutions repository & community voting
    └── utils/
        ├── redactor.js        # Section 11.2 Secret & PII masking utility
        ├── classifier.js      # Heuristic text classifier & auto-tagger
        └── similarity.js      # Jaccard / Cosine token similarity calculator
```

---

## 📡 API Reference (`/api/v1`)

### 1. Authentication (`/api/v1/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticate user by email / role; returns mock JWT and user profile |
| `GET` | `/api/v1/auth/me` | Fetch currently authenticated user profile |

### 2. Dashboard (`/api/v1/dashboard`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/dashboard/stats` | Returns MTTA, MTTR, category distribution, recurring problem patterns, and priority counts |
| `GET` | `/api/v1/dashboard/system-health` | Real-time health metrics across microservices (latency, error rates, uptime) |

### 3. Incidents (`/api/v1/incidents`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/incidents` | List incidents with query filters (`status`, `priority`, `category`, `service`, `search`) |
| `GET` | `/api/v1/incidents/:id` | Get detailed incident by ID with timeline and action items |
| `POST` | `/api/v1/incidents` | Create a new incident with automated AI classification |
| `PATCH`| `/api/v1/incidents/:id/status` | Transition incident status (`Investigating`, `Identified`, `Monitoring`, `Resolved`) |
| `POST` | `/api/v1/incidents/:id/prevention-tasks` | Append architecture prevention task |
| `POST` | `/api/v1/incidents/classify` | AI-assisted incident categorization, priority assignment, and service suggestion |

### 4. AI Diagnostics & Remediation (`/api/v1/ai`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/ai/root-cause-analysis?incidentId=...` | Synthesize or retrieve hypothesis rankings and telemetry anomalies |
| `POST` | `/api/v1/ai/recommendation-feedback` | Record operator feedback (`useful`, `unsuccessful`, `unsafe`) |
| `POST` | `/api/v1/ai/recovery-action/:actionId/execute` | Dispatch approved recovery actions and log verification events |

### 5. Smart Log Analyzer (`/api/v1/logs`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/logs/upload` | Upload logs with automatic PII / credential masking and exception detection |
| `GET` | `/api/v1/logs/:id/analysis` | Retrieve log breakdown and anomaly scores |
| `GET` | `/api/v1/logs/recent` | List recent analyzed log files |

### 6. Historical Incidents (`/api/v1/historical`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/historical/search?q=...` | Similarity search matching current incident symptoms to past postmortems |
| `GET` | `/api/v1/historical/:id` | View postmortem details, resolutions, and timeline |

### 7. Knowledge Base (`/api/v1/knowledge-base`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/knowledge-base/solutions` | Search verified runbooks and solutions |
| `GET` | `/api/v1/knowledge-base/solutions/:id` | View solution code snippets and verification status |
| `POST` | `/api/v1/knowledge-base/solutions/:id/vote` | Upvote or downvote solution usefulness |

---

## 🔒 Security & Data Masking
The backend includes built-in automated redaction before logs or messages are parsed:
- **Bearer Tokens**: Replaced with `Bearer [REDACTED_TOKEN]`
- **API Keys / Secrets**: Replaced with `[REDACTED_KEY]`
- **Passwords**: Replaced with `[REDACTED_PASSWORD]`
- **Payment Card PANs**: Replaced with `[REDACTED_PAN]`
- **JWTs**: Replaced with `[REDACTED_JWT]`
- **SSNs**: Replaced with `[REDACTED_SSN]`

---

## 🚀 Deployment
Can be deployed directly to any container or cloud provider (Render, Railway, Heroku, AWS ECS, Google Cloud Run) by specifying `npm start`.

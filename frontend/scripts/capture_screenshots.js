import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const PAGES = [
  { name: '01_login_page.png', path: '/login', desc: 'Login page with persona switchers' },
  { name: '02_main_dashboard_triage.png', path: '/dashboard?section=triage', desc: 'Main dashboard: Active triage queue & AI alert' },
  { name: '03_dashboard_system_health.png', path: '/dashboard?section=health', desc: 'Main dashboard: Microservice health & SLA metrics' },
  { name: '04_dashboard_analytics_trends.png', path: '/dashboard?section=analytics', desc: 'Main dashboard: Incident distribution & resolution trends' },
  { name: '05_dashboard_recurring_problems.png', path: '/dashboard?section=recurring', desc: 'Main dashboard: Recurring problems detector & risk' },
  { name: '06_dashboard_executive_overview.png', path: '/dashboard?section=all', desc: 'Main dashboard: Executive unified 2-column view' },
  { name: '07_incident_intake_create.png', path: '/incidents/new', desc: 'Unified incident intake with real-time AI classification' },
  { name: '08_incident_management_listing.png', path: '/incidents', desc: 'Incident management catalog with multi-filter bar' },
  { name: '09_incident_details_root_cause.png', path: '/incidents/INC-2024-1042?tab=root_cause', desc: 'Incident investigation: AI root causes & recovery actions' },
  { name: '10_incident_details_timeline.png', path: '/incidents/INC-2024-1042?tab=timeline', desc: 'Incident investigation: Event timeline & audit trail' },
  { name: '11_incident_details_service_topology.png', path: '/incidents/INC-2024-1042?tab=dependencies', desc: 'Incident investigation: Service topology & blast radius' },
  { name: '12_incident_details_change_correlation.png', path: '/incidents/INC-2024-1042?tab=deployments', desc: 'Incident investigation: Deployment change correlation' },
  { name: '13_incident_details_prevention_tasks.png', path: '/incidents/INC-2024-1042?tab=prevention', desc: 'Incident investigation: Permanent prevention tasks' },
  { name: '14_log_upload_redaction.png', path: '/logs/upload', desc: 'Log upload interface with PII & secret redaction' },
  { name: '15_log_analysis_anomaly_spikes.png', path: '/logs/analysis/LOG-2024-9102?section=anomalies', desc: 'Log analysis: Anomaly score & timeline spike chart' },
  { name: '16_log_analysis_error_stacks.png', path: '/logs/analysis/LOG-2024-9102?section=errors', desc: 'Log analysis: Clustered error patterns & stack traces' },
  { name: '17_log_analysis_interactive_explorer.png', path: '/logs/analysis/LOG-2024-9102?section=explorer', desc: 'Log analysis: Interactive log explorer stream' },
  { name: '18_log_analysis_security_redaction.png', path: '/logs/analysis/LOG-2024-9102?section=security', desc: 'Log analysis: Masked secrets & security audit' },
  { name: '19_ai_root_cause_ranked_causes.png', path: '/ai-root-cause?section=causes', desc: 'AI root cause: Ranked probable causes & evidence' },
  { name: '20_ai_root_cause_recovery_actions.png', path: '/ai-root-cause?section=actions', desc: 'AI root cause: Controlled recovery actions' },
  { name: '21_historical_incident_search.png', path: '/historical-search', desc: 'Historical incident vector similarity search' },
  { name: '22_knowledge_base_verified_solutions.png', path: '/knowledge-base', desc: 'Verified solutions & guided runbook library' },
];

function waitForServer(url, timeoutMs = 15000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    function check() {
      http.get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve(true);
        } else {
          retry();
        }
      }).on('error', () => {
        retry();
      });
    }
    function retry() {
      if (Date.now() - startTime > timeoutMs) {
        reject(new Error(`Timeout waiting for server at ${url}`));
      } else {
        setTimeout(check, 300);
      }
    }
    check();
  });
}

async function main() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  console.log('Starting Vite preview server on port', PORT);
  const previewProcess = spawn('cmd.exe', ['/c', 'npm.cmd', 'run', 'preview', '--', '--port', PORT, '--host', '127.0.0.1'], {
    cwd: __dirname,
    stdio: 'ignore',
  });

  try {
    console.log('Waiting for preview server to be ready...');
    await waitForServer(BASE_URL);
    console.log('Server is ready! Capturing screenshots using Edge Headless...\n');

    for (let i = 0; i < PAGES.length; i++) {
      const page = PAGES[i];
      const targetUrl = `${BASE_URL}${page.path}`;
      const outputPath = path.join(SCREENSHOTS_DIR, page.name);

      console.log(`[${i + 1}/${PAGES.length}] Capturing ${page.name} (${page.desc})...`);
      const cmd = `cmd.exe /c ""${EDGE_PATH}" --headless --disable-gpu --no-sandbox --window-size=1440,900 --run-all-compositor-stages-before-draw --virtual-time-budget=2500 "--screenshot=${outputPath}" "${targetUrl}""`;

      try {
        execSync(cmd, { stdio: 'ignore', timeout: 20000 });
        if (fs.existsSync(outputPath)) {
          const stats = fs.statSync(outputPath);
          console.log(`   ✓ Saved: ${page.name} (${(stats.size / 1024).toFixed(1)} KB)`);
        } else {
          console.warn(`   ✗ File not found after execution: ${page.name}`);
        }
      } catch (err) {
        console.error(`   ✗ Error capturing ${page.name}:`, err.message);
      }
    }

    console.log('\nAll screenshots captured successfully!');
  } finally {
    console.log('Terminating preview server...');
    previewProcess.kill();
    try {
      execSync(`cmd.exe /c "for /f "tokens=5" %a in ('netstat -aon ^| findstr :${PORT}') do taskkill /F /PID %a"`, { stdio: 'ignore' });
    } catch {
      // ignore
    }
  }
}

main().catch(err => {
  console.error('Fatal screenshot error:', err);
  process.exit(1);
});

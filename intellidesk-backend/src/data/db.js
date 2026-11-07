const fs = require('fs');
const path = require('path');
const initialData = require('./initialData');
const pgClient = require('./pgClient');

const DB_FILE = path.join(__dirname, 'database.json');

class Database {
  constructor() {
    this.data = {
      users: { ...initialData.DEMO_USERS },
      systemServices: [ ...initialData.SYSTEM_SERVICES ],
      incidents: [ ...initialData.INCIDENTS ],
      rootCauseAnalyses: { ...initialData.ROOT_CAUSE_ANALYSES },
      logAnalyses: { ...initialData.LOG_ANALYSES },
      historicalIncidents: [ ...initialData.HISTORICAL_INCIDENTS ],
      knowledgeBaseSolutions: [ ...initialData.KNOWLEDGE_BASE_SOLUTIONS ]
    };
    this.loadFromDisk();
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        this.data = { ...this.data, ...parsed };
        console.log('[Database] Loaded state from database.json');
      } else {
        this.saveToDisk();
      }
    } catch (err) {
      console.warn('[Database] Could not load database.json, using seed defaults:', err.message);
    }
  }

  saveToDisk() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to write database.json:', err.message);
    }
  }

  // --- Users ---
  getUserByRole(role) {
    return this.data.users[role] || this.data.users["Incident Commander"];
  }

  getUserByEmail(email) {
    return Object.values(this.data.users).find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUsers() {
    return Object.values(this.data.users);
  }

  getAllUsers() {
    return this.data.users;
  }

  // --- System Services ---
  getSystemServices() {
    return this.data.systemServices;
  }

  // --- Incidents ---
  getIncidents(filter = {}) {
    let result = [...this.data.incidents];
    if (filter.status && filter.status !== 'All') {
      result = result.filter(i => i.status.toLowerCase() === filter.status.toLowerCase());
    }
    if (filter.priority && filter.priority !== 'All') {
      result = result.filter(i => i.priority.toUpperCase() === filter.priority.toUpperCase());
    }
    if (filter.category && filter.category !== 'All') {
      result = result.filter(i => i.category.toLowerCase() === filter.category.toLowerCase());
    }
    if (filter.service && filter.service !== 'All') {
      const s = filter.service.toLowerCase();
      result = result.filter(i => (i.affectedService || '').toLowerCase().includes(s));
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(i =>
        (i.id && i.id.toLowerCase().includes(q)) ||
        (i.title && i.title.toLowerCase().includes(q)) ||
        (i.description && i.description.toLowerCase().includes(q)) ||
        (i.affectedService && i.affectedService.toLowerCase().includes(q)) ||
        (i.errorMessage && i.errorMessage.toLowerCase().includes(q))
      );
    }
    return result;
  }

  getIncidentById(id) {
    return this.data.incidents.find(i => i.id === id);
  }

  createIncident(incidentData) {
    const nextNum = 1043 + this.data.incidents.length;
    const year = new Date().getFullYear();
    const newId = incidentData.id || `INC-${year}-${nextNum}`;

    const newIncident = {
      id: newId,
      title: incidentData.title,
      description: incidentData.description,
      errorMessage: incidentData.errorMessage || '',
      category: incidentData.category || 'Application failure',
      priority: incidentData.priority || 'P2',
      status: 'New',
      affectedService: incidentData.affectedService || 'Unassigned Service',
      assignedEngineer: {
        name: incidentData.assignedEngineerName || 'Alex Rivera',
        email: 'a.rivera@enterprise.corp',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      alertCount: incidentData.importedAlertJson ? 5 : 1,
      relatedAlerts: incidentData.importedAlertJson
        ? [
            {
              id: `ALT-${Math.floor(Math.random() * 9000 + 1000)}`,
              name: 'ImportedMonitoringAlert',
              source: 'Datadog',
              severity: incidentData.priority === 'P1' ? 'critical' : 'warning',
              timestamp: new Date().toISOString(),
              message: incidentData.description,
              service: incidentData.affectedService,
              rawPayload: incidentData.importedAlertJson
            }
          ]
        : [],
      timeline: [
        {
          id: `TL-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'status_change',
          title: `Incident ${newId} Created`,
          description: `Reported via Unified Incident Intake. Initial triage priority ${incidentData.priority || 'P2'}.`,
          author: incidentData.assignedEngineerName || 'IntelliDesk Intake Engine'
        }
      ],
      serviceDependencies: [
        {
          id: 'srv-primary',
          name: incidentData.affectedService || 'Primary Service',
          type: 'service',
          status: (incidentData.priority === 'P1') ? 'failing' : 'degraded',
          latencyMs: 1200,
          errorRate: '15.4%',
          dependencies: ['srv-backend-dep']
        },
        {
          id: 'srv-backend-dep',
          name: 'Core Cluster Dependencies',
          type: 'database',
          status: 'healthy',
          latencyMs: 8.5,
          errorRate: '0.01%',
          dependencies: []
        }
      ],
      recentDeployments: [],
      logSnippet: incidentData.logSnippet || '',
      preventionTasks: [],
      suggestedByAI: true,
      aiClassificationConfidence: 92
    };

    this.data.incidents.unshift(newIncident);
    this.saveToDisk();
    return newIncident;
  }

  updateIncidentStatus(id, newStatus) {
    const incident = this.getIncidentById(id);
    if (!incident) return null;

    const oldStatus = incident.status;
    incident.status = newStatus;
    incident.updatedAt = new Date().toISOString();
    if (newStatus === 'Resolved') {
      incident.resolvedAt = new Date().toISOString();
    }

    incident.timeline.unshift({
      id: `TL-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'status_change',
      title: `Status changed to ${newStatus}`,
      description: `Incident moved from ${oldStatus} to ${newStatus}.`,
      author: 'Operations Engineer'
    });

    this.saveToDisk();
    return incident;
  }

  addPreventionTask(incidentId, task) {
    const incident = this.getIncidentById(incidentId);
    if (!incident) return null;

    const newTask = {
      id: `PREV-${Math.floor(Math.random() * 900 + 100)}`,
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      priority: task.priority || 'P2',
      dueDate: task.dueDate,
      status: task.status || 'pending',
      evidenceRequired: task.evidenceRequired || ''
    };

    if (!incident.preventionTasks) {
      incident.preventionTasks = [];
    }
    incident.preventionTasks.push(newTask);
    this.saveToDisk();
    return newTask;
  }

  // --- RCA ---
  getRootCauseAnalysis(incidentId) {
    if (this.data.rootCauseAnalyses[incidentId]) {
      return this.data.rootCauseAnalyses[incidentId];
    }

    // Dynamic generation fallback if not predefined
    const fallbackRca = {
      id: `RCA-${incidentId}`,
      incidentId: incidentId,
      generatedAt: new Date().toISOString(),
      summary: `Automated retrieval-augmented diagnostic for incident ${incidentId}. Correlated metrics, alert timelines, and runtime logs indicate service degradation or resource starvation.`,
      rankedCauses: [
        {
          id: `cause-${incidentId}-1`,
          rank: 1,
          cause: "Upstream network packet loss and TCP handshake retry exhaustion",
          confidence: 88,
          evidence: [
            "Log entries indicate socket connection timeout after 30000ms threshold.",
            "Telemetry points to 40% packet drops between worker pods and gateway."
          ],
          missingInfo: ["TCP dump capture from affected node interface eth0."],
          recommendedChecks: [
            "Check Calico / Cilium CNI pod networking health.",
            "Inspect AWS VPC NAT Gateway metrics."
          ]
        },
        {
          id: `cause-${incidentId}-2`,
          rank: 2,
          cause: "Resource saturation in underlying JVM thread executor queue",
          confidence: 62,
          evidence: ["Thread count approached 90% of maxThreads capacity."],
          missingInfo: ["Thread dump analysis during peak incident window."],
          recommendedChecks: ["Inspect JMX thread pool metrics in Grafana."]
        }
      ],
      recoveryActions: [
        {
          id: `ACT-${incidentId}-01`,
          title: "Restart Degraded Worker Pods with Graceful Draining",
          riskLevel: "low",
          requiresApproval: false,
          automatedAvailable: true,
          description: "Drain active HTTP connections over 15s and trigger Kubernetes rolling pod replacement.",
          status: "pending"
        }
      ]
    };

    this.data.rootCauseAnalyses[incidentId] = fallbackRca;
    this.saveToDisk();
    return fallbackRca;
  }

  saveRootCauseAnalysis(rca) {
    if (rca && rca.incidentId) {
      this.data.rootCauseAnalyses[rca.incidentId] = rca;
      this.saveToDisk();
      return rca;
    }
    return null;
  }

  submitRcaFeedback(incidentId, causeId, feedback, notes) {
    const rca = this.getRootCauseAnalysis(incidentId);
    if (!rca) return null;

    const cause = rca.rankedCauses.find(c => c.id === causeId);
    if (cause) {
      cause.userFeedback = feedback;
      cause.feedbackNotes = notes;
      this.saveToDisk();
      return cause;
    }
    return null;
  }

  executeRecoveryAction(incidentId, actionId, approverName) {
    const rca = this.getRootCauseAnalysis(incidentId);
    if (!rca) return null;

    const action = rca.recoveryActions.find(a => a.id === actionId);
    if (action) {
      action.status = 'completed';
      action.executedBy = approverName || 'Incident Commander';
      action.executedAt = new Date().toISOString();
      action.resultMessage = 'Successfully executed recovery action. Telemetry verified healthy response.';
      this.saveToDisk();
      return action;
    }
    return null;
  }

  // --- Logs ---
  getLogAnalysis(id) {
    return this.data.logAnalyses[id] || this.data.logAnalyses["LOG-ANALYSIS-2024-889"];
  }

  saveLogAnalysis(analysis) {
    this.data.logAnalyses[analysis.id] = analysis;
    this.saveToDisk();
    return analysis;
  }

  getAllLogAnalyses() {
    return Object.values(this.data.logAnalyses);
  }

  // --- Historical ---
  getHistoricalIncidents() {
    return this.data.historicalIncidents;
  }

  getHistoricalById(id) {
    return this.data.historicalIncidents.find(h => h.id === id || h.incidentId === id);
  }

  // --- Knowledge Base ---
  getSolutions(category, query) {
    let result = [...this.data.knowledgeBaseSolutions];
    if (category && category !== 'All') {
      result = result.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }
    if (query) {
      const q = query.toLowerCase().trim();
      result = result.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.rootCause.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q)) ||
        s.targetSystems.some(t => t.toLowerCase().includes(q)) ||
        s.solutionSteps.some(step => step.toLowerCase().includes(q))
      );
    }
    return result;
  }

  getSolutionById(id) {
    return this.data.knowledgeBaseSolutions.find(s => s.id === id);
  }

  voteSolution(id) {
    const sol = this.getSolutionById(id);
    if (!sol) return null;

    const alreadyVoted = !!sol.userVoted;
    sol.userVoted = !alreadyVoted;
    sol.helpfulVotes = alreadyVoted ? sol.helpfulVotes - 1 : sol.helpfulVotes + 1;
    this.saveToDisk();
    return sol;
  }

  // Aliases for compatibility
  getKnowledgeBaseSolutions(category, query) {
    return this.getSolutions(category, query);
  }

  getKnowledgeBaseSolutionById(id) {
    return this.getSolutionById(id);
  }

  updateKnowledgeBaseSolution(id, updates) {
    const sol = this.getSolutionById(id);
    if (!sol) return null;
    Object.assign(sol, updates);
    this.saveToDisk();
    return sol;
  }

  getHistorical(query, service, minSimilarity) {
    let result = [...this.data.historicalIncidents];
    if (service && service !== 'all') {
      result = result.filter(h => h.service.toLowerCase() === service.toLowerCase());
    }
    return result;
  }

  getHistoricalIncidentById(id) {
    return this.getHistoricalById(id);
  }
}

module.exports = new Database();

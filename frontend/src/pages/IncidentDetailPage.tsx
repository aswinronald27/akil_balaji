import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  GitCommit,
  Network,
  Clock,
  Layers,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { Incident, IncidentStatus, PreventionTask, RootCauseAnalysis } from '../types';
import { incidentService } from '../services/incidentService';
import { aiService } from '../services/aiService';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Tabs, TabItem } from '../components/common/Tabs';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { IncidentTimeline } from '../components/incident/IncidentTimeline';
import { RelatedAlertsList } from '../components/incident/RelatedAlertsList';
import { ServiceDependencyGraph } from '../components/incident/ServiceDependencyGraph';
import { RootCauseCard } from '../components/ai/RootCauseCard';
import { RecoveryActionCard } from '../components/ai/RecoveryActionCard';
import { PreventionTaskModal } from '../components/incident/PreventionTaskModal';
import { useAuth } from '../context/AuthContext';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [rca, setRca] = useState<RootCauseAnalysis | null>(null);
  const initialTab = searchParams.get('tab') || 'root_cause';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isPreventionModalOpen, setIsPreventionModalOpen] = useState(false);

  const fetchIncidentData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const inc = await incidentService.getIncidentById(id);
      setIncident(inc);
      const rcaData = await aiService.getRootCauseAnalysis(id);
      setRca(rcaData);
    } catch {
      // If specific id fails, fallback to first incident
      const list = await incidentService.getIncidents();
      if (list.length > 0) {
        setIncident(list[0]);
        const rcaData = await aiService.getRootCauseAnalysis(list[0].id);
        setRca(rcaData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentData();
  }, [id]);

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    if (!incident) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await incidentService.updateIncidentStatus(incident.id, newStatus);
      setIncident(updated);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleFeedback = async (
    causeId: string,
    feedback: 'useful' | 'unsuccessful' | 'outdated' | 'unsafe',
    notes?: string
  ) => {
    if (!incident) return;
    await aiService.submitFeedback(incident.id, causeId, feedback, notes);
    const updatedRca = await aiService.getRootCauseAnalysis(incident.id);
    setRca(updatedRca);
  };

  const handleExecuteRecoveryAction = async (actionId: string, approverName: string) => {
    if (!incident) return;
    await aiService.executeRecoveryAction(incident.id, actionId, approverName);
    const updatedRca = await aiService.getRootCauseAnalysis(incident.id);
    setRca(updatedRca);
  };

  const handleAddPreventionTask = async (task: Omit<PreventionTask, 'id'>) => {
    if (!incident) return;
    await incidentService.addPreventionTask(incident.id, task);
    const refreshed = await incidentService.getIncidentById(incident.id);
    setIncident(refreshed);
  };

  if (isLoading || !incident) {
    return <LoadingSpinner message="Aggregating incident relationships & root cause diagnostics..." />;
  }

  const tabs: TabItem[] = [
    { id: 'root_cause', label: 'AI Root-Cause & Fixes', icon: <Sparkles size={15} />, count: rca?.rankedCauses.length },
    { id: 'timeline', label: 'Event Timeline', icon: <Clock size={15} />, count: incident.timeline.length },
    { id: 'alerts', label: 'Grouped Alerts', icon: <Layers size={15} />, count: incident.relatedAlerts.length || incident.alertCount },
    { id: 'dependencies', label: 'Service Topology', icon: <Network size={15} />, count: incident.serviceDependencies.length },
    { id: 'deployments', label: 'Change Correlations', icon: <GitCommit size={15} />, count: incident.recentDeployments.length },
    { id: 'logs', label: 'Attached Logs', icon: <FileText size={15} /> },
    { id: 'prevention', label: 'Permanent Prevention', icon: <ShieldCheck size={15} />, count: incident.preventionTasks.length },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Back button & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/incidents')}
          style={{ paddingLeft: 0 }}
        >
          <ArrowLeft size={16} />
          <span>Back to Incident Queue</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Status Transition:</span>
          <select
            className="form-select"
            style={{ width: 'auto', height: 34, fontSize: 13, fontWeight: 600 }}
            value={incident.status}
            disabled={isUpdatingStatus}
            onChange={e => handleStatusChange(e.target.value as IncidentStatus)}
          >
            <option value="New">New</option>
            <option value="Investigating">Investigating</option>
            <option value="Waiting">Waiting</option>
            <option value="Resolved">Resolved</option>
            <option value="Reopened">Reopened</option>
          </select>
        </div>
      </div>

      {/* Incident Header Card */}
      <div
        className="card"
        style={{
          padding: '24px 28px',
          borderLeft: incident.priority === 'P1' ? '4px solid var(--p1-color)' : '4px solid var(--p2-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <Badge priority={incident.priority} />
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
            {incident.id}
          </span>
          <Badge status={incident.status} />
          <span
            style={{
              fontSize: 12,
              padding: '2px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            {incident.affectedService}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Category: <strong style={{ color: 'var(--text-primary)' }}>{incident.category}</strong>
          </span>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.4 }}>
          {incident.title}
        </h1>

        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
          {incident.description}
        </p>

        {incident.errorMessage && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#060911',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'monospace',
              fontSize: 12,
              color: '#f87171',
              overflowX: 'auto',
              marginBottom: 16,
            }}
          >
            {incident.errorMessage}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            paddingTop: 14,
            borderTop: '1px solid var(--border-subtle)',
            fontSize: 12.5,
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div>
              Assigned: <strong style={{ color: 'var(--text-primary)' }}>{incident.assignedEngineer?.name}</strong>
            </div>
            <div>
              Created:{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
              </strong>
            </div>
            <div>
              Grouped Alerts: <strong style={{ color: 'var(--accent-cyan)' }}>{incident.alertCount} events</strong>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/historical-search?service=${encodeURIComponent(incident.affectedService)}`)}
            icon={<Sparkles size={14} style={{ color: 'var(--accent-purple)' }} />}
          >
            Find Similar Past Incidents
          </Button>
        </div>
      </div>

      {/* Investigation Workspace Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabId) => {
          setActiveTab(tabId);
          setSearchParams({ tab: tabId });
        }}
      />

      {/* Tab 1: AI Root Cause Recommendations & Recovery Actions */}
      {activeTab === 'root_cause' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {rca?.summary && (
            <div
              style={{
                padding: '16px 20px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <Sparkles size={18} style={{ color: '#2563eb', marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a8a', marginBottom: 4 }}>
                  Root-Cause Diagnostic Summary
                </div>
                <div style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.5 }}>
                  {rca.summary}
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
              Ranked Probable Root Causes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {rca?.rankedCauses.map(cause => (
                <RootCauseCard key={cause.id} cause={cause} onFeedback={handleFeedback} />
              ))}
            </div>
          </div>

          {/* Controlled Recovery Actions (Feature 13) */}
          {rca?.recoveryActions && rca.recoveryActions.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Controlled Automated Recovery Actions (Feature 13)
                </h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Separated from AI generation layer to ensure human authorization
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {rca.recoveryActions.map(action => (
                  <RecoveryActionCard
                    key={action.id}
                    action={action}
                    onExecute={handleExecuteRecoveryAction}
                    currentUserRole={user?.role || 'Incident Commander'}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Timeline */}
      {activeTab === 'timeline' && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            Incident Event Timeline & Audit Trail
          </div>
          <IncidentTimeline events={incident.timeline} />
        </div>
      )}

      {/* Tab 3: Grouped Alerts */}
      {activeTab === 'alerts' && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            Duplicate & Related Monitoring Alerts (Feature 3)
          </div>
          <RelatedAlertsList alerts={incident.relatedAlerts} />
        </div>
      )}

      {/* Tab 4: Service Dependency Map */}
      {activeTab === 'dependencies' && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            Service Topology & Impact Propagation (Feature 9)
          </div>
          <ServiceDependencyGraph nodes={incident.serviceDependencies} />
        </div>
      )}

      {/* Tab 5: Deployment & Change Correlation */}
      {activeTab === 'deployments' && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Deployment & Configuration Change Correlation (Feature 8)
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Comparing incident onset timeline against ArgoCD, Kubernetes, and database migration release histories.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {incident.recentDeployments.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
                No deployments detected within the 2-hour pre-incident window.
              </div>
            ) : (
              incident.recentDeployments.map(dep => (
                <div
                  key={dep.id}
                  style={{
                    padding: '16px 18px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: dep.correlationRisk === 'high' ? '1px solid var(--p1-border)' : '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <GitCommit size={18} style={{ color: dep.correlationRisk === 'high' ? 'var(--p1-color)' : 'var(--accent-purple)' }} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {dep.service} ({dep.version})
                      </span>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>
                        {dep.commitSha}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: dep.correlationRisk === 'high' ? 'var(--p1-bg)' : 'var(--p4-bg)',
                        color: dep.correlationRisk === 'high' ? 'var(--p1-color)' : 'var(--p4-color)',
                      }}
                    >
                      {dep.correlationRisk.toUpperCase()} CORRELATION RISK
                    </span>
                  </div>

                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    {dep.commitMessage}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    {dep.diffSummary} • Deployed at {new Date(dep.deployedAt).toLocaleTimeString()} UTC by {dep.author}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Attached Logs */}
      {activeTab === 'logs' && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              Captured Stack Trace & Log Context
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/logs/analysis')}
              iconRight={<ExternalLink size={13} />}
            >
              Open Full Log Analyzer
            </Button>
          </div>

          <pre
            style={{
              padding: 16,
              backgroundColor: '#060911',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #1e293b',
              color: '#38bdf8',
              fontSize: 12,
              lineHeight: 1.6,
              overflowX: 'auto',
            }}
          >
            {incident.logSnippet || 'No direct log file attached to this incident. Use Log Intelligence to ingest logs.'}
          </pre>
        </div>
      )}

      {/* Tab 7: Permanent Prevention Tasks (Feature 14) */}
      {activeTab === 'prevention' && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                Permanent Fix Tracking (Feature 14)
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                Prevent recurring failures by binding engineering action items, assigned teams, and required closure evidence.
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPreventionModalOpen(true)}
              icon={<PlusCircle size={14} />}
            >
              Add Prevention Task
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {incident.preventionTasks.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                No prevention tasks created yet. Click "Add Prevention Task" to assign permanent corrective action.
              </div>
            ) : (
              incident.preventionTasks.map(task => (
                <div
                  key={task.id}
                  style={{
                    padding: '16px 18px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {task.id}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {task.title}
                      </span>
                    </div>
                    <Badge priority={task.priority} />
                  </div>

                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {task.description}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 8,
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      fontSize: 12,
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>Assignee: <strong style={{ color: 'var(--text-primary)' }}>{task.assignee}</strong></span>
                    <span>Due: <strong style={{ color: 'var(--p2-color)' }}>{task.dueDate}</strong></span>
                    <span>Status: <strong style={{ color: 'var(--status-investigating)' }}>{task.status.toUpperCase()}</strong></span>
                  </div>

                  {task.evidenceRequired && (
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)', padding: '6px 10px', borderRadius: 4 }}>
                      Evidence Required for Closure: <span style={{ color: 'var(--text-secondary)' }}>{task.evidenceRequired}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Prevention Task Modal */}
      <PreventionTaskModal
        isOpen={isPreventionModalOpen}
        onClose={() => setIsPreventionModalOpen(false)}
        onSubmit={handleAddPreventionTask}
        incidentId={incident.id}
      />
    </div>
  );
};

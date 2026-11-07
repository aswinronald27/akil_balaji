import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Terminal,
  Upload,
  Radio,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { IncidentCategory, Priority } from '../types';
import { incidentService, AIClassificationResult } from '../services/incidentService';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

type IntakeMode = 'manual' | 'error_paste' | 'log_file' | 'monitoring_import';

export const IncidentCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const [intakeMode, setIntakeMode] = useState<IntakeMode>('manual');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [affectedService, setAffectedService] = useState('Billing Service');
  const [assignedEngineerName, setAssignedEngineerName] = useState('Alex Rivera');

  // AI Classification suggestion state (Feature 2)
  const [aiSuggestion, setAiSuggestion] = useState<AIClassificationResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [category, setCategory] = useState<IncidentCategory>('Database error');
  const [priority, setPriority] = useState<Priority>('P1');

  // Form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trigger real-time AI classification when description or error message changes
  const runAiClassification = async (text: string) => {
    if (!text || text.length < 15) return;
    setIsClassifying(true);
    try {
      const result = await incidentService.classifyIncidentText(text);
      setAiSuggestion(result);
      if (!isManualOverride) {
        setCategory(result.suggestedCategory);
        setPriority(result.suggestedPriority);
      }
    } finally {
      setIsClassifying(false);
    }
  };

  const handleDescriptionBlur = () => {
    runAiClassification(`${title} ${description} ${errorMessage}`);
  };

  const handleApplyPreset = (preset: {
    title: string;
    desc: string;
    err: string;
    service: string;
  }) => {
    setTitle(preset.title);
    setDescription(preset.desc);
    setErrorMessage(preset.err);
    setAffectedService(preset.service);
    runAiClassification(`${preset.title} ${preset.desc} ${preset.err}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsSubmitting(true);
    try {
      const created = await incidentService.createIncident({
        title,
        description,
        errorMessage,
        category,
        priority,
        affectedService,
        assignedEngineerName,
      });
      navigate(`/incidents/${created.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Unified Incident Intake
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          Feature 1 & 2: Report an IT incident via problem description, stack trace, log file, or monitoring alert with real-time AI classification.
        </p>
      </div>

      {/* Intake Method Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
        }}
      >
        {[
          {
            id: 'manual',
            label: '1. Problem Description',
            desc: 'Form fields & observations',
            icon: <FileText size={18} />,
          },
          {
            id: 'error_paste',
            label: '2. Stack Trace / Error',
            desc: 'Direct exception logs',
            icon: <Terminal size={18} />,
          },
          {
            id: 'log_file',
            label: '3. Upload Log File',
            desc: '.log, .txt, .json crash dump',
            icon: <Upload size={18} />,
          },
          {
            id: 'monitoring_import',
            label: '4. Monitoring Webhook',
            desc: 'Datadog / Prometheus payload',
            icon: <Radio size={18} />,
          },
        ].map(tab => {
          const isActive = intakeMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setIntakeMode(tab.id as IntakeMode)}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-lg)',
                border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'var(--bg-surface)',
                color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13.5 }}>
                {tab.icon}
                <span>{tab.label}</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tab.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Fast Scenario Presets */}
      <div
        style={{
          padding: '12px 18px',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>
          Quick Triage Scenarios:
        </span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handleApplyPreset({
                title: 'PostgreSQL connection timeout during batch invoicing',
                desc: 'Client connection pool exhausted. Active connections 500/500.',
                err: 'PSQLException: FATAL: 53300: remaining connection slots are reserved for non-replication superuser connections',
                service: 'Billing Service',
              })
            }
          >
            Database Pool Exhaustion
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handleApplyPreset({
                title: 'Stripe webhook 504 gateway timeout on customer checkout',
                desc: 'Downstream payment processor latency escalated to 24s causing queue deadlock.',
                err: 'HTTP 504 Gateway Timeout: POST https://api.stripe-mock.internal/v1/charges',
                service: 'Payment Gateway',
              })
            }
          >
            Payment 504 Timeout
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handleApplyPreset({
                title: 'Redis OOM key eviction cascade in auth session store',
                desc: 'Maxmemory 16GB reached on redis-prod-02. Sessions evicted abruptly.',
                err: 'OOM command not allowed when used memory > maxmemory',
                service: 'Auth Service',
              })
            }
          >
            Redis Session OOM
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24 }}>
        {/* Form Fields */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <div className="form-group">
              <label className="form-label">Incident Title *</label>
              <input
                type="text"
                className="input-text"
                required
                placeholder="Brief summary of failure (e.g. Database connection timed out on checkout)"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={handleDescriptionBlur}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Affected Service / Component *</label>
              <select
                className="form-select"
                value={affectedService}
                onChange={e => setAffectedService(e.target.value)}
              >
                <option value="Billing Service">Billing Service</option>
                <option value="Payment Gateway">Payment Gateway</option>
                <option value="Auth Service">Auth Service</option>
                <option value="Order Service">Order Service</option>
                <option value="API Gateway">API Gateway</option>
                <option value="Telemetry Pipeline">Telemetry Pipeline</option>
                <option value="Kubernetes Cluster">Kubernetes Cluster</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Problem Description & Observed Symptoms *</label>
              <textarea
                className="form-textarea"
                rows={4}
                required
                placeholder="What is failing? What are users or downstream microservices experiencing? Any recent deployments?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Error Message or Stack Trace (Optional)</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Auto-analyzed by AI</span>
              </label>
              <textarea
                className="form-textarea"
                style={{ fontFamily: 'monospace', fontSize: 12.5 }}
                rows={4}
                placeholder="Paste raw error message, exception stack trace, or HTTP status error..."
                value={errorMessage}
                onChange={e => setErrorMessage(e.target.value)}
                onBlur={handleDescriptionBlur}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Assigned Incident Commander / Engineer</label>
              <input
                type="text"
                className="input-text"
                value={assignedEngineerName}
                onChange={e => setAssignedEngineerName(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            iconRight={<ArrowRight size={16} />}
          >
            Create Incident & Begin AI Investigation
          </Button>
        </form>

        {/* AI Auto-Classification & Triage Preview (Feature 2) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            className="card"
            style={{
              padding: 24,
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  AI Suggested Classification
                </span>
              </div>
              {aiSuggestion && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--status-resolved-bg)',
                    color: 'var(--status-resolved)',
                  }}
                >
                  {aiSuggestion.confidenceScore}% confidence
                </span>
              )}
            </div>

            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
              IntelliDesk analyzes description semantics, error codes, and service metadata to categorize the incident and assign initial priority.
            </p>

            {aiSuggestion ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div
                  style={{
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Suggested Category
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-cyan)', marginTop: 2 }}>
                    {aiSuggestion.suggestedCategory}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {aiSuggestion.reasoning}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Priority</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--p1-color)', marginTop: 2 }}>
                      {aiSuggestion.suggestedPriority} - Urgent
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Responsible Team</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                      {aiSuggestion.suggestedTeam}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: 24,
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                }}
              >
                Type a problem description or choose a scenario preset to generate AI classification.
              </div>
            )}

            {/* Engineer Override Toggle */}
            <div
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Engineer Manual Override
                </span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', color: 'var(--accent-cyan)' }}>
                  <input
                    type="checkbox"
                    checked={isManualOverride}
                    onChange={e => setIsManualOverride(e.target.checked)}
                  />
                  Enable Override
                </label>
              </div>

              {isManualOverride && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={e => setCategory(e.target.value as IncidentCategory)}
                    >
                      <option value="Database error">Database error</option>
                      <option value="Application failure">Application failure</option>
                      <option value="Cloud service problem">Cloud service problem</option>
                      <option value="Network issue">Network issue</option>
                      <option value="Deployment failure">Deployment failure</option>
                      <option value="Authentication or access problem">Authentication or access problem</option>
                      <option value="Server performance issue">Server performance issue</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={priority}
                      onChange={e => setPriority(e.target.value as Priority)}
                    >
                      <option value="P1">P1 - Critical</option>
                      <option value="P2">P2 - High</option>
                      <option value="P3">P3 - Medium</option>
                      <option value="P4">P4 - Low</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

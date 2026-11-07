import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Layers,
  ArrowRight,
  Terminal,
  Activity,
  ListFilter,
} from 'lucide-react';
import { Incident, RootCauseAnalysis } from '../types';
import { incidentService } from '../services/incidentService';
import { aiService } from '../services/aiService';
import { RootCauseCard } from '../components/ai/RootCauseCard';
import { RecoveryActionCard } from '../components/ai/RecoveryActionCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

type RcaSection = 'causes' | 'actions' | 'all';

export const AiRootCausePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    searchParams.get('incidentId') || 'INC-2024-1042'
  );
  const [rca, setRca] = useState<RootCauseAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialSection = (searchParams.get('section') as RcaSection) || 'causes';
  const [activeSection, setActiveSection] = useState<RcaSection>(initialSection);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const incList = await incidentService.getIncidents();
        setIncidents(incList);
        const targetId = selectedIncidentId || incList[0]?.id || 'INC-2024-1042';
        setSelectedIncidentId(targetId);
        const analysis = await aiService.getRootCauseAnalysis(targetId);
        setRca(analysis);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleIncidentChange = async (incId: string) => {
    setSelectedIncidentId(incId);
    setSearchParams({ incidentId: incId });
    setIsLoading(true);
    try {
      const analysis = await aiService.getRootCauseAnalysis(incId);
      setRca(analysis);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (
    causeId: string,
    feedback: 'useful' | 'unsuccessful' | 'outdated' | 'unsafe',
    notes?: string
  ) => {
    if (!rca) return;
    await aiService.submitFeedback(rca.incidentId, causeId, feedback, notes);
    const updated = await aiService.getRootCauseAnalysis(rca.incidentId);
    setRca(updated);
  };

  const handleExecuteRecovery = async (actionId: string, approverName: string) => {
    if (!rca) return;
    await aiService.executeRecoveryAction(rca.incidentId, actionId, approverName);
    const updated = await aiService.getRootCauseAnalysis(rca.incidentId);
    setRca(updated);
  };

  const currentIncident = incidents.find(i => i.id === selectedIncidentId);

  const sections: { id: RcaSection; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'causes',
      label: 'Ranked Probable Causes',
      icon: <Sparkles size={15} />,
      badge: rca?.rankedCauses.length,
    },
    {
      id: 'actions',
      label: 'Controlled Recovery Actions',
      icon: <ShieldCheck size={15} />,
      badge: rca?.recoveryActions?.length || 0,
    },
    {
      id: 'all',
      label: 'Full Investigation Dossier (All)',
      icon: <Layers size={15} />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          paddingBottom: 4,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            AI Root-Cause Recommendations
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Correlating runtime logs, deployment history, and historical incidents with confidence scoring.
          </p>
        </div>

        {/* Incident Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Target Incident:</span>
          <select
            className="form-select"
            style={{ width: 'auto', height: 38, fontSize: 13, fontWeight: 600 }}
            value={selectedIncidentId}
            onChange={e => handleIncidentChange(e.target.value)}
          >
            {incidents.map(inc => (
              <option key={inc.id} value={inc.id}>
                {inc.id} ({inc.priority}) - {inc.affectedService}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Incident Context Banner */}
      {currentIncident && (
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
                {currentIncident.id}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentIncident.title}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Service: {currentIncident.affectedService} • Category: {currentIncident.category} • Priority: {currentIncident.priority}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/incidents/${currentIncident.id}`)}
            iconRight={<ArrowRight size={13} />}
          >
            View Incident Workspace
          </Button>
        </div>
      )}

      {isLoading || !rca ? (
        <LoadingSpinner message="Consulting vector database & computing root-cause probabilities..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Diagnostic Summary Callout */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              <Sparkles size={18} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1e3a8a' }}>
                  Root-Cause Diagnostic Summary
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '1px 7px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--status-resolved-bg)',
                    color: 'var(--status-resolved)',
                  }}
                >
                  Evidence Verified
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.5 }}>
                {rca.summary}
              </p>
            </div>
          </div>

          {/* Section Segmented Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div className="section-pills">
              {sections.map(sec => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    className={`section-pill-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveSection(sec.id)}
                  >
                    <span>{sec.icon}</span>
                    <span>{sec.label}</span>
                    {sec.badge !== undefined && (
                      <span
                        style={{
                          fontSize: 11,
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-tertiary)',
                          color: isActive ? '#ffffff' : 'var(--text-secondary)',
                          fontWeight: 600,
                        }}
                      >
                        {sec.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Viewing: <strong>{sections.find(s => s.id === activeSection)?.label}</strong>
            </span>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 1: PROBABLE CAUSES                                                */}
          {/* ========================================================================= */}
          {activeSection === 'causes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Ranked Probable Causes with Confidence Scoring (Feature 6)
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Showing supporting evidence, uncertainty factors, and verification steps
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {rca.rankedCauses.map(cause => (
                  <RootCauseCard key={cause.id} cause={cause} onFeedback={handleFeedback} />
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 2: CONTROLLED RECOVERY ACTIONS                                    */}
          {/* ========================================================================= */}
          {activeSection === 'actions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={20} style={{ color: 'var(--status-resolved)' }} />
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Controlled Automated Recovery Actions (Feature 13)
                  </h2>
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
                  Predefined, auditable remediation procedures with human authorization safeguards for production systems.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {rca.recoveryActions?.map(action => (
                  <RecoveryActionCard
                    key={action.id}
                    action={action}
                    onExecute={handleExecuteRecovery}
                    currentUserRole={user?.role || 'Incident Commander'}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 3: FULL DOSSIER                                                   */}
          {/* ========================================================================= */}
          {activeSection === 'all' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                  Ranked Probable Causes
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {rca.rankedCauses.map(cause => (
                    <RootCauseCard key={cause.id} cause={cause} onFeedback={handleFeedback} />
                  ))}
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                  Recovery Actions
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {rca.recoveryActions?.map(action => (
                    <RecoveryActionCard
                      key={action.id}
                      action={action}
                      onExecute={handleExecuteRecovery}
                      currentUserRole={user?.role || 'Incident Commander'}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

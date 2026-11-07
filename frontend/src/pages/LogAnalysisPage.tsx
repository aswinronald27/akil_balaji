import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Check,
  Lock,
  Layers,
  Activity,
  ListFilter,
} from 'lucide-react';
import { LogAnalysis } from '../types';
import { logService } from '../services/logService';
import { LogViewer } from '../components/log/LogViewer';
import { LogAnomaliesChart } from '../components/log/LogAnomaliesChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';

type LogSection = 'anomalies' | 'errors' | 'explorer' | 'security' | 'all';

export const LogAnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [analysis, setAnalysis] = useState<LogAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialSection = (searchParams.get('section') as LogSection) || 'anomalies';
  const [activeSection, setActiveSection] = useState<LogSection>(initialSection);
  const [expandedErrorIndex, setExpandedErrorIndex] = useState<number | null>(0);
  const [copiedTraceIdx, setCopiedTraceIdx] = useState<number | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      try {
        const data = await logService.getLogAnalysis(id || 'default');
        setAnalysis(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  const handleCopyTrace = (trace: string, idx: number) => {
    navigator.clipboard.writeText(trace);
    setCopiedTraceIdx(idx);
    setTimeout(() => setCopiedTraceIdx(null), 2000);
  };

  if (isLoading || !analysis) {
    return <LoadingSpinner message="Extracting timestamp clusters, exceptions, and anomalies..." />;
  }

  const sections: { id: LogSection; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'anomalies',
      label: 'Anomaly & Spike Timeline',
      icon: <TrendingUp size={15} />,
      badge: `${analysis.anomalyScore}%`,
    },
    {
      id: 'errors',
      label: 'Error Signatures & Stacks',
      icon: <AlertTriangle size={15} />,
      badge: analysis.topErrors.length,
    },
    {
      id: 'explorer',
      label: 'Interactive Log Explorer',
      icon: <FileText size={15} />,
      badge: `${analysis.totalLines} lines`,
    },
    {
      id: 'security',
      label: 'Security & Redactions',
      icon: <ShieldCheck size={15} />,
      badge: `${analysis.redactedItemsCount} masked`,
    },
    {
      id: 'all',
      label: 'Full Dossier (All)',
      icon: <Layers size={15} />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & Quick Actions */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
              {analysis.id}
            </span>
            <span
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                fontWeight: 600,
              }}
            >
              {analysis.service}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Size: {analysis.fileSize}
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
            Log Analysis: {analysis.fileName}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/logs/upload')}
          >
            Upload Another Log
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/incidents/new?service=${encodeURIComponent(analysis.service)}`)}
            icon={<PlusCircle size={14} />}
          >
            Create Incident from Log
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/ai-root-cause?incidentId=${analysis.incidentId || 'INC-2024-1042'}`)}
            iconRight={<Sparkles size={14} />}
          >
            Run AI Root-Cause Diagnostic
          </Button>
        </div>
      </div>

      {/* Top High-level Summary Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
        }}
      >
        <div className="card" style={{ padding: '12px 18px' }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Indexed Log Volume</span>
          <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
            {analysis.totalLines.toLocaleString()} lines
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Size: {analysis.fileSize}</span>
        </div>

        <div className="card" style={{ padding: '12px 18px' }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Exceptions & Warnings</span>
          <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--p1-color)', marginTop: 2 }}>
            {analysis.errorCount} errors
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{analysis.warningCount} warnings</span>
        </div>

        <div className="card" style={{ padding: '12px 18px' }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Anomaly Severity Index</span>
          <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--p2-color)', marginTop: 2 }}>
            {analysis.anomalyScore}%
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Deviation from baseline</span>
        </div>

        <div className="card" style={{ padding: '12px 18px' }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Masked Secrets (Sec 11.2)</span>
          <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--status-resolved)', marginTop: 2 }}>
            {analysis.redactedItemsCount} items
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Protected before LLM inference</span>
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
                onClick={() => {
                  setActiveSection(sec.id);
                  setSearchParams({ section: sec.id });
                }}
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
          Active Section: <strong>{sections.find(s => s.id === activeSection)?.label}</strong>
        </span>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: ANOMALY TIMELINE & SPIKE DETECTION                             */}
      {/* ========================================================================= */}
      {activeSection === 'anomalies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <LogAnomaliesChart
            timeSeries={analysis.timeSeriesData}
            anomalyScore={analysis.anomalyScore}
          />

          <div
            className="card"
            style={{
              padding: '18px 22px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
            }}
          >
            <Sparkles size={20} style={{ color: '#2563eb', marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a8a' }}>
                Anomaly Detection Summary (Feature 4)
              </div>
              <p style={{ fontSize: 13, color: '#1e40af', marginTop: 4, lineHeight: 1.5 }}>
                Error density escalated rapidly between <strong>14:32:00 UTC</strong> and <strong>14:33:00 UTC</strong>, showing a 580% surge over baseline telemetry. The anomaly spike directly aligns with PostgreSQL client connection pool depletion on <code>billing-db-primary</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: TOP ERROR PATTERNS & STACK TRACES                              */}
      {/* ========================================================================= */}
      {activeSection === 'errors' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <AlertTriangle size={18} style={{ color: 'var(--p1-color)' }} />
              <span>Clustered Error Patterns & Stack Traces</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Deduplicated by exception signature
            </span>
          </div>

          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {analysis.topErrors.map((err, idx) => {
              const isExpanded = expandedErrorIndex === idx;
              return (
                <div
                  key={idx}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpandedErrorIndex(isExpanded ? null : idx)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--p1-bg)',
                          color: 'var(--p1-color)',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {err.count} occurrences
                      </span>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        {err.error}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        First seen {err.firstSeen} • Last seen {err.lastSeen}
                      </span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {isExpanded && err.stackTrace && (
                    <div
                      style={{
                        padding: 16,
                        backgroundColor: '#060911',
                        borderTop: '1px solid var(--border-subtle)',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleCopyTrace(err.stackTrace!, idx)}
                          style={{ fontSize: 11.5, padding: '2px 8px' }}
                        >
                          {copiedTraceIdx === idx ? (
                            <>
                              <Check size={12} style={{ color: 'var(--status-resolved)' }} />
                              <span>Copied Trace</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy Stack Trace</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre
                        style={{
                          color: '#fca5a5',
                          fontSize: 12,
                          fontFamily: 'monospace',
                          lineHeight: 1.6,
                          overflowX: 'auto',
                        }}
                      >
                        {err.stackTrace}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: INTERACTIVE LOG EXPLORER STREAM                                */}
      {/* ========================================================================= */}
      {activeSection === 'explorer' && (
        <LogViewer
          events={analysis.parsedEvents}
          totalLines={analysis.totalLines}
          redactedCount={analysis.redactedItemsCount}
          title="Interactive Log Explorer & Redaction Stream"
        />
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: SECURITY & SENSITIVE DATA REDACTION                            */}
      {/* ========================================================================= */}
      {activeSection === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            className="card"
            style={{
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <ShieldCheck size={20} style={{ color: 'var(--status-resolved)' }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                Sensitive Data Masking & Redaction Protocol (Section 11.2)
              </h2>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 18 }}>
              Before logs are indexed or submitted to AI root-cause reasoning engines, all identifiable secrets, passwords, Bearer tokens, and connection strings are masked locally in the browser/client layer.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Database Passwords</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--status-resolved)', marginTop: 4 }}>
                  14 instances masked
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Replaced with <code>[REDACTED_PASSWORD]</code>
                </div>
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Bearer & API Tokens</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--status-resolved)', marginTop: 4 }}>
                  9 tokens scrubbed
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Replaced with <code>[REDACTED_TOKEN]</code>
                </div>
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Internal IP Addresses</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--status-resolved)', marginTop: 4 }}>
                  5 internal IPs sanitized
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Replaced with <code>[REDACTED_IP]</code>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                fontSize: 12.5,
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Lock size={15} style={{ color: 'var(--status-resolved)' }} />
              <span>
                Zero sensitive credentials or unmasked internal keys are shared with external APIs or stored in non-compliant logs.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: FULL DOSSIER (ALL SECTIONS)                                    */}
      {/* ========================================================================= */}
      {activeSection === 'all' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <LogAnomaliesChart
            timeSeries={analysis.timeSeriesData}
            anomalyScore={analysis.anomalyScore}
          />

          {/* Top Error Patterns */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <AlertTriangle size={18} style={{ color: 'var(--p1-color)' }} />
                <span>Clustered Error Patterns</span>
              </div>
            </div>
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analysis.topErrors.map((err, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600 }}>{err.error}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--p1-color)' }}>{err.count} hits</span>
                </div>
              ))}
            </div>
          </div>

          <LogViewer
            events={analysis.parsedEvents}
            totalLines={analysis.totalLines}
            redactedCount={analysis.redactedItemsCount}
            title="Interactive Log Explorer & Redaction Stream"
          />
        </div>
      )}
    </div>
  );
};

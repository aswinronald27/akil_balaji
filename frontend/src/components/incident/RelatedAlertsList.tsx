import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Code2, Radio } from 'lucide-react';
import { Alert } from '../../types';

interface RelatedAlertsListProps {
  alerts: Alert[];
}

export const RelatedAlertsList: React.FC<RelatedAlertsListProps> = ({ alerts }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (alerts.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
        No external monitoring alerts currently linked to this incident.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
        IntelliDesk Alert Deduplication Engine grouped <strong>{alerts.length} monitoring events</strong> into this primary incident, preventing notification fatigue.
      </div>

      {alerts.map(alert => {
        const isExpanded = expandedId === alert.id;
        return (
          <div
            key={alert.id}
            style={{
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface-elevated)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
              onClick={() => setExpandedId(isExpanded ? null : alert.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <AlertCircle
                  size={16}
                  style={{
                    color:
                      alert.severity === 'critical'
                        ? 'var(--p1-color)'
                        : alert.severity === 'warning'
                        ? 'var(--p2-color)'
                        : 'var(--p4-color)',
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {alert.name}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {alert.source}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {alert.message}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {isExpanded && (
              <div
                style={{
                  padding: '14px 16px',
                  borderTop: '1px solid var(--border-subtle)',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  fontSize: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--accent-cyan)' }}>
                  <Code2 size={14} />
                  <span style={{ fontWeight: 600 }}>Raw Telemetry Payload</span>
                </div>
                <pre
                  style={{
                    padding: 10,
                    borderRadius: 4,
                    backgroundColor: '#060911',
                    color: '#94a3b8',
                    overflowX: 'auto',
                    fontSize: 11.5,
                  }}
                >
                  {alert.rawPayload ||
                    JSON.stringify(
                      {
                        alert_id: alert.id,
                        alertname: alert.name,
                        source: alert.source,
                        severity: alert.severity,
                        service: alert.service,
                        triggered_at: alert.timestamp,
                        evaluation_interval: '30s',
                        labels: {
                          cluster: 'production-us-east-1',
                          namespace: 'fintech-core',
                          pod: 'billing-service-7f98b',
                        },
                      },
                      null,
                      2
                    )}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

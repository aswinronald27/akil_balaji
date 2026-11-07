import React from 'react';
import { Activity, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { SystemServiceHealth } from '../../types';

interface SystemHealthWidgetProps {
  services: SystemServiceHealth[];
}

export const SystemHealthWidget: React.FC<SystemHealthWidgetProps> = ({ services }) => {
  const getStatusIcon = (status: SystemServiceHealth['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 size={16} style={{ color: 'var(--status-resolved)' }} />;
      case 'degraded':
        return <AlertTriangle size={16} style={{ color: 'var(--p2-color)' }} />;
      case 'critical':
        return <XCircle size={16} style={{ color: 'var(--p1-color)' }} />;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <Activity size={18} style={{ color: 'var(--primary)' }} />
          <span>System & Infrastructure Health</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Live Health Status
        </span>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {services.map(svc => (
          <div
            key={svc.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {getStatusIcon(svc.status)}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {svc.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {svc.type} • Uptime {svc.uptimePercent}%
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {svc.latencyMs} ms
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>latency</div>
              </div>

              <div style={{ textAlign: 'right', minWidth: 60 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: svc.status === 'critical' ? 'var(--p1-color)' : 'var(--text-secondary)',
                  }}
                >
                  {svc.errorRate}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>err rate</div>
              </div>

              {svc.activeAlertsCount > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--p1-bg)',
                    color: 'var(--p1-color)',
                    border: '1px solid var(--p1-border)',
                  }}
                >
                  {svc.activeAlertsCount} alerts
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

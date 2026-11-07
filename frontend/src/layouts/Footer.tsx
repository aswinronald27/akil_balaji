import React from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        padding: '14px 28px',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        fontSize: 12,
        color: 'var(--text-muted)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>
          <strong style={{ color: 'var(--text-primary)' }}>IntelliDesk</strong> — Smart IT Incident Intelligence Platform
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--status-resolved)' }}>
          <CheckCircle2 size={13} />
          <span>Frontend Ready for Integration</span>
        </div>
        <span style={{ color: 'var(--border-subtle)' }}>•</span>
        <span>Version 1.0.0</span>
      </div>
    </footer>
  );
};

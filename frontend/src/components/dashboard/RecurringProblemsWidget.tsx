import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ShieldAlert, ArrowRight } from 'lucide-react';
import { RecurringProblem } from '../../types';
import { Button } from '../common/Button';

interface RecurringProblemsWidgetProps {
  problems: RecurringProblem[];
}

export const RecurringProblemsWidget: React.FC<RecurringProblemsWidgetProps> = ({ problems }) => {
  const navigate = useNavigate();

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <RefreshCw size={18} style={{ color: 'var(--accent-purple)' }} />
          <span>Recurring Problem Detection</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Root-cause pattern clustering
        </span>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {problems.map(prob => (
          <div
            key={prob.id}
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
              <ShieldAlert size={18} style={{ color: 'var(--p2-color)', marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {prob.service}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--p2-bg)',
                      color: 'var(--p2-color)',
                    }}
                  >
                    {prob.status}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 3 }}>
                  {prob.pattern}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Repeated {prob.occurrences30d} times in 30 days • Avg MTTR {prob.avgResolutionMinutes} min
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/incidents/${prob.lastIncidentId}`)}
              iconRight={<ArrowRight size={12} />}
            >
              Analyze
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

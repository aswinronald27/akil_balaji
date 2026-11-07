import React from 'react';
import { PieChart } from 'lucide-react';
import { IncidentCategory } from '../../types';

interface DistributionItem {
  category: IncidentCategory;
  count: number;
  percentage: number;
}

interface IncidentDistributionChartProps {
  distribution: DistributionItem[];
  statusCounts: {
    new: number;
    investigating: number;
    waiting: number;
    resolved: number;
    reopened: number;
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  'Database error': '#ef4444',
  'Cloud service problem': '#f97316',
  'Server performance issue': '#eab308',
  'Deployment failure': '#8b5cf6',
  'Application failure': '#06b6d4',
  'Authentication or access problem': '#3b82f6',
  'Network issue': '#10b981',
};

export const IncidentDistributionChart: React.FC<IncidentDistributionChartProps> = ({
  distribution,
  statusCounts,
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <PieChart size={18} style={{ color: 'var(--primary)' }} />
          <span>Incident Classification & Status</span>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Status mini summary pills */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
            gap: 8,
            marginBottom: 20,
            padding: 12,
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--status-new)' }}>
              {statusCounts.new}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>New</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--status-investigating)' }}>
              {statusCounts.investigating}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Investigating</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--status-waiting)' }}>
              {statusCounts.waiting}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Waiting</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--status-resolved)' }}>
              {statusCounts.resolved}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Resolved</div>
          </div>
        </div>

        {/* Category progress bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {distribution.map(item => {
            const color = CATEGORY_COLORS[item.category] || 'var(--primary)';
            return (
              <div key={item.category}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 12.5,
                    marginBottom: 5,
                  }}
                >
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    {item.category}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div
                  style={{
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: 'var(--bg-tertiary)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${item.percentage}%`,
                      backgroundColor: color,
                      borderRadius: 4,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

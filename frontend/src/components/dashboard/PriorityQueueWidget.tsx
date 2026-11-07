import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Clock, Users } from 'lucide-react';
import { Incident } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface PriorityQueueWidgetProps {
  incidents: Incident[];
}

export const PriorityQueueWidget: React.FC<PriorityQueueWidgetProps> = ({ incidents }) => {
  const navigate = useNavigate();
  const priorityQueue = incidents
    .filter(i => (i.priority === 'P1' || i.priority === 'P2') && i.status !== 'Resolved')
    .slice(0, 4);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <AlertCircle size={18} style={{ color: 'var(--p1-color)' }} />
          <span>Priority Queue (Critical & High)</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/incidents?priority=P1')}
          iconRight={<ArrowRight size={14} />}
        >
          View All Queue
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {priorityQueue.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
            No active P1 or P2 critical incidents. Systems operating within SLA parameters.
          </div>
        ) : (
          priorityQueue.map(inc => (
            <div
              key={inc.id}
              onClick={() => navigate(`/incidents/${inc.id}`)}
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '75%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <Badge priority={inc.priority} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                    {inc.id}
                  </span>
                  <Badge status={inc.status} />
                  <span
                    style={{
                      fontSize: 12,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {inc.affectedService}
                  </span>
                  {inc.alertCount > 1 && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      • {inc.alertCount} alerts grouped
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {inc.title}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} />
                    {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={13} />
                    {inc.assignedEngineer?.name || 'Unassigned'}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  navigate(`/incidents/${inc.id}`);
                }}
                iconRight={<ArrowRight size={13} />}
              >
                Investigate
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

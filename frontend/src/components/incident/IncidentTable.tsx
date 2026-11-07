import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Layers, Sparkles } from 'lucide-react';
import { Incident } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface IncidentTableProps {
  incidents: Incident[];
  onStatusClick?: (incident: Incident) => void;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({ incidents }) => {
  const navigate = useNavigate();

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Incident ID</th>
            <th>Priority</th>
            <th>Title & Affected Service</th>
            <th>Category</th>
            <th>Status</th>
            <th>Alerts</th>
            <th>Assignee</th>
            <th>Created</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map(inc => (
            <tr
              key={inc.id}
              onClick={() => navigate(`/incidents/${inc.id}`)}
            >
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>
                    {inc.id}
                  </span>
                  {inc.suggestedByAI && (
                    <span title="AI Classified">
                      <Sparkles size={13} style={{ color: 'var(--primary)' }} />
                    </span>
                  )}
                </div>
              </td>
              <td>
                <Badge priority={inc.priority} />
              </td>
              <td>
                <div style={{ maxWidth: 380 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {inc.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Service: <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{inc.affectedService}</span>
                  </div>
                </div>
              </td>
              <td>
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                  {inc.category}
                </span>
              </td>
              <td>
                <Badge status={inc.status} />
              </td>
              <td>
                {inc.alertCount > 1 ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--accent-cyan)',
                    }}
                    title={`${inc.alertCount} duplicate/related alerts aggregated into this incident`}
                  >
                    <Layers size={12} />
                    {inc.alertCount}
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>1 alert</span>
                )}
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img
                    src={inc.assignedEngineer?.avatar}
                    alt={inc.assignedEngineer?.name}
                    style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: 12.5, color: 'var(--text-primary)' }}>
                    {inc.assignedEngineer?.name}
                  </span>
                </div>
              </td>
              <td>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(inc.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                  {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </td>
              <td style={{ textAlign: 'right' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    navigate(`/incidents/${inc.id}`);
                  }}
                  iconRight={<ArrowRight size={12} />}
                >
                  Investigate
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

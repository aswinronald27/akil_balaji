import React from 'react';
import { AlertCircle, ArrowUpRight, CheckCircle2, GitCommit, MessageSquare, Sparkles } from 'lucide-react';
import { TimelineEvent } from '../../types';

interface IncidentTimelineProps {
  events: TimelineEvent[];
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ events }) => {
  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'alert':
        return <AlertCircle size={15} style={{ color: 'var(--p1-color)' }} />;
      case 'deployment':
        return <GitCommit size={15} style={{ color: 'var(--accent-purple)' }} />;
      case 'ai_analysis':
        return <Sparkles size={15} style={{ color: 'var(--accent-cyan)' }} />;
      case 'status_change':
        return <ArrowUpRight size={15} style={{ color: 'var(--primary)' }} />;
      case 'action_taken':
        return <CheckCircle2 size={15} style={{ color: 'var(--status-resolved)' }} />;
      case 'comment':
      default:
        return <MessageSquare size={15} style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  return (
    <div style={{ position: 'relative', paddingLeft: 24, margin: '16px 0' }}>
      {/* Vertical line connecting events */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          bottom: 10,
          left: 10,
          width: 2,
          backgroundColor: 'var(--border-default)',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {events.map((evt) => (
          <div key={evt.id} style={{ position: 'relative', display: 'flex', gap: 14 }}>
            {/* Event dot */}
            <div
              style={{
                position: 'absolute',
                left: -24,
                top: 2,
                width: 22,
                height: 22,
                borderRadius: '50%',
                backgroundColor: 'var(--bg-secondary)',
                border: '2px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}
            >
              {getEventIcon(evt.type)}
            </div>

            <div
              style={{
                flex: 1,
                padding: '12px 16px',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {evt.title}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} UTC
                </span>
              </div>

              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {evt.description}
              </div>

              {evt.author && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  Source / Author: <span style={{ color: 'var(--text-secondary)' }}>{evt.author}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

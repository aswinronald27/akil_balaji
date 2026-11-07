import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Search, Download } from 'lucide-react';
import { LogEvent } from '../../types';
import { SearchInput } from '../common/SearchInput';
import { Button } from '../common/Button';

interface LogViewerProps {
  events: LogEvent[];
  title?: string;
  totalLines?: number;
  redactedCount?: number;
}

export const LogViewer: React.FC<LogViewerProps> = ({
  events,
  title = 'Raw Telemetry & Log Stream',
  totalLines,
  redactedCount = 0,
}) => {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [showMaskingPreview, setShowMaskingPreview] = useState(true);

  const filteredEvents = events.filter(e => {
    if (levelFilter !== 'ALL' && e.level !== levelFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.message.toLowerCase().includes(q) ||
        e.rawLine.toLowerCase().includes(q) ||
        e.timestamp.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getLevelBadge = (level: LogEvent['level']) => {
    switch (level) {
      case 'FATAL':
        return <span className="log-badge-fatal">FATAL</span>;
      case 'ERROR':
        return <span className="log-badge-error">ERROR</span>;
      case 'WARN':
        return <span className="log-badge-warn">WARN</span>;
      case 'INFO':
      default:
        return <span className="log-badge-info">INFO</span>;
    }
  };

  const renderHighlightedLine = (text: string) => {
    if (!showMaskingPreview || !text.includes('[REDACTED')) {
      return text;
    }

    const parts = text.split(/(\[REDACTED_[A-Z0-9_]+\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[REDACTED')) {
        return (
          <span key={i} className="redacted-tag">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const handleDownload = () => {
    const raw = filteredEvents.map(e => e.rawLine).join('\n');
    const blob = new Blob([raw], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intellidesk-logs-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="card-title">{title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Showing {filteredEvents.length} events {totalLines ? `of ${totalLines.toLocaleString()} indexed lines` : ''}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ width: 220 }}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search in logs..."
            />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', height: 38, fontSize: 12.5 }}
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
          >
            <option value="ALL">All Levels</option>
            <option value="FATAL">FATAL</option>
            <option value="ERROR">ERROR</option>
            <option value="WARN">WARN</option>
            <option value="INFO">INFO</option>
          </select>

          <Button
            variant={showMaskingPreview ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowMaskingPreview(prev => !prev)}
            icon={showMaskingPreview ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
          >
            {showMaskingPreview ? `AI Redacted (${redactedCount})` : 'Raw Unmasked'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            icon={<Download size={14} />}
          >
            Export
          </Button>
        </div>
      </div>

      <div style={{ padding: 0 }}>
        <div className="log-stream-terminal" style={{ maxHeight: 520 }}>
          {filteredEvents.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
              No log lines match current search and level filters.
            </div>
          ) : (
            filteredEvents.map((evt, idx) => (
              <div key={evt.id || idx} className="log-line">
                <span className="log-line-num">{idx + 1}</span>
                <span style={{ color: '#64748b', minWidth: 90 }}>{evt.timestamp}</span>
                <span style={{ minWidth: 54 }}>{getLevelBadge(evt.level)}</span>
                <span style={{ color: '#38bdf8', minWidth: 120 }}>[{evt.service}]</span>
                <span style={{ flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {renderHighlightedLine(evt.rawLine || evt.message)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

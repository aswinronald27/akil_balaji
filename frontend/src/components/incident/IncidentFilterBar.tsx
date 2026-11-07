import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { IncidentCategory, IncidentStatus, Priority } from '../../types';
import { SearchInput } from '../common/SearchInput';
import { Button } from '../common/Button';

interface IncidentFilterBarProps {
  status: IncidentStatus | 'All';
  priority: Priority | 'All';
  category: IncidentCategory | 'All';
  search: string;
  onStatusChange: (status: IncidentStatus | 'All') => void;
  onPriorityChange: (priority: Priority | 'All') => void;
  onCategoryChange: (category: IncidentCategory | 'All') => void;
  onSearchChange: (search: string) => void;
  onReset: () => void;
}

export const IncidentFilterBar: React.FC<IncidentFilterBarProps> = ({
  status,
  priority,
  category,
  search,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
  onSearchChange,
  onReset,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '16px 20px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, flex: 1, minWidth: 280 }}>
        <div style={{ width: '100%', maxWidth: 320 }}>
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search incident ID, title, error..."
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={15} style={{ color: 'var(--text-muted)' }} />
          <select
            className="form-select"
            style={{ width: 'auto', height: 38, padding: '0 12px', fontSize: 13 }}
            value={status}
            onChange={e => onStatusChange(e.target.value as any)}
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Investigating">Investigating</option>
            <option value="Waiting">Waiting</option>
            <option value="Resolved">Resolved</option>
            <option value="Reopened">Reopened</option>
          </select>
        </div>

        <div>
          <select
            className="form-select"
            style={{ width: 'auto', height: 38, padding: '0 12px', fontSize: 13 }}
            value={priority}
            onChange={e => onPriorityChange(e.target.value as any)}
          >
            <option value="All">All Priorities</option>
            <option value="P1">P1 - Critical</option>
            <option value="P2">P2 - High</option>
            <option value="P3">P3 - Medium</option>
            <option value="P4">P4 - Low</option>
          </select>
        </div>

        <div>
          <select
            className="form-select"
            style={{ width: 'auto', height: 38, padding: '0 12px', fontSize: 13 }}
            value={category}
            onChange={e => onCategoryChange(e.target.value as any)}
          >
            <option value="All">All Categories</option>
            <option value="Application failure">Application failure</option>
            <option value="Database error">Database error</option>
            <option value="Network issue">Network issue</option>
            <option value="Cloud service problem">Cloud service problem</option>
            <option value="Deployment failure">Deployment failure</option>
            <option value="Authentication or access problem">Authentication or access problem</option>
            <option value="Server performance issue">Server performance issue</option>
          </select>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        icon={<RotateCcw size={14} />}
      >
        Reset Filters
      </Button>
    </div>
  );
};

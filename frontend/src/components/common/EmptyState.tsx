import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'No results match your current query or filter criteria.',
  icon = <Inbox size={42} style={{ color: 'var(--text-muted)' }} />,
  actionText,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        backgroundColor: 'var(--bg-surface-elevated)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-default)',
        margin: '20px 0',
      }}
    >
      <div style={{ marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
        {title}
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 440, marginBottom: actionText ? 20 : 0 }}>
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

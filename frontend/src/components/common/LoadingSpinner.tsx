import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading IntelliDesk telemetry...',
  size = 32,
  fullPage = false,
}) => {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 40,
        color: 'var(--text-secondary)',
      }}
    >
      <Loader2
        size={size}
        className="animate-spin"
        style={{ color: 'var(--accent-cyan)' }}
      />
      {message && <div style={{ fontSize: 14, fontWeight: 500 }}>{message}</div>}
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--bg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99,
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};

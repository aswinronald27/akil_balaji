import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: 40,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: 'var(--p1-bg)',
          color: 'var(--p1-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <AlertCircle size={32} />
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
        404 - Telemetry Route Not Found
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 460, marginBottom: 24 }}>
        The requested IntelliDesk console page does not exist or has been relocated to another service endpoint.
      </p>
      <Button
        variant="primary"
        onClick={() => navigate('/dashboard')}
        icon={<Home size={16} />}
      >
        Return to Dashboard
      </Button>
    </div>
  );
};

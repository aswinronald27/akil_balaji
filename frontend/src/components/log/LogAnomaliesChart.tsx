import React from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { LogTimeSeriesPoint } from '../../types';

interface LogAnomaliesChartProps {
  timeSeries: LogTimeSeriesPoint[];
  anomalyScore: number;
}

export const LogAnomaliesChart: React.FC<LogAnomaliesChartProps> = ({
  timeSeries,
  anomalyScore,
}) => {
  const maxErrors = Math.max(...timeSeries.map(p => p.errors), 10);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <TrendingUp size={18} style={{ color: 'var(--p1-color)' }} />
          <span>Error Frequency & Anomaly Detection</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Anomaly Confidence:</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: anomalyScore > 80 ? 'var(--p1-bg)' : 'var(--p2-bg)',
              color: anomalyScore > 80 ? 'var(--p1-color)' : 'var(--p2-color)',
            }}
          >
            {anomalyScore}% Anomaly Index
          </span>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160, paddingBottom: 24, position: 'relative' }}>
          {timeSeries.map((point, index) => {
            const heightPercent = Math.min(100, Math.round((point.errors / maxErrors) * 100));
            const isSpike = point.errors > 40;

            return (
              <div
                key={index}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                {isSpike && (
                  <div style={{ marginBottom: 4, color: 'var(--p1-color)', fontSize: 11, fontWeight: 700 }}>
                    {point.errors}
                  </div>
                )}
                <div
                  style={{
                    width: '100%',
                    maxWidth: 36,
                    height: `${Math.max(heightPercent, 6)}%`,
                    backgroundColor: isSpike ? 'var(--p1-color)' : 'var(--accent-cyan)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.3s ease',
                  }}
                  title={`${point.timestamp} - Errors: ${point.errors}, Warnings: ${point.warnings}`}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    fontSize: 11,
                    color: isSpike ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: isSpike ? 600 : 400,
                  }}
                >
                  {point.timestamp}
                </span>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 16,
            padding: '10px 14px',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 12.5,
            color: 'var(--text-secondary)',
          }}
        >
          <AlertTriangle size={16} style={{ color: 'var(--p1-color)', flexShrink: 0 }} />
          <span>
            <strong>Anomaly Detected at 16:39–16:41 UTC:</strong> Sudden 60x error rate deviation compared to 7-day baseline. Directly correlates with connection pool exhaustion.
          </span>
        </div>
      </div>
    </div>
  );
};

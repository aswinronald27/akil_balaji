import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositiveGood?: boolean;
    isUp?: boolean;
  };
  icon: React.ReactNode;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  accentColor = 'var(--primary)',
}) => {
  return (
    <div
      className="card"
      style={{
        padding: '20px 22px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: accentColor,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        <div
          style={{
            padding: 8,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-tertiary)',
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          {value}
        </span>
        {trend && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              color: trend.isUp === trend.isPositiveGood ? 'var(--status-resolved)' : 'var(--p1-color)',
            }}
          >
            {trend.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

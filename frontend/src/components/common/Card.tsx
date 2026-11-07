import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  badge,
  actions,
  footer,
  className = '',
  onClick,
}) => {
  return (
    <div className={`card ${className}`} onClick={onClick}>
      {(title || badge || actions) && (
        <div className="card-header">
          <div>
            <div className="card-title">
              {title}
              {badge && <span style={{ marginLeft: 8 }}>{badge}</span>}
            </div>
            {subtitle && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{subtitle}</div>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

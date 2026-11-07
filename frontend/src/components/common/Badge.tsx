import React from 'react';
import { IncidentStatus, Priority } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'p1' | 'p2' | 'p3' | 'p4' | 'new' | 'investigating' | 'waiting' | 'resolved' | 'reopened' | 'outline' | 'cyan' | 'purple';
  priority?: Priority;
  status?: IncidentStatus;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  priority,
  status,
  className = '',
}) => {
  let badgeClass = 'badge';

  if (priority) {
    badgeClass += ` badge-${priority.toLowerCase()}`;
  } else if (status) {
    badgeClass += ` badge-status-${status.toLowerCase()}`;
  } else if (variant) {
    badgeClass += ` badge-${variant}`;
  } else {
    badgeClass += ' badge-p4';
  }

  const displayText = children || priority || status;

  return (
    <span className={`${badgeClass} ${className}`}>
      {displayText}
    </span>
  );
};

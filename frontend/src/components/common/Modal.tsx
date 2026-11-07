import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '640px',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth }}
        onClick={e => e.stopPropagation()}
      >
        <div className="card-header" style={{ padding: '18px 24px' }}>
          <div className="card-title" style={{ fontSize: 17 }}>
            {title}
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: 6, borderRadius: 'var(--radius-full)' }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
        {footer && (
          <div
            className="card-footer"
            style={{
              padding: '16px 24px',
              backgroundColor: 'var(--bg-surface-elevated)',
              justifyContent: 'flex-end',
              gap: 12,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

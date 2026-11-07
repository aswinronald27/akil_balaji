import React, { useState } from 'react';
import { Play, ShieldCheck, AlertTriangle, CheckCircle2, UserCheck } from 'lucide-react';
import { RecoveryAction } from '../../types';
import { Button } from '../common/Button';

interface RecoveryActionCardProps {
  action: RecoveryAction;
  onExecute: (actionId: string, approverName: string) => Promise<void>;
  currentUserRole: string;
}

export const RecoveryActionCard: React.FC<RecoveryActionCardProps> = ({
  action,
  onExecute,
  currentUserRole,
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [showApprovalPrompt, setShowApprovalPrompt] = useState(false);
  const [approverName, setApproverName] = useState(currentUserRole);

  const getRiskBadge = (risk: RecoveryAction['riskLevel']) => {
    switch (risk) {
      case 'low':
        return (
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--status-resolved-bg)', color: 'var(--status-resolved)' }}>
            LOW RISK
          </span>
        );
      case 'medium':
        return (
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--p2-bg)', color: 'var(--p2-color)' }}>
            MEDIUM RISK (APPROVAL REQ)
          </span>
        );
      case 'high':
        return (
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--p1-bg)', color: 'var(--p1-color)' }}>
            HIGH RISK (MANUAL DBA/NOC)
          </span>
        );
    }
  };

  const handleTrigger = () => {
    if (action.requiresApproval) {
      setShowApprovalPrompt(true);
    } else {
      runAction(approverName);
    }
  };

  const runAction = async (approver: string) => {
    setIsExecuting(true);
    try {
      await onExecute(action.id, approver);
      setShowApprovalPrompt(false);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div
      style={{
        padding: '16px 20px',
        backgroundColor: 'var(--bg-surface-elevated)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            {action.title}
          </span>
          {getRiskBadge(action.riskLevel)}
        </div>

        {action.status === 'completed' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--status-resolved)', fontSize: 13, fontWeight: 600 }}>
            <CheckCircle2 size={16} />
            <span>Executed by {action.executedBy || 'Engineer'}</span>
          </div>
        ) : (
          <Button
            variant={action.riskLevel === 'high' ? 'danger' : 'primary'}
            size="sm"
            onClick={handleTrigger}
            isLoading={isExecuting}
            icon={<Play size={14} />}
          >
            {action.requiresApproval ? 'Request Approval & Execute' : 'Run Pre-Approved Action'}
          </Button>
        )}
      </div>

      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        {action.description}
      </div>

      {action.status === 'completed' && action.resultMessage && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: 'var(--status-resolved-bg)',
            border: '1px solid var(--status-resolved)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 12,
            color: 'var(--status-resolved)',
          }}
        >
          {action.resultMessage}
        </div>
      )}

      {/* Human In the Loop Approval Dialog */}
      {showApprovalPrompt && (
        <div className="modal-backdrop" onClick={() => setShowApprovalPrompt(false)}>
          <div className="modal-content" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserCheck size={18} style={{ color: 'var(--p2-color)' }} />
                <span>Production Authorization Required</span>
              </div>
            </div>
            <div style={{ padding: 20 }}>
              <div
                style={{
                  padding: 12,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: 6,
                  border: '1px solid var(--p1-border)',
                  color: 'var(--p1-color)',
                  fontSize: 12.5,
                  marginBottom: 16,
                  display: 'flex',
                  gap: 8,
                }}
              >
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>
                  Feature 13 Guardrail: AI recommendations cannot automatically alter production environments without human sign-off.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Authorized Approver Name</label>
                <input
                  type="text"
                  className="input-text"
                  value={approverName}
                  onChange={e => setApproverName(e.target.value)}
                />
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Action target: <strong>{action.title}</strong>
              </div>
            </div>

            <div className="card-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="ghost" onClick={() => setShowApprovalPrompt(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => runAction(approverName)}
                isLoading={isExecuting}
                icon={<ShieldCheck size={14} />}
              >
                Authorize & Trigger Action
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

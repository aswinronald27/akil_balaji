import React, { useState } from 'react';
import { CheckSquare, Square, Copy, Check, Terminal, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';
import { VerifiedSolution } from '../../types';
import { Button } from '../common/Button';

interface RunbookViewerProps {
  solution: VerifiedSolution;
  onClose?: () => void;
}

export const RunbookViewer: React.FC<RunbookViewerProps> = ({ solution, onClose }) => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const totalSteps = solution.runbookSteps.length;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = totalSteps ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Info */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-resolved)' }}>
            APPROVED STANDARD OPERATING PROCEDURE
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Target: {solution.targetSystems.join(', ')}
          </span>
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          {solution.title}
        </h2>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong>Underlying Root Cause:</strong> {solution.rootCause}
        </div>
      </div>

      {/* Warnings & Precautions */}
      {solution.warnings.length > 0 && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid var(--p1-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--p1-color)', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
            <AlertTriangle size={16} />
            <span>Operational Warnings & Safeguards</span>
          </div>
          <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {solution.warnings.map((warn, i) => (
              <li key={i} style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                • {warn}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Runbook Progress Bar */}
      <div
        style={{
          padding: '14px 18px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            Guided Execution Progress ({completedCount} of {totalSteps} checks completed)
          </span>
          <span style={{ fontWeight: 700, color: progressPercent === 100 ? 'var(--status-resolved)' : 'var(--primary)' }}>
            {progressPercent}%
          </span>
        </div>
        <div style={{ height: 8, backgroundColor: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: progressPercent === 100 ? 'var(--status-resolved)' : 'var(--primary)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Step by Step Sequence */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {solution.runbookSteps.map((step, idx) => {
          const isDone = !!completedSteps[step.step];

          return (
            <div
              key={step.step}
              style={{
                padding: '16px 20px',
                borderRadius: 'var(--radius-lg)',
                border: isDone ? '1px solid var(--status-resolved)' : '1px solid var(--border-subtle)',
                backgroundColor: isDone ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface-elevated)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => toggleStep(step.step)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: isDone ? 'var(--status-resolved)' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {isDone ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>
                  <span
                    style={{
                      fontSize: 14.5,
                      fontWeight: 700,
                      color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: isDone ? 'line-through' : 'none',
                    }}
                  >
                    Step {step.step}: {step.title}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isDone ? 'var(--status-resolved-bg)' : 'var(--bg-tertiary)',
                    color: isDone ? 'var(--status-resolved)' : 'var(--text-muted)',
                  }}
                >
                  {isDone ? 'Completed' : 'Pending Check'}
                </span>
              </div>

              <div style={{ fontSize: 13, color: 'var(--text-secondary)', paddingLeft: 30, lineHeight: 1.5 }}>
                {step.explanation}
              </div>

              {step.command && (
                <div style={{ paddingLeft: 30 }}>
                  <div
                    style={{
                      position: 'relative',
                      backgroundColor: '#060911',
                      border: '1px solid #1e293b',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto' }}>
                      <Terminal size={14} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                      <code style={{ fontSize: 12, color: '#38bdf8', whiteSpace: 'nowrap' }}>
                        {step.command}
                      </code>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(step.command!, idx)}
                      icon={copiedIndex === idx ? <Check size={13} style={{ color: 'var(--status-resolved)' }} /> : <Copy size={13} />}
                    >
                      {copiedIndex === idx ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {progressPercent === 100 && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--status-resolved-bg)',
            border: '1px solid var(--status-resolved)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={22} style={{ color: 'var(--status-resolved)' }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--status-resolved)' }}>
                Runbook Successfully Executed
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                All 5 recovery verification checks completed. Ready to update incident status.
              </div>
            </div>
          </div>
          {onClose && (
            <Button variant="primary" size="sm" onClick={onClose}>
              Done & Return
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

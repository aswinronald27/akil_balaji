import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, ThumbsUp, ThumbsDown, MessageSquare, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';
import { RankedCause } from '../../types';
import { Button } from '../common/Button';

interface RootCauseCardProps {
  cause: RankedCause;
  onFeedback: (causeId: string, feedback: 'useful' | 'unsuccessful' | 'outdated' | 'unsafe', notes?: string) => Promise<void>;
}

export const RootCauseCard: React.FC<RootCauseCardProps> = ({ cause, onFeedback }) => {
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<'useful' | 'unsuccessful' | 'outdated' | 'unsafe'>('useful');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackClick = async (type: 'useful' | 'unsuccessful' | 'outdated' | 'unsafe') => {
    setSelectedFeedback(type);
    setShowNotesModal(true);
  };

  const handleConfirmFeedback = async () => {
    setIsSubmitting(true);
    try {
      await onFeedback(cause.id, selectedFeedback, notes);
      setShowNotesModal(false);
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        borderLeft: cause.rank === 1 ? '4px solid var(--primary)' : '1px solid var(--border-subtle)',
      }}
    >
      <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              backgroundColor: cause.rank === 1 ? 'var(--primary)' : 'var(--bg-tertiary)',
              color: cause.rank === 1 ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
            }}
          >
            #{cause.rank}
          </span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              {cause.cause}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>AI Confidence</span>
            <div style={{ fontSize: 15, fontWeight: 800, color: cause.confidence >= 80 ? 'var(--status-resolved)' : 'var(--p2-color)' }}>
              {cause.confidence}%
            </div>
          </div>
          <div
            style={{
              width: 50,
              height: 8,
              borderRadius: 4,
              backgroundColor: 'var(--bg-tertiary)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${cause.confidence}%`,
                height: '100%',
                backgroundColor: cause.confidence >= 80 ? 'var(--status-resolved)' : 'var(--p2-color)',
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Supporting Evidence */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Sparkles size={15} />
            <span>Supporting Technical Evidence</span>
          </div>
          <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cause.evidence.map((ev, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                <CheckCircle2 size={15} style={{ color: 'var(--status-resolved)', marginTop: 2, flexShrink: 0 }} />
                <span>{ev}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Missing Information / Uncertainty */}
        {cause.missingInfo.length > 0 && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'rgba(234, 179, 8, 0.08)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--p3-color)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <HelpCircle size={14} />
              <span>Uncertainty & Missing Data Elements</span>
            </div>
            <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {cause.missingInfo.map((info, i) => (
                <li key={i} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  • {info}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Checks */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            Recommended Diagnostic Checks:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cause.recommendedChecks.map((check, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                }}
              >
                <ChevronRight size={14} style={{ color: 'var(--primary)' }} />
                <span>{check}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Section (Page 7 & 15: Recommendation Usefulness Metric) */}
        <div
          style={{
            paddingTop: 14,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Was this root-cause suggestion accurate and helpful?
            {cause.userFeedback && (
              <span style={{ marginLeft: 8, fontWeight: 700, color: 'var(--accent-cyan)' }}>
                Recorded: {cause.userFeedback.toUpperCase()}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button
              variant={cause.userFeedback === 'useful' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleFeedbackClick('useful')}
              icon={<ThumbsUp size={13} />}
            >
              Useful
            </Button>
            <Button
              variant={cause.userFeedback === 'unsuccessful' ? 'danger' : 'outline'}
              size="sm"
              onClick={() => handleFeedbackClick('unsuccessful')}
              icon={<ThumbsDown size={13} />}
            >
              Unsuccessful
            </Button>
            <Button
              variant={cause.userFeedback === 'outdated' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => handleFeedbackClick('outdated')}
            >
              Outdated
            </Button>
            <Button
              variant={cause.userFeedback === 'unsafe' ? 'danger' : 'outline'}
              size="sm"
              onClick={() => handleFeedbackClick('unsafe')}
              icon={<ShieldAlert size={13} />}
            >
              Unsafe
            </Button>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showNotesModal && (
        <div className="modal-backdrop" onClick={() => setShowNotesModal(false)}>
          <div className="modal-content" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="card-header">
              <div className="card-title">
                Submit Recommendation Feedback ({selectedFeedback.toUpperCase()})
              </div>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Your feedback trains the IntelliDesk RAG retriever and refines knowledge ranking for your engineering team.
              </div>
              <textarea
                className="form-textarea"
                placeholder="Optional notes or engineering context (e.g. verified via pg_stat_activity query)..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
            <div className="card-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="ghost" onClick={() => setShowNotesModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmFeedback} isLoading={isSubmitting}>
                Save Feedback
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { CheckCircle2, ThumbsUp, Tag, Server, ArrowRight } from 'lucide-react';
import { VerifiedSolution } from '../../types';
import { Button } from '../common/Button';

interface SolutionCardProps {
  solution: VerifiedSolution;
  onSelect: (solution: VerifiedSolution) => void;
  onVote: (id: string) => void;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({
  solution,
  onSelect,
  onVote,
}) => {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
      }}
      onClick={() => onSelect(solution)}
    >
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--status-resolved)', fontSize: 12, fontWeight: 700 }}>
            <CheckCircle2 size={15} />
            <span>VERIFIED SOLUTION</span>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{
              gap: 4,
              fontSize: 12,
              padding: '2px 8px',
              backgroundColor: solution.userVoted ? 'var(--primary-light)' : 'transparent',
              color: solution.userVoted ? 'var(--primary)' : 'var(--text-muted)',
            }}
            onClick={e => {
              e.stopPropagation();
              onVote(solution.id);
            }}
          >
            <ThumbsUp size={13} />
            <span>{solution.helpfulVotes}</span>
          </button>
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.4 }}>
          {solution.title}
        </h3>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {solution.rootCause}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {solution.tags.map(tag => (
            <span
              key={tag}
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--accent-cyan)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>

        {/* Target Systems */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text-muted)' }}>
          <Server size={13} />
          <span>Applies to: {solution.targetSystems.join(', ')}</span>
        </div>
      </div>

      <div
        className="card-footer"
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
          Verified by {solution.verifiedBy}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={e => {
            e.stopPropagation();
            onSelect(solution);
          }}
          iconRight={<ArrowRight size={13} />}
        >
          View Runbook
        </Button>
      </div>
    </div>
  );
};

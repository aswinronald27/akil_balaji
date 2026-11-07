import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Tag,
  ThumbsUp,
  Server,
  ArrowRight,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { IncidentCategory, VerifiedSolution } from '../types';
import { knowledgeBaseService } from '../services/knowledgeBaseService';
import { SolutionCard } from '../components/kb/SolutionCard';
import { RunbookViewer } from '../components/kb/RunbookViewer';
import { SearchInput } from '../components/common/SearchInput';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';

export const KnowledgeBasePage: React.FC = () => {
  const [solutions, setSolutions] = useState<VerifiedSolution[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeSolutionModal, setActiveSolutionModal] = useState<VerifiedSolution | null>(null);

  const fetchSolutions = async () => {
    setIsLoading(true);
    try {
      const data = await knowledgeBaseService.getSolutions(selectedCategory, searchQuery);
      setSolutions(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSolutions();
  }, [selectedCategory, searchQuery]);

  const handleVote = async (id: string) => {
    await knowledgeBaseService.voteSolution(id);
    const updated = await knowledgeBaseService.getSolutions(selectedCategory, searchQuery);
    setSolutions(updated);
  };

  const categories: (IncidentCategory | 'All')[] = [
    'All',
    'Database error',
    'Server performance issue',
    'Cloud service problem',
    'Application failure',
    'Deployment failure',
    'Authentication or access problem',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Knowledge Base & Verified Runbooks
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Search approved technical solutions, troubleshooting procedures, and interactive step-by-step runbooks.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--status-resolved-bg)',
              color: 'var(--status-resolved)',
              border: '1px solid var(--status-resolved)',
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ShieldCheck size={16} />
            <span>100% Peer-Reviewed Fixes</span>
          </span>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div
        className="card"
        style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ maxWidth: 600 }}>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search runbooks by keyword, technology (Postgres, Redis, Kafka), or symptom..."
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-default)',
                  backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Solutions Grid */}
      {isLoading ? (
        <LoadingSpinner message="Retrieving approved solutions & executable runbooks..." />
      ) : solutions.length === 0 ? (
        <EmptyState
          title="No verified solutions found"
          description="Try broadening your search term or select 'All' categories."
          actionText="Reset Filters"
          onAction={() => {
            setSelectedCategory('All');
            setSearchQuery('');
          }}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 20,
          }}
        >
          {solutions.map(sol => (
            <SolutionCard
              key={sol.id}
              solution={sol}
              onSelect={s => setActiveSolutionModal(s)}
              onVote={handleVote}
            />
          ))}
        </div>
      )}

      {/* Guided Runbook Interactive Modal */}
      {activeSolutionModal && (
        <Modal
          isOpen={!!activeSolutionModal}
          onClose={() => setActiveSolutionModal(null)}
          title={`Guided Troubleshooting Runbook (${activeSolutionModal.id})`}
          maxWidth="780px"
          footer={
            <Button variant="primary" onClick={() => setActiveSolutionModal(null)}>
              Close Runbook
            </Button>
          }
        >
          <RunbookViewer
            solution={activeSolutionModal}
            onClose={() => setActiveSolutionModal(null)}
          />
        </Modal>
      )}
    </div>
  );
};

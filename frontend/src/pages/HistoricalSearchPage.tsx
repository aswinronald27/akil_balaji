import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Copy,
  Check,
  Tag,
  Filter,
  Layers,
  BookOpen,
} from 'lucide-react';
import { HistoricalIncident } from '../types';
import { historicalSearchService } from '../services/historicalSearchService';
import { SearchInput } from '../components/common/SearchInput';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';

export const HistoricalSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState(
    searchParams.get('q') || 'connection pool exhausted'
  );
  const [selectedService, setSelectedService] = useState(
    searchParams.get('service') || 'All'
  );
  const [minSimilarity, setMinSimilarity] = useState(50);
  const [results, setResults] = useState<HistoricalIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const executeSearch = async () => {
    setIsLoading(true);
    try {
      const data = await historicalSearchService.searchHistorical({
        query,
        service: selectedService,
        minSimilarity,
      });
      setResults(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [query, selectedService, minSimilarity]);

  const handleCopySolution = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sampleQueries = [
    'connection pool exhausted',
    'payment webhook 504 timeout',
    'redis maxmemory OOM eviction',
    'ingress controller pod evicted',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          Historical Incident Search
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          Search past resolved incidents to find verified solutions and prevent repeating troubleshooting work.
        </p>
      </div>

      {/* Multi-modal Search Box */}
      <div
        className="card"
        style={{
          padding: 20,
        }}
      >
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by error text, exception code, or symptom (e.g. FATAL: remaining connection slots)..."
            />
          </div>
          <Button variant="primary" onClick={executeSearch} icon={<Search size={15} />}>
            Search Similar Cases
          </Button>
        </div>

        {/* Quick query chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Suggested Searches:</span>
          {sampleQueries.map(q => (
            <button
              key={q}
              type="button"
              onClick={() => setQuery(q)}
              style={{
                fontSize: 12,
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: query === q ? 'var(--primary)' : 'var(--bg-tertiary)',
                color: query === q ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Filters bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            paddingTop: 14,
            borderTop: '1px solid var(--border-subtle)',
            fontSize: 13,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Service:</span>
            <select
              className="form-select"
              style={{ width: 'auto', height: 32, fontSize: 12.5 }}
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
            >
              <option value="All">All Services</option>
              <option value="Subscription Service">Subscription Service</option>
              <option value="Billing Service">Billing Service</option>
              <option value="Payment Gateway">Payment Gateway</option>
              <option value="Auth Service">Auth Service</option>
              <option value="Kubernetes Cluster">Kubernetes Cluster</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Min Similarity Threshold: <strong>{minSimilarity}%</strong>
            </span>
            <input
              type="range"
              min="30"
              max="95"
              step="5"
              value={minSimilarity}
              onChange={e => setMinSimilarity(Number(e.target.value))}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Results List */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            Found {results.length} Semantically Related Historical Incidents
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Ranked by vector cosine similarity + symptom overlap
          </span>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Calculating embedding similarity against historical incident vector store..." />
        ) : results.length === 0 ? (
          <EmptyState
            title="No past incidents match your query"
            description="Try lowering the minimum similarity threshold or using alternative symptom keywords."
            actionText="Reset Search"
            onAction={() => {
              setQuery('');
              setSelectedService('All');
              setMinSimilarity(50);
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {results.map(item => (
              <div
                key={item.id}
                className="card"
                style={{
                  borderLeft: item.similarityScore >= 90 ? '4px solid var(--accent-cyan)' : '4px solid var(--primary)',
                }}
              >
                <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
                      {item.incidentId}
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Semantic Match</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent-cyan)' }}>
                        {item.similarityScore}%
                      </div>
                    </div>

                    {item.isVerified && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--status-resolved-bg)',
                          color: 'var(--status-resolved)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <CheckCircle2 size={13} />
                        VERIFIED FIX
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Historical Root Cause */}
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Historical Root Cause
                    </span>
                    <p style={{ fontSize: 13.5, color: 'var(--text-primary)', marginTop: 4, lineHeight: 1.5 }}>
                      {item.historicalCause}
                    </p>
                  </div>

                  {/* Verified Solution */}
                  <div
                    style={{
                      padding: '14px 16px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--status-resolved)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={14} />
                        Verified Fix & Remediation Applied
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleCopySolution(item.verifiedSolution, item.id)}
                        style={{ padding: '2px 8px', fontSize: 11.5 }}
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check size={12} style={{ color: 'var(--status-resolved)' }} />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy Fix</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {item.verifiedSolution}
                    </div>
                  </div>

                  {/* Matched Symptoms */}
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                      Matched Symptom Signatures:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                      {item.symptoms.map((sym, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          • {sym}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className="card-footer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 20px',
                    fontSize: 12,
                    color: 'var(--text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span>Service: <strong style={{ color: 'var(--text-primary)' }}>{item.affectedService}</strong></span>
                    <span>Resolved in <strong style={{ color: 'var(--status-resolved)' }}>{item.resolutionTimeMinutes} mins</strong></span>
                    <span>Resolved Date: {item.resolvedDate}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/knowledge-base')}
                    iconRight={<BookOpen size={13} />}
                  >
                    Open Knowledge Base Runbook
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

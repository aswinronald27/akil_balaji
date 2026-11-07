import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PlusCircle, RefreshCw, AlertTriangle, Layers } from 'lucide-react';
import { Incident, IncidentCategory, IncidentStatus, Priority } from '../types';
import { incidentService } from '../services/incidentService';
import { IncidentFilterBar } from '../components/incident/IncidentFilterBar';
import { IncidentTable } from '../components/incident/IncidentTable';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';

export const IncidentListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states initialized from URL params if present
  const [status, setStatus] = useState<IncidentStatus | 'All'>(
    (searchParams.get('status') as any) || 'All'
  );
  const [priority, setPriority] = useState<Priority | 'All'>(
    (searchParams.get('priority') as any) || 'All'
  );
  const [category, setCategory] = useState<IncidentCategory | 'All'>(
    (searchParams.get('category') as any) || 'All'
  );
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const data = await incidentService.getIncidents({
        status,
        priority,
        category,
        search,
      });
      setIncidents(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [status, priority, category, search]);

  const handleResetFilters = () => {
    setStatus('All');
    setPriority('All');
    setCategory('All');
    setSearch('');
    setSearchParams({});
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Incident Management & Intake Queue
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Aggregated IT failures with deduplicated alerts and automated category triage.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchIncidents}
            icon={<RefreshCw size={14} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/incidents/new')}
            icon={<PlusCircle size={15} />}
          >
            Report Incident
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <IncidentFilterBar
        status={status}
        priority={priority}
        category={category}
        search={search}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
        onCategoryChange={setCategory}
        onSearchChange={setSearch}
        onReset={handleResetFilters}
      />

      {/* Incident Table / Empty State */}
      {isLoading ? (
        <LoadingSpinner message="Filtering incident repository..." />
      ) : incidents.length === 0 ? (
        <EmptyState
          title="No matching incidents found"
          description="Adjust your search criteria, category filters, or report a new incident."
          actionText="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <IncidentTable incidents={incidents} />
      )}
    </div>
  );
};

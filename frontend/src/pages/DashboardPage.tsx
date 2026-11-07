import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Layers,
  Sparkles,
  BookOpen,
  FileText,
  Search,
  PlusCircle,
  Activity,
  Shield,
  TrendingDown,
  RefreshCw,
  LayoutGrid,
  ListFilter,
  BarChart2,
  Server,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DashboardStats, Incident, SystemServiceHealth } from '../types';
import { systemHealthService } from '../services/systemHealthService';
import { incidentService } from '../services/incidentService';
import { StatCard } from '../components/dashboard/StatCard';
import { PriorityQueueWidget } from '../components/dashboard/PriorityQueueWidget';
import { SystemHealthWidget } from '../components/dashboard/SystemHealthWidget';
import { RecurringProblemsWidget } from '../components/dashboard/RecurringProblemsWidget';
import { IncidentDistributionChart } from '../components/dashboard/IncidentDistributionChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';

type DashboardSection = 'triage' | 'health' | 'analytics' | 'recurring' | 'all';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemServiceHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const initialSection = (searchParams.get('section') as DashboardSection) || 'triage';
  const [activeSection, setActiveSection] = useState<DashboardSection>(initialSection);
  const [showKpiDetails, setShowKpiDetails] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sData, incData, healthData] = await Promise.all([
        systemHealthService.getDashboardStats(),
        incidentService.getIncidents(),
        systemHealthService.getSystemServicesHealth(),
      ]);
      setStats(sData);
      setIncidents(incData);
      setSystemHealth(healthData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading || !stats) {
    return <LoadingSpinner message="Synchronizing enterprise telemetry & incident analytics..." />;
  }

  const sections: { id: DashboardSection; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'triage',
      label: 'Active Triage & Priority Queue',
      icon: <ListFilter size={15} />,
      badge: stats.openIncidents,
    },
    {
      id: 'health',
      label: 'System & Services Health',
      icon: <Activity size={15} />,
      badge: `${systemHealth.filter(s => s.status === 'healthy').length}/${systemHealth.length} Healthy`,
    },
    {
      id: 'analytics',
      label: 'Incident Analytics & Trends',
      icon: <BarChart2 size={15} />,
      badge: `${stats.criticalCount} Critical`,
    },
    {
      id: 'recurring',
      label: 'Recurring Problems & Risk',
      icon: <Shield size={15} />,
      badge: stats.recurringProblems.length,
    },
    {
      id: 'all',
      label: 'Executive Overview (All)',
      icon: <LayoutGrid size={15} />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner & Quick Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          paddingBottom: 4,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Incident Intelligence Dashboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Organized workspace for real-time incident triage, service health, and automated diagnostics.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            icon={<RefreshCw size={14} />}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/logs/upload')}
            icon={<FileText size={14} />}
          >
            Upload Logs
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/historical-search')}
            icon={<Search size={14} />}
          >
            Historical Search
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/incidents/new')}
            icon={<PlusCircle size={14} />}
          >
            Report Incident
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar - Compact & Clean */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Operational Health & Resolution Velocity (Section 12 KPIs)
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setShowKpiDetails(!showKpiDetails)}
            style={{ fontSize: 11.5, color: 'var(--text-secondary)', padding: '2px 8px' }}
          >
            {showKpiDetails ? (
              <>
                <ChevronUp size={13} />
                <span>Compact KPI Bar</span>
              </>
            ) : (
              <>
                <ChevronDown size={13} />
                <span>Expand KPIs</span>
              </>
            )}
          </button>
        </div>

        {showKpiDetails ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 12,
            }}
          >
            <StatCard
              title="Active Critical Issues"
              value={stats.criticalCount}
              subtitle={`${stats.openIncidents} total open incidents`}
              trend={{ value: '2 P1 incidents require attention', isUp: false, isPositiveGood: false }}
              icon={<AlertTriangle size={18} />}
              accentColor="var(--p1-color)"
            />

            <StatCard
              title="Mean Time to Acknowledge (MTTA)"
              value={`${stats.mttaMinutes}m`}
              subtitle="Time to initial engineer triage"
              trend={{ value: '34% faster than baseline', isUp: false, isPositiveGood: true }}
              icon={<Clock size={18} />}
              accentColor="var(--accent-cyan)"
            />

            <StatCard
              title="Mean Time to Resolve (MTTR)"
              value={`${stats.mttrMinutes}m`}
              subtitle="Incident detection to recovery"
              trend={{ value: '18m reduction via RAG fixes', isUp: false, isPositiveGood: true }}
              icon={<CheckCircle2 size={18} />}
              accentColor="var(--status-resolved)"
            />

            <StatCard
              title="Alert Reduction Rate"
              value={`${stats.alertReductionPercent}%`}
              subtitle="Duplicate/correlated alerts grouped"
              trend={{ value: 'Prevents notification fatigue', isUp: true, isPositiveGood: true }}
              icon={<Layers size={18} />}
              accentColor="var(--primary)"
            />

            <StatCard
              title="Knowledge Reuse Rate"
              value={`${stats.knowledgeReusePercent}%`}
              subtitle="Incidents resolved via verified fixes"
              trend={{ value: 'Eliminating repeat troubleshooting', isUp: true, isPositiveGood: true }}
              icon={<BookOpen size={18} />}
              accentColor="var(--accent-purple)"
            />
          </div>
        ) : (
          /* Sleek single-line summary strip */
          <div
            className="card"
            style={{
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              fontSize: 13,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>P1 Critical: </span>
                <strong style={{ color: 'var(--p1-color)' }}>{stats.criticalCount} issues</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>MTTA: </span>
                <strong style={{ color: 'var(--text-primary)' }}>{stats.mttaMinutes}m</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>MTTR: </span>
                <strong style={{ color: 'var(--status-resolved)' }}>{stats.mttrMinutes}m</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Alert Reduction: </span>
                <strong style={{ color: 'var(--primary)' }}>{stats.alertReductionPercent}%</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Verified Knowledge Reuse: </span>
                <strong style={{ color: 'var(--accent-purple)' }}>{stats.knowledgeReusePercent}%</strong>
              </div>
            </div>

            <span style={{ fontSize: 11.5, color: 'var(--status-resolved)', fontWeight: 600 }}>
              ● Operational Telemetry Normal
            </span>
          </div>
        )}
      </div>

      {/* Section Segmented Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div className="section-pills">
          {sections.map(sec => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                className={`section-pill-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection(sec.id);
                  setSearchParams({ section: sec.id });
                }}
              >
                <span>{sec.icon}</span>
                <span>{sec.label}</span>
                {sec.badge !== undefined && (
                  <span
                    style={{
                      fontSize: 11,
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-tertiary)',
                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    {sec.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Showing: <strong>{sections.find(s => s.id === activeSection)?.label}</strong>
        </span>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: ACTIVE TRIAGE & PRIORITY QUEUE                                 */}
      {/* ========================================================================= */}
      {activeSection === 'triage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* AI Recommended Investigation Callout Banner */}
          <div
            className="card"
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a8a' }}>
                  AI Root-Cause Recommendation Ready for INC-2024-1042
                </div>
                <div style={{ fontSize: 12.5, color: '#1e40af', marginTop: 2 }}>
                  Analysis of PostgreSQL pool exhaustion is complete with <strong>94% confidence</strong>. Recommended fix: enlarge connection pooler ceiling & kill idle transactions.
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/incidents/INC-2024-1042')}
              iconRight={<Sparkles size={14} />}
            >
              Open AI Investigation
            </Button>
          </div>

          {/* Full Priority Queue Widget */}
          <PriorityQueueWidget incidents={incidents} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: SYSTEM & SERVICES HEALTH                                       */}
      {/* ========================================================================= */}
      {activeSection === 'health' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Health Summary Highlights */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14,
            }}
          >
            <div className="card" style={{ padding: '14px 18px' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Core Services Monitored</span>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                {systemHealth.length} Microservices
              </div>
              <span style={{ fontSize: 11.5, color: 'var(--status-resolved)', fontWeight: 600 }}>
                {systemHealth.filter(s => s.status === 'healthy').length} fully operational
              </span>
            </div>

            <div className="card" style={{ padding: '14px 18px' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Average Microservice Latency</span>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                {Math.round(systemHealth.reduce((acc, s) => acc + s.latencyMs, 0) / systemHealth.length)} ms
              </div>
              <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>Across all endpoints</span>
            </div>

            <div className="card" style={{ padding: '14px 18px' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Degraded Service Alert</span>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--p2-color)', marginTop: 2 }}>
                Billing Service
              </div>
              <span style={{ fontSize: 11.5, color: 'var(--p2-color)' }}>
                Elevated latency (1420ms) & connection pool load
              </span>
            </div>

            <div className="card" style={{ padding: '14px 18px' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Platform Monthly SLA</span>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--status-resolved)', marginTop: 2 }}>
                99.94% Uptime
              </div>
              <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>Meeting SLO target (&gt;99.9%)</span>
            </div>
          </div>

          {/* Full System Health Widget */}
          <SystemHealthWidget services={systemHealth} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: INCIDENT ANALYTICS & DISTRIBUTION                             */}
      {/* ========================================================================= */}
      {activeSection === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14,
            }}
          >
            <div className="card" style={{ padding: '14px 18px' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Tracked Incidents</span>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                {stats.totalIncidents}
              </div>
              <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                {stats.openIncidents} active • {stats.resolvedCount} resolved
              </span>
            </div>

            <div className="card" style={{ padding: '14px 18px' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>P1 Critical Incident Ratio</span>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--p1-color)', marginTop: 2 }}>
                {Math.round((stats.criticalCount / (stats.totalIncidents || 1)) * 100)}%
              </div>
              <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                {stats.criticalCount} currently open P1 incidents
              </span>
            </div>

            <div className="card" style={{ padding: '14px 18px' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Noise Reduction (Feature 3)</span>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>
                {stats.alertReductionPercent}%
              </div>
              <span style={{ fontSize: 11.5, color: 'var(--status-resolved)' }}>
                Duplicate alerts suppressed & grouped
              </span>
            </div>

            <div className="card" style={{ padding: '14px 18px' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>MTTR Efficiency Gain</span>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--status-resolved)', marginTop: 2 }}>
                37.5% Faster
              </div>
              <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                Average 30m vs historical 48m
              </span>
            </div>
          </div>

          <IncidentDistributionChart
            distribution={stats.categoryDistribution}
            statusCounts={stats.statusCounts}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: RECURRING PROBLEMS & RISK                                      */}
      {/* ========================================================================= */}
      {activeSection === 'recurring' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Recurring risk explanation banner */}
          <div
            className="card"
            style={{
              padding: '16px 20px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>
                Chronic Failure Pattern Detection (Feature 10 & 14)
              </div>
              <div style={{ fontSize: 12.5, color: '#b45309', marginTop: 2 }}>
                Identifies recurring issues sharing similar root causes, tracks engineering assignments, and verifies permanent corrective actions.
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/knowledge-base')}
              iconRight={<BookOpen size={14} />}
            >
              Browse Verified Fixes
            </Button>
          </div>

          <RecurringProblemsWidget problems={stats.recurringProblems} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: EXECUTIVE OVERVIEW (ALL SECTIONS COMPACT)                      */}
      {/* ========================================================================= */}
      {activeSection === 'all' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Priority Queue & Recurring Issues */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr',
              gap: 20,
            }}
          >
            <PriorityQueueWidget incidents={incidents} />
            <RecurringProblemsWidget problems={stats.recurringProblems} />
          </div>

          {/* System Health & Incident Distribution */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: 20,
            }}
          >
            <SystemHealthWidget services={systemHealth} />
            <IncidentDistributionChart
              distribution={stats.categoryDistribution}
              statusCounts={stats.statusCounts}
            />
          </div>
        </div>
      )}
    </div>
  );
};

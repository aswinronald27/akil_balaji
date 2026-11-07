import React from 'react';
import { Database, Globe, Network, Server, HardDrive, Layers } from 'lucide-react';
import { ServiceNode } from '../../types';

interface ServiceDependencyGraphProps {
  nodes: ServiceNode[];
}

export const ServiceDependencyGraph: React.FC<ServiceDependencyGraphProps> = ({ nodes }) => {
  const getNodeIcon = (type: ServiceNode['type']) => {
    switch (type) {
      case 'frontend':
        return <Globe size={18} />;
      case 'gateway':
        return <Network size={18} />;
      case 'database':
        return <Database size={18} />;
      case 'cache':
        return <HardDrive size={18} />;
      case 'queue':
        return <Layers size={18} />;
      default:
        return <Server size={18} />;
    }
  };

  const getStatusBorder = (status: ServiceNode['status']) => {
    switch (status) {
      case 'failing':
        return { border: '2px solid var(--p1-color)', bg: 'var(--p1-bg)' };
      case 'degraded':
        return { border: '2px solid var(--p2-color)', bg: 'var(--p2-bg)' };
      case 'healthy':
      default:
        return { border: '1px solid var(--border-default)', bg: 'var(--bg-surface-elevated)' };
    }
  };

  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
        Topology & Blast Radius: Failure in <span style={{ color: 'var(--p1-color)', fontWeight: 600 }}>PostgreSQL Primary</span> propagates upstream through Billing Service to API Gateway and Web Storefront.
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        {nodes.map(node => {
          const styleConfig = getStatusBorder(node.status);
          return (
            <div
              key={node.id}
              style={{
                padding: '16px 18px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: styleConfig.bg,
                border: styleConfig.border,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                boxShadow: node.status === 'failing' ? 'var(--shadow-md)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      color:
                        node.status === 'failing'
                          ? 'var(--p1-color)'
                          : node.status === 'degraded'
                          ? 'var(--p2-color)'
                          : 'var(--status-resolved)',
                    }}
                  >
                    {getNodeIcon(node.type)}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {node.name}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    backgroundColor:
                      node.status === 'failing'
                        ? 'var(--p1-color)'
                        : node.status === 'degraded'
                        ? 'var(--p2-color)'
                        : 'var(--status-resolved)',
                    color: '#ffffff',
                  }}
                >
                  {node.status}
                </span>
              </div>

              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Type: {node.type} • ID: {node.id}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 8,
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: 12,
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Latency: </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{node.latencyMs}ms</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Errors: </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: node.status === 'failing' ? 'var(--p1-color)' : 'var(--text-secondary)',
                    }}
                  >
                    {node.errorRate}
                  </span>
                </div>
              </div>

              {node.dependencies.length > 0 && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Calls: {node.dependencies.join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

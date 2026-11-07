import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  PlusCircle,
  FileText,
  Sparkles,
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Server,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      to: '/incidents',
      label: 'Incident Queue',
      icon: <AlertTriangle size={18} />,
      badge: '2 Critical',
    },
    {
      to: '/incidents/new',
      label: 'Create Incident',
      icon: <PlusCircle size={18} />,
    },
    {
      to: '/logs/upload',
      label: 'Log Upload',
      icon: <FileText size={18} />,
    },
    {
      to: '/logs/analysis',
      label: 'Log Analysis',
      icon: <Server size={18} />,
    },
    {
      to: '/ai-root-cause',
      label: 'Root-Cause Analysis',
      icon: <Sparkles size={18} />,
    },
    {
      to: '/historical-search',
      label: 'Historical Search',
      icon: <Search size={18} />,
    },
    {
      to: '/knowledge-base',
      label: 'Knowledge Base',
      icon: <BookOpen size={18} />,
    },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Server size={18} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                IntelliDesk
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                IT Incident Platform
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="btn btn-ghost btn-sm"
          style={{ padding: 6, margin: collapsed ? '0 auto' : '0' }}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation links */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <span>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && item.badge && (
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 10.5,
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--p1-bg)',
                  color: 'var(--p1-color)',
                }}
              >
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Info Box */}
      {!collapsed && (
        <div style={{ padding: '14px 12px', borderTop: '1px solid var(--border-subtle)' }}>
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <ShieldCheck size={14} style={{ color: 'var(--status-resolved)' }} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                System Status: Normal
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Data protection & audit logs active
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Sun,
  Moon,
  PlusCircle,
  ChevronDown,
  LogOut,
  UserCheck,
  Search,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/common/Button';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const availableRoles: UserRole[] = [
    'Incident Commander',
    'Senior SRE',
    'DevOps Lead',
    'Support Engineer',
  ];

  return (
    <header className="navbar">
      {/* Left side: Simple clean incident alert notice */}
      <div className="navbar-left">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--p1-bg)',
            border: '1px solid var(--p1-border)',
            fontSize: 12,
            color: 'var(--p1-color)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/incidents/INC-2024-1042')}
        >
          <AlertCircle size={14} />
          <span>Active Critical Incident: INC-2024-1042 (PostgreSQL Connection Pool)</span>
        </div>
      </div>

      {/* Right side: Actions & User menu */}
      <div className="navbar-right">
        {/* Quick Search */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/historical-search')}
          icon={<Search size={14} />}
          style={{ color: 'var(--text-secondary)' }}
        >
          <span>Search Solutions</span>
        </Button>

        {/* Create Incident Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/incidents/new')}
          icon={<PlusCircle size={14} />}
        >
          New Incident
        </Button>

        {/* Theme Toggle */}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          style={{ padding: 7, borderRadius: 'var(--radius-full)' }}
        >
          {theme === 'dark' ? (
            <Sun size={16} style={{ color: '#f59e0b' }} />
          ) : (
            <Moon size={16} style={{ color: '#64748b' }} />
          )}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ padding: 7, borderRadius: 'var(--radius-full)', position: 'relative' }}
          >
            <Bell size={16} style={{ color: 'var(--text-secondary)' }} />
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'var(--p1-color)',
              }}
            />
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 40,
                width: 300,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                zIndex: 60,
                padding: '8px 0',
              }}
            >
              <div
                style={{
                  padding: '6px 14px 8px',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Recent System Alerts</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Latest</span>
              </div>
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                <div
                  style={{
                    padding: '8px 14px',
                    borderBottom: '1px solid var(--border-subtle)',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    navigate('/incidents/INC-2024-1042');
                    setShowNotifications(false);
                  }}
                >
                  <div style={{ color: 'var(--p1-color)', fontWeight: 600 }}>
                    Prometheus: DatabasePoolExhausted
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                    db-prod-01 active connections 500/500
                  </div>
                </div>
                <div
                  style={{
                    padding: '8px 14px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    navigate('/incidents/INC-2024-1039');
                    setShowNotifications(false);
                  }}
                >
                  <div style={{ color: 'var(--p2-color)', fontWeight: 600 }}>
                    Datadog: Payment Gateway 504 Timeout
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                    Downstream webhook timeout 20s
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        {user && (
          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 8px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                backgroundColor: showRoleMenu ? 'var(--bg-hover)' : 'transparent',
              }}
              onClick={() => setShowRoleMenu(!showRoleMenu)}
            >
              <img
                src={user.avatar}
                alt={user.name}
                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {user.role}
                </span>
              </div>
              <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
            </div>

            {showRoleMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 44,
                  width: 220,
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 60,
                  padding: '6px 0',
                }}
              >
                <div
                  style={{
                    padding: '6px 12px 6px',
                    borderBottom: '1px solid var(--border-subtle)',
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  Switch Demo Role
                </div>
                {availableRoles.map(role => (
                  <button
                    key={role}
                    type="button"
                    style={{
                      width: '100%',
                      padding: '7px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: user.role === role ? 'var(--primary-light)' : 'transparent',
                      border: 'none',
                      color: user.role === role ? 'var(--primary)' : 'var(--text-primary)',
                      fontSize: 12.5,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onClick={() => {
                      switchRole(role);
                      setShowRoleMenu(false);
                    }}
                  >
                    <span>{role}</span>
                    {user.role === role && <UserCheck size={14} />}
                  </button>
                ))}

                <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 4, paddingTop: 4 }}>
                  <button
                    type="button"
                    style={{
                      width: '100%',
                      padding: '7px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--p1-color)',
                      fontSize: 12.5,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

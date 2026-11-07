import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, Mail, Users, CheckCircle2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Button } from '../components/common/Button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('elena.rostova@intellidesk.io');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Incident Commander');
  const [isLoading, setIsLoading] = useState(false);

  const demoProfiles: { role: UserRole; name: string; email: string; avatar: string; description: string }[] = [
    {
      role: 'Incident Commander',
      name: 'Elena Rostova',
      email: 'elena.rostova@intellidesk.io',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      description: 'NOC Lead & production action approver',
    },
    {
      role: 'Senior SRE',
      name: 'Alex Rivera',
      email: 'alex.rivera@intellidesk.io',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      description: 'Infrastructure and database diagnostics',
    },
    {
      role: 'DevOps Lead',
      name: 'Marcus Vance',
      email: 'marcus.vance@intellidesk.io',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      description: 'CI/CD and deployment rollbacks',
    },
    {
      role: 'Support Engineer',
      name: 'Priya Sharma',
      email: 'priya.sharma@intellidesk.io',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
      description: 'Incident intake & runbook execution',
    },
  ];

  const handleSelectProfile = (profile: typeof demoProfiles[0]) => {
    setSelectedRole(profile.role);
    setEmail(profile.email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password, selectedRole);
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        backgroundColor: '#ffffff',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 920,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Left Side: Overview & Features */}
        <div
          style={{
            padding: '40px 36px',
            backgroundColor: '#fbfbfb',
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  backgroundColor: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Shield size={20} />
              </div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
                  IntelliDesk
                </h1>
                <p style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                  Smart IT Incident Intelligence Platform
                </p>
              </div>
            </div>

            <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, marginBottom: 20 }}>
              A centralized platform that helps IT teams detect issues, analyze logs, identify probable root causes, and reuse verified solutions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[
                'Unified Incident Intake with AI Classification',
                'Smart Log Analysis with Secret Redaction',
                'AI-assisted Root Cause Recommendations',
                'Verified Solutions & Runbooks Knowledge Base',
                'Service Dependency & Blast Radius Mapping',
              ].map((feat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1e293b' }}>
                  <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#ffffff',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: '#64748b',
            }}
          >
            <ShieldCheck size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
            <span>Enterprise Security • Role-Based Access Controls</span>
          </div>
        </div>

        {/* Right Side: Sign-in & Fast Demo Persona Switcher */}
        <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
            Sign In to IntelliDesk
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 18 }}>
            Choose a quick demo profile or enter your credentials.
          </p>

          {/* Quick Demo Persona Selector */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>
              Select Demo User:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {demoProfiles.map(p => {
                const isSelected = selectedRole === p.role;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleSelectProfile(p)}
                    style={{
                      padding: '7px 8px',
                      borderRadius: 6,
                      border: isSelected ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      color: isSelected ? '#1d4ed8' : '#1e293b',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <img
                      src={p.avatar}
                      alt={p.name}
                      style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 9.5, color: '#64748b', whiteSpace: 'nowrap' }}>
                        {p.role}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 12.5 }}>Work Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 10, top: 11, color: '#94a3b8' }} />
                <input
                  type="email"
                  className="input-text"
                  style={{ paddingLeft: 32, fontSize: 13, height: 36 }}
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 12.5 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 10, top: 11, color: '#94a3b8' }} />
                <input
                  type="password"
                  className="input-text"
                  style={{ paddingLeft: 32, fontSize: 13, height: 36 }}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              iconRight={<ArrowRight size={15} />}
              style={{ marginTop: 4 }}
            >
              Log In as {selectedRole}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
  FileCode,
  Terminal,
} from 'lucide-react';
import { logService } from '../services/logService';
import { Button } from '../components/common/Button';

export const LogUploadPage: React.FC = () => {
  const navigate = useNavigate();

  const [uploadMode, setUploadMode] = useState<'file' | 'paste'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pasteContent, setPasteContent] = useState('');
  const [service, setService] = useState('Billing Service');
  const [incidentId, setIncidentId] = useState('INC-2024-1042');
  const [redactSensitiveData, setRedactSensitiveData] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const sampleLogData = `2026-11-04 16:38:12.014 INFO  [main] c.e.b.BillingApplication: Started BillingApplication with api_key="sk_live_9481948194810294"
2026-11-04 16:39:18.990 WARN  [HikariPool-1 housekeeper] c.z.h.p.HikariPool: Pool usage warning: active=425, idle=75, waiting=14
2026-11-04 16:39:48.102 FATAL [billing-worker-7] org.postgresql.Driver: FATAL: 53300: remaining connection slots are reserved for non-replication superuser connections (client_token=Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)
2026-11-04 16:40:02.481 ERROR [HikariPool-1 housekeeper] c.z.h.p.HikariPool: HikariPool-1 - Connection is not available, request timed out after 30005ms
2026-11-04 16:40:15.890 ERROR [http-nio-8080-exec-14] c.e.b.c.PaymentController: Internal Server Error on /v2/invoices/process for card 4111 2222 3333 4444
	at org.postgresql.core.v3.ConnectionFactoryImpl.openConnectionImpl(ConnectionFactoryImpl.java:317)
	at com.zaxxer.hikari.pool.HikariPool.createPoolEntry(HikariPool.java:470)`;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUseSample = () => {
    setUploadMode('paste');
    setPasteContent(sampleLogData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = uploadMode === 'file' ? sampleLogData : pasteContent;
    const fileName = selectedFile ? selectedFile.name : `${service.toLowerCase().replace(/\s+/g, '-')}-incident.log`;

    setIsUploading(true);
    try {
      const analysis = await logService.uploadLog({
        fileName,
        fileContent: content,
        service,
        incidentId,
        redactSensitiveData,
      });
      navigate(`/logs/analysis/${analysis.id}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 960, margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Smart Log Ingestion & Redaction Interface
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          Feature 4 & 11.2: Ingest multi-line logs, extract error patterns, and redact secrets before AI reasoning.
        </p>
      </div>

      {/* Preset sample button */}
      <div
        style={{
          padding: '12px 18px',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Need quick test logs with secrets and database connection timeouts?
        </span>
        <Button variant="outline" size="sm" onClick={handleUseSample} icon={<Terminal size={14} />}>
          Load Sample Production Log Snippet
        </Button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Destination & Association Settings */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
            Ingestion Context & Target System
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Service / Application Name *</label>
              <select
                className="form-select"
                value={service}
                onChange={e => setService(e.target.value)}
              >
                <option value="Billing Service">Billing Service</option>
                <option value="Payment Gateway">Payment Gateway</option>
                <option value="Auth Service">Auth Service</option>
                <option value="Order Service">Order Service</option>
                <option value="API Gateway">API Gateway</option>
                <option value="Telemetry Pipeline">Telemetry Pipeline</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Associated Incident ID (Optional)</label>
              <select
                className="form-select"
                value={incidentId}
                onChange={e => setIncidentId(e.target.value)}
              >
                <option value="INC-2024-1042">INC-2024-1042 (Postgres Pool Exhaustion)</option>
                <option value="INC-2024-1039">INC-2024-1039 (Payment Gateway 504)</option>
                <option value="INC-2024-1033">INC-2024-1033 (Redis Session OOM)</option>
                <option value="">Standalone / Ad-Hoc Inspection</option>
              </select>
            </div>
          </div>

          {/* Section 11.2: Sensitive Data Protection Card */}
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: redactSensitiveData ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: redactSensitiveData ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--p1-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {redactSensitiveData ? (
                <ShieldCheck size={22} style={{ color: 'var(--status-resolved)' }} />
              ) : (
                <ShieldAlert size={22} style={{ color: 'var(--p1-color)' }} />
              )}
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {redactSensitiveData ? 'Sensitive Data Redaction Enabled (Section 11.2)' : 'Sensitive Data Redaction Disabled'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Automatically masks API keys, passwords, bearer tokens, and credit card numbers before LLM processing.
                </div>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={redactSensitiveData}
                onChange={e => setRedactSensitiveData(e.target.checked)}
              />
              <span>Active</span>
            </label>
          </div>
        </div>

        {/* Input Method Toggle */}
        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            type="button"
            variant={uploadMode === 'file' ? 'primary' : 'outline'}
            onClick={() => setUploadMode('file')}
            icon={<Upload size={14} />}
          >
            File Drag & Drop (.log, .txt, .json)
          </Button>
          <Button
            type="button"
            variant={uploadMode === 'paste' ? 'primary' : 'outline'}
            onClick={() => setUploadMode('paste')}
            icon={<FileText size={14} />}
          >
            Direct Text Paste
          </Button>
        </div>

        {/* File Drag & Drop Zone */}
        {uploadMode === 'file' ? (
          <div
            className={`dropzone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('log-file-input')?.click()}
          >
            <input
              id="log-file-input"
              type="file"
              style={{ display: 'none' }}
              accept=".log,.txt,.json,.csv"
              onChange={handleFileChange}
            />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-cyan)',
                }}
              >
                <FileCode size={26} />
              </div>

              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedFile ? selectedFile.name : 'Choose log file or drag & drop here'}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB • Ready for extraction`
                    : 'Supported formats: Standard JVM logs, Syslog, Nginx/Envoy access logs, JSON logs (max 50MB)'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 20 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Paste Raw Log Stream</label>
              <textarea
                className="form-textarea"
                rows={10}
                style={{ fontFamily: 'monospace', fontSize: 12 }}
                placeholder="Paste multi-line logs, stack traces, or JSON event streams..."
                value={pasteContent}
                onChange={e => setPasteContent(e.target.value)}
              />
            </div>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isUploading}
          iconRight={<ArrowRight size={16} />}
        >
          Parse Log & Generate AI Anomaly Diagnostics
        </Button>
      </form>
    </div>
  );
};

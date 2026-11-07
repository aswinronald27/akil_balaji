import React, { useState } from 'react';
import { Priority, PreventionTask } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface PreventionTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<PreventionTask, 'id'>) => Promise<void>;
  incidentId: string;
}

export const PreventionTaskModal: React.FC<PreventionTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  incidentId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<Priority>('P2');
  const [dueDate, setDueDate] = useState('');
  const [evidenceRequired, setEvidenceRequired] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !assignee || !dueDate) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        assignee,
        priority,
        dueDate,
        status: 'pending',
        evidenceRequired,
      });
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setAssignee('');
      setDueDate('');
      setEvidenceRequired('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Create Permanent Prevention Task (${incidentId})`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            Create Prevention Task
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
          Prevent this incident from recurring by binding permanent architectural fixes, code refactors, or infrastructure tuning with required verification evidence.
        </div>

        <div className="form-group">
          <label className="form-label">Task Title *</label>
          <input
            type="text"
            className="input-text"
            required
            placeholder="e.g. Add PgBouncer connection proxy & configure Hikari leak detection"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Corrective Action Plan *</label>
          <textarea
            className="form-textarea"
            required
            placeholder="Detail the technical steps needed to permanently eliminate the root cause..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Assignee / Team *</label>
            <input
              type="text"
              className="input-text"
              required
              placeholder="e.g. David Chen (FinTech Backend)"
              value={assignee}
              onChange={e => setAssignee(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="form-select"
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
            >
              <option value="P1">P1 - Urgent</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Medium</option>
              <option value="P4">P4 - Low</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Due Date *</label>
            <input
              type="date"
              className="input-text"
              required
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Evidence Required for Closure</label>
            <input
              type="text"
              className="input-text"
              placeholder="e.g. Merged GitHub PR #412 + Grafana load test metric"
              value={evidenceRequired}
              onChange={e => setEvidenceRequired(e.target.value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

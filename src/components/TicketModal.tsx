import React, { useState, useEffect } from 'react';
import { Ticket, Priority, TicketStatus } from '../types';
import { TEAM_MEMBERS } from '../store';
import { X } from 'lucide-react';

interface TicketModalProps {
  isOpen: boolean;
  ticketToEdit: Ticket | null;
  allTickets: Ticket[];
  defaultStatus?: TicketStatus;
  defaultDate?: string;
  onClose: () => void;
  onSave: (ticketData: Partial<Ticket>, isEdit: boolean) => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  ticketToEdit,
  allTickets,
  defaultStatus,
  defaultDate,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [status, setStatus] = useState<TicketStatus>('backlog');
  const [assignee, setAssignee] = useState('');
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dependencies, setDependencies] = useState<string[]>([]);

  useEffect(() => {
    if (ticketToEdit) {
      setTitle(ticketToEdit.title);
      setDescription(ticketToEdit.description || '');
      setPriority(ticketToEdit.priority);
      setStatus(ticketToEdit.status);
      setAssignee(ticketToEdit.assignee || '');
      setProgress(ticketToEdit.progress);
      setStartDate(ticketToEdit.startDate);
      setEndDate(ticketToEdit.endDate);
      setDependencies(ticketToEdit.dependencies || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('normal');
      setStatus(defaultStatus || 'backlog');
      setAssignee('');
      setProgress(0);
      const today = defaultDate ? new Date(defaultDate) : new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setStartDate(today.toISOString().split('T')[0]);
      setEndDate(nextWeek.toISOString().split('T')[0]);
      setDependencies([]);
    }
  }, [isOpen, ticketToEdit, defaultStatus, defaultDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: ticketToEdit ? ticketToEdit.id : undefined,
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      assignee,
      progress: status === 'done' ? 100 : progress,
      startDate,
      endDate,
      dependencies
    }, !!ticketToEdit);
  };

  const availableTickets = allTickets.filter(t => !ticketToEdit || t.id !== ticketToEdit.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h3 className="text-xl font-bold text-gray-900">
            {ticketToEdit ? 'Edit Tiket' : 'Buat Tiket Baru'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Tiket *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Contoh: Integrasi Payment Gateway"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Penjelasan detail tugas..."
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Prioritas</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="low">🟢 Low</option>
                  <option value="normal">🟡 Normal</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={e => {
                    const st = e.target.value as TicketStatus;
                    setStatus(st);
                    if (st === 'done') setProgress(100);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="backlog">Backlog</option>
                  <option value="in-progress">In Progress</option>
                  <option value="in-validation">In Validation</option>
                  <option value="done">Done</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Assignee</label>
                <select
                  value={assignee}
                  onChange={e => setAssignee(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">Tidak ditugaskan</option>
                  {TEAM_MEMBERS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={e => setProgress(parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Mulai *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Selesai *</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Dependensi (Tugas Pendahulu)</label>
              <select
                multiple
                value={dependencies}
                onChange={e => setDependencies(Array.from(e.target.selectedOptions, o => o.value))}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                style={{ minHeight: '90px' }}
              >
                {availableTickets.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.id} - {t.title}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 mt-1">Tekan Ctrl/Cmd untuk memilih lebih dari satu.</p>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm shadow-blue-500/20 transition"
            >
              Simpan Tiket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

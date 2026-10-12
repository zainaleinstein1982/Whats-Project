import React, { useState } from 'react';
import { Ticket, Priority, TicketStatus } from '../types';
import { CPMEngine } from '../utils/cpm';
import { Search, Edit2, Trash2 } from 'lucide-react';

interface TicketListViewProps {
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
  onEditTicket: (ticketId: string) => void;
  onDeleteTicket: (ticketId: string) => void;
}

export const TicketListView: React.FC<TicketListViewProps> = ({
  tickets,
  onSelectTicket,
  onEditTicket,
  onDeleteTicket
}) => {
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');

  const cpmResult = CPMEngine.calculate(tickets);
  const cpmMap: Record<string, any> = {};
  cpmResult.tasks.forEach(t => { cpmMap[t.id] = t; });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = tickets.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchPriority = !filterPriority || t.priority === filterPriority;
    const matchStatus = !filterStatus || t.status === filterStatus;
    return matchSearch && matchPriority && matchStatus;
  });

  if (sortBy) {
    const priorityOrder: Record<Priority, number> = { high: 0, normal: 1, low: 2 };
    filtered.sort((a, b) => {
      if (sortBy === 'dueDate') return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      if (sortBy === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority];
      if (sortBy === 'progress') return b.progress - a.progress;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });
  }

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'high': return <span className="text-xs font-semibold text-red-700 bg-red-100 px-2.5 py-1 rounded-full">🔴 High</span>;
      case 'normal': return <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">🟡 Normal</span>;
      case 'low': return <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">🟢 Low</span>;
    }
  };

  const getStatusBadge = (s: TicketStatus) => {
    switch (s) {
      case 'done': return <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">Done</span>;
      case 'in-progress': return <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">In Progress</span>;
      case 'in-validation': return <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">In Validation</span>;
      case 'archived': return <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">Archived</span>;
      default: return <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">Backlog</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden max-w-7xl mx-auto">
      {/* Filters bar */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari ID atau judul tiket..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">Semua Prioritas</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">Semua Status</option>
            <option value="backlog">Backlog</option>
            <option value="in-progress">In Progress</option>
            <option value="in-validation">In Validation</option>
            <option value="done">Done</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">Urutkan Berdasarkan</option>
            <option value="dueDate">Due Date Terdekat</option>
            <option value="priority">Prioritas Tertinggi</option>
            <option value="progress">Progress Tertinggi</option>
            <option value="title">Judul (A-Z)</option>
          </select>
        </div>

        <span className="text-sm font-bold text-gray-500">{filtered.length} dari {tickets.length} tiket</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
              <th className="text-left py-3.5 px-4">ID</th>
              <th className="text-left py-3.5 px-4">Judul Tiket</th>
              <th className="text-left py-3.5 px-4">Prioritas</th>
              <th className="text-left py-3.5 px-4">Status</th>
              <th className="text-left py-3.5 px-4">Assignee</th>
              <th className="text-left py-3.5 px-4">Mulai</th>
              <th className="text-left py-3.5 px-4">Selesai</th>
              <th className="text-left py-3.5 px-4">Progress</th>
              <th className="text-center py-3.5 px-4">Float</th>
              <th className="text-right py-3.5 px-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(t => {
              const cpmTask = cpmMap[t.id];
              const overdue = t.status !== 'done' && t.status !== 'archived' && new Date(t.endDate).getTime() < today.getTime();
              return (
                <tr key={t.id} className="hover:bg-gray-50/80 transition">
                  <td className="py-3 px-4 font-mono text-xs text-gray-500">{t.id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    <button
                      onClick={() => onSelectTicket(t.id)}
                      className="hover:text-blue-600 transition flex items-center gap-2 text-left"
                    >
                      {overdue && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">⚠️</span>}
                      {t.title}
                    </button>
                  </td>
                  <td className="py-3 px-4">{getPriorityBadge(t.priority)}</td>
                  <td className="py-3 px-4">{getStatusBadge(t.status)}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{t.assignee || '-'}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{t.startDate}</td>
                  <td className={`py-3 px-4 text-xs ${overdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}>{t.endDate}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${t.progress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-600">{t.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {cpmTask ? (
                      <span className={`font-mono font-bold text-xs ${cpmTask.isCritical ? 'text-red-600' : 'text-green-600'}`}>
                        {cpmTask.totalFloat}d
                      </span>
                    ) : '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEditTicket(t.id)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTicket(t.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

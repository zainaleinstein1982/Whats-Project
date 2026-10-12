import React from 'react';
import { Ticket } from '../types';
import { CPMEngine } from '../utils/cpm';
import { GitCommit, ArrowRight } from 'lucide-react';

interface CPMViewProps {
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
}

export const CPMView: React.FC<CPMViewProps> = ({ tickets, onSelectTicket }) => {
  const activeTickets = tickets.filter(t => t.status !== 'archived');
  const result = CPMEngine.calculate(activeTickets);
  const { tasks, criticalPath, projectDuration, criticalTasks } = result;

  const sortedTasks = [...tasks].sort((a, b) => (a.ES || 0) - (b.ES || 0));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Durasi Proyek</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{projectDuration} <span className="text-base font-normal text-gray-500">hari</span></p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Tugas</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{tasks.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-red-100 bg-red-50/40">
          <p className="text-xs text-red-600 font-semibold uppercase tracking-wider">Tugas Kritis</p>
          <p className="text-3xl font-extrabold text-red-700 mt-1">{criticalTasks.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Float Minimum</p>
          <p className="text-3xl font-extrabold text-green-600 mt-1">
            {tasks.length > 0 ? Math.min(...tasks.map(t => t.totalFloat || 0)) : 0} hari
          </p>
        </div>
      </div>

      {/* Visual Critical Path Trace */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
          <GitCommit className="w-5 h-5 text-red-600" /> Jalur Kritis (Critical Path)
        </h3>
        <div className="flex items-center gap-3 flex-wrap py-2">
          {criticalPath.map((taskId, i) => {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return null;
            return (
              <React.Fragment key={taskId}>
                <div
                  onClick={() => onSelectTicket(taskId)}
                  className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center min-w-[160px] cursor-pointer hover:bg-red-100 transition shadow-xs"
                >
                  <span className="text-xs font-mono font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">{task.id}</span>
                  <p className="text-sm font-semibold text-gray-900 mt-2 line-clamp-1">{task.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{task.duration} hari kerja</p>
                </div>
                {i < criticalPath.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-red-400 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-sm text-red-800 font-medium">
            <strong>Analisis:</strong> Keterlambatan pada tugas mana pun di jalur kritis ini akan memperpanjang total durasi proyek ({projectDuration} hari).
          </p>
        </div>
      </div>

      {/* CPM Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-base">Tabel Analisis CPM Lengkap</h3>
          <p className="text-xs text-gray-500 mt-0.5">ES = Early Start, EF = Early Finish, LS = Late Start, LF = Late Finish, Float = Total Slack</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                <th className="text-left py-3.5 px-4">ID</th>
                <th className="text-left py-3.5 px-4">Nama Tugas</th>
                <th className="text-center py-3.5 px-4">Durasi</th>
                <th className="text-center py-3.5 px-4">Dependensi</th>
                <th className="text-center py-3.5 px-4 text-blue-600">ES</th>
                <th className="text-center py-3.5 px-4 text-blue-600">EF</th>
                <th className="text-center py-3.5 px-4 text-purple-600">LS</th>
                <th className="text-center py-3.5 px-4 text-purple-600">LF</th>
                <th className="text-center py-3.5 px-4">Float</th>
                <th className="text-center py-3.5 px-4">Status Jalur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedTasks.map(t => (
                <tr
                  key={t.id}
                  onClick={() => onSelectTicket(t.id)}
                  className={`hover:bg-gray-50/80 cursor-pointer transition ${t.isCritical ? 'bg-red-50/40 font-medium' : ''}`}
                >
                  <td className="py-3 px-4 font-mono text-xs text-gray-500">{t.id}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {t.isCritical && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
                      <span className="text-gray-900 font-semibold">{t.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">{t.duration}d</td>
                  <td className="py-3 px-4 text-center text-xs text-gray-500">
                    {t.dependencies.length > 0 ? t.dependencies.join(', ') : '-'}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-blue-600 font-bold">{t.ES}</td>
                  <td className="py-3 px-4 text-center font-mono text-blue-600 font-bold">{t.EF}</td>
                  <td className="py-3 px-4 text-center font-mono text-purple-600 font-bold">{t.LS}</td>
                  <td className="py-3 px-4 text-center font-mono text-purple-600 font-bold">{t.LF}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-mono font-bold ${t.isCritical ? 'text-red-600' : 'text-green-600'}`}>
                      {t.totalFloat}d
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {t.isCritical ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        ⚡ KRITIS
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        Normal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

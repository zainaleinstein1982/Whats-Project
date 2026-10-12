import React from 'react';
import { Ticket } from '../types';
import { TEAM_MEMBERS } from '../store';
import { Users, Clock, AlertTriangle } from 'lucide-react';

interface WorkloadViewProps {
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
}

export const WorkloadView: React.FC<WorkloadViewProps> = ({ tickets, onSelectTicket }) => {
  const workload = TEAM_MEMBERS.map(name => {
    const assigned = tickets.filter(t => t.assignee === name);
    const active = assigned.filter(t => t.status === 'in-progress' || t.status === 'in-validation');
    const totalHours = assigned.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
    const avgProgress = assigned.length > 0 
      ? Math.round(assigned.reduce((sum, t) => sum + t.progress, 0) / assigned.length) 
      : 0;
    return { name, assigned, active, activeCount: active.length, totalHours, avgProgress };
  });

  const maxActive = Math.max(...workload.map(w => w.activeCount), 1);
  const totalAssignedActive = workload.reduce((s, w) => s + w.activeCount, 0);
  const totalTeamHours = workload.reduce((s, w) => s + w.totalHours, 0);
  const overallAvgProgress = TEAM_MEMBERS.length > 0 
    ? Math.round(workload.reduce((s, w) => s + w.avgProgress, 0) / TEAM_MEMBERS.length) 
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Anggota</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{TEAM_MEMBERS.length}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Tiket Aktif</p>
            <p className="text-3xl font-extrabold text-blue-600 mt-1">{totalAssignedActive}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
            ⚡
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Jam Kerja</p>
            <p className="text-3xl font-extrabold text-indigo-600 mt-1">{totalTeamHours.toFixed(1)}h</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Rata-rata Progress</p>
            <p className="text-3xl font-extrabold text-green-600 mt-1">{overallAvgProgress}%</p>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center font-bold">
            📈
          </div>
        </div>
      </div>

      {/* Workload Bars */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 text-base mb-6">Beban Kerja Anggota Tim</h3>
        <div className="space-y-5">
          {workload.map(w => {
            const loadLevel = w.activeCount < 3 ? 'green' : w.activeCount <= 5 ? 'yellow' : 'red';
            const colors = { green: 'bg-green-500', yellow: 'bg-amber-500', red: 'bg-red-500' };
            const bgColors = { green: 'bg-green-50/40 border-green-100', yellow: 'bg-amber-50/40 border-amber-100', red: 'bg-red-50/50 border-red-200' };
            const textColors = { green: 'text-green-700', yellow: 'text-amber-700', red: 'text-red-700' };
            const barWidth = (w.activeCount / maxActive) * 100;

            return (
              <div key={w.name} className={`p-4 rounded-2xl border ${bgColors[loadLevel]} transition`}>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      {w.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{w.name}</p>
                      <p className="text-xs text-gray-500">{w.assigned.length} total tiket • {w.activeCount} tiket aktif</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${textColors[loadLevel]}`}>{w.activeCount} aktif</p>
                    <p className="text-xs text-gray-500">{w.totalHours.toFixed(1)}h • {w.avgProgress}% avg progress</p>
                  </div>
                </div>
                <div className="w-full bg-white rounded-full h-2.5 mb-2 overflow-hidden shadow-2xs">
                  <div className={`h-2.5 rounded-full ${colors[loadLevel]} transition-all duration-500`} style={{ width: `${barWidth}%` }} />
                </div>
                {w.activeCount > 5 && (
                  <div className="text-xs font-semibold text-red-700 flex items-center gap-1.5 mt-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" /> Beban kerja tinggi! Pertimbangkan redistribusi tugas.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Per-Person Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workload.map(w => (
          <div key={w.name} className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  {w.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{w.name}</p>
                  <p className="text-xs text-gray-500">{w.activeCount} aktif • {w.totalHours.toFixed(1)}h</p>
                </div>
              </div>

              <div className="space-y-2">
                {w.assigned.filter(t => t.status !== 'done' && t.status !== 'archived').slice(0, 4).map(t => (
                  <div
                    key={t.id}
                    onClick={() => onSelectTicket(t.id)}
                    className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl hover:bg-blue-50/50 cursor-pointer transition text-xs border border-gray-100"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono font-bold text-gray-400">{t.id}</span>
                      <span className="font-medium text-gray-800 truncate">{t.title}</span>
                    </div>
                    <span className="font-bold text-blue-600 flex-shrink-0 ml-2">{t.progress}%</span>
                  </div>
                ))}
                {w.assigned.filter(t => t.status !== 'done' && t.status !== 'archived').length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">Tidak ada tiket aktif</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

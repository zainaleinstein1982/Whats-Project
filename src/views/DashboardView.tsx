import React from 'react';
import { Ticket } from '../types';
import { CPMEngine } from '../utils/cpm';
import { AlertTriangle, Clock, CheckCircle2, TrendingUp, Calendar, Layers, Sparkles, ArrowUpRight } from 'lucide-react';

interface DashboardViewProps {
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
  onNavigateView: (view: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ tickets, onSelectTicket, onNavigateView }) => {
  const cpmResult = CPMEngine.calculate(tickets.filter(t => t.status !== 'archived'));
  const criticalCount = cpmResult.criticalTasks.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTickets = tickets.filter(t => {
    if (t.status === 'done' || t.status === 'archived') return false;
    const end = new Date(t.endDate);
    end.setHours(0, 0, 0, 0);
    return end < today;
  });

  const upcomingDeadlines = tickets
    .filter(t => t.status !== 'done' && t.status !== 'archived')
    .filter(t => {
      const end = new Date(t.endDate);
      end.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    })
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 4);

  const totalHours = tickets.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
  const avgProgress = tickets.length > 0 
    ? Math.round(tickets.reduce((sum, t) => sum + t.progress, 0) / tickets.length) 
    : 0;

  const stats = {
    total: tickets.length,
    backlog: tickets.filter(t => t.status === 'backlog').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    inValidation: tickets.filter(t => t.status === 'in-validation').length,
    done: tickets.filter(t => t.status === 'done').length,
    highPriority: tickets.filter(t => t.priority === 'high').length,
    overdue: overdueTickets.length,
    critical: criticalCount,
    totalHours: totalHours.toFixed(1)
  };

  return (
    <div className="space-y-5 max-w-full mx-auto pb-8 select-none overflow-x-hidden">
      {/* Gorgeous Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="flex items-center justify-between mb-3 flex-wrap gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Whats Project Enterprise
              </span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">Progress Keseluruhan Proyek E-Commerce</h3>
            <p className="text-xs text-blue-100 mt-0.5">Rata-rata penyelesaian dari {stats.total} tiket pekerjaan utama</p>
          </div>
          <div className="text-right bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
            <div className="text-2xl font-black tracking-tight">{avgProgress}%</div>
            <div className="text-[11px] text-blue-100 font-semibold">{stats.done} dari {stats.total} tiket selesai</div>
          </div>
        </div>
        <div className="w-full bg-black/20 rounded-full h-3 p-0.5 relative z-10">
          <div className="h-2 rounded-full bg-white transition-all duration-700 shadow-sm" style={{ width: `${avgProgress}%` }} />
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-gray-100 flex flex-col justify-between hover:border-blue-200 transition">
          <div className="flex items-center justify-between text-gray-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Tiket</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-black text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-gray-100 flex flex-col justify-between hover:border-blue-200 transition">
          <div className="flex items-center justify-between text-gray-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">In Progress</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-amber-600">{stats.inProgress}</p>
        </div>

        <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-gray-100 flex flex-col justify-between hover:border-blue-200 transition">
          <div className="flex items-center justify-between text-gray-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xl font-black text-green-600">{stats.done}</p>
        </div>

        <div className={`bg-white rounded-2xl p-3.5 shadow-xs border ${stats.overdue > 0 ? 'border-red-200 bg-red-50/40' : 'border-gray-100'} flex flex-col justify-between`}>
          <div className="flex items-center justify-between text-gray-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-xl font-black text-red-700">{stats.overdue}</p>
        </div>

        <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-gray-100 flex flex-col justify-between hover:border-blue-200 transition">
          <div className="flex items-center justify-between text-gray-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Jalur Kritis</span>
            <span className="w-2 h-2 rounded-full bg-red-500" />
          </div>
          <p className="text-xl font-black text-red-600">{stats.critical}</p>
        </div>

        <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-gray-100 flex flex-col justify-between hover:border-blue-200 transition">
          <div className="flex items-center justify-between text-gray-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Jam</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl font-black text-indigo-600">{stats.totalHours}h</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Ticket Progress Bars */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-sm">Progress Tiket</h3>
            <button
              onClick={() => onNavigateView('tickets')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2.5 flex-1 pr-1 max-h-[380px] overflow-y-auto">
            {tickets.map(t => {
              const cpmTask = cpmResult.tasks.find(ct => ct.id === t.id);
              const isCritical = cpmTask?.isCritical;
              const overdue = overdueTickets.some(ot => ot.id === t.id);
              return (
                <div 
                  key={t.id} 
                  onClick={() => onSelectTicket(t.id)}
                  className="p-2 rounded-xl hover:bg-blue-50/40 cursor-pointer transition border border-transparent hover:border-blue-100 flex items-center gap-3"
                >
                  <span className="text-xs font-mono font-bold text-gray-400 w-7">{t.id}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-800 truncate flex items-center gap-2">
                        {isCritical && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" title="Critical Path" />}
                        {overdue && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">⚠️ Overdue</span>}
                        {t.title}
                      </span>
                      <span className="text-xs font-bold text-gray-600 ml-2">{t.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all ${isCritical ? 'bg-red-500' : t.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                        style={{ width: `${t.progress}%` }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Deadlines & Status Distribution */}
        <div className="space-y-5 flex flex-col">
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Upcoming Deadlines
            </h3>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Tidak ada deadline dalam 7 hari ke depan</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingDeadlines.map(t => {
                  const daysLeft = Math.ceil((new Date(t.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div
                      key={t.id}
                      onClick={() => onSelectTicket(t.id)}
                      className="p-3 border border-gray-100 rounded-xl hover:bg-blue-50/50 cursor-pointer transition shadow-2xs"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-mono text-gray-400">{t.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${daysLeft <= 2 ? 'bg-red-100 text-red-700' : daysLeft <= 4 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {daysLeft === 0 ? 'Hari ini' : `${daysLeft} hari`}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-800 line-clamp-1">{t.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{t.endDate} • {t.assignee || 'Unassigned'}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Distribusi Status</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-gray-400" /><span className="text-gray-600 font-medium">Backlog</span></div><span className="font-bold text-gray-900">{stats.backlog}</span></div>
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-gray-600 font-medium">In Progress</span></div><span className="font-bold text-gray-900">{stats.inProgress}</span></div>
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-purple-500" /><span className="text-gray-600 font-medium">In Validation</span></div><span className="font-bold text-gray-900">{stats.inValidation}</span></div>
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-gray-600 font-medium">Done</span></div><span className="font-bold text-gray-900">{stats.done}</span></div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold">
              <span className="text-gray-500">Durasi: <strong className="text-gray-800">{cpmResult.projectDuration}h</strong></span>
              <span className="text-red-600">Prioritas Tinggi: <strong>{stats.highPriority}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

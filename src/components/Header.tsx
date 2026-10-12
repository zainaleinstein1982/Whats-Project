import React, { useEffect, useState } from 'react';
import { ViewType, ActiveTimer, Ticket } from '../types';
import { Plus, Timer, Square } from 'lucide-react';

interface HeaderProps {
  currentView: ViewType;
  tickets: Ticket[];
  activeTimer: ActiveTimer | null;
  onOpenCreateModal: () => void;
  onStopTimer: () => void;
  onSelectTicket: (ticketId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  tickets,
  activeTimer,
  onOpenCreateModal,
  onStopTimer,
  onSelectTicket
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!activeTimer) {
      setElapsedSeconds(0);
      return;
    }
    const update = () => {
      setElapsedSeconds(Math.floor((Date.now() - activeTimer.startTime) / 1000));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const formatTime = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getTitles = (view: ViewType): [string, string] => {
    switch (view) {
      case 'dashboard': return ['Dashboard', 'Ringkasan proyek dan aktivitas tim'];
      case 'kanban': return ['Papan Kanban', 'Kelola tiket dengan drag-and-drop interaktif'];
      case 'gantt': return ['Gantt Chart', 'Visualisasi timeline dan jalur kritis proyek'];
      case 'cpm': return ['Jalur Kritis (CPM)', 'Critical Path Method untuk analisis durasi'];
      case 'tickets': return ['Semua Tiket', 'Daftar lengkap seluruh tiket pekerjaan'];
      case 'list': return ['List View', 'Tampilan spreadsheet dengan inline editing'];
      case 'calendar': return ['Kalender', 'Tampilan kalender bulanan proyek'];
      case 'workload': return ['Workload', 'Beban kerja dan distribusi tugas per anggota tim'];
      case 'activity': return ['Aktivitas Tim', 'Feed komentar dan log aktivitas proyek'];
      case 'detail': return ['Detail Tiket', 'Informasi lengkap, checklist, dan waktu kerja'];
      default: return ['Whats Project', 'Manajemen Proyek Modern'];
    }
  };

  const [title, subtitle] = getTitles(currentView);
  const activeTicket = activeTimer ? tickets.find(t => t.id === activeTimer.ticketId) : null;

  const showCreateBtn = ['kanban', 'tickets', 'list', 'calendar'].includes(currentView);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0 shadow-xs">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Active Timer Indicator */}
        {activeTimer && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <button 
              onClick={() => activeTicket && onSelectTicket(activeTicket.id)}
              className="text-xs font-semibold text-red-700 hover:underline truncate max-w-[120px]"
            >
              ⏱ {activeTicket ? activeTicket.id : ''}
            </button>
            <span className="text-xs font-mono font-bold text-red-700">{formatTime(elapsedSeconds)}</span>
            <button
              onClick={onStopTimer}
              className="ml-1 px-2 py-0.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 flex items-center gap-1 transition"
              title="Stop Timer"
            >
              <Square className="w-3 h-3 fill-current" /> Stop
            </button>
          </div>
        )}

        {showCreateBtn && (
          <button
            onClick={onOpenCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" /> Buat Tiket
          </button>
        )}
      </div>
    </header>
  );
};

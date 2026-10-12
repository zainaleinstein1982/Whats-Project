import React from 'react';
import { ViewType } from '../types';
import { 
  LayoutDashboard, 
  Kanban, 
  BarChart3, 
  GitCommit, 
  Ticket as TicketIcon, 
  ListOrdered, 
  Calendar as CalendarIcon, 
  Users, 
  Activity, 
  Upload, 
  Download, 
  RotateCcw,
  FolderKanban
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  onOpenImport: () => void;
  onExport: () => void;
  onReset: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onOpenImport,
  onExport,
  onReset
}) => {
  const menuItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kanban' as ViewType, label: 'Papan Kanban', icon: Kanban },
    { id: 'gantt' as ViewType, label: 'Gantt Chart', icon: BarChart3 },
    { id: 'cpm' as ViewType, label: 'Jalur Kritis (CPM)', icon: GitCommit },
  ];

  const projectItems = [
    { id: 'tickets' as ViewType, label: 'Semua Tiket', icon: TicketIcon },
    { id: 'list' as ViewType, label: 'List View', icon: ListOrdered },
    { id: 'calendar' as ViewType, label: 'Kalender', icon: CalendarIcon },
    { id: 'workload' as ViewType, label: 'Workload', icon: Users },
    { id: 'activity' as ViewType, label: 'Aktivitas Tim', icon: Activity },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0 h-screen select-none">
      {/* Brand Header */}
      <div className="p-3.5 border-b border-gray-800 flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
          <FolderKanban className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-sm tracking-wide text-white truncate">Whats Project</h1>
          <p className="text-[10px] text-gray-400 font-medium truncate">Modern PM</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto sidebar-scroll space-y-4">
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Menu Utama</div>
          <div className="space-y-0.5">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-blue-600/20 text-blue-400 border-l-3 border-blue-500 shadow-sm' 
                      : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="px-3 mb-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Proyek</div>
          <div className="space-y-0.5">
            {projectItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-blue-600/20 text-blue-400 border-l-3 border-blue-500 shadow-sm' 
                      : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="px-3 mb-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Data & Berkas</div>
          <div className="space-y-0.5">
            <button
              onClick={onOpenImport}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-gray-800/60 hover:text-emerald-300 transition-all"
            >
              <Upload className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="truncate">Import CSV</span>
            </button>
            <button
              onClick={onExport}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:bg-gray-800/60 hover:text-white transition-all"
            >
              <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">Export JSON</span>
            </button>
            <button
              onClick={onReset}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-gray-800/60 hover:text-red-300 transition-all"
            >
              <RotateCcw className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="truncate">Reset Data</span>
            </button>
          </div>
        </div>
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-gray-800 bg-gray-950/60 flex items-center gap-3 flex-shrink-0">
        <div className="w-7 h-7 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow flex-shrink-0">
          AP
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white truncate">Admin Proyek</p>
          <p className="text-[10px] text-gray-400 truncate">admin@whatsproject.id</p>
        </div>
      </div>
    </aside>
  );
};

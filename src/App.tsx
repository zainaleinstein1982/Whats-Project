import React, { useState, useEffect } from 'react';
import { Ticket, ViewType, TicketStatus, ActiveTimer } from './types';
import { store } from './store';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TicketModal } from './components/TicketModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { ImportModal } from './components/ImportModal';
import { ToastContainer, ToastMessage } from './components/ToastContainer';

import { DashboardView } from './views/DashboardView';
import { KanbanView } from './views/KanbanView';
import { GanttView } from './views/GanttView';
import { CPMView } from './views/CPMView';
import { TicketListView } from './views/TicketListView';
import { ListView } from './views/ListView';
import { CalendarView } from './views/CalendarView';
import { WorkloadView } from './views/WorkloadView';
import { ActivityFeedView } from './views/ActivityFeedView';

export default function App() {
  const [state, setState] = useState(store.state);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Modals state
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketToEdit, setTicketToEdit] = useState<Ticket | null>(null);
  const [defaultStatusForNew, setDefaultStatusForNew] = useState<TicketStatus | undefined>(undefined);
  const [defaultDateForNew, setDefaultDateForNew] = useState<string | undefined>(undefined);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    store.subscribe((newState) => {
      setState({ ...newState });
    });
  }, []);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const logActivity = (ticketId: string, action: string) => {
    store.logActivity(ticketId, action);
  };

  // View selection
  const handleSelectView = (view: ViewType) => {
    store.state.currentView = view;
    store.notify();
  };

  // Ticket CRUD
  const handleOpenCreateModal = (status?: TicketStatus, dateStr?: string) => {
    setTicketToEdit(null);
    setDefaultStatusForNew(status);
    setDefaultDateForNew(dateStr);
    setIsTicketModalOpen(true);
  };

  const handleEditTicket = (ticketId: string) => {
    const ticket = store.state.tickets.find(t => t.id === ticketId);
    if (ticket) {
      setTicketToEdit(ticket);
      setDefaultStatusForNew(undefined);
      setDefaultDateForNew(undefined);
      setIsTicketModalOpen(true);
    }
  };

  const handleSaveTicket = (ticketData: Partial<Ticket>, isEdit: boolean) => {
    if (isEdit && ticketData.id) {
      const ticket = store.state.tickets.find(t => t.id === ticketData.id);
      if (ticket) {
        const changes: string[] = [];
        if (ticket.status !== ticketData.status) changes.push(`status: ${ticket.status} → ${ticketData.status}`);
        if (ticket.priority !== ticketData.priority) changes.push(`prioritas: ${ticket.priority} → ${ticketData.priority}`);
        if (ticket.progress !== ticketData.progress) changes.push(`progress: ${ticket.progress}% → ${ticketData.progress}%`);
        
        Object.assign(ticket, ticketData);
        if (ticketData.status === 'done') ticket.progress = 100;
        if (changes.length > 0) logActivity(ticket.id, `Tiket diperbarui: ${changes.join(', ')}`);
        showToast('Tiket berhasil diperbarui', 'success');
      }
    } else {
      const existingIds = store.state.tickets.map(t => parseInt(t.id.replace('T', '')) || 0);
      const nextNum = Math.max(0, ...existingIds) + 1;
      const newId = 'T' + nextNum;

      const newTicket: Ticket = {
        id: newId,
        title: ticketData.title || 'Tugas Baru',
        description: ticketData.description || '',
        priority: ticketData.priority || 'normal',
        status: ticketData.status || 'backlog',
        assignee: ticketData.assignee || '',
        startDate: ticketData.startDate || new Date().toISOString().split('T')[0],
        endDate: ticketData.endDate || new Date().toISOString().split('T')[0],
        progress: ticketData.progress || 0,
        dependencies: ticketData.dependencies || [],
        timeSpent: 0,
        timeEntries: [],
        checklist: [],
        activityLog: [{ timestamp: new Date().toISOString(), action: 'Tiket dibuat', user: 'Admin Proyek' }]
      };

      store.state.tickets.push(newTicket);
      showToast('Tiket baru berhasil dibuat', 'success');
    }
    store.notify();
    setIsTicketModalOpen(false);
  };

  const handleDeleteTicket = (ticketId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tiket ini?')) return;
    store.state.tickets = store.state.tickets.filter(t => t.id !== ticketId);
    store.state.tickets.forEach(t => {
      if (t.dependencies) {
        t.dependencies = t.dependencies.filter(d => d !== ticketId);
      }
    });
    delete store.state.comments[ticketId];
    delete store.state.attachments[ticketId];
    store.notify();
    showToast('Tiket berhasil dihapus', 'success');
    if (selectedTicketId === ticketId) setIsDetailModalOpen(false);
  };

  const handleUpdateStatus = (ticketId: string, newStatus: TicketStatus) => {
    const ticket = store.state.tickets.find(t => t.id === ticketId);
    if (ticket && ticket.status !== newStatus) {
      const oldStatus = ticket.status;
      ticket.status = newStatus;
      if (newStatus === 'done') ticket.progress = 100;
      logActivity(ticketId, `Status diubah dari ${oldStatus} ke ${newStatus}`);
      store.notify();
      showToast(`Status tiket ${ticketId} diperbarui`, 'success');
    }
  };

  const handleUpdateTicketField = (ticketId: string, field: keyof Ticket, value: any) => {
    const ticket = store.state.tickets.find(t => t.id === ticketId);
    if (ticket) {
      (ticket as any)[field] = value;
      if (field === 'status' && value === 'done') ticket.progress = 100;
      logActivity(ticketId, `Field ${field} diperbarui`);
      store.notify();
      showToast('Perubahan disimpan', 'success');
    }
  };

  // Time Tracking & Timer
  const handleStartTimer = (ticketId: string) => {
    if (store.state.activeTimer) {
      if (!confirm('Timer lain sedang berjalan. Hentikan dan mulai yang baru?')) return;
      handleStopTimer(true);
    }
    store.state.activeTimer = { ticketId, startTime: Date.now() };
    store.notify();
    showToast('Timer dimulai', 'success');
  };

  const handleStopTimer = (silent = false) => {
    if (!store.state.activeTimer) return;
    const elapsed = Date.now() - store.state.activeTimer.startTime;
    const hours = Math.round((elapsed / (1000 * 60 * 60)) * 10) / 10;
    const ticketId = store.state.activeTimer.ticketId;
    const ticket = store.state.tickets.find(t => t.id === ticketId);

    if (ticket && hours > 0) {
      if (!ticket.timeEntries) ticket.timeEntries = [];
      if (!ticket.timeSpent) ticket.timeSpent = 0;
      ticket.timeEntries.unshift({
        id: 'te_' + Date.now(),
        hours,
        note: 'Timer session',
        timestamp: new Date().toISOString()
      });
      ticket.timeSpent = Math.round((ticket.timeSpent + hours) * 10) / 10;
      logActivity(ticketId, `Mencatat ${hours} jam kerja via timer`);
    }

    store.state.activeTimer = null;
    store.notify();
    if (!silent) showToast(`Timer dihentikan: ${hours} jam dicatat`, 'success');
  };

  const handleAddTimeEntry = (ticketId: string, hours: number, note: string) => {
    const ticket = store.state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    if (!ticket.timeEntries) ticket.timeEntries = [];
    if (!ticket.timeSpent) ticket.timeSpent = 0;
    ticket.timeEntries.unshift({
      id: 'te_' + Date.now(),
      hours,
      note: note || 'Manual entry',
      timestamp: new Date().toISOString()
    });
    ticket.timeSpent = Math.round((ticket.timeSpent + hours) * 10) / 10;
    logActivity(ticketId, `Mencatat ${hours} jam manual`);
    store.notify();
    showToast(`${hours} jam berhasil dicatat`, 'success');
  };

  const handleDeleteTimeEntry = (ticketId: string, entryId: string) => {
    const ticket = store.state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    const entry = ticket.timeEntries.find(e => e.id === entryId);
    if (entry) {
      ticket.timeSpent = Math.max(0, Math.round((ticket.timeSpent - entry.hours) * 10) / 10);
      ticket.timeEntries = ticket.timeEntries.filter(e => e.id !== entryId);
      logActivity(ticketId, `Menghapus catatan waktu ${entry.hours} jam`);
      store.notify();
      showToast('Catatan waktu dihapus', 'success');
    }
  };

  // Checklist
  const handleAddChecklist = (ticketId: string, text: string) => {
    const ticket = store.state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    if (!ticket.checklist) ticket.checklist = [];
    ticket.checklist.push({ id: 'cl_' + Date.now(), text, done: false });
    logActivity(ticketId, `Menambahkan checklist: ${text}`);
    store.notify();
    showToast('Checklist ditambahkan', 'success');
  };

  const handleToggleChecklist = (ticketId: string, itemId: string) => {
    const ticket = store.state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    const item = ticket.checklist.find(i => i.id === itemId);
    if (item) {
      item.done = !item.done;
      logActivity(ticketId, `${item.done ? 'Menyelesaikan' : 'Membatalkan'} checklist: ${item.text}`);
      store.notify();
    }
  };

  const handleDeleteChecklist = (ticketId: string, itemId: string) => {
    const ticket = store.state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    ticket.checklist = ticket.checklist.filter(i => i.id !== itemId);
    logActivity(ticketId, `Menghapus item checklist`);
    store.notify();
    showToast('Checklist dihapus', 'success');
  };

  // Comments
  const handleAddComment = (ticketId: string, text: string) => {
    if (!store.state.comments[ticketId]) store.state.comments[ticketId] = [];
    store.state.comments[ticketId].push({
      author: 'Admin Proyek',
      text,
      date: new Date().toISOString().split('T')[0]
    });
    logActivity(ticketId, `Menambahkan komentar`);
    store.notify();
    showToast('Komentar terkirim', 'success');
  };

  // Import / Export / Reset
  const handleImportCSV = (importedTickets: Ticket[], replace: boolean) => {
    if (replace) {
      store.state.tickets = importedTickets;
      store.state.comments = {};
      store.state.attachments = {};
    } else {
      const existingIds = new Set(store.state.tickets.map(t => t.id));
      importedTickets.forEach(t => {
        if (!existingIds.has(t.id)) {
          store.state.tickets.push(t);
          existingIds.add(t.id);
        }
      });
    }
    store.notify();
    showToast(`Berhasil import ${importedTickets.length} tugas`, 'success');
  };

  const handleExportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      tickets: store.state.tickets,
      comments: store.state.comments,
      attachments: store.state.attachments
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsproject-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data proyek berhasil di-export', 'success');
  };

  const handleResetData = () => {
    if (!confirm('Reset semua data proyek ke kondisi awal?')) return;
    localStorage.removeItem('whats_project_data_v1');
    store.state.tickets = [];
    store.state.comments = {};
    store.state.attachments = {};
    store.seedData();
    showToast('Data direset ke default', 'success');
  };

  const selectedTicket = store.state.tickets.find(t => t.id === selectedTicketId) || null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <ToastContainer toasts={toasts} onRemove={id => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* Sidebar */}
      <Sidebar
        currentView={state.currentView}
        onSelectView={handleSelectView}
        onOpenImport={() => setIsImportModalOpen(true)}
        onExport={handleExportJSON}
        onReset={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          currentView={state.currentView}
          tickets={state.tickets}
          activeTimer={state.activeTimer}
          onOpenCreateModal={() => handleOpenCreateModal()}
          onStopTimer={() => handleStopTimer()}
          onSelectTicket={id => { setSelectedTicketId(id); setIsDetailModalOpen(true); }}
        />

        <div className="flex-1 overflow-auto p-6">
          {state.currentView === 'dashboard' && (
            <DashboardView
              tickets={state.tickets}
              onSelectTicket={id => { setSelectedTicketId(id); setIsDetailModalOpen(true); }}
              onNavigateView={handleSelectView}
            />
          )}
          {state.currentView === 'kanban' && (
            <KanbanView
              tickets={state.tickets}
              onUpdateStatus={handleUpdateStatus}
              onSelectTicket={id => { setSelectedTicketId(id); setIsDetailModalOpen(true); }}
              onOpenCreateModal={status => handleOpenCreateModal(status)}
            />
          )}
          {state.currentView === 'gantt' && (
            <GanttView
              tickets={state.tickets}
              onSelectTicket={id => { setSelectedTicketId(id); setIsDetailModalOpen(true); }}
            />
          )}
          {state.currentView === 'cpm' && (
            <CPMView
              tickets={state.tickets}
              onSelectTicket={id => { setSelectedTicketId(id); setIsDetailModalOpen(true); }}
            />
          )}
          {state.currentView === 'tickets' && (
            <TicketListView
              tickets={state.tickets}
              onSelectTicket={id => { setSelectedTicketId(id); setIsDetailModalOpen(true); }}
              onEditTicket={handleEditTicket}
              onDeleteTicket={handleDeleteTicket}
            />
          )}
          {state.currentView === 'list' && (
            <ListView
              tickets={state.tickets}
              onUpdateTicketField={handleUpdateTicketField}
              onSelectTicket={id => { setSelectedTicketId(id); setIsDetailModalOpen(true); }}
            />
          )}
          {state.currentView === 'calendar' && (
            <CalendarView
              tickets={state.tickets}
              calendarDate={state.calendarDate}
              onUpdateCalendarDate={d => { store.state.calendarDate = d; store.notify(); }}
              onSelectTicket={id => { setSelectedTicketId(id); setIsDetailModalOpen(true); }}
              onOpenCreateWithDate={dateStr => handleOpenCreateModal('backlog', dateStr)}
            />
          )}
          {state.currentView === 'workload' && (
            <WorkloadView
              tickets={state.tickets}
              onSelectTicket={id => { setSelectedTicketId(id); setIsDetailModalOpen(true); }}
            />
          )}
          {state.currentView === 'activity' && (
            <ActivityFeedView
              tickets={state.tickets}
              commentsMap={state.comments}
              onSelectTicket={id => { setSelectedTicketId(id); setIsDetailModalOpen(true); }}
            />
          )}
        </div>
      </main>

      {/* Ticket Create / Edit Modal */}
      <TicketModal
        isOpen={isTicketModalOpen}
        ticketToEdit={ticketToEdit}
        allTickets={state.tickets}
        defaultStatus={defaultStatusForNew}
        defaultDate={defaultDateForNew}
        onClose={() => setIsTicketModalOpen(false)}
        onSave={handleSaveTicket}
      />

      {/* Ticket Detail Modal */}
      {isDetailModalOpen && (
        <TicketDetailModal
          ticket={selectedTicket}
          allTickets={state.tickets}
          commentsMap={state.comments}
          attachmentsMap={state.attachments}
          activeTimer={state.activeTimer}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={handleEditTicket}
          onStartTimer={handleStartTimer}
          onStopTimer={() => handleStopTimer()}
          onAddTimeEntry={handleAddTimeEntry}
          onDeleteTimeEntry={handleDeleteTimeEntry}
          onAddChecklist={handleAddChecklist}
          onToggleChecklist={handleToggleChecklist}
          onDeleteChecklist={handleDeleteChecklist}
          onAddComment={handleAddComment}
          onSelectTicket={id => setSelectedTicketId(id)}
        />
      )}

      {/* CSV Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportCSV}
        onShowToast={showToast}
      />
    </div>
  );
}

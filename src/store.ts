import { Ticket, ViewType, ActiveTimer } from './types';

export const TEAM_MEMBERS = ['Andi Prasetyo', 'Budi Santoso', 'Citra Dewi', 'Dian Permata', 'Eko Wijaya'];

function migrateTicket(t: any): Ticket {
  return {
    ...t,
    timeSpent: t.timeSpent || 0,
    timeEntries: t.timeEntries || [],
    checklist: t.checklist || [],
    activityLog: t.activityLog || []
  };
}

export class AppStore {
  state: {
    tickets: Ticket[];
    currentView: ViewType;
    ganttZoom: 'day' | 'week' | 'month';
    calendarDate: string; // YYYY-MM
    comments: Record<string, Array<{ author: string; text: string; date: string }>>;
    attachments: Record<string, string[]>;
    activeTimer: ActiveTimer | null;
    selectedTicketId: string | null;
  } = {
    tickets: [],
    currentView: 'dashboard',
    ganttZoom: 'week',
    calendarDate: new Date().toISOString().slice(0, 7),
    comments: {},
    attachments: {},
    activeTimer: null,
    selectedTicketId: null
  };

  listeners: Array<(state: any) => void> = [];

  subscribe(fn: (state: any) => void) {
    this.listeners.push(fn);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
    this.persist();
  }

  persist() {
    try {
      localStorage.setItem('whats_project_data_v1', JSON.stringify({
        tickets: this.state.tickets,
        comments: this.state.comments,
        attachments: this.state.attachments
      }));
    } catch (e) {
      console.warn('Persist failed:', e);
    }
  }

  load() {
    try {
      const data = localStorage.getItem('whats_project_data_v1');
      if (data) {
        const parsed = JSON.parse(data);
        this.state.tickets = (parsed.tickets || []).map(migrateTicket);
        this.state.comments = parsed.comments || {};
        this.state.attachments = parsed.attachments || {};
        if (this.state.tickets.length === 0) this.seedData();
      } else {
        this.seedData();
      }
    } catch (e) {
      console.warn('Load failed, reseeding:', e);
      this.seedData();
    }
  }

  seedData() {
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);
    const addDays = (base: Date, days: number) => {
      const d = new Date(base);
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };
    const now = new Date().toISOString();

    const schedule = [
      { id: 'T1', es: 0, duration: 3 },
      { id: 'T2', es: 3, duration: 4 },
      { id: 'T3', es: 7, duration: 5 },
      { id: 'T4', es: 7, duration: 4 },
      { id: 'T5', es: 12, duration: 6 },
      { id: 'T6', es: 12, duration: 5 },
      { id: 'T7', es: 18, duration: 4 },
      { id: 'T8', es: 18, duration: 3 },
      { id: 'T9', es: 22, duration: 2 },
      { id: 'T10', es: 24, duration: 2 }
    ];
    const dates: Record<string, { start: string; end: string }> = {};
    schedule.forEach(s => {
      dates[s.id] = { start: addDays(baseDate, s.es), end: addDays(baseDate, s.es + s.duration - 1) };
    });

    this.state.tickets = [
      { id: 'T1', title: 'Analisis Kebutuhan Bisnis', description: 'Pengumpulan requirement dari stakeholder dan penyusunan BRD.', priority: 'high', status: 'done', assignee: 'Andi Prasetyo', startDate: dates.T1.start, endDate: dates.T1.end, progress: 100, dependencies: [], timeSpent: 18, timeEntries: [{id:'te1', hours:8, note:'Workshop stakeholder', timestamp: now}, {id:'te2', hours:10, note:'Penyusunan BRD', timestamp: now}], checklist: [{id:'c1', text:'Interview stakeholder', done:true}, {id:'c2', text:'Analisis kompetitor', done:true}, {id:'c3', text:'Dokumen BRD final', done:true}], activityLog: [{timestamp: now, action: 'Tiket dibuat', user: 'Admin Proyek'}, {timestamp: now, action: 'Status diubah ke Done', user: 'Admin Proyek'}] },
      { id: 'T2', title: 'Desain UI/UX', description: 'Pembuatan wireframe, mockup, dan design system di Figma.', priority: 'high', status: 'done', assignee: 'Citra Dewi', startDate: dates.T2.start, endDate: dates.T2.end, progress: 100, dependencies: ['T1'], timeSpent: 24, timeEntries: [{id:'te3', hours:24, note:'Wireframe & mockup', timestamp: now}], checklist: [{id:'c4', text:'User research', done:true}, {id:'c5', text:'Wireframe low-fi', done:true}, {id:'c6', text:'Mockup high-fi', done:true}, {id:'c7', text:'Design system', done:true}], activityLog: [{timestamp: now, action: 'Tiket dibuat', user: 'Admin Proyek'}] },
      { id: 'T3', title: 'Desain Arsitektur Sistem', description: 'Perancangan arsitektur microservices dan skema database.', priority: 'high', status: 'in-progress', assignee: 'Budi Santoso', startDate: dates.T3.start, endDate: dates.T3.end, progress: 70, dependencies: ['T2'], timeSpent: 15, timeEntries: [{id:'te4', hours:15, note:'ERD & API design', timestamp: now}], checklist: [{id:'c8', text:'ERD database', done:true}, {id:'c9', text:'API contract', done:true}, {id:'c10', text:'Dokumentasi arsitektur', done:false}], activityLog: [{timestamp: now, action: 'Tiket dibuat', user: 'Admin Proyek'}] },
      { id: 'T4', title: 'Setup Infrastruktur & CI/CD', description: 'Konfigurasi AWS/GCP, Kubernetes, dan pipeline CI/CD.', priority: 'normal', status: 'in-progress', assignee: 'Eko Wijaya', startDate: dates.T4.start, endDate: dates.T4.end, progress: 50, dependencies: ['T2'], timeSpent: 10, timeEntries: [], checklist: [{id:'c11', text:'Setup AWS account', done:true}, {id:'c12', text:'Kubernetes cluster', done:false}, {id:'c13', text:'CI/CD pipeline', done:false}], activityLog: [] },
      { id: 'T5', title: 'Pengembangan Backend API', description: 'Implementasi REST API dengan Node.js/Express.', priority: 'high', status: 'in-progress', assignee: 'Budi Santoso', startDate: dates.T5.start, endDate: dates.T5.end, progress: 30, dependencies: ['T3'], timeSpent: 12, timeEntries: [], checklist: [{id:'c14', text:'Auth module', done:true}, {id:'c15', text:'Product API', done:false}, {id:'c16', text:'Order API', done:false}, {id:'c17', text:'Payment integration', done:false}], activityLog: [] },
      { id: 'T6', title: 'Pengembangan Frontend', description: 'Pembangunan SPA dengan React/Next.js.', priority: 'high', status: 'backlog', assignee: 'Dian Permata', startDate: dates.T6.start, endDate: dates.T6.end, progress: 0, dependencies: ['T2', 'T3'], timeSpent: 0, timeEntries: [], checklist: [{id:'c18', text:'Setup project', done:false}, {id:'c19', text:'Komponen UI', done:false}, {id:'c20', text:'Routing', done:false}], activityLog: [] },
      { id: 'T7', title: 'Pengujian Fungsional & Keamanan', description: 'Unit testing, E2E testing, dan security audit.', priority: 'high', status: 'backlog', assignee: 'Citra Dewi', startDate: dates.T7.start, endDate: dates.T7.end, progress: 0, dependencies: ['T5', 'T6'], timeSpent: 0, timeEntries: [], checklist: [], activityLog: [] },
      { id: 'T8', title: 'User Acceptance Testing (UAT)', description: 'Sesi UAT dengan stakeholder dan beta tester.', priority: 'normal', status: 'backlog', assignee: 'Andi Prasetyo', startDate: dates.T8.start, endDate: dates.T8.end, progress: 0, dependencies: ['T5', 'T6'], timeSpent: 0, timeEntries: [], checklist: [], activityLog: [] },
      { id: 'T9', title: 'Deployment Production', description: 'Deployment ke production environment.', priority: 'high', status: 'backlog', assignee: 'Eko Wijaya', startDate: dates.T9.start, endDate: dates.T9.end, progress: 0, dependencies: ['T7', 'T8'], timeSpent: 0, timeEntries: [], checklist: [], activityLog: [] },
      { id: 'T10', title: 'Dokumentasi & Pelatihan', description: 'Pembuatan dokumentasi API dan user manual.', priority: 'low', status: 'backlog', assignee: 'Dian Permata', startDate: dates.T10.start, endDate: dates.T10.end, progress: 0, dependencies: ['T9'], timeSpent: 0, timeEntries: [], checklist: [], activityLog: [] }
    ];

    this.state.comments = {
      'T1': [{ author: 'Citra Dewi', text: 'BRD sudah final dan disetujui stakeholder. @Andi Prasetyo tolong review.', date: addDays(baseDate, 2) }],
      'T3': [{ author: 'Budi Santoso', text: 'ERD sudah 70% selesai. @Eko Wijaya siapkan infra.', date: addDays(baseDate, 9) }]
    };
    this.state.attachments = { 'T1': ['BRD-WhatsProject-v1.2.pdf'], 'T2': ['wireframe-main-pages.fig'] };
    this.notify();
  }

  logActivity(ticketId: string, action: string) {
    const ticket = this.state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    if (!ticket.activityLog) ticket.activityLog = [];
    ticket.activityLog.unshift({
      timestamp: new Date().toISOString(),
      action,
      user: 'Admin Proyek'
    });
    if (ticket.activityLog.length > 50) ticket.activityLog = ticket.activityLog.slice(0, 50);
  }
}

export const store = new AppStore();
store.load();

export type Priority = 'low' | 'normal' | 'high';
export type TicketStatus = 'backlog' | 'in-progress' | 'in-validation' | 'done' | 'archived';
export type ViewType = 'dashboard' | 'kanban' | 'gantt' | 'cpm' | 'tickets' | 'list' | 'calendar' | 'workload' | 'activity' | 'detail';

export interface TimeEntry {
  id: string;
  hours: number;
  note: string;
  timestamp: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ActivityLog {
  timestamp: string;
  action: string;
  user: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  assignee: string;
  startDate: string;
  endDate: string;
  progress: number;
  dependencies: string[];
  timeSpent: number;
  timeEntries: TimeEntry[];
  checklist: ChecklistItem[];
  activityLog: ActivityLog[];
}

export interface Comment {
  author: string;
  text: string;
  date: string;
}

export interface ActiveTimer {
  ticketId: string;
  startTime: number;
}

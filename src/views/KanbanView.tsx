import React, { useState } from 'react';
import { Ticket, TicketStatus } from '../types';
import { CPMEngine } from '../utils/cpm';
import { AlertTriangle, Plus } from 'lucide-react';

interface KanbanViewProps {
  tickets: Ticket[];
  onUpdateStatus: (ticketId: string, newStatus: TicketStatus) => void;
  onSelectTicket: (ticketId: string) => void;
  onOpenCreateModal: (status: TicketStatus) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  tickets,
  onUpdateStatus,
  onSelectTicket,
  onOpenCreateModal
}) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TicketStatus | null>(null);

  const statuses: Array<{ id: TicketStatus; label: string; dotColor: string }> = [
    { id: 'backlog', label: 'Backlog', dotColor: 'bg-gray-400' },
    { id: 'in-progress', label: 'In Progress', dotColor: 'bg-blue-500' },
    { id: 'in-validation', label: 'In Validation', dotColor: 'bg-purple-500' },
    { id: 'done', label: 'Done', dotColor: 'bg-green-500' },
    { id: 'archived', label: 'Archived', dotColor: 'bg-gray-300' }
  ];

  const cpmResult = CPMEngine.calculate(tickets);
  const cpmMap: Record<string, boolean> = {};
  cpmResult.tasks.forEach(t => { cpmMap[t.id] = !!t.isCritical; });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 h-full select-none overflow-x-hidden pb-4">
      {statuses.map(status => {
        const columnTickets = tickets.filter(t => t.status === status.id);
        const isTarget = dragOverStatus === status.id;

        return (
          <div key={status.id} className="flex flex-col h-full min-w-0">
            <div className="flex items-center justify-between mb-2.5 px-1 flex-shrink-0">
              <div className="flex items-center gap-1.5 truncate">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${status.dotColor}`} />
                <h3 className="font-bold text-xs text-gray-800 truncate">{status.label}</h3>
                <span className="text-[10px] bg-gray-200 text-gray-700 font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {columnTickets.length}
                </span>
              </div>
              <button
                onClick={() => onOpenCreateModal(status.id)}
                className="text-gray-400 hover:text-blue-600 font-bold text-sm p-1 rounded transition flex-shrink-0"
                title="Tambah tiket"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div
              onDragOver={e => { e.preventDefault(); setDragOverStatus(status.id); }}
              onDragLeave={() => setDragOverStatus(null)}
              onDrop={e => {
                e.preventDefault();
                setDragOverStatus(null);
                if (draggingId) {
                  onUpdateStatus(draggingId, status.id);
                  setDraggingId(null);
                }
              }}
              className={`flex-1 overflow-y-auto space-y-2.5 p-2 rounded-2xl border-2 transition-all ${
                isTarget ? 'bg-blue-50/70 border-blue-400 border-dashed' : 'bg-gray-100/70 border-transparent'
              }`}
              style={{ maxHeight: 'calc(100vh - 180px)' }}
            >
              {columnTickets.map(ticket => {
                const isCritical = cpmMap[ticket.id];
                const endDate = new Date(ticket.endDate);
                endDate.setHours(0, 0, 0, 0);
                const isOverdue = ticket.status !== 'done' && ticket.status !== 'archived' && endDate < today;

                const priorityBorder = ticket.priority === 'high' 
                  ? 'border-l-4 border-l-red-500' 
                  : ticket.priority === 'normal' 
                  ? 'border-l-4 border-l-amber-500' 
                  : 'border-l-4 border-l-green-500';

                return (
                  <div
                    key={ticket.id}
                    draggable
                    onDragStart={() => setDraggingId(ticket.id)}
                    onDragEnd={() => setDraggingId(null)}
                    onClick={() => onSelectTicket(ticket.id)}
                    className={`bg-white rounded-xl p-3 shadow-2xs border border-gray-200/80 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${priorityBorder} ${draggingId === ticket.id ? 'opacity-40 scale-95' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-gray-400">{ticket.id}</span>
                      <div className="flex items-center gap-1">
                        {isOverdue && (
                          <span className="text-[9px] bg-red-500 text-white font-bold px-1 py-0.5 rounded flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> OVERDUE
                          </span>
                        )}
                        {isCritical && (
                          <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">
                            CRITICAL
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="text-xs font-semibold text-gray-900 mb-2.5 line-clamp-2 leading-snug">
                      {ticket.title}
                    </h4>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 truncate">
                        {ticket.assignee ? (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 shadow-2xs">
                            {ticket.assignee.split(' ').map(n => n[0]).join('')}
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-400 text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                            ?
                          </div>
                        )}
                        <span className="text-[11px] text-gray-600 font-medium truncate">
                          {ticket.assignee ? ticket.assignee.split(' ')[0] : 'Unassigned'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-gray-500 flex-shrink-0">{ticket.progress}%</span>
                    </div>

                    {ticket.progress > 0 && (
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${ticket.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                          style={{ width: `${ticket.progress}%` }} 
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {columnTickets.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-xs font-medium border-2 border-dashed border-gray-200/80 rounded-xl">
                  Kosong
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

import React, { useState } from 'react';
import { Ticket, Priority, TicketStatus } from '../types';
import { CPMEngine } from '../utils/cpm';
import { TEAM_MEMBERS } from '../store';
import { Info } from 'lucide-react';

interface ListViewProps {
  tickets: Ticket[];
  onUpdateTicketField: (ticketId: string, field: keyof Ticket, value: any) => void;
  onSelectTicket: (ticketId: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({ tickets, onUpdateTicketField, onSelectTicket }) => {
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof Ticket } | null>(null);
  const [editValue, setEditValue] = useState<any>('');

  const cpmResult = CPMEngine.calculate(tickets);
  const cpmMap: Record<string, any> = {};
  cpmResult.tasks.forEach(t => { cpmMap[t.id] = t; });

  const startEdit = (ticket: Ticket, field: keyof Ticket) => {
    setEditingCell({ id: ticket.id, field });
    setEditValue(ticket[field]);
  };

  const saveEdit = (ticketId: string, field: keyof Ticket) => {
    onUpdateTicketField(ticketId, field, editValue);
    setEditingCell(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden max-w-7xl mx-auto flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50/50">
        <h3 className="font-bold text-gray-900 text-base">Tampilan Spreadsheet (Inline Edit)</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Info className="w-4 h-4 text-blue-500" />
          <span>Klik sel mana pun untuk mengedit langsung • Tekan Enter untuk menyimpan</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
              <th className="text-left py-3.5 px-4 w-20">ID</th>
              <th className="text-left py-3.5 px-4 min-w-[220px]">Judul Tugas</th>
              <th className="text-left py-3.5 px-4 w-36">Assignee</th>
              <th className="text-left py-3.5 px-4 w-32">Prioritas</th>
              <th className="text-left py-3.5 px-4 w-36">Status</th>
              <th className="text-left py-3.5 px-4 w-32">Mulai</th>
              <th className="text-left py-3.5 px-4 w-32">Selesai</th>
              <th className="text-center py-3.5 px-4 w-28">Progress</th>
              <th className="text-center py-3.5 px-4 w-20">Float</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tickets.map(t => {
              const cpmTask = cpmMap[t.id];
              const isEditingTitle = editingCell?.id === t.id && editingCell.field === 'title';
              const isEditingAssignee = editingCell?.id === t.id && editingCell.field === 'assignee';
              const isEditingPriority = editingCell?.id === t.id && editingCell.field === 'priority';
              const isEditingStatus = editingCell?.id === t.id && editingCell.field === 'status';
              const isEditingStart = editingCell?.id === t.id && editingCell.field === 'startDate';
              const isEditingEnd = editingCell?.id === t.id && editingCell.field === 'endDate';
              const isEditingProgress = editingCell?.id === t.id && editingCell.field === 'progress';

              return (
                <tr key={t.id} className="hover:bg-blue-50/20 transition">
                  {/* ID */}
                  <td 
                    onClick={() => onSelectTicket(t.id)} 
                    className="py-3 px-4 font-mono text-xs text-gray-500 cursor-pointer font-bold hover:text-blue-600"
                  >
                    {t.id}
                  </td>

                  {/* Title */}
                  <td onClick={() => !isEditingTitle && startEdit(t, 'title')} className="py-3 px-4 cursor-pointer">
                    {isEditingTitle ? (
                      <input
                        autoFocus
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => saveEdit(t.id, 'title')}
                        onKeyPress={e => e.key === 'Enter' && saveEdit(t.id, 'title')}
                        className="w-full border border-blue-500 rounded px-2 py-1 text-sm bg-yellow-50 outline-none font-semibold"
                      />
                    ) : (
                      <span className="font-semibold text-gray-900 hover:text-blue-600">{t.title}</span>
                    )}
                  </td>

                  {/* Assignee */}
                  <td onClick={() => !isEditingAssignee && startEdit(t, 'assignee')} className="py-3 px-4 cursor-pointer">
                    {isEditingAssignee ? (
                      <select
                        autoFocus
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => saveEdit(t.id, 'assignee')}
                        className="w-full border border-blue-500 rounded px-2 py-1 text-sm bg-yellow-50 outline-none"
                      >
                        <option value="">Tidak ada</option>
                        {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    ) : (
                      <span className="text-gray-700 font-medium hover:bg-gray-100 px-2 py-1 rounded">{t.assignee || '-'}</span>
                    )}
                  </td>

                  {/* Priority */}
                  <td onClick={() => !isEditingPriority && startEdit(t, 'priority')} className="py-3 px-4 cursor-pointer">
                    {isEditingPriority ? (
                      <select
                        autoFocus
                        value={editValue}
                        onChange={e => setEditValue(e.target.value as Priority)}
                        onBlur={() => saveEdit(t.id, 'priority')}
                        className="w-full border border-blue-500 rounded px-2 py-1 text-sm bg-yellow-50 outline-none"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                      </select>
                    ) : (
                      <span className="hover:bg-gray-100 px-2 py-1 rounded inline-block">
                        {t.priority === 'high' && <span className="text-xs font-semibold text-red-700 bg-red-100 px-2.5 py-1 rounded-full">🔴 High</span>}
                        {t.priority === 'normal' && <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">🟡 Normal</span>}
                        {t.priority === 'low' && <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">🟢 Low</span>}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td onClick={() => !isEditingStatus && startEdit(t, 'status')} className="py-3 px-4 cursor-pointer">
                    {isEditingStatus ? (
                      <select
                        autoFocus
                        value={editValue}
                        onChange={e => setEditValue(e.target.value as TicketStatus)}
                        onBlur={() => saveEdit(t.id, 'status')}
                        className="w-full border border-blue-500 rounded px-2 py-1 text-sm bg-yellow-50 outline-none"
                      >
                        <option value="backlog">Backlog</option>
                        <option value="in-progress">In Progress</option>
                        <option value="in-validation">In Validation</option>
                        <option value="done">Done</option>
                        <option value="archived">Archived</option>
                      </select>
                    ) : (
                      <span className="hover:bg-gray-100 px-2 py-1 rounded inline-block capitalize font-semibold text-xs bg-gray-100 text-gray-700">
                        {t.status.replace('-', ' ')}
                      </span>
                    )}
                  </td>

                  {/* Start Date */}
                  <td onClick={() => !isEditingStart && startEdit(t, 'startDate')} className="py-3 px-4 cursor-pointer text-xs text-gray-600 font-mono">
                    {isEditingStart ? (
                      <input
                        autoFocus
                        type="date"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => saveEdit(t.id, 'startDate')}
                        className="w-full border border-blue-500 rounded px-2 py-1 text-xs bg-yellow-50 outline-none"
                      />
                    ) : (
                      <span className="hover:bg-gray-100 px-2 py-1 rounded">{t.startDate}</span>
                    )}
                  </td>

                  {/* End Date */}
                  <td onClick={() => !isEditingEnd && startEdit(t, 'endDate')} className="py-3 px-4 cursor-pointer text-xs text-gray-600 font-mono">
                    {isEditingEnd ? (
                      <input
                        autoFocus
                        type="date"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => saveEdit(t.id, 'endDate')}
                        className="w-full border border-blue-500 rounded px-2 py-1 text-xs bg-yellow-50 outline-none"
                      />
                    ) : (
                      <span className="hover:bg-gray-100 px-2 py-1 rounded">{t.endDate}</span>
                    )}
                  </td>

                  {/* Progress */}
                  <td onClick={() => !isEditingProgress && startEdit(t, 'progress')} className="py-3 px-4 text-center cursor-pointer">
                    {isEditingProgress ? (
                      <input
                        autoFocus
                        type="number"
                        min="0"
                        max="100"
                        value={editValue}
                        onChange={e => setEditValue(parseInt(e.target.value) || 0)}
                        onBlur={() => saveEdit(t.id, 'progress')}
                        onKeyPress={e => e.key === 'Enter' && saveEdit(t.id, 'progress')}
                        className="w-16 border border-blue-500 rounded px-2 py-1 text-sm bg-yellow-50 outline-none text-center font-bold"
                      />
                    ) : (
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-12 bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${t.progress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-600">{t.progress}%</span>
                      </div>
                    )}
                  </td>

                  {/* Float */}
                  <td className="py-3 px-4 text-center">
                    {cpmTask ? (
                      <span className={`font-mono font-bold text-xs ${cpmTask.isCritical ? 'text-red-600' : 'text-green-600'}`}>
                        {cpmTask.totalFloat}d
                      </span>
                    ) : '-'}
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

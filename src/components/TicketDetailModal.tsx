import React, { useState } from 'react';
import { Ticket, ActiveTimer } from '../types';
import { CPMEngine } from '../utils/cpm';
import { TEAM_MEMBERS } from '../store';
import { 
  X, 
  Clock, 
  CheckSquare, 
  MessageSquare, 
  FileText, 
  Activity, 
  Play, 
  Square, 
  Plus, 
  Trash2, 
  Paperclip, 
  AlertTriangle 
} from 'lucide-react';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  allTickets: Ticket[];
  commentsMap: Record<string, Array<{ author: string; text: string; date: string }>>;
  attachmentsMap: Record<string, string[]>;
  activeTimer: ActiveTimer | null;
  onClose: () => void;
  onEdit: (ticketId: string) => void;
  onStartTimer: (ticketId: string) => void;
  onStopTimer: () => void;
  onAddTimeEntry: (ticketId: string, hours: number, note: string) => void;
  onDeleteTimeEntry: (ticketId: string, entryId: string) => void;
  onAddChecklist: (ticketId: string, text: string) => void;
  onToggleChecklist: (ticketId: string, itemId: string) => void;
  onDeleteChecklist: (ticketId: string, itemId: string) => void;
  onAddComment: (ticketId: string, text: string) => void;
  onSelectTicket: (ticketId: string) => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  allTickets,
  commentsMap,
  attachmentsMap,
  activeTimer,
  onClose,
  onEdit,
  onStartTimer,
  onStopTimer,
  onAddTimeEntry,
  onDeleteTimeEntry,
  onAddChecklist,
  onToggleChecklist,
  onDeleteChecklist,
  onAddComment,
  onSelectTicket
}) => {
  if (!ticket) return null;

  const [activeTab, setActiveTab] = useState<'details' | 'checklist' | 'time' | 'comments' | 'activity'>('details');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [timeHours, setTimeHours] = useState('');
  const [timeNote, setTimeNote] = useState('');
  const [commentText, setCommentText] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  const comments = commentsMap[ticket.id] || [];
  const attachments = attachmentsMap[ticket.id] || [];
  const checklist = ticket.checklist || [];
  const timeEntries = ticket.timeEntries || [];
  const activityLog = ticket.activityLog || [];

  const cpmResult = CPMEngine.calculate(allTickets.filter(t => t.status !== 'archived'));
  const cpmTask = cpmResult.tasks.find(t => t.id === ticket.id);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(ticket.endDate);
  endDate.setHours(0, 0, 0, 0);
  const isOverdue = ticket.status !== 'done' && ticket.status !== 'archived' && endDate < today;

  const checklistDone = checklist.filter(i => i.done).length;
  const checklistProgress = checklist.length > 0 ? Math.round((checklistDone / checklist.length) * 100) : 0;
  const isTimerRunning = activeTimer && activeTimer.ticketId === ticket.id;

  const handleCommentInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCommentText(val);
    const match = val.match(/@(\w*)$/);
    if (match) {
      setMentionQuery(match[1].toLowerCase());
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (name: string) => {
    const updated = commentText.replace(/@\w*$/, `@${name} `);
    setCommentText(updated);
    setMentionQuery(null);
  };

  const filteredMembers = mentionQuery !== null
    ? TEAM_MEMBERS.filter(m => m.toLowerCase().includes(mentionQuery))
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-3xl bg-white shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-gray-50/50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-semibold text-gray-500 bg-gray-200 px-2.5 py-1 rounded-md">
              {ticket.id}
            </span>
            {cpmTask?.isCritical && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                ⚡ Critical
              </span>
            )}
            {isOverdue && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-600 text-white animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" /> Overdue
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { onEdit(ticket.id); onClose(); }}
              className="px-3.5 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Edit Tiket
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{ticket.title}</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Prioritas</p>
              <div className="mt-1">
                {ticket.priority === 'high' && <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">🔴 High</span>}
                {ticket.priority === 'normal' && <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">🟡 Normal</span>}
                {ticket.priority === 'low' && <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">🟢 Low</span>}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Status</p>
              <div className="mt-1">
                <span className="text-xs font-semibold capitalize text-gray-700 bg-gray-200 px-2.5 py-0.5 rounded-full">
                  {ticket.status.replace('-', ' ')}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Assignee</p>
              <p className="text-sm font-semibold text-gray-800 mt-1 truncate">{ticket.assignee || 'Tidak ditugaskan'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Progress</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: `${ticket.progress}%` }} />
                </div>
                <span className="text-xs font-bold text-gray-700">{ticket.progress}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 font-medium">Tanggal Mulai</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{ticket.startDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Tanggal Selesai</p>
              <p className={`text-sm font-semibold mt-0.5 ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
                {ticket.endDate} {isOverdue && '⚠️'}
              </p>
            </div>
          </div>

          {ticket.dependencies && ticket.dependencies.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Dependensi (Tugas Pendahulu)</p>
              <div className="flex flex-wrap gap-2">
                {ticket.dependencies.map(depId => {
                  const dep = allTickets.find(t => t.id === depId);
                  return (
                    <button
                      key={depId}
                      onClick={() => onSelectTicket(depId)}
                      className="text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-700 px-3 py-1.5 rounded-lg border font-medium transition flex items-center gap-1.5"
                    >
                      <span className="font-mono">{depId}</span>: {dep ? dep.title : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {cpmTask && (
            <div className={`p-4 rounded-xl border ${cpmTask.isCritical ? 'bg-red-50/50 border-red-200' : 'bg-blue-50/50 border-blue-200'}`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${cpmTask.isCritical ? 'text-red-800' : 'text-blue-800'}`}>
                📊 Analisis CPM (Critical Path Method)
              </h4>
              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="bg-white p-2 rounded-lg border">
                  <p className="text-[10px] text-gray-500 font-medium">ES</p>
                  <p className="font-bold text-sm text-blue-600">{cpmTask.ES}</p>
                </div>
                <div className="bg-white p-2 rounded-lg border">
                  <p className="text-[10px] text-gray-500 font-medium">EF</p>
                  <p className="font-bold text-sm text-blue-600">{cpmTask.EF}</p>
                </div>
                <div className="bg-white p-2 rounded-lg border">
                  <p className="text-[10px] text-gray-500 font-medium">LS</p>
                  <p className="font-bold text-sm text-purple-600">{cpmTask.LS}</p>
                </div>
                <div className="bg-white p-2 rounded-lg border">
                  <p className="text-[10px] text-gray-500 font-medium">LF</p>
                  <p className="font-bold text-sm text-purple-600">{cpmTask.LF}</p>
                </div>
                <div className="bg-white p-2 rounded-lg border">
                  <p className="text-[10px] text-gray-500 font-medium">Float</p>
                  <p className={`font-bold text-sm ${cpmTask.isCritical ? 'text-red-600' : 'text-green-600'}`}>{cpmTask.totalFloat}</p>
                </div>
              </div>
            </div>
          )}

          {/* TABS NAVIGATION */}
          <div className="border-b border-gray-200 flex gap-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              <FileText className="w-4 h-4" /> Detail
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${activeTab === 'checklist' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              <CheckSquare className="w-4 h-4" /> Checklist ({checklistDone}/{checklist.length})
            </button>
            <button
              onClick={() => setActiveTab('time')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${activeTab === 'time' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              <Clock className="w-4 h-4" /> Waktu Kerja ({ticket.timeSpent || 0}h)
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${activeTab === 'comments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              <MessageSquare className="w-4 h-4" /> Komentar ({comments.length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${activeTab === 'activity' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              <Activity className="w-4 h-4" /> Aktivitas ({activityLog.length})
            </button>
          </div>

          {/* TAB CONTENTS */}
          <div className="pt-2">
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Deskripsi</h4>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed border border-gray-100 whitespace-pre-wrap">
                    {ticket.description || 'Tidak ada deskripsi.'}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Lampiran Berkas ({attachments.length})</h4>
                  <div className="space-y-2">
                    {attachments.map((att, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 text-sm text-gray-700 font-medium">
                        <Paperclip className="w-4 h-4 text-blue-500" />
                        <span>{att}</span>
                      </div>
                    ))}
                    {attachments.length === 0 && <p className="text-sm text-gray-400 italic">Tidak ada lampiran.</p>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'checklist' && (
              <div className="space-y-4">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-blue-900">Progress Checklist</p>
                    <p className="text-xs text-blue-700 mt-0.5">{checklistDone} dari {checklist.length} selesai</p>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{checklistProgress}%</span>
                </div>

                <div className="space-y-2">
                  {checklist.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => onToggleChecklist(ticket.id, item.id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`text-sm flex-1 font-medium ${item.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {item.text}
                      </span>
                      <button
                        onClick={() => onDeleteChecklist(ticket.id, item.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {checklist.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Belum ada item checklist.</p>}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={e => setNewChecklistText(e.target.value)}
                    onKeyPress={e => {
                      if (e.key === 'Enter' && newChecklistText.trim()) {
                        onAddChecklist(ticket.id, newChecklistText.trim());
                        setNewChecklistText('');
                      }
                    }}
                    placeholder="Tambah item checklist baru..."
                    className="flex-1 border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    onClick={() => {
                      if (newChecklistText.trim()) {
                        onAddChecklist(ticket.id, newChecklistText.trim());
                        setNewChecklistText('');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'time' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-indigo-900 uppercase tracking-wider">Total Waktu Dihabiskan</p>
                    <p className="text-3xl font-bold text-indigo-700 mt-1">
                      {(ticket.timeSpent || 0).toFixed(1)} <span className="text-base font-normal text-gray-500">jam</span>
                    </p>
                  </div>
                  <div>
                    {isTimerRunning ? (
                      <button
                        onClick={onStopTimer}
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-md flex items-center gap-2 transition"
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                        <Square className="w-4 h-4 fill-current" /> Stop Timer
                      </button>
                    ) : (
                      <button
                        onClick={() => onStartTimer(ticket.id)}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md flex items-center gap-2 transition"
                      >
                        <Play className="w-4 h-4 fill-current" /> Start Timer
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Catat Waktu Manual</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={timeHours}
                      onChange={e => setTimeHours(e.target.value)}
                      placeholder="Jam (cth: 2.5)"
                      className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                    <input
                      type="text"
                      value={timeNote}
                      onChange={e => setTimeNote(e.target.value)}
                      placeholder="Catatan pengerjaan..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                    <button
                      onClick={() => {
                        const h = parseFloat(timeHours);
                        if (h > 0) {
                          onAddTimeEntry(ticket.id, h, timeNote.trim());
                          setTimeHours('');
                          setTimeNote('');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      Catat
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Riwayat Waktu ({timeEntries.length})</h4>
                  <div className="space-y-2">
                    {timeEntries.map(entry => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            ⏱
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{entry.hours} jam</p>
                            <p className="text-xs text-gray-500">{entry.note || 'Manual entry'} • {entry.timestamp.split('T')[0]}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteTimeEntry(ticket.id, entry.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 p-1 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {timeEntries.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Belum ada catatan waktu.</p>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {comments.map((c, idx) => (
                    <div key={idx} className="flex gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                        {c.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-900">{c.author}</span>
                          <span className="text-[10px] text-gray-400">{c.date}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Belum ada komentar. Ketik @ untuk mention rekan tim.</p>}
                </div>

                <div className="relative pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={handleCommentInput}
                      onKeyPress={e => {
                        if (e.key === 'Enter' && commentText.trim()) {
                          onAddComment(ticket.id, commentText.trim());
                          setCommentText('');
                          setMentionQuery(null);
                        }
                      }}
                      placeholder="Tulis komentar... (ketik @ untuk mention)"
                      className="flex-1 border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      onClick={() => {
                        if (commentText.trim()) {
                          onAddComment(ticket.id, commentText.trim());
                          setCommentText('');
                          setMentionQuery(null);
                        }
                      }}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      Kirim
                    </button>
                  </div>

                  {/* Mention dropdown */}
                  {mentionQuery !== null && filteredMembers.length > 0 && (
                    <div className="absolute bottom-full left-0 mb-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-20">
                      <div className="p-2 bg-gray-50 border-b text-[10px] font-bold text-gray-400 uppercase">Mention Anggota Tim</div>
                      {filteredMembers.map(member => (
                        <button
                          key={member}
                          type="button"
                          onClick={() => insertMention(member)}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition"
                        >
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                            {member[0]}
                          </div>
                          {member}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-3">
                {activityLog.map((log, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">{log.action}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{log.user} • {log.timestamp.split('T')[0]}</p>
                    </div>
                  </div>
                ))}
                {activityLog.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Belum ada aktivitas tercatat.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Ticket } from '../types';
import { MessageSquare, RefreshCw } from 'lucide-react';

interface ActivityFeedViewProps {
  tickets: Ticket[];
  commentsMap: Record<string, Array<{ author: string; text: string; date: string }>>;
  onSelectTicket: (ticketId: string) => void;
}

export const ActivityFeedView: React.FC<ActivityFeedViewProps> = ({
  tickets,
  commentsMap,
  onSelectTicket
}) => {
  const activities: Array<{
    type: 'comment' | 'activity';
    timestamp: number;
    date: string;
    author: string;
    text: string;
    ticketId: string;
    ticketTitle: string;
  }> = [];

  Object.keys(commentsMap).forEach(ticketId => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    (commentsMap[ticketId] || []).forEach(c => {
      activities.push({
        type: 'comment',
        timestamp: new Date(c.date).getTime(),
        date: c.date,
        author: c.author,
        text: c.text,
        ticketId,
        ticketTitle: ticket.title
      });
    });
  });

  tickets.forEach(ticket => {
    (ticket.activityLog || []).forEach(log => {
      activities.push({
        type: 'activity',
        timestamp: new Date(log.timestamp).getTime(),
        date: log.timestamp.split('T')[0],
        author: log.user,
        text: log.action,
        ticketId: ticket.id,
        ticketTitle: ticket.title
      });
    });
  });

  activities.sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Feed Aktivitas Tim</h3>
            <p className="text-sm text-gray-500 mt-0.5">Semua komentar dan perubahan dari seluruh proyek Whats Project</p>
          </div>
          <span className="text-sm font-bold text-gray-500">{activities.length} aktivitas</span>
        </div>

        <div className="divide-y divide-gray-100">
          {activities.length === 0 ? (
            <div className="p-16 text-center text-gray-400 font-medium">Belum ada aktivitas tercatat</div>
          ) : (
            activities.slice(0, 60).map((a, idx) => (
              <div
                key={idx}
                onClick={() => onSelectTicket(a.ticketId)}
                className="p-5 hover:bg-gray-50/80 cursor-pointer transition flex gap-4"
              >
                <div className={`w-10 h-10 rounded-2xl text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs ${
                  a.type === 'comment' ? 'bg-gradient-to-tr from-blue-600 to-indigo-600' : 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                }`}>
                  {a.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                    <span className="text-sm font-bold text-gray-900">{a.author}</span>
                    <span className="text-xs text-gray-400">{a.date}</span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      a.type === 'comment' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {a.type === 'comment' ? <><MessageSquare className="w-3 h-3" /> Komentar</> : <><RefreshCw className="w-3 h-3" /> Aktivitas</>}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2 leading-relaxed">{a.text}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">{a.ticketId}</span>
                    <span>•</span>
                    <span className="truncate">{a.ticketTitle}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

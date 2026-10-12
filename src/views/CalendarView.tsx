import React from 'react';
import { Ticket } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  tickets: Ticket[];
  calendarDate: string; // YYYY-MM
  onUpdateCalendarDate: (newDateStr: string) => void;
  onSelectTicket: (ticketId: string) => void;
  onOpenCreateWithDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tickets,
  calendarDate,
  onUpdateCalendarDate,
  onSelectTicket,
  onOpenCreateWithDate
}) => {
  const [year, month] = calendarDate.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDayOfWeek = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  // Build cells
  const cells: Array<{ day: number; isOtherMonth: boolean; date: Date }> = [];
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    cells.push({ day: prevMonthLastDay - i, isOtherMonth: true, date: new Date(year, month - 2, prevMonthLastDay - i) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isOtherMonth: false, date: new Date(year, month - 1, d) });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, isOtherMonth: true, date: new Date(year, month, d) });
  }

  const ticketsByDate: Record<string, Ticket[]> = {};
  tickets.forEach(t => {
    if (!ticketsByDate[t.startDate]) ticketsByDate[t.startDate] = [];
    ticketsByDate[t.startDate].push(t);
  });

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1);
    onUpdateCalendarDate(d.toISOString().slice(0, 7));
  };

  const nextMonth = () => {
    const d = new Date(year, month, 1);
    onUpdateCalendarDate(d.toISOString().slice(0, 7));
  };

  const goToday = () => {
    onUpdateCalendarDate(new Date().toISOString().slice(0, 7));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden max-w-7xl mx-auto flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4 flex-shrink-0 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded-xl transition">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h3 className="text-lg font-bold text-gray-900 min-w-[180px] text-center">
            {monthNames[month - 1]} {year}
          </h3>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded-xl transition">
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
          <button onClick={goToday} className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition shadow-2xs">
            Hari Ini
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> High</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Normal</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Low</span>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
        {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {cells.map((cell, idx) => {
          const dateStr = cell.date.toISOString().split('T')[0];
          const dayTickets = ticketsByDate[dateStr] || [];
          const isToday = cell.date.getTime() === today.getTime();
          const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;

          return (
            <div
              key={idx}
              onClick={() => onOpenCreateWithDate(dateStr)}
              className={`min-h-[110px] border-r border-b border-gray-100 p-2 cursor-pointer transition hover:bg-blue-50/20 ${
                cell.isOtherMonth ? 'opacity-40 bg-gray-50/30' : isWeekend ? 'bg-gray-50/60' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-bold ${
                  isToday 
                    ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-xs' 
                    : 'text-gray-700'
                }`}>
                  {cell.day}
                </span>
                {dayTickets.length > 0 && (
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 rounded">
                    {dayTickets.length}
                  </span>
                )}
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[85px]">
                {dayTickets.map(t => {
                  const badgeColor = t.priority === 'high' ? 'bg-red-500' : t.priority === 'normal' ? 'bg-amber-500' : 'bg-green-500';
                  return (
                    <div
                      key={t.id}
                      onClick={(e) => { e.stopPropagation(); onSelectTicket(t.id); }}
                      className={`text-[10px] text-white px-2 py-1 rounded-md font-semibold truncate hover:opacity-90 shadow-2xs ${badgeColor}`}
                      title={`${t.id}: ${t.title}`}
                    >
                      {t.id}: {t.title}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

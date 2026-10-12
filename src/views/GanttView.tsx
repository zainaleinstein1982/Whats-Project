import React, { useState } from 'react';
import { Ticket } from '../types';
import { CPMEngine } from '../utils/cpm';

interface GanttViewProps {
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
}

export const GanttView: React.FC<GanttViewProps> = ({ tickets, onSelectTicket }) => {
  const [zoom, setZoom] = useState<'day' | 'week' | 'month'>('week');

  const activeTickets = tickets.filter(t => t.status !== 'archived');
  if (activeTickets.length === 0) {
    return <div className="text-center py-20 text-gray-500 font-medium">Tidak ada tiket aktif untuk Gantt Chart</div>;
  }

  const cpmResult = CPMEngine.calculate(activeTickets);
  const cpmMap: Record<string, boolean> = {};
  cpmResult.tasks.forEach(t => { cpmMap[t.id] = !!t.isCritical; });

  const sortedTickets = [...activeTickets].sort((a, b) => {
    const aES = cpmResult.tasks.find(t => t.id === a.id)?.ES || 0;
    const bES = cpmResult.tasks.find(t => t.id === b.id)?.ES || 0;
    return aES - bES;
  });

  const allDates = activeTickets.flatMap(t => [new Date(t.startDate), new Date(t.endDate)]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  minDate.setDate(minDate.getDate() - 2);
  maxDate.setDate(maxDate.getDate() + 2);

  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  const dayWidth = zoom === 'day' ? 44 : zoom === 'week' ? 22 : 8;
  const chartWidth = totalDays * dayWidth;
  const rowHeight = 48;
  const headerHeight = 56;
  const labelWidth = 280;

  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

  const ticketIndex: Record<string, number> = {};
  sortedTickets.forEach((t, i) => { ticketIndex[t.id] = i; });

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4 flex-shrink-0">
        <div className="flex items-center gap-6">
          <h3 className="font-bold text-gray-900 text-base">Timeline Proyek</h3>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-600" /> Normal</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500" /> Critical Path</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500" /> Selesai</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Zoom:</span>
          <button
            onClick={() => setZoom('day')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${zoom === 'day' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Hari
          </button>
          <button
            onClick={() => setZoom('week')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${zoom === 'week' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Minggu
          </button>
          <button
            onClick={() => setZoom('month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${zoom === 'month' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Bulan
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative">
        <div className="flex" style={{ minWidth: `${labelWidth + chartWidth}px` }}>
          {/* Left Task Labels */}
          <div className="flex-shrink-0 border-r border-gray-200 bg-gray-50/80 sticky left-0 z-20" style={{ width: `${labelWidth}px` }}>
            <div className="border-b border-gray-200 font-bold text-xs text-gray-500 px-4 flex items-center uppercase tracking-wider" style={{ height: `${headerHeight}px` }}>
              Daftar Tugas
            </div>
            {sortedTickets.map(t => {
              const isCritical = cpmMap[t.id];
              return (
                <div
                  key={t.id}
                  onClick={() => onSelectTicket(t.id)}
                  className={`flex items-center px-4 border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer transition ${isCritical ? 'border-l-4 border-l-red-500 bg-red-50/20' : ''}`}
                  style={{ height: `${rowHeight}px` }}
                >
                  <span className="text-xs font-mono font-bold text-gray-400 mr-2.5">{t.id}</span>
                  <span className="text-xs font-semibold text-gray-800 truncate flex-1">{t.title}</span>
                  {isCritical && (
                    <span className="ml-2 text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                      CP
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Gantt Chart Area */}
          <div className="flex-1 relative" style={{ width: `${chartWidth}px` }}>
            {/* Header Timeline */}
            <div className="border-b border-gray-200 flex bg-gray-50/40 sticky top-0 z-10" style={{ height: `${headerHeight}px` }}>
              {(() => {
                let htmlHeader = [];
                if (zoom === 'month') {
                  let curMonth = -1;
                  for (let i = 0; i < totalDays; i++) {
                    const date = new Date(minDate);
                    date.setDate(date.getDate() + i);
                    if (date.getMonth() !== curMonth) {
                      curMonth = date.getMonth();
                      let daysInM = 0;
                      for (let j = i; j < totalDays; j++) {
                        const d = new Date(minDate);
                        d.setDate(d.getDate() + j);
                        if (d.getMonth() === curMonth) daysInM++; else break;
                      }
                      htmlHeader.push(
                        <div key={i} className="border-r border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700" style={{ width: `${daysInM * dayWidth}px`, height: '100%' }}>
                          {months[curMonth]} {date.getFullYear()}
                        </div>
                      );
                    }
                  }
                } else {
                  for (let i = 0; i < totalDays; i++) {
                    const date = new Date(minDate);
                    date.setDate(date.getDate() + i);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    const showLabel = zoom === 'day' || (zoom === 'week' && date.getDay() === 1);
                    htmlHeader.push(
                      <div key={i} className={`border-r ${isWeekend ? 'bg-gray-100/60' : 'border-gray-200/50'} flex flex-col items-center justify-center`} style={{ width: `${dayWidth}px`, height: '100%' }}>
                        {showLabel && (
                          <>
                            <span className="text-[10px] font-bold text-gray-400">{months[date.getMonth()]}</span>
                            <span className={`text-xs font-bold ${isWeekend ? 'text-gray-400' : 'text-gray-700'}`}>{date.getDate()}</span>
                          </>
                        )}
                      </div>
                    );
                  }
                }
                return htmlHeader;
              })()}
            </div>

            {/* Today Red Line */}
            {(() => {
              const todayObj = new Date();
              todayObj.setHours(0, 0, 0, 0);
              const offset = Math.round((todayObj.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
              if (offset >= 0 && offset <= totalDays) {
                return (
                  <div
                    style={{ position: 'absolute', left: `${offset * dayWidth}px`, top: 0, bottom: 0, width: '2px', background: '#EF4444', zIndex: 15, opacity: 0.8 }}
                    title="Hari ini"
                  />
                );
              }
              return null;
            })()}

            {/* Grid Rows & Bars */}
            <div className="relative" style={{ height: `${sortedTickets.length * rowHeight}px` }}>
              {/* Grid lines */}
              {Array.from({ length: sortedTickets.length + 1 }).map((_, i) => (
                <div key={i} style={{ position: 'absolute', top: `${i * rowHeight}px`, left: 0, right: 0, height: '1px', background: '#f1f5f9' }} />
              ))}

              {/* Dependency SVG lines */}
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible', zIndex: 5 }}>
                <defs>
                  <marker id="gantt-arrow" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                    <polygon points="0 0, 6 2, 0 4" fill="#6B7280" />
                  </marker>
                </defs>
                {sortedTickets.map((ticket, i) => {
                  if (!ticket.dependencies || ticket.dependencies.length === 0) return null;
                  return ticket.dependencies.map(depId => {
                    const depIdx = ticketIndex[depId];
                    if (depIdx === undefined) return null;
                    const depTicket = sortedTickets[depIdx];
                    const depEnd = new Date(depTicket.endDate);
                    const taskStart = new Date(ticket.startDate);

                    const fromX = Math.round((depEnd.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth + dayWidth;
                    const fromY = depIdx * rowHeight + rowHeight / 2;
                    const toX = Math.round((taskStart.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth;
                    const toY = i * rowHeight + rowHeight / 2;
                    const midX = fromX + (toX - fromX) / 2;

                    return (
                      <path
                        key={`${depId}-${ticket.id}`}
                        d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
                        stroke="#6B7280"
                        strokeWidth="1.5"
                        fill="none"
                        markerEnd="url(#gantt-arrow)"
                      />
                    );
                  });
                })}
              </svg>

              {/* Gantt Bars */}
              {sortedTickets.map((ticket, index) => {
                const start = new Date(ticket.startDate);
                const end = new Date(ticket.endDate);
                const startOffset = Math.max(0, Math.round((start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));
                const duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
                const left = startOffset * dayWidth;
                const width = duration * dayWidth;
                const top = index * rowHeight + 10;
                const height = rowHeight - 20;

                const isCritical = cpmMap[ticket.id];
                let barBg = 'bg-blue-600';
                if (isCritical) barBg = 'bg-red-500';
                else if (ticket.status === 'done') barBg = 'bg-green-500';
                else if (ticket.status === 'in-validation') barBg = 'bg-purple-600';

                const progressW = (ticket.progress / 100) * width;

                return (
                  <div
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket.id)}
                    className={`absolute cursor-pointer rounded-lg shadow-2xs group transition hover:brightness-110 ${isCritical ? 'animate-pulse' : ''}`}
                    style={{ left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px`, zIndex: 10 }}
                    title={`${ticket.id}: ${ticket.title} (${ticket.progress}%)`}
                  >
                    <div className={`w-full h-full rounded-lg ${barBg} opacity-30 absolute`} />
                    <div className={`h-full rounded-lg ${barBg} absolute`} style={{ width: `${progressW}px`, opacity: 0.9 }} />
                    <div className="absolute inset-0 flex items-center px-2.5">
                      <span className="text-[11px] text-white font-bold truncate drop-shadow">
                        {width > 60 ? `${ticket.id}: ${ticket.title}` : ticket.id}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

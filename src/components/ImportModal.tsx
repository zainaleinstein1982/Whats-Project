import React, { useState } from 'react';
import { Ticket } from '../types';
import { parseCSV, normalizeHeader, mapPriority, inferStatusFromProgress, parseDate, parsePredecessors } from '../utils/csv';
import { X, Upload, FileSpreadsheet, CheckCircle } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (tickets: Ticket[], replace: boolean) => void;
  onShowToast: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  onShowToast
}) => {
  const [parsedTickets, setParsedTickets] = useState<Ticket[] | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      onShowToast('File harus berformat CSV', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result as string;
        const result = processCSVText(text);
        if (result.error) {
          onShowToast(result.error, 'error');
        } else {
          setParsedTickets(result.tickets);
          setParseErrors(result.errors);
        }
      } catch (err: any) {
        onShowToast('Gagal memparsing CSV: ' + err.message, 'error');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const processCSVText = (text: string) => {
    const rows = parseCSV(text);
    if (rows.length < 2) return { error: 'File CSV kosong atau tidak memiliki header', tickets: [], errors: [] };
    const headers = rows[0].map(normalizeHeader);
    const colMap = {
      id: headers.findIndex(h => h === 'id' || h === 'no'),
      name: headers.findIndex(h => h === 'taskname' || h === 'name' || h === 'task'),
      priority: headers.findIndex(h => h === 'priority'),
      progress: headers.findIndex(h => h.includes('complete') || h === 'progress'),
      assignee: headers.findIndex(h => h === 'resourcenames' || h === 'assignee'),
      start: headers.findIndex(h => h === 'start' || h === 'startdate'),
      finish: headers.findIndex(h => h === 'finish' || h === 'enddate'),
      predecessors: headers.findIndex(h => h === 'predecessors' || h === 'dependencies')
    };

    if (colMap.name === -1 || colMap.start === -1 || colMap.finish === -1) {
      return { error: 'Kolom wajib (Task Name, Start, Finish) tidak ditemukan di CSV', tickets: [], errors: [] };
    }

    const tickets: Ticket[] = [];
    const errors: string[] = [];

    rows.slice(1).forEach((row, idx) => {
      const lineNum = idx + 2;
      const get = (col: number) => col >= 0 && col < row.length ? (row[col] || '').trim() : '';
      const name = get(colMap.name);
      if (!name) { errors.push(`Baris ${lineNum}: nama tugas kosong`); return; }

      const startDate = parseDate(get(colMap.start));
      const endDate = parseDate(get(colMap.finish));
      if (!startDate || !endDate) { errors.push(`Baris ${lineNum}: format tanggal invalid`); return; }

      let progress = 0;
      const pRaw = get(colMap.progress);
      if (pRaw) {
        const pNum = parseFloat(pRaw.replace('%', ''));
        if (!isNaN(pNum)) progress = Math.max(0, Math.min(100, Math.round(pNum)));
      }

      const rawId = get(colMap.id);
      const id = rawId ? String(rawId).replace(/[^a-zA-Z0-9]/g, '') : `T${idx + 1}`;
      const ticketId = id.startsWith('T') ? id : `T${id}`;

      tickets.push({
        id: ticketId,
        title: name,
        description: '',
        priority: mapPriority(get(colMap.priority)),
        status: inferStatusFromProgress(progress),
        assignee: get(colMap.assignee) || '',
        startDate,
        endDate,
        progress,
        dependencies: parsePredecessors(get(colMap.predecessors)),
        timeSpent: 0,
        timeEntries: [],
        checklist: [],
        activityLog: [{ timestamp: new Date().toISOString(), action: 'Diimport dari CSV', user: 'Admin Proyek' }]
      });
    });

    if (tickets.length === 0) return { error: 'Tidak ada data valid yang dapat diimport', tickets: [], errors };

    // Resolve dependencies
    const idLookup: Record<string, string> = {};
    tickets.forEach(t => {
      idLookup[String(t.id).replace('T', '')] = t.id;
      idLookup[t.id] = t.id;
    });
    tickets.forEach(t => {
      t.dependencies = t.dependencies.map(dep => {
        const c = String(dep).replace(/[^a-zA-Z0-9]/g, '');
        return idLookup[c] || idLookup['T' + c] || null;
      }).filter(Boolean) as string[];
    });

    return { tickets, errors };
  };

  const handleSampleData = () => {
    const sampleCSV = `ID,Task Name,Priority,% Complete,Resource Names,Start,Finish,Predecessors
1,Analisis Kebutuhan Bisnis,High,100,Andi Prasetyo,2026-10-12,2026-10-14,
2,Desain UI/UX,High,100,Citra Dewi,2026-10-15,2026-10-18,1
3,Desain Arsitektur Sistem,High,70,Budi Santoso,2026-10-19,2026-10-23,2
4,Setup Infrastruktur,Medium,50,Eko Wijaya,2026-10-19,2026-10-22,2
5,Pengembangan Backend API,High,30,Budi Santoso,2026-10-24,2026-10-29,3
6,Pengembangan Frontend,High,0,Dian Permata,2026-10-24,2026-10-28,"2,3"
7,Pengujian Fungsional,High,0,Citra Dewi,2026-10-30,2026-11-02,"5,6"
8,User Acceptance Testing,Medium,0,Andi Prasetyo,2026-10-30,2026-11-01,"5,6"
9,Deployment Production,High,0,Eko Wijaya,2026-11-03,2026-11-04,"7,8"
10,Dokumentasi & Pelatihan,Low,0,Dian Permata,2026-11-05,2026-11-06,9`;
    const res = processCSVText(sampleCSV);
    setParsedTickets(res.tickets);
    setParseErrors(res.errors);
  };

  const downloadTemplate = () => {
    const csv = `ID,Task Name,Priority,% Complete,Resource Names,Start,Finish,Predecessors
1,Analisis Kebutuhan,High,100,Andi Prasetyo,2026-10-12,2026-10-14,
2,Desain UI/UX,High,100,Citra Dewi,2026-10-15,2026-10-18,1`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whatsproject-template.csv';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Template CSV berhasil didownload', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="text-xl font-bold text-gray-900">📥 Import Tugas dari CSV</h3>
              <p className="text-sm text-gray-500 mt-0.5">Upload file CSV atau muat data sampel</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!parsedTickets ? (
              <div className="space-y-6">
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setIsDragging(false);
                    const f = e.dataTransfer.files[0];
                    if (f) handleFileProcess(f);
                  }}
                  onClick={() => document.getElementById('csv-input')?.click()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${
                    isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50/50'
                  }`}
                >
                  <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4 animate-bounce" />
                  <p className="text-lg font-semibold text-gray-800 mb-1">Klik atau seret file CSV ke sini</p>
                  <p className="text-xs text-gray-400">Mendukung format standar Microsoft Project / CSV</p>
                  <input
                    id="csv-input"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleFileProcess(f);
                    }}
                  />
                </div>

                <div className="flex items-center justify-center gap-4 pt-2">
                  <button
                    onClick={downloadTemplate}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Download Template CSV
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={handleSampleData}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
                  >
                    ✨ Muat Data Sampel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-emerald-900">File CSV berhasil diparse</p>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        {parsedTickets.length} tugas siap diimport {parseErrors.length > 0 ? `• ${parseErrors.length} baris dilewati` : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setParsedTickets(null)}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    ← Pilih File Lain
                  </button>
                </div>

                <label className="flex items-center gap-2.5 text-sm font-medium text-gray-700 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={replaceExisting}
                    onChange={e => setReplaceExisting(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Ganti semua data tiket yang ada (Timpa total)</span>
                </label>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-2.5 px-3 font-semibold text-gray-600">ID</th>
                        <th className="text-left py-2.5 px-3 font-semibold text-gray-600">Judul Tugas</th>
                        <th className="text-left py-2.5 px-3 font-semibold text-gray-600">Prioritas</th>
                        <th className="text-center py-2.5 px-3 font-semibold text-gray-600">Progress</th>
                        <th className="text-left py-2.5 px-3 font-semibold text-gray-600">Assignee</th>
                        <th className="text-left py-2.5 px-3 font-semibold text-gray-600">Mulai</th>
                        <th className="text-left py-2.5 px-3 font-semibold text-gray-600">Selesai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {parsedTickets.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50/50">
                          <td className="py-2 px-3 font-mono text-xs text-gray-500">{t.id}</td>
                          <td className="py-2 px-3 font-medium text-gray-800">{t.title}</td>
                          <td className="py-2 px-3">
                            <span className="text-xs font-semibold capitalize">{t.priority}</span>
                          </td>
                          <td className="py-2 px-3 text-center">{t.progress}%</td>
                          <td className="py-2 px-3 text-gray-600 text-xs">{t.assignee || '-'}</td>
                          <td className="py-2 px-3 text-xs text-gray-500">{t.startDate}</td>
                          <td className="py-2 px-3 text-xs text-gray-500">{t.endDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-white transition"
            >
              Batal
            </button>
            {parsedTickets && parsedTickets.length > 0 && (
              <button
                onClick={() => {
                  onImport(parsedTickets, replaceExisting);
                  onClose();
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
              >
                Import {parsedTickets.length} Tugas
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

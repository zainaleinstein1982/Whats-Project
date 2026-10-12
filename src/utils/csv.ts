export function parseCSV(text: string) {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  while (i < text.length) {
    const char = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 2;
      } else if (char === '"') {
        inQuotes = false;
        i++;
      } else {
        field += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === ',') {
        current.push(field);
        field = '';
        i++;
      } else if (char === '\n') {
        current.push(field);
        rows.push(current);
        current = [];
        field = '';
        i++;
      } else {
        field += char;
        i++;
      }
    }
  }
  if (field.length > 0 || current.length > 0) {
    current.push(field);
    rows.push(current);
  }
  return rows.filter(row => row.length > 0 && !(row.length === 1 && row[0].trim() === ''));
}

export function normalizeHeader(h: string) {
  return h.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function mapPriority(p: string): 'low' | 'normal' | 'high' {
  const v = (p || '').trim().toLowerCase();
  if (v === 'high' || v === 'tinggi' || v === 'critical') return 'high';
  if (v === 'low' || v === 'rendah') return 'low';
  return 'normal';
}

export function inferStatusFromProgress(p: number): 'backlog' | 'in-progress' | 'in-validation' | 'done' | 'archived' {
  if (p >= 100) return 'done';
  if (p > 0) return 'in-progress';
  return 'backlog';
}

export function parseDate(str: string): string | null {
  if (!str) return null;
  str = str.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const m1 = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m1) return `${m1[3]}-${m1[2].padStart(2, '0')}-${m1[1].padStart(2, '0')}`;
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return null;
}

export function parsePredecessors(str: string): string[] {
  if (!str) return [];
  return String(str).split(/[,;]+/).map(s => s.trim()).filter(s => s.length > 0);
}

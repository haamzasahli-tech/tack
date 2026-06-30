import { Transaction, TransactionType } from './types';
import { CATS, KW, INCOME_CATS, TRANSFER_CATS } from './data';

// Helper to format currency values to readable Tunisian Dinars (TND) style
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
  });
}

// Auto-detect a suitable category key based on title, descriptions, or raw values
export function detectCategory(description: string, notes: string, categoryValue?: string): string {
  const normCat = (categoryValue || '').toString().toLowerCase().trim();
  
  if (normCat) {
    if (CATS[normCat]) {
      return normCat;
    }
    // Partial check in labels
    for (const [key, value] of Object.entries(CATS)) {
      if (normCat.includes(key) || normCat.includes(value.label.toLowerCase())) {
        return key;
      }
    }
    // Keyword map check on raw category string
    for (const [kw, catKey] of Object.entries(KW)) {
      if (normCat.includes(kw)) {
        return catKey;
      }
    }
  }

  // Fallback to searching the description and notes
  const textToSearch = `${description} ${notes}`.toLowerCase();
  for (const [kw, catKey] of Object.entries(KW)) {
    if (textToSearch.includes(kw)) {
      return catKey;
    }
  }

  return 'other';
}

// Normalize raw inputs (from API/webhooks or modal fields) to secure TypeScript objects
export function normalizeTransaction(raw: any, fallbackId?: string): Transaction {
  const src = (raw && typeof raw.json === 'object') ? raw.json : raw;
  const r: Record<string, any> = {};
  
  Object.keys(src).forEach(k => {
    r[k.toLowerCase().trim()] = src[k];
  });

  const amount = parseFloat(r.amount || r.price || r.cost || r.value || 0);
  const desc = (r.description || r.note || r.message || r.text || r.item || r.name || '').toString().trim();
  const notes = (r.notes || r.comment || r.remarks || '').toString().trim();
  const pm = (r['payment method'] || r.payment_method || r.paymentmethod || r.pm || r.method || 'Cash').toString().trim();
  const account = (r.account || r.acc || '').toString().trim();

  // Resolve transaction type
  let rawType = (r.type || r.kind || '').toString().toLowerCase().trim();
  let type: TransactionType = 'expense';
  
  if (rawType.includes('income') || rawType.includes('revenu') || rawType.includes('salary') || rawType.includes('salaire')) {
    type = 'income';
  } else if (rawType.includes('transfer') || rawType.includes('virement') || rawType.includes('retrait') || rawType.includes('withdrawal') || rawType.includes('depot') || rawType.includes('deposit')) {
    type = 'transfer';
  }

  // Resolve category
  const cat = detectCategory(desc, notes, r.category || r.cat || r.categorie);

  // Override type based on resolved category for maximum intelligence
  let finalType = type;
  if (INCOME_CATS?.has(cat)) finalType = 'income';
  if (TRANSFER_CATS?.has(cat)) finalType = 'transfer';

  // Date parsing with multiple formatting fallbacks (e.g. Serial numbers, standard dates)
  let dateStr = (r.date || r.day || r.datetime || r.timestamp || '').toString().trim();
  if (!dateStr || dateStr === 'undefined') {
    dateStr = new Date().toISOString().slice(0, 10);
  } else if (/^\d{5,}$/.test(dateStr)) {
    // Excel date serial number conversion
    dateStr = new Date((parseInt(dateStr, 10) - 25569) * 86400000).toISOString().slice(0, 10);
  } else if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(dateStr)) {
    // DD-MM-YYYY or MM/DD/YYYY to YYYY-MM-DD
    const p = dateStr.split(/[\/\-]/);
    if (p[2] && p[2].length === 2) {
      p[2] = '20' + p[2];
    }
    dateStr = `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
  }
  
  dateStr = dateStr.slice(0, 10);

  // Time parsing
  const rawTime = (r.time || r.hour || '').toString();
  const tm = rawTime.match(/\d{1,2}:\d{2}/);
  const time = tm ? tm[0] : '00:00';

  return {
    id: src.id || fallbackId || `tx-${Math.random().toString(36).substr(2, 9)}`,
    amount,
    desc: desc || CATS[cat]?.label || 'Unlabeled Transaction',
    notes,
    pm,
    account,
    type: finalType,
    cat,
    date: dateStr,
    time,
    fromAccount: r.from || r.from_account || undefined,
    toAccount: r.to || r.to_account || undefined,
  };
}

// Export a set of transaction objects directly into a beautifully encoded CSV download
export function exportToCSV(transactions: Transaction[], filename: string = 'floww_export.csv'): void {
  const headers = ['Date', 'Time', 'Description', 'Category', 'Payment Method', 'Type', 'Amount (TND)', 'Notes', 'From Account', 'To Account'];
  const csvLines = [headers.join(',')];

  transactions.forEach(t => {
    const escapedDesc = `"${(t.desc || '').replace(/"/g, '""')}"`;
    const escapedNotes = `"${(t.notes || '').replace(/"/g, '""')}"`;
    const categoryLabel = CATS[t.cat]?.label || t.cat;
    
    csvLines.push([
      t.date,
      t.time,
      escapedDesc,
      categoryLabel,
      t.pm,
      t.type,
      t.amount,
      escapedNotes,
      t.fromAccount || '',
      t.toAccount || ''
    ].join(','));
  });

  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

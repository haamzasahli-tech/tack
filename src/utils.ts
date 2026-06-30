import { Transaction, TransactionType, CategoryInfo } from './types';
import { CATS, KW, INCOME_CATS, TRANSFER_CATS } from './data';

// Helper to resolve category details (icon, label, color) for any custom or predefined category
export function getCategoryDetails(catKey: string): CategoryInfo {
  const norm = (catKey || '').toString().trim();
  if (!norm) {
    return {
      label: 'Other',
      icon: '📦',
      color: '#8895aa',
    };
  }

  const lower = norm.toLowerCase();
  if (CATS[lower]) {
    return CATS[lower];
  }

  // If we can't find the exact key in CATS, let's see if we can match the label case-insensitively
  for (const value of Object.values(CATS)) {
    if (value.label.toLowerCase() === lower) {
      return value;
    }
  }

  // Fallback icon and color selection based on common keywords
  let icon = '📦';
  let color = '#8895aa';

  if (lower.includes('food') || lower.includes('eat') || lower.includes('resto') || lower.includes('nourriture') || lower.includes('dine') || lower.includes('repas')) {
    icon = '🍔'; color = '#f97316';
  } else if (lower.includes('coffee') || lower.includes('cafe') || lower.includes('espresso') || lower.includes('latte') || lower.includes('cappuccino')) {
    icon = '☕'; color = '#a78bfa';
  } else if (lower.includes('grocer') || lower.includes('groceries') || lower.includes('superm') || lower.includes('market') || lower.includes('achat') || lower.includes('epicerie')) {
    icon = '🛒'; color = '#22c55e';
  } else if (lower.includes('transp') || lower.includes('taxi') || lower.includes('uber') || lower.includes('bus') || lower.includes('bolt') || lower.includes('metro') || lower.includes('train')) {
    icon = '🚗'; color = '#3b82f6';
  } else if (lower.includes('car') || lower.includes('voiture') || lower.includes('fuel') || lower.includes('essence') || lower.includes('parking') || lower.includes('mecanic')) {
    icon = '🚙'; color = '#4f8ef7';
  } else if (lower.includes('health') || lower.includes('doctor') || lower.includes('med') || lower.includes('pharm') || lower.includes('dentist') || lower.includes('sante') || lower.includes('clinique')) {
    icon = '🏥'; color = '#2dd4bf';
  } else if (lower.includes('bill') || lower.includes('facture') || lower.includes('electr') || lower.includes('water') || lower.includes('internet') || lower.includes('telecom') || lower.includes('steg') || lower.includes('sonede')) {
    icon = '💡'; color = '#fbbf24';
  } else if (lower.includes('rent') || lower.includes('loyer') || lower.includes('appartment') || lower.includes('home') || lower.includes('maison')) {
    icon = '🏠'; color = '#f472b6';
  } else if (lower.includes('fun') || lower.includes('cin') || lower.includes('show') || lower.includes('netflix') || lower.includes('spotify') || lower.includes('entertain') || lower.includes('loisir') || lower.includes('jeux')) {
    icon = '🎬'; color = '#c084fc';
  } else if (lower.includes('shop') || lower.includes('clothe') || lower.includes('zara') || lower.includes('mall') || lower.includes('boutique') || lower.includes('magasin')) {
    icon = '🛍'; color = '#fb7185';
  } else if (lower.includes('educ') || lower.includes('school') || lower.includes('book') || lower.includes('course') || lower.includes('learn') || lower.includes('etude') || lower.includes('cours') || lower.includes('livre')) {
    icon = '📚'; color = '#60a5fa';
  } else if (lower.includes('travel') || lower.includes('voyage') || lower.includes('flight') || lower.includes('hotel') || lower.includes('vacation') || lower.includes('vol') || lower.includes('vols')) {
    icon = '✈️'; color = '#34d399';
  } else if (lower.includes('gift') || lower.includes('cadeau') || lower.includes('present')) {
    icon = '🎁'; color = '#f87171';
  } else if (lower.includes('salary') || lower.includes('salaire') || lower.includes('paie') || lower.includes('pay') || lower.includes('virement')) {
    icon = '💰'; color = '#4ade80';
  } else if (lower.includes('freelance') || lower.includes('client') || lower.includes('contract') || lower.includes('travail')) {
    icon = '💼'; color = '#a3e635';
  } else if (lower.includes('invest') || lower.includes('crypto') || lower.includes('stock') || lower.includes('saving') || lower.includes('bourse') || lower.includes('epargne')) {
    icon = '📈'; color = '#38bdf8';
  } else if (lower.includes('bank') || lower.includes('banque') || lower.includes('transfert') || lower.includes('virement_bancaire')) {
    icon = '🏦'; color = '#818cf8';
  } else if (lower.includes('fee') || lower.includes('frais') || lower.includes('charge') || lower.includes('commission')) {
    icon = '💳'; color = '#fb923c';
  } else if (lower.includes('withdraw') || lower.includes('retrait') || lower.includes('cash_out') || lower.includes('atm')) {
    icon = '💵'; color = '#94a3b8';
  } else if (lower.includes('family') || lower.includes('famille') || lower.includes('enfant') || lower.includes('kid')) {
    icon = '❤️'; color = '#f43f5e';
  } else if (lower.includes('pet') || lower.includes('dog') || lower.includes('cat') || lower.includes('animal') || lower.includes('chien') || lower.includes('chat')) {
    icon = '🐶'; color = '#d97706';
  } else if (lower.includes('sub') || lower.includes('abonnement')) {
    icon = '📱'; color = '#7c3aed';
  } else if (lower.includes('online') || lower.includes('amazon') || lower.includes('delivery') || lower.includes('livraison') || lower.includes('jumia') || lower.includes('aliexpress')) {
    icon = '📦'; color = '#0ea5e9';
  } else if (lower.includes('tax') || lower.includes('impot') || lower.includes('taxes')) {
    icon = '📋'; color = '#dc2626';
  } else if (lower.includes('maint') || lower.includes('repar') || lower.includes('work') || lower.includes('bricolage') || lower.includes('plombier') || lower.includes('electricien')) {
    icon = '🔧'; color = '#78716c';
  }

  // Otherwise return the custom category exactly as received with a generic icon and stylish color
  return {
    label: norm, // Keep exactly as exists in Google Sheets!
    icon,
    color,
  };
}

// Helper to format currency values to readable Tunisian Dinars (TND) style
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
  });
}

// Auto-detect a suitable category key based on title, descriptions, or raw values
export function detectCategory(description: string, notes: string, categoryValue?: string, enableSmartCategorization = false): string {
  const normCat = (categoryValue || '').toString().trim();
  
  if (normCat) {
    const normLower = normCat.toLowerCase();
    if (CATS[normLower]) {
      return normLower;
    }
    // Partial check in labels
    for (const [key, value] of Object.entries(CATS)) {
      if (normLower === value.label.toLowerCase() || normLower.includes(key)) {
        return key;
      }
    }
    // Return raw category exactly as received if it's not empty and not matching predefined
    return normCat;
  }

  // Fallback to keyword guessing only if Smart Categorization is enabled
  if (enableSmartCategorization) {
    const textToSearch = `${description} ${notes}`.toLowerCase();
    for (const [kw, catKey] of Object.entries(KW)) {
      if (textToSearch.includes(kw)) {
        return catKey;
      }
    }
  }

  return 'other';
}

// Normalize raw inputs (from API/webhooks or modal fields) to secure TypeScript objects
export function normalizeTransaction(raw: any, fallbackId?: string, enableSmartCategorization = false): Transaction {
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
  const cat = detectCategory(desc, notes, r.category || r.cat || r.categorie, enableSmartCategorization);

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
    desc: desc || getCategoryDetails(cat).label || 'Unlabeled Transaction',
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
    const categoryLabel = getCategoryDetails(t.cat).label;
    
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

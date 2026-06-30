import { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  ArrowUpDown, 
  Tag, 
  Wallet,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { Transaction } from '../types';
import { CATS, PM_CONFIGS } from '../data';
import { formatCurrency, exportToCSV } from '../utils';

interface TransactionTableProps {
  transactions: Transaction[];
  onOpenAddTx: () => void;
}

type SortKey = 'date' | 'amount';
type SortOrder = 'asc' | 'desc';

export default function TransactionTable({ transactions, onOpenAddTx }: TransactionTableProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterPM, setFilterPM] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Sorting state
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Retrieve unique categories currently present in transactions for filter choices
  const uniqueCats = useMemo(() => {
    const cats = new Set(transactions.map(t => t.cat));
    return Array.from(cats).sort();
  }, [transactions]);

  // Apply search, filters, and sorting
  const processedTransactions = useMemo(() => {
    let result = [...transactions];

    // Search query match
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        t =>
          (t.desc || '').toLowerCase().includes(q) ||
          (t.notes || '').toLowerCase().includes(q) ||
          (CATS[t.cat]?.label || '').toLowerCase().includes(q)
      );
    }

    // Type filter match
    if (filterType) {
      result = result.filter(t => t.type === filterType);
    }

    // Category filter match
    if (filterCat) {
      result = result.filter(t => t.cat === filterCat);
    }

    // Payment Method filter match
    if (filterPM) {
      result = result.filter(t => t.pm === filterPM);
    }

    // Date From filter match
    if (dateFrom) {
      result = result.filter(t => t.date >= dateFrom);
    }

    // Date To filter match
    if (dateTo) {
      result = result.filter(t => t.date <= dateTo);
    }

    // Sorting algorithm
    result.sort((a, b) => {
      if (sortKey === 'date') {
        const dateTimeA = `${a.date}T${a.time}`;
        const dateTimeB = `${b.date}T${b.time}`;
        return sortOrder === 'asc' 
          ? dateTimeA.localeCompare(dateTimeB) 
          : dateTimeB.localeCompare(dateTimeA);
      } else {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
    });

    return result;
  }, [transactions, search, filterType, filterCat, filterPM, dateFrom, dateTo, sortKey, sortOrder]);

  // Calculate pages
  const totalItems = processedTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedTransactions = useMemo(() => {
    // Correct active page overflow bounds
    const safePage = currentPage > totalPages ? totalPages : currentPage;
    const startIndex = (safePage - 1) * itemsPerPage;
    return processedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [processedTransactions, currentPage, totalPages]);

  // Handle Sort trigger
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Generate pagination buttons array with ellipsis
  const pageButtons = useMemo(() => {
    const buttons: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) buttons.push(i);
    } else {
      buttons.push(1);
      if (currentPage > 3) buttons.push('…');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        buttons.push(i);
      }
      if (currentPage < totalPages - 2) buttons.push('…');
      buttons.push(totalPages);
    }
    return buttons;
  }, [currentPage, totalPages]);

  const handleExport = () => {
    exportToCSV(processedTransactions, 'filtered_transactions.csv');
  };

  const clearAllFilters = () => {
    setSearch('');
    setFilterType('');
    setFilterCat('');
    setFilterPM('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const isFilterActive = search || filterType || filterCat || filterPM || dateFrom || dateTo;

  return (
    <div className="bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden shadow-sm">
      {/* Dynamic Toolbar filters */}
      <div className="p-4 md:p-5 border-b border-[rgba(255,255,255,0.06)] flex flex-wrap gap-3 items-center">
        {/* Search input container */}
        <div className="flex items-center gap-2 bg-[#1a2130] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-1.5 flex-1 min-w-[200px] max-w-[300px]">
          <Search size={13} className="text-[#8895aa]" />
          <input
            type="text"
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent border-none outline-none text-[#f0f4ff] text-xs w-full"
          />
        </div>

        {/* Type dropdown */}
        <div className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-lg px-2.5 py-1.5">
          <Layers size={11} className="text-[#8895aa]" />
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent border-none text-[#f0f4ff] text-xs outline-none cursor-pointer font-medium"
          >
            <option value="">All Types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
            <option value="transfer">Transfers</option>
          </select>
        </div>

        {/* Category dropdown */}
        <div className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-lg px-2.5 py-1.5">
          <Tag size={11} className="text-[#8895aa]" />
          <select
            value={filterCat}
            onChange={(e) => {
              setFilterCat(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent border-none text-[#f0f4ff] text-xs outline-none cursor-pointer font-medium"
          >
            <option value="">All Categories</option>
            {uniqueCats.map((catKey) => {
              const cat = CATS[catKey];
              return (
                <option key={catKey} value={catKey}>
                  {cat?.icon} {cat?.label}
                </option>
              );
            })}
          </select>
        </div>

        {/* Method dropdown */}
        <div className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-lg px-2.5 py-1.5">
          <Wallet size={11} className="text-[#8895aa]" />
          <select
            value={filterPM}
            onChange={(e) => {
              setFilterPM(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent border-none text-[#f0f4ff] text-xs outline-none cursor-pointer font-medium"
          >
            <option value="">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Mobile Payment">Mobile Payment</option>
          </select>
        </div>

        {/* Date inputs */}
        <div className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-lg px-2.5 py-1.5">
          <Calendar size={11} className="text-[#8895aa]" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent border-none text-[#f0f4ff] text-xs outline-none cursor-pointer"
            title="Start date filter"
          />
          <span className="text-[#4a5568] text-[10px]">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent border-none text-[#f0f4ff] text-xs outline-none cursor-pointer"
            title="End date filter"
          />
        </div>

        {/* Action Clear/Export button container */}
        <div className="ml-auto flex gap-2 w-full sm:w-auto justify-end">
          {isFilterActive && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-[#8895aa] hover:text-[#f0f4ff] bg-[#1a2130]/50 hover:bg-[#1a2130] border border-[rgba(255,255,255,0.04)] cursor-pointer transition-all"
            >
              Clear
            </button>
          )}

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.06)] text-[#8895aa] hover:text-[#f0f4ff] text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            <Download size={12} />
            <span>CSV</span>
          </button>

          <button
            onClick={onOpenAddTx}
            className="flex items-center gap-1 bg-gradient-to-r from-[#4f8ef7] to-[#7c6af0] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-[0_0_12px_rgba(79,142,247,0.2)] hover:shadow-[0_0_18px_rgba(79,142,247,0.35)] transition-all cursor-pointer"
          >
            <span>+ Add</span>
          </button>
        </div>
      </div>

      {/* Main Table view */}
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#0d1117] text-[#4a5568] border-b border-[rgba(255,255,255,0.06)]">
              <th 
                onClick={() => handleSort('date')} 
                className="sort p-3.5 pl-5 text-left text-[10px] font-bold tracking-wider uppercase cursor-pointer select-none hover:text-[#8895aa] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown size={10} />
                </div>
              </th>
              <th className="p-3.5 text-left text-[10px] font-bold tracking-wider uppercase">Description</th>
              <th className="p-3.5 text-left text-[10px] font-bold tracking-wider uppercase">Category</th>
              <th className="p-3.5 text-left text-[10px] font-bold tracking-wider uppercase">Method</th>
              <th className="p-3.5 text-left text-[10px] font-bold tracking-wider uppercase">Type</th>
              <th 
                onClick={() => handleSort('amount')} 
                className="sort p-3.5 pr-5 text-right text-[10px] font-bold tracking-wider uppercase cursor-pointer select-none hover:text-[#8895aa] transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Amount</span>
                  <ArrowUpDown size={10} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(255,255,255,0.025)]">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-12 text-[#4a5568] text-sm">
                  <Sparkles size={18} className="mx-auto mb-2 opacity-50 text-[#8895aa]" />
                  No matching transaction records found.
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((t, idx) => {
                const cat = CATS[t.cat] || CATS.other;
                const pmCfg = PM_CONFIGS[t.pm] || { icon: '💰', color: '#8895aa' };
                const formattedDate = new Date(t.date).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: '2-digit',
                });

                return (
                  <tr
                    key={t.id}
                    className="hover:bg-[rgba(255,255,255,0.012)] transition-colors duration-100 group cursor-default"
                    style={{ animation: `fadeUp 0.35s ease ${idx * 0.02}s both` }}
                  >
                    {/* Date cell */}
                    <td className="p-3.5 pl-5 text-[#8895aa] text-xs">
                      <div className="font-semibold text-[#f0f4ff]">{formattedDate}</div>
                      <div className="text-[10px] text-[#4a5568]">{t.time}</div>
                    </td>

                    {/* Description cell */}
                    <td className="p-3.5">
                      <div className="text-xs font-semibold text-[#f0f4ff]">{t.desc}</div>
                      {t.notes && <div className="text-[10px] text-[#8895aa] mt-0.5">{t.notes}</div>}
                    </td>

                    {/* Category badge cell */}
                    <td className="p-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                        style={{
                          backgroundColor: `${cat.color}10`,
                          borderColor: `${cat.color}20`,
                          color: cat.color,
                        }}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>
                    </td>

                    {/* Payment Method cell */}
                    <td className="p-3.5 text-[#8895aa] text-xs font-medium">
                      <span className="flex items-center gap-1.5">
                        <span>{pmCfg.icon}</span>
                        <span>{t.pm}</span>
                      </span>
                    </td>

                    {/* Type badge cell */}
                    <td className="p-3.5">
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          t.type === 'income'
                            ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e]'
                            : t.type === 'transfer'
                            ? 'bg-[rgba(59,130,246,0.1)] text-[#3b82f6]'
                            : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>

                    {/* Amount cell */}
                    <td
                      className={`p-3.5 pr-5 font-['Syne'] text-xs font-black text-right ${
                        t.type === 'income'
                          ? 'text-[#22c55e]'
                          : t.type === 'transfer'
                          ? 'text-[#3b82f6]'
                          : 'text-[#ef4444]'
                      }`}
                    >
                      {t.type === 'income' ? '+' : t.type === 'transfer' ? '⇄' : '−'}
                      {formatCurrency(t.amount)} TND
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="p-4 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs text-[#8895aa]">
        <span className="font-semibold text-[11px]">{totalItems} transaction entries</span>
        
        {totalPages > 1 && (
          <div className="flex gap-1">
            {/* Prev button */}
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-[#8895aa] hover:text-white flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronLeft size={12} />
            </button>

            {/* Pagination numbers */}
            {pageButtons.map((btn, idx) => {
              if (btn === '…') {
                return (
                  <div
                    key={`ellipsis-${idx}`}
                    className="w-7 h-7 flex items-center justify-center text-[#4a5568]"
                  >
                    …
                  </div>
                );
              }

              return (
                <button
                  key={`page-${btn}`}
                  onClick={() => setCurrentPage(btn as number)}
                  className={`w-7 h-7 rounded text-xs font-semibold border flex items-center justify-center cursor-pointer transition-all ${
                    btn === currentPage
                      ? 'bg-[rgba(79,142,247,0.12)] text-[#4f8ef7] border-[rgba(79,142,247,0.25)] font-bold'
                      : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] text-[#8895aa] hover:text-[#f0f4ff]'
                  }`}
                >
                  {btn}
                </button>
              );
            })}

            {/* Next button */}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 rounded bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-[#8895aa] hover:text-white flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

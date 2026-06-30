import { RefreshCw, Plus, CreditCard, Download, User } from 'lucide-react';
import { PeriodType } from '../types';

interface TopbarProps {
  period: PeriodType;
  setPeriod: (p: PeriodType) => void;
  syncState: 'idle' | 'loading' | 'ok' | 'error';
  syncInfo: string | number;
  onRefresh: () => void;
  onOpenAddTx: () => void;
  onOpenUpdateBalance: () => void;
  onExportCSV: () => void;
}

export default function Topbar({
  period,
  setPeriod,
  syncState,
  syncInfo,
  onRefresh,
  onOpenAddTx,
  onOpenUpdateBalance,
  onExportCSV,
}: TopbarProps) {
  
  // Custom styling based on current background synchronization states
  const getSyncPillStyles = () => {
    switch (syncState) {
      case 'loading':
        return 'text-[#8895aa] border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)]';
      case 'ok':
        return 'text-[#22c55e] border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.08)] hover:bg-[rgba(34,197,94,0.12)] shadow-[0_0_12px_rgba(34,197,94,0.05)]';
      case 'error':
        return 'text-[#fb923c] border-[rgba(251,146,60,0.25)] bg-[rgba(251,146,60,0.08)] hover:bg-[rgba(251,146,60,0.12)]';
      default:
        return 'text-[#4f8ef7] border-[rgba(79,142,247,0.2)] bg-[rgba(79,142,247,0.08)] hover:bg-[rgba(79,142,247,0.12)]';
    }
  };

  const getSyncLabel = () => {
    switch (syncState) {
      case 'loading':
        return 'Syncing…';
      case 'ok':
        return `Live · ${syncInfo} rows`;
      case 'error':
        return 'Offline';
      default:
        return 'Click to Sync';
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-[#080b12]/85 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)] px-6 md:px-8 h-16 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <h1 className="font-['Syne'] text-base font-bold tracking-tight text-[#f0f4ff]">
          Financial Intelligence
        </h1>
        <button
          onClick={onRefresh}
          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${getSyncPillStyles()}`}
          title={syncState === 'error' ? `Connection error: ${syncInfo}` : 'Refresh data connection'}
        >
          <RefreshCw 
            size={11} 
            className={`flex-shrink-0 ${syncState === 'loading' ? 'animate-spin duration-700' : ''}`} 
          />
          <span>{getSyncLabel()}</span>
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Period Selector dropdown */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as PeriodType)}
          className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-[#f0f4ff] text-xs px-3 py-1.5 rounded-lg outline-none cursor-pointer hover:bg-[rgba(255,255,255,0.06)] transition-all"
        >
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="last_3m">Last 3 Months</option>
          <option value="this_year">This Year</option>
          <option value="all">All Time</option>
        </select>

        {/* Action button tools */}
        <button
          onClick={onOpenAddTx}
          className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center cursor-pointer text-[#8895aa] hover:bg-[rgba(255,255,255,0.07)] hover:text-white transition-all"
          title="Add New Transaction"
        >
          <Plus size={15} strokeWidth={2.3} />
        </button>

        <button
          onClick={onOpenUpdateBalance}
          className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center cursor-pointer text-[#8895aa] hover:bg-[rgba(255,255,255,0.07)] hover:text-white transition-all"
          title="Update Account Starting Balances"
        >
          <CreditCard size={14} strokeWidth={2} />
        </button>

        <button
          onClick={onExportCSV}
          className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center cursor-pointer text-[#8895aa] hover:bg-[rgba(255,255,255,0.07)] hover:text-white transition-all"
          title="Export CSV"
        >
          <Download size={14} strokeWidth={2} />
        </button>

        {/* Dynamic User avatar container */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c6af0] to-[#f472b6] flex items-center justify-center text-[11px] font-bold text-white shadow-md cursor-pointer select-none">
          <User size={13} className="text-white" />
        </div>
      </div>
    </header>
  );
}

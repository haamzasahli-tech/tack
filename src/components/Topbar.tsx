import { Plus, CreditCard, Download, User } from 'lucide-react';
import { PeriodType } from '../types';

interface TopbarProps {
  period: PeriodType;
  setPeriod: (p: PeriodType) => void;
  onOpenAddTx: () => void;
  onOpenUpdateBalance: () => void;
  onExportCSV: () => void;
}

export default function Topbar({
  period,
  setPeriod,
  onOpenAddTx,
  onOpenUpdateBalance,
  onExportCSV,
}: TopbarProps) {
  
  return (
    <header className="sticky top-0 z-10 bg-[#080b12]/85 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)] px-6 md:px-8 h-16 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <h1 className="font-['Syne'] text-base font-bold tracking-tight text-[#f0f4ff]">
          Financial Intelligence
        </h1>
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

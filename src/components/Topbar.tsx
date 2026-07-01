import { Plus, CreditCard, Download, User, Menu } from 'lucide-react';
import { PeriodType } from '../types';

interface TopbarProps {
  period: PeriodType;
  setPeriod: (p: PeriodType) => void;
  onOpenAddTx: () => void;
  onOpenUpdateBalance: () => void;
  onExportCSV: () => void;
  onOpenSidebar: () => void;
}

export default function Topbar({
  period,
  setPeriod,
  onOpenAddTx,
  onOpenUpdateBalance,
  onExportCSV,
  onOpenSidebar,
}: TopbarProps) {
  
  return (
    <header className="sticky top-0 z-10 bg-[#080b12]/85 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)] px-4 md:px-8 h-16 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 md:gap-4">
        {/* Hamburger Menu Toggle on Mobile */}
        <button
          onClick={onOpenSidebar}
          className="flex md:hidden w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] items-center justify-center cursor-pointer text-[#8895aa] hover:bg-[rgba(255,255,255,0.07)] hover:text-white transition-all"
          title="Open Menu"
        >
          <Menu size={16} />
        </button>

        <h1 className="font-['Syne'] text-sm md:text-base font-bold tracking-tight text-[#f0f4ff] truncate max-w-[140px] xs:max-w-none">
          Financial Intelligence
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Period Selector dropdown */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as PeriodType)}
          className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-[#f0f4ff] text-xs px-2 py-1.5 md:px-3 rounded-lg outline-none cursor-pointer hover:bg-[rgba(255,255,255,0.06)] transition-all bg-[#0d1117]"
        >
          <option className="bg-[#131922] text-[#f0f4ff]" value="this_month">This Month</option>
          <option className="bg-[#131922] text-[#f0f4ff]" value="last_month">Last Month</option>
          <option className="bg-[#131922] text-[#f0f4ff]" value="last_3m">Last 3 Months</option>
          <option className="bg-[#131922] text-[#f0f4ff]" value="this_year">This Year</option>
          <option className="bg-[#131922] text-[#f0f4ff]" value="all">All Time</option>
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
          className="hidden sm:flex w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] items-center justify-center cursor-pointer text-[#8895aa] hover:bg-[rgba(255,255,255,0.07)] hover:text-white transition-all"
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

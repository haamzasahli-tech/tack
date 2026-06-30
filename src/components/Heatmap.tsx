import { useMemo } from 'react';
import { Transaction } from '../types';
import { formatCurrency } from '../utils';

interface HeatmapProps {
  transactions: Transaction[];
}

export default function Heatmap({ transactions }: HeatmapProps) {
  const heatmapCells = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    const expenses = transactions.filter((t) => t.type === 'expense');
    
    expenses.forEach((t) => {
      dailyMap[t.date] = (dailyMap[t.date] || 0) + t.amount;
    });

    const maxDayVal = Math.max(...Object.values(dailyMap), 1);
    const cells = [];
    const now = new Date('2026-06-30'); // Anchor time

    // Calculate cells for the past 35 days (5 weeks grid)
    for (let i = 34; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const value = dailyMap[iso] || 0;
      
      // Map values to discrete levels from 0 to 5
      let level = 0;
      if (value > 0) {
        level = Math.min(5, Math.ceil((value / maxDayVal) * 5));
      }

      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
      cells.push({
        iso,
        value,
        level,
        title: `${value > 0 ? `${Math.round(value)} TND — ` : ''}${label}`,
      });
    }

    return cells;
  }, [transactions]);

  // Retrieve bg styling depending on the intensity level
  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-[#4f8ef7]/15 border border-[#4f8ef7]/10';
      case 2:
        return 'bg-[#4f8ef7]/35 border border-[#4f8ef7]/20';
      case 3:
        return 'bg-[#4f8ef7]/55 border border-[#4f8ef7]/30';
      case 4:
        return 'bg-[#4f8ef7]/75';
      case 5:
        return 'bg-[#4f8ef7] shadow-[0_0_8px_rgba(79,142,247,0.4)]';
      default:
        return 'bg-[#1a2130] hover:bg-[#202a3a] border border-transparent';
    }
  };

  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
      <div className="mb-4">
        <h4 className="font-['Syne'] text-xs font-bold text-[#f0f4ff] uppercase tracking-wider">Spending Heatmap</h4>
        <p className="text-[10px] text-[#8895aa] mt-0.5">Frequency map over the past 5 weeks</p>
      </div>

      {/* Grid labels */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5 text-center">
        {weekdays.map((day, i) => (
          <span key={i} className="text-[9px] font-bold text-[#4a5568]">
            {day}
          </span>
        ))}
      </div>

      {/* Grid cells */}
      <div className="grid grid-cols-7 gap-1.5">
        {heatmapCells.map((cell) => (
          <div
            key={cell.iso}
            title={cell.title}
            className={`aspect-square rounded-md cursor-pointer transition-all duration-150 hover:scale-110 ${getLevelColor(
              cell.level
            )}`}
          ></div>
        ))}
      </div>

      {/* Grid legend indicators */}
      <div className="flex items-center gap-1.5 mt-4 text-[9px] text-[#4a5568] font-bold">
        <span>Less</span>
        <div className="w-2.5 h-2.5 rounded-sm bg-[#1a2130]"></div>
        <div className="w-2.5 h-2.5 rounded-sm bg-[#4f8ef7]/15"></div>
        <div className="w-2.5 h-2.5 rounded-sm bg-[#4f8ef7]/35"></div>
        <div className="w-2.5 h-2.5 rounded-sm bg-[#4f8ef7]/55"></div>
        <div className="w-2.5 h-2.5 rounded-sm bg-[#4f8ef7]/75"></div>
        <div className="w-2.5 h-2.5 rounded-sm bg-[#4f8ef7]"></div>
        <span>More</span>
      </div>
    </div>
  );
}

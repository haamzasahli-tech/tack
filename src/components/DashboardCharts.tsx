import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Transaction } from '../types';
import { PM_CONFIGS } from '../data';
import { formatCurrency } from '../utils';

interface DashboardChartsProps {
  allTransactions: Transaction[];
  filteredTransactions: Transaction[];
}

export default function DashboardCharts({ allTransactions, filteredTransactions }: DashboardChartsProps) {
  const [ieMonths, setIeMonths] = useState<6 | 12>(6);

  // 1. DATA PREPARATION: Income vs Expenses Grouped Bar
  const ieChartData = useMemo(() => {
    const data: { name: string; income: number; expense: number }[] = [];
    const now = new Date('2026-06-30T14:42:09-07:00'); // Consistent reference time

    for (let i = ieMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = d.toISOString().slice(0, 7); // "YYYY-MM"
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      const monthRows = allTransactions.filter((t) => t.date.startsWith(yearMonth));
      const income = Math.round(monthRows.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0));
      const expense = Math.round(monthRows.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0));

      data.push({ name: label, income, expense });
    }
    return data;
  }, [allTransactions, ieMonths]);

  // 2. DATA PREPARATION: Daily Spending (Last 30 Days)
  const dailyChartData = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    const expenses = filteredTransactions.filter((t) => t.type === 'expense');
    expenses.forEach((t) => {
      dailyMap[t.date] = (dailyMap[t.date] || 0) + t.amount;
    });

    const dates = Object.keys(dailyMap).sort();
    const end = dates.length ? new Date(dates[dates.length - 1]) : new Date('2026-06-30');
    const start = new Date(end);
    start.setDate(end.getDate() - 29);

    const chartData: { name: string; amount: number }[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      chartData.push({
        name: label,
        amount: +(dailyMap[iso] || 0).toFixed(1),
      });
    }
    return chartData;
  }, [filteredTransactions]);

  // 3. DATA PREPARATION: Weekly Trend (Last 8 Weeks)
  const weeklyChartData = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    filteredTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        dailyMap[t.date] = (dailyMap[t.date] || 0) + t.amount;
      });

    const now = new Date('2026-06-30');
    const chartData: { name: string; amount: number }[] = [];

    for (let w = 7; w >= 0; w--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - w * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);

      let amount = 0;
      for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
        amount += dailyMap[d.toISOString().slice(0, 10)] || 0;
      }

      const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      chartData.push({
        name: label,
        amount: Math.round(amount),
      });
    }
    return chartData;
  }, [filteredTransactions]);

  // 4. DATA PREPARATION: Savings Trend (Last 6 Months)
  const savingsChartData = useMemo(() => {
    const chartData: { name: string; savings: number }[] = [];
    const now = new Date('2026-06-30');

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('en-US', { month: 'short' });

      const monthRows = allTransactions.filter((t) => t.date.startsWith(yearMonth));
      const income = monthRows.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = monthRows.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      chartData.push({
        name: label,
        savings: Math.round(income - expense),
      });
    }
    return chartData;
  }, [allTransactions]);

  // 5. DATA PREPARATION: Payment Method Doughnut Pie
  const pmChartData = useMemo(() => {
    const expenses = filteredTransactions.filter((t) => t.type === 'expense');
    const pmMap: Record<string, number> = {};
    expenses.forEach((t) => {
      pmMap[t.pm] = (pmMap[t.pm] || 0) + t.amount;
    });

    return Object.entries(pmMap)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        color: PM_CONFIGS[name]?.color || '#8895aa',
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // General reusable charts style variables
  const customTooltipStyle = {
    contentStyle: {
      backgroundColor: '#131922',
      borderColor: 'rgba(255,255,255,0.08)',
      borderRadius: '8px',
      padding: '8px 12px',
    },
    labelStyle: {
      color: '#f0f4ff',
      fontWeight: 'bold',
      fontSize: '11px',
    },
    itemStyle: {
      color: '#8895aa',
      fontSize: '11px',
    },
  };

  return (
    <div className="space-y-6">
      {/* Analytics Row 1: Cash Flow & Daily Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Income vs Expenses Grouped Bar */}
        <div className="lg:col-span-7 bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h4 className="font-['Syne'] text-sm font-bold text-[#f0f4ff]">Income vs Expenses</h4>
              <p className="text-[11px] text-[#8895aa] mt-0.5">Monthly cash flow comparison</p>
            </div>
            <div className="flex gap-1 p-0.5 bg-[#1a2130] rounded-lg border border-[rgba(255,255,255,0.03)]">
              <button
                onClick={() => setIeMonths(6)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  ieMonths === 6
                    ? 'bg-[rgba(79,142,247,0.12)] text-[#4f8ef7] border border-[rgba(79,142,247,0.25)]'
                    : 'text-[#8895aa] hover:text-[#f0f4ff]'
                }`}
              >
                6M
              </button>
              <button
                onClick={() => setIeMonths(12)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  ieMonths === 12
                    ? 'bg-[rgba(79,142,247,0.12)] text-[#4f8ef7] border border-[rgba(79,142,247,0.25)]'
                    : 'text-[#8895aa] hover:text-[#f0f4ff]'
                }`}
              >
                12M
              </button>
            </div>
          </div>
          <div className="h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ieChartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#4a5568', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4a5568', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...customTooltipStyle} formatter={(val) => [`${formatCurrency(val as number)} TND`]} />
                <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: '#8895aa' }} />
                <Bar name="Income" dataKey="income" fill="rgba(34,197,94,0.65)" radius={[4, 4, 0, 0]} />
                <Bar name="Expenses" dataKey="expense" fill="rgba(239,68,68,0.65)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Spending Line-Area Flow */}
        <div className="lg:col-span-5 bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
          <div>
            <h4 className="font-['Syne'] text-sm font-bold text-[#f0f4ff]">Daily Spending</h4>
            <p className="text-[11px] text-[#8895aa] mt-0.5">Last 30 days visualization</p>
          </div>
          <div className="h-[210px] w-full mt-5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f8ef7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#4a5568', fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={25} />
                <YAxis tick={{ fill: '#4a5568', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...customTooltipStyle} formatter={(val) => [`${formatCurrency(val as number)} TND`]} />
                <Area type="monotone" name="Spend" dataKey="amount" stroke="#4f8ef7" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Row 2: Weekly Trends, Savings & Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Weekly Trend (Bar) */}
        <div className="bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
          <h4 className="font-['Syne'] text-xs font-bold text-[#f0f4ff] uppercase tracking-wider">Weekly Trend</h4>
          <p className="text-[10px] text-[#8895aa] mt-0.5 mb-4">Last 8 weeks spending</p>
          <div className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#4a5568', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4a5568', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip {...customTooltipStyle} formatter={(val) => [`${val} TND`]} />
                <Bar dataKey="amount" fill="#7c6af0" radius={[4, 4, 0, 0]} opacity={0.85}>
                  {weeklyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`rgba(124,106,240, ${0.4 + (index / 7) * 0.6})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Savings Trend (Line) */}
        <div className="bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
          <h4 className="font-['Syne'] text-xs font-bold text-[#f0f4ff] uppercase tracking-wider">Savings Trend</h4>
          <p className="text-[10px] text-[#8895aa] mt-0.5 mb-4">Monthly net savings</p>
          <div className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={savingsChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#4a5568', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4a5568', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip {...customTooltipStyle} formatter={(val) => [`${val} TND`]} />
                <Line type="monotone" dataKey="savings" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Doughnut Pie */}
        <div className="bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="font-['Syne'] text-xs font-bold text-[#f0f4ff] uppercase tracking-wider">Methods Ratio</h4>
            <p className="text-[10px] text-[#8895aa] mt-0.5">By transaction amounts</p>
          </div>
          <div className="h-[140px] w-full flex items-center justify-center relative my-1">
            {pmChartData.length === 0 ? (
              <span className="text-xs text-[#4a5568]">No transaction records</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip {...customTooltipStyle} formatter={(val) => [`${val} TND`]} />
                  <Pie data={pmChartData} cx="50%" cy="50%" innerRadius={42} outerRadius={58} paddingAngle={2} dataKey="value">
                    {pmChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconSize={6} iconType="circle" wrapperStyle={{ fontSize: 10, color: '#8895aa', right: 0 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

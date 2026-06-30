import { useState, useEffect, useMemo } from 'react';
import { 
  Send, 
  Layers, 
  Database,
  TrendingDown,
  TrendingUp,
  Activity,
  DollarSign,
  Landmark,
  CreditCard as CardIcon,
  Plus,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Trash2
} from 'lucide-react';

import { Transaction, AccountBalances, PeriodType } from './types';
import { CATS, BUDGETS, getMockTransactions } from './data';
import { normalizeTransaction, formatCurrency, exportToCSV, getCategoryDetails } from './utils';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import BalanceModal from './components/BalanceModal';
import TransactionModal from './components/TransactionModal';
import DashboardCharts from './components/DashboardCharts';
import Heatmap from './components/Heatmap';
import TransactionTable from './components/TransactionTable';

const WEBHOOK_URL = 'https://n8n-x5rtnol9als1ymvhfxmgdz77.46.202.153.236.sslip.io/webhook/aced9fef-541e-4f4a-a7b1-17ef2e30271a';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balances, setBalances] = useState<AccountBalances>({ cash: 0, bank: 0, card: 0 });
  
  const [period, setPeriod] = useState<PeriodType>('this_month');
  const [activeSection, setActiveSection] = useState('overview');
  
  // Modals visibility toggles
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isUpdateBalanceOpen, setIsUpdateBalanceOpen] = useState(false);
  
  // Category configuration toggle
  const [catSortHighest, setCatSortHighest] = useState(true);

  // Settings for Smart Categorization
  const [smartCategorization, setSmartCategorization] = useState<boolean>(() => {
    return localStorage.getItem('floww_smart_cat') === 'true';
  });

  // Webhook sync states
  const [syncState, setSyncState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [syncInfo, setSyncInfo] = useState<string | number>('');

  // 1. SYNCHRONIZE DATA: Fetch and overwrite from n8n sheets webhook
  const handleSync = async () => {
    setSyncState('loading');
    const url = `${WEBHOOK_URL}?t=${Date.now()}`;
    let fetchedData: any = null;
    let errorMsg = '';

    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        fetchedData = await response.json();
      } else {
        errorMsg = `GET Error: ${response.status}`;
      }
    } catch (e: any) {
      errorMsg = e.message;
    }

    if (!fetchedData) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({}),
        });
        if (response.ok) {
          fetchedData = await response.json();
        } else {
          errorMsg += ` | POST Error: ${response.status}`;
        }
      } catch (e: any) {
        errorMsg += ` | POST Exception: ${e.message}`;
      }
    }

    if (fetchedData) {
      let rawRows: any[] = [];
      if (Array.isArray(fetchedData)) {
        rawRows = fetchedData;
      } else if (Array.isArray(fetchedData.data)) {
        rawRows = fetchedData.data;
      } else if (Array.isArray(fetchedData.rows)) {
        rawRows = fetchedData.rows;
      } else if (Array.isArray(fetchedData.items)) {
        rawRows = fetchedData.items;
      } else {
        rawRows = [fetchedData];
      }

      // Read current smart categorization state
      const isSmartCatEnabled = localStorage.getItem('floww_smart_cat') === 'true';

      const normalized = rawRows
        .map((row, idx) => normalizeTransaction(row, `synced-${idx}`, isSmartCatEnabled))
        .filter((row) => row.amount > 0);

      // Overwrite local transactions entirely to represent Google Sheet as single source of truth!
      setTransactions(normalized);
      localStorage.setItem('floww_transactions', JSON.stringify(normalized));
      setSyncState('ok');
      setSyncInfo(normalized.length);
    } else {
      console.warn('Unable to sync with n8n webhook:', errorMsg);
      setSyncState('error');
      setSyncInfo(errorMsg);
    }
  };

  // 2. INITIAL MOUNT LOAD: Restore state from local storage and poll
  useEffect(() => {
    // Restore starter base balances
    const savedCash = localStorage.getItem('floww_bal_cash');
    const savedBank = localStorage.getItem('floww_bal_bank') || localStorage.getItem('floww_floww_bal_bank');
    const savedCard = localStorage.getItem('floww_bal_card');
    
    if (savedCash || savedBank || savedCard) {
      setBalances({
        cash: parseFloat(savedCash || '0'),
        bank: parseFloat(savedBank || '0'),
        card: parseFloat(savedCard || '0'),
      });
    } else {
      setBalances({ cash: 0, bank: 0, card: 0 });
    }

    // Restore transactions if available, otherwise start with empty array
    const savedTx = localStorage.getItem('floww_transactions');
    if (savedTx) {
      try {
        setTransactions(JSON.parse(savedTx));
      } catch (e) {
        setTransactions([]);
      }
    } else {
      setTransactions([]);
    }

    // Run first sync immediately on load
    handleSync();

    // Auto-refresh from Google Sheets every 15 seconds
    const interval = setInterval(() => {
      handleSync();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // 3. SUBMIT MANUAL TRANSACTION
  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    const id = `manual-${Math.random().toString(36).substr(2, 9)}`;
    const fullTx: Transaction = {
      id,
      ...newTx
    };

    // Update state immediately for optimal offline interaction
    setTransactions((prev) => {
      const updated = [fullTx, ...prev];
      localStorage.setItem('floww_transactions', JSON.stringify(updated));
      return updated;
    });

    // Send transaction to n8n sheets webhook, then trigger sync
    try {
      setSyncState('loading');
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx),
      });
      // Delay pull sync slightly to allow n8n write to settle in sheet
      setTimeout(() => {
        handleSync();
      }, 1500);
    } catch (e: any) {
      console.error('Push to n8n sheet failed:', e);
      setSyncState('error');
      setSyncInfo(e.message);
    }
  };

  // 4. UPDATE CORE BASE BALANCES
  const handleSaveBalances = (newBalances: AccountBalances) => {
    setBalances(newBalances);
    localStorage.setItem('floww_bal_cash', newBalances.cash.toString());
    localStorage.setItem('floww_bal_bank', newBalances.bank.toString());
    localStorage.setItem('floww_bal_card', newBalances.card.toString());
  };

  const handleToggleSmartCat = () => {
    const newVal = !smartCategorization;
    setSmartCategorization(newVal);
    localStorage.setItem('floww_smart_cat', newVal ? 'true' : 'false');
    // Force immediate sync with new category classification logic
    setTimeout(() => {
      handleSync();
    }, 100);
  };

  // 5. TIMEFRAME CALCULATOR: Filter transactions based on selected period
  const filteredTransactions = useMemo(() => {
    const now = new Date('2026-06-30T14:42:09-07:00'); // Consistent baseline
    const y = now.getFullYear();
    const m = now.getMonth();
    
    let fromDate = '';
    let toDate = '';

    if (period === 'this_month') {
      fromDate = new Date(y, m, 1).toISOString().slice(0, 10);
      toDate = now.toISOString().slice(0, 10);
    } else if (period === 'last_month') {
      fromDate = new Date(y, m - 1, 1).toISOString().slice(0, 10);
      toDate = new Date(y, m, 0).toISOString().slice(0, 10);
    } else if (period === 'last_3m') {
      fromDate = new Date(y, m - 2, 1).toISOString().slice(0, 10);
      toDate = now.toISOString().slice(0, 10);
    } else if (period === 'this_year') {
      fromDate = `${y}-01-01`;
      toDate = now.toISOString().slice(0, 10);
    } else {
      return transactions;
    }

    return transactions.filter((t) => t.date >= fromDate && t.date <= toDate);
  }, [transactions, period]);

  // 6. DYNAMIC LEDGER: Calculate live active asset values
  const liveBalances = useMemo(() => {
    const result = { ...balances };
    
    // Evaluate ledger records across ALL transactions
    transactions.forEach((t) => {
      const amt = t.amount;
      const cat = (t.cat || '').toLowerCase();
      const type = t.type;
      const pm = (t.pm || '').toLowerCase();
      const acc = (t.account || '').toLowerCase();

      if (type === 'transfer') {
        const from = (t.fromAccount || '').toLowerCase();
        const to = (t.toAccount || '').toLowerCase();
        
        if (from === 'cash') result.cash -= amt;
        else if (from === 'bank') result.bank -= amt;
        else if (from === 'card') result.card -= amt;
        
        if (to === 'cash') result.cash += amt;
        else if (to === 'bank') result.bank += amt;
        else if (to === 'card') result.card += amt;
      } else if (cat === 'withdrawal') {
        // Withdrawal acts as transferring money from bank (checking) to Cash wallet
        if (acc === 'bank' || pm === 'bank transfer') {
          result.bank -= amt;
        } else if (acc === 'card' || pm === 'card') {
          result.card -= amt;
        } else {
          result.bank -= amt;
        }
        result.cash += amt;
      } else if (type === 'expense') {
        if (acc === 'cash' || pm === 'cash') result.cash -= amt;
        else if (acc === 'bank' || pm === 'bank transfer') result.bank -= amt;
        else if (acc === 'card' || pm === 'card' || pm === 'mobile payment') result.card -= amt;
      } else if (type === 'income') {
        if (acc === 'cash' || pm === 'cash') result.cash += amt;
        else if (acc === 'bank' || pm === 'bank transfer') result.bank += amt;
        else if (acc === 'card' || pm === 'card' || pm === 'mobile payment') result.card += amt;
      }
    });

    return result;
  }, [transactions, balances]);

  // 7. KEY PERFORMANCE INDICATORS (KPIs) CALCULATIONS
  const kpiData = useMemo(() => {
    const expRows = filteredTransactions.filter((t) => t.type === 'expense');
    const incRows = filteredTransactions.filter((t) => t.type === 'income');

    const totalIncome = incRows.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expRows.reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    
    // Calculate unique active days count for average spend
    const uniqueDays = new Set(expRows.map((t) => t.date)).size || 1;
    const avgDailySpend = totalExpenses / uniqueDays;

    // Category sorting
    const catTotals: Record<string, number> = {};
    expRows.forEach((t) => {
      catTotals[t.cat] = (catTotals[t.cat] || 0) + t.amount;
    });
    
    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const topCategoryKey = sortedCats[0]?.[0] || 'other';
    const topCategoryAmount = sortedCats[0]?.[1] || 0;

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      avgDailySpend,
      expenseCount: expRows.length,
      incomeCount: incRows.length,
      topCategoryKey,
      topCategoryAmount,
      catTotals,
    };
  }, [filteredTransactions]);

  // 8. DYNAMIC ANOMALY & ALERT NOTIFICATIONS BANNERS
  const activeAlerts = useMemo(() => {
    const alerts: { id: string; type: 'warn' | 'danger' | 'info' | 'success'; text: string; icon: string }[] = [];
    const { totalExpenses, totalIncome, netSavings, catTotals } = kpiData;

    // Alert A: Category Budget Overruns
    (Object.entries(catTotals) as [string, number][]).forEach(([catKey, val]) => {
      const budgetMax = BUDGETS[catKey];
      if (budgetMax && budgetMax > 0 && val > budgetMax) {
        const cat = getCategoryDetails(catKey);
        alerts.push({
          id: `alert-budget-${catKey}`,
          type: 'danger',
          icon: '🚨',
          text: `Budget overrun: ${cat.icon} ${cat.label} expenses (${formatCurrency(val)} TND) exceeded its threshold of ${formatCurrency(budgetMax)} TND.`
        });
      }
    });

    // Alert B: High Cash Payment Preference Warning
    const cashExpensesSum = filteredTransactions
      .filter((t) => t.type === 'expense' && t.pm === 'Cash')
      .reduce((s, t) => s + t.amount, 0);

    if (totalExpenses > 0) {
      const cashPercentage = Math.round((cashExpensesSum / totalExpenses) * 100);
      if (cashPercentage >= 70) {
        alerts.push({
          id: 'alert-cash-ratio',
          type: 'info',
          icon: '💵',
          text: `High cash reliance: ${cashPercentage}% of your payments are paid in cash. Consider utilizing digital banking or cards to build automated transaction histories.`
        });
      }
    }

    // Alert C: Savings Milestones Achievements
    if (netSavings > 0 && totalIncome > 0) {
      const savingPercentage = Math.round((netSavings / totalIncome) * 100);
      if (savingPercentage >= 20) {
        alerts.push({
          id: 'alert-saving-milestone',
          type: 'success',
          icon: '✅',
          text: `Savings achievement: You saved ${savingPercentage}% of your income in this timeframe (${formatCurrency(netSavings)} TND). Excellent capital stewardship!`
        });
      }
    }

    // Alert D: Compare Category spending against previous month
    const now = new Date('2026-06-30');
    const prevMonthRows = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() - 1;
    });

    const prevMonthCatTotals: Record<string, number> = {};
    prevMonthRows.filter(t => t.type === 'expense').forEach(t => {
      prevMonthCatTotals[t.cat] = (prevMonthCatTotals[t.cat] || 0) + t.amount;
    });

    (Object.entries(catTotals) as [string, number][]).forEach(([catKey, currentSum]) => {
      const previousSum = prevMonthCatTotals[catKey] || 0;
      if (previousSum > 50) { // filter noise
        const pctIncrease = Math.round(((currentSum - previousSum) / previousSum) * 100);
        if (pctIncrease >= 30) {
          const cat = getCategoryDetails(catKey);
          alerts.push({
            id: `alert-trend-${catKey}`,
            type: 'warn',
            icon: '📈',
            text: `Spending surge: ${cat.icon} ${cat.label} increased by ${pctIncrease}% compared to last month (${formatCurrency(currentSum)} TND vs ${formatCurrency(previousSum)} TND).`
          });
        }
      }
    });

    return alerts.slice(0, 5); // caps visible warnings limit
  }, [kpiData, filteredTransactions, transactions]);

  // 9. PREPARE CATEGORIES RENDER LIST
  const categoryBreakdownList = useMemo(() => {
    const totals = kpiData.catTotals;
    const sorted = (Object.entries(totals) as [string, number][]).sort((a, b) => 
      catSortHighest ? b[1] - a[1] : a[1] - b[1]
    );
    return sorted;
  }, [kpiData.catTotals, catSortHighest]);

  // 10. PREPARE PAYMENT METHODS RENDER GRID
  const paymentMethodsGrid = useMemo(() => {
    const expenses = filteredTransactions.filter((t) => t.type === 'expense');
    const totals: Record<string, number> = {};
    const counts: Record<string, number> = {};

    expenses.forEach((t) => {
      totals[t.pm] = (totals[t.pm] || 0) + t.amount;
      counts[t.pm] = (counts[t.pm] || 0) + 1;
    });

    const totalSum = expenses.reduce((s, t) => s + t.amount, 0) || 1;

    return ['Cash', 'Card', 'Bank Transfer', 'Mobile Payment'].map((pmName) => {
      const sum = totals[pmName] || 0;
      const count = counts[pmName] || 0;
      const pct = Math.round((sum / totalSum) * 100);
      return { name: pmName, sum, count, pct };
    }).sort((a, b) => b.sum - a.sum);
  }, [filteredTransactions]);

  // 11. TOP 10 EXPENSES
  const top10ExpensesList = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [filteredTransactions]);

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to purge local cache and trigger a fresh reload from Google Sheets? This action is irreversible.')) {
      localStorage.clear();
      setTransactions([]);
      setBalances({ cash: 0, bank: 0, card: 0 });
      handleSync();
    }
  };

  return (
    <div className="shell flex bg-[#080b12] text-[#f0f4ff] font-sans min-h-screen">
      {/* Collapsible Left navigation Sidebar */}
      <Sidebar 
        txCount={transactions.length}
        onOpenAddTx={() => setIsAddTxOpen(true)}
        onOpenUpdateBalance={() => setIsUpdateBalanceOpen(true)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content Pane */}
      <main className="main flex-1 overflow-y-auto flex flex-col min-w-0">
        <Topbar 
          period={period}
          setPeriod={setPeriod}
          onOpenAddTx={() => setIsAddTxOpen(true)}
          onOpenUpdateBalance={() => setIsUpdateBalanceOpen(true)}
          onExportCSV={() => exportToCSV(transactions, 'floww_export.csv')}
        />

        {/* Content Section padding */}
        <div className="content p-6 md:p-8 space-y-6 max-w-[1500px] w-full mx-auto">

          {/* Dynamic alerts warning section */}
          {activeAlerts.length > 0 && (
            <div className="space-y-2 animate-fade-up">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs leading-relaxed ${
                    alert.type === 'danger'
                      ? 'bg-red-500/5 border-red-500/15 text-[#f0f4ff]'
                      : alert.type === 'warn'
                      ? 'bg-yellow-500/5 border-yellow-500/15 text-[#f0f4ff]'
                      : alert.type === 'success'
                      ? 'bg-emerald-500/5 border-emerald-500/15 text-[#f0f4ff]'
                      : 'bg-[#4f8ef7]/5 border-[#4f8ef7]/15 text-[#f0f4ff]'
                  }`}
                >
                  <span className="text-sm flex-shrink-0">{alert.icon}</span>
                  <div className="flex-1">{alert.text}</div>
                  <button 
                    onClick={(e) => {
                      const element = e.currentTarget.parentElement;
                      if (element) element.style.display = 'none';
                    }}
                    className="text-[#4a5568] hover:text-[#8895aa] font-bold text-xs px-1"
                    title="Dismiss alert"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Account Assets grid cards section */}
          <div id="sec-accounts" className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold tracking-widest text-[#8895aa] uppercase">
                💼 Live Accounts
              </h3>
              <button 
                onClick={() => setIsUpdateBalanceOpen(true)}
                className="text-[11px] text-[#4f8ef7] font-semibold hover:underline cursor-pointer"
              >
                Update Base Values →
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cash Card */}
              <div className="bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 hover:bg-[#1a2130] transition-all overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-[rgba(34,197,94,0.12)] text-[#22c55e] flex items-center justify-center font-bold text-base mb-3.5">
                  💵
                </div>
                <div className="text-[10px] font-semibold text-[#8895aa] uppercase tracking-wider">Cash Wallet</div>
                <div className="font-heading text-xl font-extrabold text-[#f0f4ff] tracking-tight mt-1 leading-none">
                  {formatCurrency(liveBalances.cash)} TND
                </div>
                <p className="text-xs text-[#a0aec0] font-semibold mt-3 bg-[rgba(255,255,255,0.03)] inline-block px-2 py-1 rounded">Base: {formatCurrency(balances.cash)} TND</p>
              </div>

              {/* Bank Account */}
              <div className="bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 hover:bg-[#1a2130] transition-all overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-[rgba(124,106,240,0.12)] text-[#7c6af0] flex items-center justify-center font-bold text-base mb-3.5">
                  🏦
                </div>
                <div className="text-[10px] font-semibold text-[#8895aa] uppercase tracking-wider">Bank Checking</div>
                <div className="font-heading text-xl font-extrabold text-[#f0f4ff] tracking-tight mt-1 leading-none">
                  {formatCurrency(liveBalances.bank)} TND
                </div>
                <p className="text-xs text-[#a0aec0] font-semibold mt-3 bg-[rgba(255,255,255,0.03)] inline-block px-2 py-1 rounded">Base: {formatCurrency(balances.bank)} TND</p>
              </div>

              {/* Credit Card Account */}
              <div className="bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 hover:bg-[#1a2130] transition-all overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-[rgba(244,114,182,0.12)] text-[#f472b6] flex items-center justify-center font-bold text-base mb-3.5">
                  💳
                </div>
                <div className="text-[10px] font-semibold text-[#8895aa] uppercase tracking-wider">Credit Card</div>
                <div className="font-heading text-xl font-extrabold text-[#f0f4ff] tracking-tight mt-1 leading-none">
                  {formatCurrency(liveBalances.card)} TND
                </div>
                <p className="text-xs text-[#a0aec0] font-semibold mt-3 bg-[rgba(255,255,255,0.03)] inline-block px-2 py-1 rounded">Base: {formatCurrency(balances.card)} TND</p>
              </div>
            </div>
          </div>

          {/* Dynamic Core KPIs Overview */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {/* Income KPI */}
            <div className="bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-xl p-3.5 hover:bg-[#1a2130] transition-all">
              <div className="text-[9px] font-bold text-[#8895aa] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={10} className="text-[#22c55e]" />
                Period Income
              </div>
              <div className="font-heading text-lg font-bold text-[#22c55e] leading-none mt-1.5">
                +{formatCurrency(kpiData.totalIncome)} TND
              </div>
              <p className="text-[9px] text-[#4a5568] mt-2">{kpiData.incomeCount} entries registered</p>
            </div>

            {/* Expense KPI */}
            <div className="bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-xl p-3.5 hover:bg-[#1a2130] transition-all">
              <div className="text-[9px] font-bold text-[#8895aa] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown size={10} className="text-[#ef4444]" />
                Period Expenses
              </div>
              <div className="font-heading text-lg font-bold text-[#ef4444] leading-none mt-1.5">
                −{formatCurrency(kpiData.totalExpenses)} TND
              </div>
              <p className="text-[9px] text-[#4a5568] mt-2">{kpiData.expenseCount} purchases tracked</p>
            </div>

            {/* Net Savings KPI */}
            <div className="bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-xl p-3.5 hover:bg-[#1a2130] transition-all">
              <div className="text-[9px] font-bold text-[#8895aa] uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={10} className="text-[#3b82f6]" />
                Net Savings
              </div>
              <div className={`font-heading text-lg font-bold leading-none mt-1.5 ${kpiData.netSavings >= 0 ? 'text-[#3b82f6]' : 'text-[#ef4444]'}`}>
                {kpiData.netSavings >= 0 ? '+' : ''}{formatCurrency(kpiData.netSavings)} TND
              </div>
              <p className="text-[9px] text-[#4a5568] mt-2">
                {kpiData.netSavings >= 0 ? 'Positive savings rate' : 'Deficit budget overrun'}
              </p>
            </div>

            {/* Avg Daily Spend KPI */}
            <div className="bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-xl p-3.5 hover:bg-[#1a2130] transition-all">
              <div className="text-[9px] font-bold text-[#8895aa] uppercase tracking-wider">Avg Daily Spend</div>
              <div className="font-heading text-lg font-bold text-[#f0f4ff] leading-none mt-1.5">
                {formatCurrency(kpiData.avgDailySpend)} TND
              </div>
              <p className="text-[9px] text-[#4a5568] mt-2">Calculated from active days</p>
            </div>

            {/* Transaction Vol KPI */}
            <div className="bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-xl p-3.5 hover:bg-[#1a2130] transition-all">
              <div className="text-[9px] font-bold text-[#8895aa] uppercase tracking-wider">Period Rows</div>
              <div className="font-heading text-lg font-bold text-[#f0f4ff] leading-none mt-1.5">
                {filteredTransactions.length} rows
              </div>
              <p className="text-[9px] text-[#4a5568] mt-2">Total timeframe dataset</p>
            </div>

            {/* Top Category KPI */}
            <div className="bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-xl p-3.5 hover:bg-[#1a2130] transition-all overflow-hidden">
              <div className="text-[9px] font-bold text-[#8895aa] uppercase tracking-wider">Top Category</div>
              <div className="font-heading text-sm font-bold text-[#f0f4ff] leading-none mt-2 truncate">
                {kpiData.topCategoryAmount > 0 
                  ? `${getCategoryDetails(kpiData.topCategoryKey).icon} ${getCategoryDetails(kpiData.topCategoryKey).label}`
                  : '—'
                }
              </div>
              <p className="text-[9px] text-[#4a5568] mt-2">
                {kpiData.topCategoryAmount > 0 
                  ? `${formatCurrency(kpiData.topCategoryAmount)} TND spent` 
                  : 'No active expenses'
                }
              </p>
            </div>
          </div>

          {/* Core Analytics visual interactive charts */}
          <div id="sec-charts" className="space-y-3 pt-2">
            <h3 className="text-[10px] font-bold tracking-widest text-[#8895aa] uppercase">
              📈 Analytical Insights
            </h3>
            <DashboardCharts allTransactions={transactions} filteredTransactions={filteredTransactions} />
          </div>

          {/* Sub-charts: Heatmap & Additional charts */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
            <div className="md:col-span-4">
              <Heatmap transactions={filteredTransactions} />
            </div>

            {/* Top Ten largest individual expenses list */}
            <div id="sec-payments" className="md:col-span-8 bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h4 className="font-['Syne'] text-xs font-bold text-[#f0f4ff] uppercase tracking-wider">Top Ten Individual Purchases</h4>
                <p className="text-[10px] text-[#8895aa] mt-0.5">Largest expense payouts recorded in timeframe</p>
              </div>

              <div className="mt-4 flex-1 overflow-y-auto max-h-[190px] pr-1 space-y-1 divide-y divide-[rgba(255,255,255,0.03)]">
                {top10ExpensesList.length === 0 ? (
                  <div className="text-center text-xs text-[#4a5568] py-12">No expenses registered</div>
                ) : (
                  top10ExpensesList.map((t, i) => {
                    const cat = getCategoryDetails(t.cat);
                    const maxAmt = top10ExpensesList[0]?.amount || 1;
                    const pctWidth = Math.min(100, Math.round((t.amount / maxAmt) * 100));
                    return (
                      <div key={t.id} className="flex items-center gap-3.5 py-2.5">
                        <span className="text-[10px] text-[#4a5568] font-bold w-4 text-right">{i+1}</span>
                        <span className="text-sm">{cat.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-[#f0f4ff] truncate">{t.desc}</div>
                          <div className="w-full bg-[#1a2130] h-[3px] rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pctWidth}%`, backgroundColor: cat.color }}></div>
                          </div>
                        </div>
                        <span className="font-heading text-xs font-black text-[#ef4444] text-right flex-shrink-0">
                          {formatCurrency(t.amount)} TND
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Section: Category breakdown horizontal charts and List */}
          <div id="sec-categories" className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold tracking-widest text-[#8895aa] uppercase">
                🏷 Timeframe Category Breakdowns
              </h3>
              <button 
                onClick={() => setCatSortHighest(!catSortHighest)}
                className="text-[11px] text-[#4f8ef7] font-semibold hover:underline cursor-pointer"
              >
                Sort: {catSortHighest ? 'Highest Spending First' : 'Lowest Spending First'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Category Breakdown Horizontal Progress rows */}
              <div className="bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 space-y-3.5">
                <div>
                  <h4 className="font-['Syne'] text-xs font-bold text-[#f0f4ff] uppercase tracking-wider">Top Categories Grid</h4>
                  <p className="text-[10px] text-[#8895aa] mt-0.5">Timeframe distribution bars</p>
                </div>

                <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
                  {categoryBreakdownList.length === 0 ? (
                    <div className="text-center text-xs text-[#4a5568] py-16">No expense categories to evaluate</div>
                  ) : (
                    categoryBreakdownList.map(([catKey, sum]) => {
                      const cat = getCategoryDetails(catKey);
                      const pct = kpiData.totalExpenses > 0 ? Math.round((sum / kpiData.totalExpenses) * 100) : 0;
                      const txCount = filteredTransactions.filter((t) => t.cat === catKey && t.type === 'expense').length;
                      return (
                        <div key={catKey} className="group cursor-default">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="flex items-center gap-1.5 font-semibold text-[#f0f4ff]">
                              <span className="text-sm bg-[rgba(255,255,255,0.02)] p-1 rounded-md">{cat.icon}</span>
                              <span>{cat.label}</span>
                              <span className="text-[10px] text-[#4a5568] font-normal">({txCount} rows)</span>
                            </span>
                            <span className="text-right">
                              <span className="font-heading font-extrabold text-[#f0f4ff]">{formatCurrency(sum)} TND</span>
                              <span className="text-[10px] text-[#8895aa] ml-2">({pct}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-[#1a2130] h-[4px] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: cat.color }}></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Payment Methods Breakdown details card */}
              <div className="bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 space-y-4">
                <div>
                  <h4 className="font-['Syne'] text-xs font-bold text-[#f0f4ff] uppercase tracking-wider">Payment Channels Ratio</h4>
                  <p className="text-[10px] text-[#8895aa] mt-0.5">Aggregate outflows per chosen method</p>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {paymentMethodsGrid.map((method) => {
                    const totalSum = kpiData.totalExpenses || 1;
                    const pct = Math.round((method.sum / totalSum) * 100);
                    let emoji = '💳';
                    let col = '#4f8ef7';
                    if (method.name === 'Cash') { emoji = '💵'; col = '#22c55e'; }
                    else if (method.name === 'Bank Transfer') { emoji = '🏦'; col = '#a78bfa'; }
                    else if (method.name === 'Mobile Payment') { emoji = '📱'; col = '#fb923c'; }

                    return (
                      <div key={method.name} className="bg-[#1a2130] border border-[rgba(255,255,255,0.03)] rounded-xl p-3.5 hover:bg-[#202a3a]/80 transition-all flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-lg bg-[#131922] w-7 h-7 rounded-lg flex items-center justify-center">{emoji}</span>
                          <span className="text-[10px] font-bold text-[#8895aa]">{pct}%</span>
                        </div>
                        <div className="mt-3">
                          <div className="text-[10px] font-bold text-[#8895aa]">{method.name}</div>
                          <div className="font-heading text-sm font-black text-[#f0f4ff] mt-0.5">{formatCurrency(method.sum)} TND</div>
                          <div className="text-[9px] text-[#4a5568] mt-1">{method.count} payouts made</div>
                          
                          {/* Progress line */}
                          <div className="w-full bg-[#080b12] h-[3px] rounded-full mt-2.5 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: col }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Transaction list table section */}
          <div id="sec-tx" className="space-y-3 pt-2">
            <h3 className="text-[10px] font-bold tracking-widest text-[#8895aa] uppercase">
              📋 Complete Transaction Ledger
            </h3>
            <TransactionTable transactions={transactions} onOpenAddTx={() => setIsAddTxOpen(true)} />
          </div>

          {/* Developer / debug settings action drawer */}
          <div className="pt-6 border-t border-[rgba(255,255,255,0.06)] flex flex-wrap gap-4 justify-between items-center text-[#4a5568] text-[11px] font-medium">
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <span className="text-[#8895aa] font-semibold">AI Finance Tracker</span>
              <div className="h-4 w-[1px] bg-[rgba(255,255,255,0.1)] hidden sm:block"></div>
              {/* Smart Categorization Settings Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={smartCategorization}
                  onChange={smartCategorization ? () => handleToggleSmartCat() : handleToggleSmartCat}
                  className="rounded bg-[#1a2130] border-[rgba(255,255,255,0.1)] text-[#4f8ef7] focus:ring-0 cursor-pointer h-3.5 w-3.5"
                />
                <span className={smartCategorization ? 'text-[#4f8ef7] font-semibold transition-all' : 'text-[#8895aa] transition-all'}>
                  Smart Categorization {smartCategorization ? 'Enabled' : 'Disabled'}
                </span>
              </label>
              <div className="h-4 w-[1px] bg-[rgba(255,255,255,0.1)] hidden sm:block"></div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${syncState === 'loading' ? 'bg-[#3b82f6] animate-pulse' : syncState === 'error' ? 'bg-red-500' : 'bg-[#22c55e]'} shadow-sm`}></span>
                <span className="text-[10px] text-[#8895aa]">
                  {syncState === 'loading' ? 'Syncing n8n...' : syncState === 'error' ? `Offline: ${syncInfo}` : `Connected (${syncInfo} Sheet rows)`}
                </span>
              </div>
            </div>
            
            <button 
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/10 hover:border-red-500/20 text-red-500/80 hover:text-red-500 bg-red-500/5 transition-all cursor-pointer font-bold"
            >
              <Trash2 size={12} />
              Purge Database & Reset Defaults
            </button>
          </div>

        </div>{/* /content */}
      </main>

      {/* Dynamic MODALS components insertion */}
      <BalanceModal 
        isOpen={isUpdateBalanceOpen}
        onClose={() => setIsUpdateBalanceOpen(false)}
        balances={balances}
        onSave={handleSaveBalances}
      />

      <TransactionModal 
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onSubmit={handleAddTransaction}
      />

      {/* Persistent Floating Quick Action Button area */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2.5 z-40">
        <button
          onClick={() => setIsAddTxOpen(true)}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4f8ef7] to-[#7c6af0] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(79,142,247,0.4)] hover:shadow-[0_4px_24px_rgba(79,142,247,0.6)] hover:scale-110 transition-all duration-200 cursor-pointer"
          title="Add new transaction"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

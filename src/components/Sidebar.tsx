import { useState } from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  TrendingUp, 
  Tag, 
  History, 
  PlusCircle, 
  Coins, 
  ChevronLeft, 
  ChevronRight,
  Send,
  Sliders,
  Database
} from 'lucide-react';

interface SidebarProps {
  txCount: number;
  onOpenAddTx: () => void;
  onOpenUpdateBalance: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function Sidebar({ 
  txCount, 
  onOpenAddTx, 
  onOpenUpdateBalance, 
  activeSection, 
  setActiveSection 
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts', icon: CreditCard },
    { id: 'charts', label: 'Analytics', icon: TrendingUp },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'tx', label: 'Transactions', icon: History, count: txCount },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(`sec-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside 
      id="sidebar" 
      className={`sidebar border-r border-[rgba(255,255,255,0.06)] bg-[#0d1117] flex flex-col sticky top-0 h-screen overflow-hidden transition-all duration-300 z-20 ${
        collapsed ? 'w-[70px]' : 'w-[240px]'
      }`}
    >
      {/* Brand logo header */}
      <div className="p-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-gradient-to-br from-[#4f8ef7] to-[#7c6af0] flex items-center justify-center font-black text-white shadow-[0_0_18px_rgba(79,142,247,0.4)]">
            F
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-['Syne'] text-lg font-extrabold tracking-tight text-[#f0f4ff]">Floww</span>
              <span className="text-[10px] text-[#8895aa] uppercase tracking-wider font-semibold">Finance Intel</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="w-6 h-6 rounded-md bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center cursor-pointer text-[#8895aa] hover:bg-[rgba(255,255,255,0.07)] hover:text-white transition-all"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={13} strokeWidth={2.5} /> : <ChevronLeft size={13} strokeWidth={2.5} />}
        </button>
      </div>

      {/* Navigation section */}
      <nav className="p-2 flex-1 overflow-y-auto space-y-1">
        <div className="text-[9px] font-bold text-[#4a5568] tracking-widest uppercase px-3 py-2">
          {!collapsed ? 'Overview' : '•••'}
        </div>
        
        {navItems.slice(0, 3).map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm cursor-pointer transition-all duration-150 ${
                isActive 
                  ? 'bg-[rgba(79,142,247,0.12)] text-[#4f8ef7] font-medium' 
                  : 'text-[#8895aa] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#f0f4ff]'
              }`}
            >
              <Icon size={16} className={`flex-shrink-0 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        <div className="text-[9px] font-bold text-[#4a5568] tracking-widest uppercase px-3 py-2 pt-4">
          {!collapsed ? 'Finance' : '•••'}
        </div>

        {navItems.slice(3).map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm cursor-pointer transition-all duration-150 ${
                isActive 
                  ? 'bg-[rgba(79,142,247,0.12)] text-[#4f8ef7] font-medium' 
                  : 'text-[#8895aa] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#f0f4ff]'
              }`}
            >
              <Icon size={16} className={`flex-shrink-0 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.count !== undefined && (
                <span className="ml-auto bg-[#4f8ef7] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        <div className="text-[9px] font-bold text-[#4a5568] tracking-widest uppercase px-3 py-2 pt-4">
          {!collapsed ? 'Quick Actions' : '•••'}
        </div>

        <button
          onClick={onOpenAddTx}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm cursor-pointer text-[#8895aa] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#f0f4ff] transition-all"
        >
          <PlusCircle size={16} className="text-[#2dd4bf] opacity-80" />
          {!collapsed && <span>Add Transaction</span>}
        </button>

        <button
          onClick={onOpenUpdateBalance}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm cursor-pointer text-[#8895aa] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#f0f4ff] transition-all"
        >
          <Coins size={16} className="text-[#fb923c] opacity-80" />
          {!collapsed && <span>Update Balance</span>}
        </button>
      </nav>

      {/* Integration Status Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-[rgba(255,255,255,0.06)] space-y-2">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e] animate-pulse"></span>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#f0f4ff] font-medium leading-none flex items-center gap-1">Telegram <Send size={8} /></span>
              <span className="text-[8px] text-[#8895aa]">Bot Active</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4f8ef7] shadow-[0_0_6px_#4f8ef7] animate-pulse"></span>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#f0f4ff] font-medium leading-none flex items-center gap-1">n8n Engine <Sliders size={8} /></span>
              <span className="text-[8px] text-[#22c55e] font-semibold">Workflow Running</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

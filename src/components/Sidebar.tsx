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
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ 
  txCount, 
  onOpenAddTx, 
  onOpenUpdateBalance, 
  activeSection, 
  setActiveSection,
  isOpen,
  onClose
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
    onClose();
    const element = document.getElementById(`sec-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside 
        id="sidebar" 
        className={`sidebar border-r border-[rgba(255,255,255,0.06)] bg-[#0d1117] flex flex-col fixed inset-y-0 left-0 z-50 transform md:sticky md:top-0 md:h-screen md:translate-x-0 overflow-hidden transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${
          collapsed ? 'md:w-[70px]' : 'md:w-[240px]'
        } w-[240px]`}
      >
        {/* Brand logo header */}
        <div className="p-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-gradient-to-br from-[#4f8ef7] to-[#7c6af0] flex items-center justify-center font-black text-white shadow-[0_0_18px_rgba(79,142,247,0.4)]">
              F
            </div>
            {(!collapsed || isOpen) && (
              <div className="flex flex-col">
                <span className="font-['Syne'] text-lg font-extrabold tracking-tight text-[#f0f4ff]">Floww</span>
                <span className="text-[10px] text-[#8895aa] uppercase tracking-wider font-semibold">Finance Intel</span>
              </div>
            )}
          </div>
          
          {/* Collapse toggle (only visible on md+ screen widths) */}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="hidden md:flex w-6 h-6 rounded-md bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] items-center justify-center cursor-pointer text-[#8895aa] hover:bg-[rgba(255,255,255,0.07)] hover:text-white transition-all"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={13} strokeWidth={2.5} /> : <ChevronLeft size={13} strokeWidth={2.5} />}
          </button>

          {/* Close button for mobile menu */}
          <button 
            onClick={onClose} 
            className="flex md:hidden w-6 h-6 rounded-md bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] items-center justify-center cursor-pointer text-[#8895aa] hover:bg-[rgba(255,255,255,0.07)] hover:text-white transition-all"
            title="Close sidebar"
          >
            <ChevronLeft size={13} strokeWidth={2.5} />
          </button>
        </div>

        {/* Navigation section */}
        <nav className="p-2 flex-1 overflow-y-auto space-y-1">
          <div className="text-[9px] font-bold text-[#4a5568] tracking-widest uppercase px-3 py-2">
            {(!collapsed || isOpen) ? 'Overview' : '•••'}
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
                {(!collapsed || isOpen) && <span>{item.label}</span>}
              </button>
            );
          })}

          <div className="text-[9px] font-bold text-[#4a5568] tracking-widest uppercase px-3 py-2 pt-4">
            {(!collapsed || isOpen) ? 'Finance' : '•••'}
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
                {(!collapsed || isOpen) && <span>{item.label}</span>}
                {(!collapsed || isOpen) && item.count !== undefined && (
                  <span className="ml-auto bg-[#4f8ef7] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          <div className="text-[9px] font-bold text-[#4a5568] tracking-widest uppercase px-3 py-2 pt-4">
            {(!collapsed || isOpen) ? 'Quick Actions' : '•••'}
          </div>

          <button
            onClick={() => {
              onOpenAddTx();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm cursor-pointer text-[#8895aa] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#f0f4ff] transition-all"
          >
            <PlusCircle size={16} className="text-[#2dd4bf] opacity-80" />
            {(!collapsed || isOpen) && <span>Add Transaction</span>}
          </button>

          <button
            onClick={() => {
              onOpenUpdateBalance();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm cursor-pointer text-[#8895aa] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#f0f4ff] transition-all"
          >
            <Coins size={16} className="text-[#fb923c] opacity-80" />
            {(!collapsed || isOpen) && <span>Update Balance</span>}
          </button>
        </nav>
      </aside>
    </>
  );
}

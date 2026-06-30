import { useEffect, useState, FormEvent } from 'react';
import { CreditCard, Landmark, DollarSign } from 'lucide-react';
import { AccountBalances } from '../types';

interface BalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  balances: AccountBalances;
  onSave: (newBalances: AccountBalances) => void;
}

export default function BalanceModal({
  isOpen,
  onClose,
  balances,
  onSave,
}: BalanceModalProps) {
  const [cash, setCash] = useState<string>('');
  const [bank, setBank] = useState<string>('');
  const [card, setCard] = useState<string>('');

  // Synchronize inputs with current global values when the modal opens
  useEffect(() => {
    if (isOpen) {
      setCash(balances.cash.toString());
      setBank(balances.bank.toString());
      setCard(balances.card.toString());
    }
  }, [isOpen, balances]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      cash: parseFloat(cash) || 0,
      bank: parseFloat(bank) || 0,
      card: parseFloat(card) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#000]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Click overlay to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 w-full max-w-[420px] shadow-[0_12px_36px_rgba(0,0,0,0.5)] relative z-10 transform transition-transform duration-300">
        <h3 className="font-['Syne'] text-lg font-extrabold text-[#f0f4ff] mb-1">
          Update Starting Balances
        </h3>
        <p className="text-xs text-[#8895aa] mb-5">
          Set base figures for your financial assets. Transactions in your current timeframe will dynamically adjust these values.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cash input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-wider text-[#8895aa] uppercase flex items-center gap-1.5">
              <DollarSign size={11} className="text-[#22c55e]" />
              Cash Wallet Starting Base (TND)
            </label>
            <input
              type="number"
              step="0.001"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              placeholder="0.000"
              className="w-full bg-[#1a2130] border border-[rgba(255,255,255,0.06)] rounded-lg px-3.5 py-2.5 text-sm text-[#f0f4ff] outline-none focus:border-[#4f8ef7] transition-all font-semibold"
            />
          </div>

          {/* Bank input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-wider text-[#8895aa] uppercase flex items-center gap-1.5">
              <Landmark size={11} className="text-[#a78bfa]" />
              Bank Account Starting Base (TND)
            </label>
            <input
              type="number"
              step="0.001"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              placeholder="0.000"
              className="w-full bg-[#1a2130] border border-[rgba(255,255,255,0.06)] rounded-lg px-3.5 py-2.5 text-sm text-[#f0f4ff] outline-none focus:border-[#4f8ef7] transition-all font-semibold"
            />
          </div>

          {/* Credit Card input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-wider text-[#8895aa] uppercase flex items-center gap-1.5">
              <CreditCard size={11} className="text-[#f472b6]" />
              Credit Card Starting Base (TND)
            </label>
            <input
              type="number"
              step="0.001"
              value={card}
              onChange={(e) => setCard(e.target.value)}
              placeholder="0.000"
              className="w-full bg-[#1a2130] border border-[rgba(255,255,255,0.06)] rounded-lg px-3.5 py-2.5 text-sm text-[#f0f4ff] outline-none focus:border-[#4f8ef7] transition-all font-semibold"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#1a2130] text-xs font-semibold text-[#8895aa] hover:bg-[#202a3a] hover:text-[#f0f4ff] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#4f8ef7] to-[#7c6af0] text-xs font-bold text-white shadow-[0_0_16px_rgba(79,142,247,0.3)] hover:shadow-[0_0_24px_rgba(79,142,247,0.45)] transition-all cursor-pointer"
            >
              💾 Save Balances
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

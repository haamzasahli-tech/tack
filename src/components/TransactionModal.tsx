import { useState, useEffect, FormEvent } from 'react';
import { CATS, INCOME_CATS, TRANSFER_CATS } from '../data';
import { Transaction } from '../types';
import { getCategoryDetails } from '../utils';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tx: Omit<Transaction, 'id'>) => void;
}

type TxType = 'expense' | 'income' | 'transfer';

export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
}: TransactionModalProps) {
  const [type, setType] = useState<TxType>('expense');
  const [date, setDate] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [category, setCategory] = useState<string>('other');
  const [pm, setPm] = useState<string>('Cash');
  const [notes, setNotes] = useState<string>('');
  const [fromAccount, setFromAccount] = useState<string>('Bank');
  const [toAccount, setToAccount] = useState<string>('Cash');

  // Reset/Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().slice(0, 10);
      setDate(today);
      setAmount('');
      setDesc('');
      setNotes('');
      setType('expense');
      setCategory('food');
      setPm('Cash');
      setFromAccount('Bank');
      setToAccount('Cash');
    }
  }, [isOpen]);

  // Handle dynamic changes in categories depending on selected transaction type
  useEffect(() => {
    if (type === 'income') {
      setCategory('salary');
    } else if (type === 'transfer') {
      setCategory('transfer');
    } else {
      setCategory('food');
    }
  }, [type]);

  if (!isOpen) return null;

  const getFilteredCategories = () => {
    if (type === 'income') {
      return Object.keys(CATS).filter(k => INCOME_CATS.has(k) || k === 'other');
    }
    if (type === 'transfer') {
      return Object.keys(CATS).filter(k => TRANSFER_CATS.has(k));
    }
    // Expense categories
    return Object.keys(CATS).filter(k => !INCOME_CATS.has(k) && !TRANSFER_CATS.has(k));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    if (!desc.trim()) {
      alert('Please enter a short description.');
      return;
    }

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${mins}`;

    const newTx: Omit<Transaction, 'id'> = {
      date,
      time,
      desc: desc.trim(),
      notes: notes.trim(),
      pm,
      account: type === 'transfer' ? fromAccount : (pm === 'Cash' ? 'Cash' : pm === 'Bank Transfer' ? 'Bank' : 'Card'),
      type,
      cat: category,
      amount: parsedAmount,
      fromAccount: type === 'transfer' ? fromAccount : undefined,
      toAccount: type === 'transfer' ? toAccount : undefined,
    };

    onSubmit(newTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#000]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Click overlay to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="bg-[#131922] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 w-full max-w-[480px] shadow-[0_12px_36px_rgba(0,0,0,0.5)] relative z-10 my-8">
        <h3 className="font-['Syne'] text-lg font-extrabold text-[#f0f4ff] mb-1">
          New Transaction
        </h3>
        <p className="text-xs text-[#8895aa] mb-4">
          Add an expense, income, or internal account transfer to sync with your sheets.
        </p>

        {/* Dynamic transaction type switcher */}
        <div className="flex gap-2 p-1 bg-[#1a2130] rounded-xl mb-4 border border-[rgba(255,255,255,0.03)]">
          {(['expense', 'income', 'transfer'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-150 cursor-pointer ${
                type === t
                  ? t === 'expense'
                    ? 'bg-[rgba(239,68,68,0.12)] text-[#ef4444] border border-[rgba(239,68,68,0.25)]'
                    : t === 'income'
                    ? 'bg-[rgba(34,197,94,0.12)] text-[#22c55e] border border-[rgba(34,197,94,0.25)]'
                    : 'bg-[rgba(79,142,247,0.12)] text-[#4f8ef7] border border-[rgba(79,142,247,0.25)]'
                  : 'text-[#8895aa] hover:text-[#f0f4ff]'
              }`}
            >
              {t === 'transfer' ? '⇄ Transfer' : t === 'income' ? '+ Income' : '− Expense'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Date input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-wider text-[#8895aa] uppercase">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#1a2130] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-xs text-[#f0f4ff] outline-none focus:border-[#4f8ef7] transition-all font-semibold"
              />
            </div>

            {/* Amount input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-wider text-[#8895aa] uppercase">
                Amount (TND)
              </label>
              <input
                type="number"
                step="0.001"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.000"
                className="w-full bg-[#1a2130] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-xs text-[#f0f4ff] outline-none focus:border-[#4f8ef7] transition-all font-semibold"
              />
            </div>
          </div>

          {/* Description input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-wider text-[#8895aa] uppercase">
              Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Monoprix groceries, Upwork freelance design, Rent wire..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-[#1a2130] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-xs text-[#f0f4ff] outline-none focus:border-[#4f8ef7] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-wider text-[#8895aa] uppercase">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#1a2130] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-xs text-[#f0f4ff] outline-none focus:border-[#4f8ef7] transition-all"
              >
                {getFilteredCategories().map((catKey) => {
                  const cat = getCategoryDetails(catKey);
                  return (
                    <option key={catKey} value={catKey}>
                      {cat.icon} {cat.label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Payment Method selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-wider text-[#8895aa] uppercase">
                Payment Method
              </label>
              <select
                value={pm}
                onChange={(e) => setPm(e.target.value)}
                className="w-full bg-[#1a2130] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-xs text-[#f0f4ff] outline-none focus:border-[#4f8ef7] transition-all"
              >
                <option value="Cash">💵 Cash</option>
                <option value="Card">💳 Card</option>
                <option value="Bank Transfer">🏦 Bank Transfer</option>
                <option value="Mobile Payment">📱 Mobile Payment</option>
              </select>
            </div>
          </div>

          {/* Transfer fields (Rendered only for Transfer transactions) */}
          {type === 'transfer' && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#1a2130]/60 border border-[rgba(255,255,255,0.04)]">
              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-wider text-[#8895aa] uppercase">
                  From Account
                </label>
                <select
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="w-full bg-[#1a2130] border border-[rgba(255,255,255,0.06)] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4ff] outline-none focus:border-[#4f8ef7] transition-all"
                >
                  <option value="Cash">💵 Cash</option>
                  <option value="Bank">🏦 Bank</option>
                  <option value="Card">💳 Card</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-wider text-[#8895aa] uppercase">
                  To Account
                </label>
                <select
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  className="w-full bg-[#1a2130] border border-[rgba(255,255,255,0.06)] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f4ff] outline-none focus:border-[#4f8ef7] transition-all"
                >
                  <option value="Cash">💵 Cash</option>
                  <option value="Bank">🏦 Bank</option>
                  <option value="Card">💳 Card</option>
                </select>
              </div>
            </div>
          )}

          {/* Notes input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-wider text-[#8895aa] uppercase">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="Any additional remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#1a2130] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-xs text-[#f0f4ff] outline-none"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-[#1a2130] text-xs font-semibold text-[#8895aa] hover:bg-[#202a3a] hover:text-[#f0f4ff] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#4f8ef7] to-[#7c6af0] text-xs font-bold text-white shadow-md hover:shadow-[0_0_18px_rgba(79,142,247,0.3)] transition-all cursor-pointer"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { Vehicle, TransactionType, ExpenseCategory, Transaction } from '../types';
import { Plus, DollarSign, Wrench, Calendar, Clock, AlertTriangle, FileText, ChevronRight } from 'lucide-react';

interface QuickEntryProps {
  vehicles: Vehicle[];
  transactions: Transaction[];
  onAddTransaction: (data: any) => void;
}

export const QuickEntry: React.FC<QuickEntryProps> = ({ vehicles, transactions, onAddTransaction }) => {
  const [activeTab, setActiveTab] = useState<'collection' | 'expense'>('collection');
  
  // Form State
  const [vehicleId, setVehicleId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.REPAIR);
  
  // Date & Time State (Default to Now)
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(new Date().toTimeString().slice(0, 5));

  // Check if collection exists for this vehicle on this date
  const existingCollection = useMemo(() => {
    if (activeTab !== 'collection' || !vehicleId || !date) return null;
    
    return transactions.find(t => 
      t.vehicleId === vehicleId && 
      t.type === TransactionType.INCOME && 
      t.date.split('T')[0] === date
    );
  }, [vehicleId, date, activeTab, transactions]);

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setVehicleId(selectedId);
    
    // Auto-fill amount based on daily target if in collection mode
    if (activeTab === 'collection') {
      const vehicle = vehicles.find(v => v.id === selectedId);
      if (vehicle) {
        setAmount(vehicle.targetDaily.toString());
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !amount) return;
    if (existingCollection) return;

    const fullDateTime = new Date(`${date}T${time}`).toISOString();

    onAddTransaction({
      vehicleId,
      amount: parseFloat(amount),
      type: activeTab === 'collection' ? TransactionType.INCOME : TransactionType.EXPENSE,
      notes,
      category: activeTab === 'expense' ? category : undefined,
      date: fullDateTime
    });

    setAmount('');
    setNotes('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col h-full">
      {/* Header / Tabs */}
      <div className="p-1.5 bg-slate-50 border-b border-slate-100 m-4 mb-0 rounded-xl flex relative">
        <button
          onClick={() => { setActiveTab('collection'); setAmount(''); }}
          className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'collection' 
              ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <DollarSign size={16} className="mr-2" strokeWidth={2.5} />
          Income
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'expense' 
              ? 'bg-white text-rose-600 shadow-sm ring-1 ring-slate-200' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Wrench size={16} className="mr-2" strokeWidth={2.5} />
          Expense
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 pt-4 flex-1 flex flex-col space-y-5">
        
        {/* Date Time Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</label>
            <div className="relative group">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 rounded-lg border border-slate-200 pl-9 pr-2 py-2.5 text-slate-700 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                required
              />
              <Calendar size={16} className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</label>
            <div className="relative group">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 rounded-lg border border-slate-200 pl-9 pr-2 py-2.5 text-slate-700 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                required
              />
              <Clock size={16} className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        {existingCollection && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3 animate-fade-in">
            <div className="bg-amber-100 p-1.5 rounded-full h-fit">
              <AlertTriangle className="text-amber-600" size={16} />
            </div>
            <div className="text-xs text-amber-900">
              <p className="font-bold mb-0.5">Payment Recorded</p>
              <p className="leading-relaxed opacity-90">Rent for {new Date(existingCollection.date).toLocaleDateString()} was already collected.</p>
            </div>
          </div>
        )}

        {/* Vehicle Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Vehicle</label>
          <div className="relative">
            <select
              value={vehicleId}
              onChange={handleVehicleChange}
              className="w-full appearance-none bg-slate-50 rounded-lg border border-slate-200 px-4 py-3 text-slate-900 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              required
            >
              <option value="" disabled>Choose a vehicle...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} • {v.plateNumber}
                </option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-3.5 text-slate-400 rotate-90 pointer-events-none" size={16} />
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</label>
          <div className="relative group">
            <span className="absolute left-4 top-3 text-slate-400 font-semibold group-focus-within:text-indigo-500 transition-colors">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-50 rounded-lg border border-slate-200 pl-8 pr-4 py-2.5 text-slate-900 font-bold text-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              required
              min="0"
              disabled={!!existingCollection}
            />
          </div>
        </div>

        {/* Category (Expense Only) */}
        {activeTab === 'expense' && (
          <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expense Type</label>
            <div className="relative">
               <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full appearance-none bg-slate-50 rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              >
                {Object.values(ExpenseCategory).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-3 top-3.5 text-slate-400 rotate-90 pointer-events-none" size={16} />
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes (Optional)</label>
          <div className="relative group">
            <FileText size={16} className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add details..."
              className="w-full bg-slate-50 rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 text-slate-700 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all h-20 resize-none"
              disabled={!!existingCollection}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!!existingCollection}
          className={`mt-auto w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center transition-all duration-200 ${
            activeTab === 'collection' 
              ? (existingCollection ? 'bg-slate-300 shadow-none cursor-not-allowed transform-none' : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500') 
              : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500'
          }`}
        >
          <Plus size={18} className="mr-2" strokeWidth={3} />
          {activeTab === 'collection' ? 'Confirm Collection' : 'Log Expense'}
        </button>
      </form>
    </div>
  );
};
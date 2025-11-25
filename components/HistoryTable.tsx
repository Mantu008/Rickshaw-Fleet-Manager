import React from 'react';
import { Transaction, TransactionType, Vehicle } from '../types';
import { ArrowUpRight, ArrowDownLeft, Search, Filter } from 'lucide-react';

interface HistoryTableProps {
  transactions: Transaction[];
  vehicles: Vehicle[];
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ transactions, vehicles }) => {
  const getVehicleName = (id: string) => vehicles.find(v => v.id === id)?.name || 'Unknown Vehicle';

  // Sort by date desc
  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Header Toolbar */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Transaction History</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage and view all fleet financial records</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none w-48"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-sm font-medium border border-slate-200 transition-colors">
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs tracking-wider sticky top-0">
            <tr>
              <th className="px-6 py-4 border-b border-slate-200">Date & Time</th>
              <th className="px-6 py-4 border-b border-slate-200">Vehicle</th>
              <th className="px-6 py-4 border-b border-slate-200">Type</th>
              <th className="px-6 py-4 border-b border-slate-200">Notes</th>
              <th className="px-6 py-4 border-b border-slate-200 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {sorted.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800">{new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="text-xs text-slate-400 font-medium">{new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                      {getVehicleName(t.vehicleId).charAt(0)}
                    </div>
                    {getVehicleName(t.vehicleId)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                    t.type === TransactionType.INCOME 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                      : 'bg-rose-50 text-rose-700 border-rose-100'
                  }`}>
                    {t.type === TransactionType.INCOME ? (
                      <ArrowUpRight size={12} className="mr-1" strokeWidth={3} />
                    ) : (
                      <ArrowDownLeft size={12} className="mr-1" strokeWidth={3} />
                    )}
                    {t.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="truncate max-w-xs text-slate-500">{t.notes || <span className="text-slate-300 italic">No notes</span>}</p>
                </td>
                <td className={`px-6 py-4 text-right font-bold text-base ${
                   t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {t.type === TransactionType.INCOME ? '+' : '-'}₹{t.amount.toLocaleString()}
                </td>
              </tr>
            ))}
            
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Search className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-slate-900 font-semibold text-lg mb-1">No transactions found</h3>
                    <p className="text-slate-500">Get started by recording your first collection or expense using the Quick Entry panel.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  History as HistoryIcon, 
  Truck, 
  Settings, 
  Wallet, 
  TrendingUp, 
  AlertCircle, 
  Sparkles,
  Menu,
  X,
  Pencil,
  Save,
  LogOut,
  Bell,
  ChevronRight,
  Wrench
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { MOCK_VEHICLES, MOCK_TRANSACTIONS } from './constants';
import { Transaction, Vehicle, TransactionType } from './types';
import { StatsCard } from './components/StatsCard';
import { QuickEntry } from './components/QuickEntry';
import { HistoryTable } from './components/HistoryTable';
import { generateFleetInsights } from './services/geminiService';

enum Tab {
  DASHBOARD = 'dashboard',
  HISTORY = 'history',
  VEHICLES = 'vehicles'
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Derived State: Stats
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    const todayIncome = transactions
      .filter(t => t.date.split('T')[0] === todayStr && t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalRevenue = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      todayIncome,
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense
    };
  }, [transactions]);

  // Derived State: Charts Data
  const chartData = useMemo(() => {
    const data: Record<string, { date: string, income: number, expense: number }> = {};
    
    transactions.forEach(t => {
      const dateKey = t.date.split('T')[0];
      
      if (!data[dateKey]) {
        data[dateKey] = { date: dateKey, income: 0, expense: 0 };
      }
      if (t.type === TransactionType.INCOME) {
        data[dateKey].income += t.amount;
      } else {
        data[dateKey].expense += t.amount;
      }
    });

    return Object.values(data)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);
  }, [transactions]);

  const handleAddTransaction = (data: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...data,
      id: Math.random().toString(36).substr(2, 9)
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleGenerateAiInsight = async () => {
    setIsAiLoading(true);
    setAiInsight(null);
    try {
      const result = await generateFleetInsights(transactions, vehicles);
      setAiInsight(result);
    } catch (e) {
      console.error(e);
      setAiInsight("Failed to generate insights.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleUpdateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    
    setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? editingVehicle : v));
    setEditingVehicle(null);
  };

  const NavItem = ({ tab, icon: Icon, label }: { tab: Tab, icon: any, label: string }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
        activeTab === tab 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      <Icon size={20} className={activeTab === tab ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
      <span className="font-medium tracking-wide">{label}</span>
      {activeTab === tab && <ChevronRight size={16} className="ml-auto opacity-70" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-slate-950 text-white transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-0 left-0 w-full h-64 bg-indigo-600/10 blur-[60px] pointer-events-none"></div>

          <div className="p-8 border-b border-slate-800/50 relative z-10">
            <h1 className="text-2xl font-bold flex items-center space-x-3">
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-indigo-900/50">
                <Truck size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="tracking-tight">Fleet<span className="text-indigo-400">Mgr</span></span>
            </h1>
            <p className="text-slate-500 text-xs mt-3 font-medium uppercase tracking-widest pl-1">Owner Dashboard</p>
          </div>

          <nav className="flex-1 p-6 space-y-2 relative z-10">
            <NavItem tab={Tab.DASHBOARD} icon={LayoutDashboard} label="Overview" />
            <NavItem tab={Tab.HISTORY} icon={HistoryIcon} label="Transactions" />
            <NavItem tab={Tab.VEHICLES} icon={Truck} label="Fleet Status" />
          </nav>

          <div className="p-6 border-t border-slate-800/50 relative z-10">
             <button className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors text-sm px-4 py-3 w-full rounded-lg hover:bg-slate-900">
               <Settings size={18} />
               <span>Configuration</span>
             </button>
             <button className="flex items-center space-x-3 text-rose-400 hover:text-rose-300 transition-colors text-sm px-4 py-3 w-full rounded-lg hover:bg-rose-950/30 mt-1">
               <LogOut size={18} />
               <span>Sign Out</span>
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen scroll-smooth">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
               <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                {activeTab === Tab.DASHBOARD && 'Dashboard Overview'}
                {activeTab === Tab.HISTORY && 'Financial History'}
                {activeTab === Tab.VEHICLES && 'Fleet Management'}
              </h2>
              <p className="text-sm text-slate-500 hidden sm:block">Welcome back, here's what's happening today.</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-slate-900">Admin User</p>
                <p className="text-xs text-slate-500 font-medium">Super Admin</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-md">
                <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-indigo-700 font-bold text-sm">
                  AD
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto space-y-8 pb-20">
          
          {/* Dashboard View */}
          {activeTab === Tab.DASHBOARD && (
            <>
              {/* Top Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                  title="Today's Collection" 
                  value={`₹${stats.todayIncome.toLocaleString()}`} 
                  icon={Wallet} 
                  trend="+12% vs yesterday" 
                  trendUp={true} 
                  color="green"
                />
                <StatsCard 
                  title="Total Revenue" 
                  value={`₹${stats.totalRevenue.toLocaleString()}`} 
                  icon={TrendingUp} 
                  color="blue"
                />
                <StatsCard 
                  title="Net Profit" 
                  value={`₹${stats.netProfit.toLocaleString()}`} 
                  icon={Sparkles} 
                  color="purple"
                />
                <StatsCard 
                  title="Maintenance Costs" 
                  value={`₹${stats.totalExpense.toLocaleString()}`} 
                  icon={AlertCircle} 
                  trend="+5% this month" 
                  trendUp={false} 
                  color="red"
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Chart Section */}
                <div className="xl:col-span-2 space-y-8">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-8">
                       <div>
                         <h3 className="text-lg font-bold text-slate-800">Revenue Trends</h3>
                         <p className="text-sm text-slate-500">Income analysis over the last 7 days</p>
                       </div>
                       <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20">
                         <option>Last 7 Days</option>
                         <option>Last 30 Days</option>
                       </select>
                    </div>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12, fill: '#64748b'}} 
                            tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, {weekday: 'short'})}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12, fill: '#64748b'}}
                            tickFormatter={(value) => `₹${value}`}
                          />
                          <Tooltip 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="income" 
                            stroke="#4f46e5" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorIncome)" 
                            activeDot={{ r: 6, fill: "#4f46e5", stroke: "white", strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* AI Insights Section */}
                  <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Sparkles size={120} />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md">
                            <Sparkles className="text-amber-400" size={24} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">Smart Fleet Insights</h3>
                            <p className="text-indigo-200 text-sm">AI-powered recommendations for your business</p>
                          </div>
                        </div>
                        <button 
                          onClick={handleGenerateAiInsight}
                          disabled={isAiLoading}
                          className="text-sm font-medium bg-white text-indigo-950 hover:bg-indigo-50 transition-colors px-4 py-2 rounded-lg shadow-sm disabled:opacity-70"
                        >
                          {isAiLoading ? 'Analyzing Fleet Data...' : 'Generate New Report'}
                        </button>
                      </div>
                      
                      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-md border border-white/10 min-h-[120px]">
                        {aiInsight ? (
                          <div className="text-base leading-relaxed text-indigo-50 whitespace-pre-line font-light">
                            {aiInsight}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-indigo-300 py-6">
                            <Sparkles className="mb-3 opacity-50" size={32} />
                            <p className="text-base">Tap 'Generate New Report' to analyze your profit margins and expenses.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Entry Sidebar */}
                <div className="xl:col-span-1 h-full flex flex-col gap-6">
                  <div className="sticky top-28 space-y-6">
                    <QuickEntry 
                      vehicles={vehicles} 
                      transactions={transactions}
                      onAddTransaction={handleAddTransaction} 
                    />
                    
                    {/* Mini Recent List for Context */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Activity</h4>
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Today</span>
                      </div>
                      
                      <div className="space-y-4">
                        {transactions.slice(0, 5).map(t => (
                          <div key={t.id} className="flex items-center justify-between text-sm group">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                t.type === 'Income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                              }`}>
                                {t.type === 'Income' ? <Wallet size={14} /> : <Wrench size={14} />}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-700 truncate w-28">{vehicles.find(v => v.id === t.vehicleId)?.name}</p>
                                <p className="text-xs text-slate-400">{new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                              </div>
                            </div>
                            <span className={`font-bold ${t.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {t.type === 'Income' ? '+' : '-'}₹{t.amount}
                            </span>
                          </div>
                        ))}
                        {transactions.length === 0 && (
                          <p className="text-center text-slate-400 text-sm py-4">No recent activity.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* History View */}
          {activeTab === Tab.HISTORY && (
            <HistoryTable transactions={transactions} vehicles={vehicles} />
          )}

          {/* Vehicles View */}
          {activeTab === Tab.VEHICLES && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {vehicles.map(vehicle => (
                <div key={vehicle.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="p-3.5 bg-indigo-50 rounded-xl text-indigo-600">
                      <Truck size={28} strokeWidth={1.5} />
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full border ${
                      vehicle.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      vehicle.status === 'Maintenance' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>

                  <div className="mb-2 relative z-10">
                    <h3 className="text-xl font-bold text-slate-800">{vehicle.name}</h3>
                    <p className="text-sm font-medium text-slate-400 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                      {vehicle.plateNumber}
                    </p>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-100 space-y-3 relative z-10">
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-slate-500 font-medium">Driver</span>
                      <span className="font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{vehicle.driverName}</span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-slate-500 font-medium">Daily Target</span>
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">₹{vehicle.targetDaily}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setEditingVehicle(vehicle)}
                    className="mt-4 w-full py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Pencil size={14} />
                    Edit Configuration
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Edit Vehicle</h3>
                <p className="text-xs text-slate-500 mt-0.5">Update fleet configuration</p>
              </div>
              <button 
                onClick={() => setEditingVehicle(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-2 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateVehicle} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle Name</label>
                <input 
                  type="text" 
                  value={editingVehicle.name}
                  onChange={(e) => setEditingVehicle({...editingVehicle, name: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  required 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver Name</label>
                <input 
                  type="text" 
                  value={editingVehicle.driverName}
                  onChange={(e) => setEditingVehicle({...editingVehicle, driverName: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  required 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Daily Rent Target (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-400 font-medium">₹</span>
                  <input 
                    type="number" 
                    value={editingVehicle.targetDaily}
                    onChange={(e) => setEditingVehicle({...editingVehicle, targetDaily: Number(e.target.value)})}
                    className="w-full rounded-lg border border-slate-200 pl-8 pr-4 py-2.5 text-slate-900 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    required 
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-2">
                <button 
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                >
                  <Save size={16} className="mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
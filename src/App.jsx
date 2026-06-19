import React, { useState, useEffect } from 'react';

import { 

  Plus, Trash2, Edit2, Sun, Moon, DollarSign, 

  Calendar, Tag, Search, AlertCircle, TrendingUp, 

  PieChart, CreditCard, Filter, Check, X, Sparkles,

  ArrowUpRight, RefreshCw, Layers

} from 'lucide-react';



const INITIAL_SUBSCRIPTIONS = [

  { id: '1', name: 'Netflix', cost: 15.99, category: 'Entertainment', renewalDate: '2026-07-02', billingCycle: 'Monthly' },

  { id: '2', name: 'Spotify', cost: 10.99, category: 'Music', renewalDate: '2026-06-25', billingCycle: 'Monthly' },

  { id: '3', name: 'Gold\'s Gym', cost: 49.99, category: 'Health', renewalDate: '2026-06-21', billingCycle: 'Monthly' },

  { id: '4', name: 'Adobe Creative Cloud', cost: 54.99, category: 'Utilities', renewalDate: '2026-07-12', billingCycle: 'Monthly' },

];



const CATEGORIES = ['Entertainment', 'Music', 'Health', 'Utilities', 'Software', 'Other'];



export default function App() {

  const [subscriptions, setSubscriptions] = useState(() => {

    const saved = localStorage.getItem('subs_data_v2');

    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;

  });

  

  const [darkMode, setDarkMode] = useState(true);

  const [search, setSearch] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('All');

  const [aiSuggestions, setAiSuggestions] = useState([]);

  const [backendStatus, setBackendStatus] = useState('Connected (Local Engine)');

  

  // Drag and Drop State

  const [draggedItemId, setDraggedItemId] = useState(null);



  // Form States

  const [isEditing, setIsEditing] = useState(null);

  const [formData, setFormData] = useState({

    name: '', cost: '', category: 'Entertainment', renewalDate: '', billingCycle: 'Monthly'

  });



  useEffect(() => {

    localStorage.setItem('subs_data_v2', JSON.stringify(subscriptions));

    generateAiSuggestions(subscriptions);

  }, [subscriptions]);



  // Calculations

  const totalMonthlyCost = subscriptions.reduce((sum, sub) => sum + Number(sub.cost), 0);



  // Category wise distributions for Visual Charts

  const categoryData = CATEGORIES.map(cat => {

    const cost = subscriptions.filter(s => s.category === cat).reduce((sum, s) => sum + Number(s.cost), 0);

    return { name: cat, value: cost };

  }).filter(item => item.value > 0);



  const maxCategoryValue = Math.max(...categoryData.map(d => d.value), 1);



  // Rule-Based AI Engine for Real Insights

  const generateAiSuggestions = (subs) => {

    const suggestions = [];

    const total = subs.reduce((sum, s) => sum + Number(s.cost), 0);

    

    if (total > 120) {

      suggestions.push({

        id: '1',

        type: 'warning',

        text: `Aapka monthly spend ($${total.toFixed(2)}) kaafi high hai. 'Entertainment' ya 'Software' stack ko optimize karne ka sochein.`

      });

    }



    const entertainmentCost = subs.filter(s => s.category === 'Entertainment').reduce((sum, s) => sum + Number(s.cost), 0);

    if (entertainmentCost > 30) {

      suggestions.push({

        id: '2',

        type: 'insight',

        text: "Multiple streaming apps active hain! Ek waqt par ek subscription pause karke paise bacha sakte hain."

      });

    }



    if (subs.length > 5) {

      suggestions.push({

        id: '3',

        type: 'tip',

        text: `${subs.length} active micro-transactions hain. Bundle offers ya annual passes check karein, isse up to 20% savings ho sakti hai.`

      });

    }



    if (suggestions.length === 0) {

      suggestions.push({

        id: 'healthy',

        type: 'success',

        text: "Kamaal hai! Aapka subscription framework tight aur under control lag raha hai. Keep it up!"

      });

    }



    setAiSuggestions(suggestions);

  };



  const filteredSubs = subscriptions.filter(sub => {

    const matchesSearch = sub.name.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || sub.category === selectedCategory;

    return matchesSearch && matchesCategory;

  });



  const isUpcomingAlert = (dateStr) => {

    const today = new Date();

    const renewal = new Date(dateStr);

    const diffTime = renewal - today;

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 0 && diffDays <= 7;

  };



  const upcomingAlertsCount = subscriptions.filter(sub => isUpcomingAlert(sub.renewalDate)).length;



  // Drag and Drop Logic

  const handleDragStart = (id) => {

    setDraggedItemId(id);

  };



  const handleDrop = (targetCategory) => {

    if (!draggedItemId) return;

    setSubscriptions(prev => prev.map(sub => 

      sub.id === draggedItemId ? { ...sub, category: targetCategory } : sub

    ));

    setDraggedItemId(null);

  };



  // CRUD Actions

  const handleSubmit = (e) => {

    e.preventDefault();

    if (!formData.name || !formData.cost || !formData.renewalDate) return;



    setBackendStatus('Syncing changes...');

    setTimeout(() => {

      if (isEditing) {

        setSubscriptions(subscriptions.map(sub => sub.id === isEditing ? { ...formData, id: isEditing, cost: Number(formData.cost) } : sub));

        setIsEditing(null);

      } else {

        const newSub = {

          ...formData,

          id: Date.now().toString(),

          cost: Number(formData.cost)

        };

        setSubscriptions([...subscriptions, newSub]);

      }

      setFormData({ name: '', cost: '', category: 'Entertainment', renewalDate: '', billingCycle: 'Monthly' });

      setBackendStatus('Connected (Local Engine)');

    }, 400);

  };



  const handleEdit = (sub) => {

    setIsEditing(sub.id);

    setFormData({ name: sub.name, cost: sub.cost, category: sub.category, renewalDate: sub.renewalDate, billingCycle: sub.billingCycle });

  };



  const handleDelete = (id) => {

    setBackendStatus('Removing entry...');

    setTimeout(() => {

      setSubscriptions(subscriptions.filter(sub => sub.id !== id));

      setBackendStatus('Connected (Local Engine)');

    }, 300);

  };



  return (

    <div className={`min-h-screen transition-all duration-500 selection:bg-indigo-500 selection:text-white ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>

      

      {/* Dynamic Header */}

      <header className={`border-b sticky top-0 z-50 backdrop-blur-xl transition-colors duration-500 ${darkMode ? 'border-slate-900 bg-slate-950/80' : 'border-slate-200 bg-white/80'}`}>

        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

          <div className="flex items-center gap-3">

            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl text-white shadow-xl shadow-indigo-500/20">

              <Layers size={22} className="animate-spin-slow" />

            </div>

            <div>

              <div className="flex items-center gap-2">

                {/* Heading Updated with Premium Short Name */}

                <h1 className="font-black text-2xl tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">SubSphere</h1>

                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">V2.0 PRO</span>

              </div>

              <p className="text-[11px] text-slate-500 flex items-center gap-1">

                <RefreshCw size={10} className="text-slate-400 animate-spin" /> {backendStatus}

              </p>

            </div>

          </div>

          

          <button 

            onClick={() => setDarkMode(!darkMode)}

            className={`p-3 rounded-2xl border transition-all duration-300 scale-100 active:scale-95 ${darkMode ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-100 shadow-sm'}`}

          >

            {darkMode ? <Sun size={18} /> : <Moon size={18} />}

          </button>

        </div>

      </header>



      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        

        {/* Renewal Alerts */}

        {upcomingAlertsCount > 0 && (

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-amber-500 transition-all duration-300">

            <AlertCircle size={20} className="flex-shrink-0 animate-bounce" />

            <p className="text-sm font-semibold">Attention Required: <strong>{upcomingAlertsCount}</strong> subscription(s) agle 7 dinon mein renew hone wale hain!</p>

          </div>

        )}



        {/* Analytical Dashboard Blocks */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          

          {/* Card 1: Advanced Metrics */}

          <div className={`p-6 rounded-3xl border transition-all duration-300 transform hover:-translate-y-1 ${darkMode ? 'bg-slate-900/40 border-slate-900 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'}`}>

            <div className="flex justify-between items-start mb-4">

              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aggregated Monthly Burn</span>

              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl"><DollarSign size={18} /></div>

            </div>

            <div className="flex items-baseline gap-2">

              <h2 className="text-4xl font-black tracking-tight">${totalMonthlyCost.toFixed(2)}</h2>

              <span className="text-xs text-slate-400 font-semibold">USD / mo</span>

            </div>

            <p className="text-xs text-emerald-400 mt-4 flex items-center gap-1 font-bold">

              <ArrowUpRight size={14} /> Total {subscriptions.length} active service footprints

            </p>

          </div>



          {/* Card 2: Native Distribution Tracker Chart */}

          <div className={`p-6 rounded-3xl border transition-all duration-300 transform hover:-translate-y-1 ${darkMode ? 'bg-slate-900/40 border-slate-900 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'}`}>

            <div className="flex justify-between items-start mb-3">

              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category Distribution</span>

              <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl"><PieChart size={18} /></div>

            </div>

            

            {/* Elegant Reactive SVG Micro Chart */}

            <div className="space-y-2 mt-2">

              {categoryData.slice(0, 3).map((item, i) => (

                <div key={i} className="space-y-1">

                  <div className="flex justify-between text-[11px] font-bold">

                    <span className="text-slate-400">{item.name}</span>

                    <span>${item.value.toFixed(1)}</span>

                  </div>

                  <div className={`w-full h-1.5 rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>

                    <div 

                      className="h-full bg-cyan-400 rounded-full transition-all duration-1000"

                      style={{ width: `${(item.value / maxCategoryValue) * 100}%` }}

                    />

                  </div>

                </div>

              ))}

              {categoryData.length === 0 && <p className="text-xs text-slate-500 italic py-4 text-center">No structural data available</p>}

            </div>

          </div>



          {/* Card 3: Spending Trend Vectors */}

          <div className={`p-6 rounded-3xl border transition-all duration-300 transform hover:-translate-y-1 ${darkMode ? 'bg-slate-900/40 border-slate-900 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'}`}>

            <div className="flex justify-between items-start mb-2">

              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Velocity & Trend Vectors</span>

              <div className="p-2 bg-violet-500/10 text-violet-400 rounded-xl"><TrendingUp size={18} /></div>

            </div>

            <div className="h-12 w-full mt-2">

              <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">

                <path 

                  d="M0,28 Q20,18 40,22 T80,8 T100,2" 

                  fill="none" 

                  stroke="url(#indigoLinear)" 

                  strokeWidth="3"

                  strokeLinecap="round"

                />

                <defs>

                  <linearGradient id="indigoLinear" x1="0%" y1="0%" x2="100%" y2="0%">

                    <stop offset="0%" stopColor="#6366f1" />

                    <stop offset="100%" stopColor="#22d3ee" />

                  </linearGradient>

                </defs>

              </svg>

            </div>

            <p className="text-[11px] text-slate-400 mt-2 font-medium">Predictive projection matrix for Q3-Q4</p>

          </div>

        </div>



        {/* AI Recommendations Module */}

        <div className={`p-5 rounded-3xl border transition-all duration-300 ${darkMode ? 'bg-gradient-to-r from-slate-900 to-indigo-950/20 border-slate-900' : 'bg-gradient-to-r from-white to-indigo-50/30 border-slate-200 shadow-sm'}`}>

          <div className="flex items-center gap-2 mb-3">

            <Sparkles size={16} className="text-indigo-400 animate-pulse" />

            <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">SubSphere AI Copilot Insights</h3>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {aiSuggestions.map((sug, idx) => (

              <div key={idx} className={`p-3.5 rounded-2xl text-xs font-medium border ${darkMode ? 'bg-slate-950/60 border-slate-900/60' : 'bg-slate-50 border-slate-200'}`}>

                <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{sug.text}</p>

              </div>

            ))}

          </div>

        </div>



        {/* Workspace Matrix */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          

          {/* Operations Core Control (Left Column) */}

          <div className="lg:col-span-1">

            <div className={`p-6 rounded-3xl border sticky top-24 transition-all duration-300 ${darkMode ? 'bg-slate-900/30 border-slate-900' : 'bg-white border-slate-200'}`}>

              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">

                {isEditing ? <Edit2 size={18} className="text-indigo-500" /> : <Plus size={20} className="text-indigo-500" />}

                {isEditing ? 'Modify Footprint' : 'Add New Asset'}

              </h3>

              

              <form onSubmit={handleSubmit} className="space-y-4">

                <div>

                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Service Identity</label>

                  <input 

                    type="text" required placeholder="e.g., Netflix Premium"

                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}

                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${darkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'}`}

                  />

                </div>



                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Monthly Rent ($)</label>

                    <input 

                      type="number" step="0.01" required placeholder="14.99"

                      value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})}

                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}

                    />

                  </div>

                  <div>

                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Category Pillar</label>

                    <select 

                      value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}

                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}

                    >

                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}

                    </select>

                  </div>

                </div>



                <div>

                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Next Cycle Trigger Date</label>

                  <input 

                    type="date" required

                    value={formData.renewalDate} onChange={e => setFormData({...formData, renewalDate: e.target.value})}

                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}

                  />

                </div>



                <div className="pt-2 flex gap-2">

                  <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm py-3 rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">

                    {isEditing ? <Check size={16} /> : <Plus size={16} />}

                    {isEditing ? 'Commit Configuration' : 'Deploy Subscription'}

                  </button>

                  {isEditing && (

                    <button 

                      type="button" 

                      onClick={() => {

                        setIsEditing(null);

                        setFormData({ name: '', cost: '', category: 'Entertainment', renewalDate: '', billingCycle: 'Monthly' });

                      }}

                      className={`p-3 rounded-xl border transition-all ${darkMode ? 'border-slate-800 hover:bg-slate-900' : 'border-slate-200 hover:bg-slate-100'}`}

                    >

                      <X size={16} />

                    </button>

                  )}

                </div>

              </form>

            </div>

          </div>



          {/* Interactive Workspace Array (Right Column) */}

          <div className="lg:col-span-2 space-y-6">

            

            {/* Advanced Search Filter Toolbar */}

            <div className={`p-4 rounded-3xl border flex flex-col md:flex-row gap-4 justify-between items-center transition-all ${darkMode ? 'bg-slate-900/30 border-slate-900' : 'bg-white border-slate-200'}`}>

              <div className="relative w-full md:w-72">

                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />

                <input 

                  type="text" placeholder="Filter downstream assets..."

                  value={search} onChange={e => setSearch(e.target.value)}

                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${darkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200'}`}

                />

              </div>



              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">

                <Filter size={14} className="text-slate-500 flex-shrink-0" />

                <button 

                  onClick={() => setSelectedCategory('All')}

                  onDragOver={(e) => e.preventDefault()}

                  onDrop={() => handleDrop('Other')}

                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${selectedCategory === 'All' ? 'bg-indigo-600 text-white' : (darkMode ? 'bg-slate-900 text-slate-400 hover:text-slate-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}`}

                >

                  All Elements

                </button>

                {CATEGORIES.map(cat => (

                  <button

                    key={cat} 

                    onClick={() => setSelectedCategory(cat)}

                    onDragOver={(e) => e.preventDefault()}

                    onDrop={() => handleDrop(cat)}

                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border ${draggedItemId ? 'border-dashed border-indigo-500/50 scale-105 bg-indigo-500/5' : 'border-transparent'} ${selectedCategory === cat ? 'bg-indigo-600 text-white' : (darkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600')}`}

                  >

                    {cat}

                  </button>

                ))}

              </div>

            </div>



            {/* Asset Grid Interface */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {filteredSubs.length > 0 ? (

                filteredSubs.map(sub => {

                  const alertActive = isUpcomingAlert(sub.renewalDate);

                  return (

                    <div 

                      key={sub.id} 

                      draggable

                      onDragStart={() => handleDragStart(sub.id)}

                      className={`p-5 rounded-3xl border transition-all duration-300 relative flex flex-col justify-between cursor-grab active:cursor-grabbing hover:shadow-xl group ${alertActive ? 'border-amber-500/40 bg-amber-500/[0.01]' : (darkMode ? 'bg-slate-900/30 border-slate-900 hover:border-slate-800' : 'bg-white border-slate-200 hover:border-slate-300')}`}

                    >

                      <div>

                        <div className="flex justify-between items-start mb-3">

                          <div>

                            <span className="px-2 py-0.5 text-[9px] font-black tracking-widest uppercase bg-indigo-500/10 text-indigo-400 rounded-md">

                              {sub.category}

                            </span>

                            <h4 className="font-bold text-lg mt-1 tracking-tight group-hover:text-indigo-400 transition-colors">{sub.name}</h4>

                          </div>

                          <div className="text-right">

                            <span className="text-xl font-black tracking-tight">${Number(sub.cost).toFixed(2)}</span>

                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{sub.billingCycle}</p>

                          </div>

                        </div>



                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-4">

                          <Calendar size={14} className={alertActive ? 'text-amber-500' : 'text-slate-500'} />

                          <span>Renews on: <strong className={alertActive ? 'text-amber-500' : 'text-slate-300'}>{sub.renewalDate}</strong></span>

                        </div>

                      </div>



                      <div className="flex gap-2 justify-end border-t pt-3 border-slate-500/5">

                        <button 

                          onClick={() => handleEdit(sub)}

                          className={`p-2 rounded-xl transition-all scale-100 active:scale-90 ${darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600'}`}

                        >

                          <Edit2 size={14} />

                        </button>

                        <button 

                          onClick={() => handleDelete(sub.id)}

                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all scale-100 active:scale-90"

                        >

                          <Trash2 size={14} />

                        </button>

                      </div>

                    </div>

                  );

                })

              ) : (

                <div className={`col-span-full p-12 text-center border border-dashed rounded-3xl ${darkMode ? 'border-slate-900 text-slate-600' : 'border-slate-300 text-slate-400'}`}>

                  <CreditCard size={40} className="mx-auto mb-3 opacity-30" />

                  <p className="text-sm font-medium">No matching computational nodes or assets discovered.</p>

                </div>

              )}

            </div>

          </div>



        </div>

      </main>

    </div>

  );

}

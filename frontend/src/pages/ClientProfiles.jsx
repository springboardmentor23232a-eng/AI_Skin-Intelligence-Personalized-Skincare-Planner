import React, { useState } from 'react';
import consultantData from '../data/consultantData.json';
import Breadcrumb from '../components/common/Breadcrumb';
import EmptyState from '../components/common/EmptyState';
import { Search, Filter, MessageSquare, Clipboard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClientProfiles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [skinTypeFilter, setSkinTypeFilter] = useState('All');
  const [clients, setClients] = useState(consultantData.clients);

  const filtered = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkin = skinTypeFilter === 'All' || c.skinType === skinTypeFilter;
    return matchesSearch && matchesSkin;
  });

  const crumbs = [
    { label: 'Dashboard', path: '/consultant' },
    { label: 'Client Profiles', path: '/consultant/profiles' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div>
        <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
          Client Profiles
        </h1>
        <p className="text-sm text-brand-850">
          Search, filter, and audit detailed profiles of skincare clients assigned to you.
        </p>
      </div>

      <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-100">
          <div className="relative">
            <Search className="w-4 h-4 text-brand-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Search client profile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-brand-200 rounded-xl text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 w-full sm:w-64"
            />
          </div>

          <div className="flex items-center gap-1.5 border border-brand-200 px-3 py-1.5 rounded-xl bg-brand-50/20 text-xs text-brand-900 font-display">
            <Filter className="w-3.5 h-3.5 text-brand-500" />
            <span className="font-semibold mr-1">Filter Skin Type:</span>
            <select 
              value={skinTypeFilter}
              onChange={(e) => setSkinTypeFilter(e.target.value)}
              className="bg-transparent focus:outline-none font-bold cursor-pointer"
            >
              <option value="All">All Skin Types</option>
              <option value="Combination">Combination</option>
              <option value="Dry">Dry</option>
              <option value="Sensitive">Sensitive</option>
              <option value="Oily">Oily</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
        </div>

        {/* Client List */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(c => (
              <div 
                key={c.id} 
                className="border border-brand-100 bg-white rounded-2xl p-5 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-display text-base font-bold text-slate-900">{c.name}</h4>
                      <p className="text-[11px] text-brand-800">{c.email}</p>
                    </div>
                    <span className="bg-brand-100 text-brand-850 text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      {c.skinType} Skin
                    </span>
                  </div>

                  {/* Lifestyle Habits */}
                  <div className="bg-brand-50/40 border border-brand-100/50 p-3 rounded-xl text-xs space-y-1.5 font-sans">
                    <span className="font-display font-bold text-[9px] uppercase tracking-wider text-brand-650 block">Lifestyle & Habits</span>
                    <div className="grid grid-cols-2 gap-2 text-brand-900 text-[11px]">
                      <div>• Sleep: <strong>7.5h avg</strong></div>
                      <div>• Water: <strong>2.8L daily</strong></div>
                      <div>• Diet: <strong>Balanced</strong></div>
                      <div>• Exercise: <strong>3x / week</strong></div>
                    </div>
                  </div>

                  {/* Previous Notes */}
                  <div className="text-xs space-y-1 font-sans text-brand-900 leading-normal">
                    <span className="font-display font-bold text-[9px] uppercase tracking-wider text-brand-650 block">Previous Consultant Notes:</span>
                    <p className="italic text-brand-800 bg-brand-50/20 p-2.5 border border-brand-100/50 rounded-xl">
                      "Client noted barrier tightness on winter days. Recommended squalane oil drops before moisturizer."
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-brand-100/60 pt-3 mt-4 text-xs font-display">
                  <button 
                    onClick={() => toast.success(`Viewing consultation notes archive for ${c.name}`)}
                    className="p-1.5 hover:bg-brand-50 border border-brand-200 text-brand-800 rounded-xl transition-colors flex items-center gap-1 px-3"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    History Notes
                  </button>
                  <button 
                    onClick={() => toast.success(`Initiating chat channel with client ${c.name}`)}
                    className="btn-primary px-3 py-1.5 rounded-xl flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Chat Client
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

    </div>
  );
}

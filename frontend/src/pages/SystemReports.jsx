import React from 'react';
import adminData from '../data/adminData.json';
import Breadcrumb from '../components/common/Breadcrumb';
import { ShieldCheck, FileDown, ShieldAlert, Cpu, Database } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SystemReports() {
  const crumbs = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'System Reports', path: '/admin/reports' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
            System Reports
          </h1>
          <p className="text-sm text-brand-850">
            Monitor infrastructure nodes health, download audit compliance worksheets, and read security logs.
          </p>
        </div>
        <button 
          onClick={() => toast.success('Audit Report compiled! Starting PDF download... 📂')}
          className="btn-accent px-4 py-2.5 rounded-xl text-xs font-display flex items-center gap-1.5 shrink-0"
        >
          <FileDown className="w-4 h-4" />
          Download System Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* System Health */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-brand-100">
            <div className="p-2 bg-brand-100 rounded-xl text-brand-650">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">System Health</h3>
              <p className="text-[10px] text-brand-800">Connection state and core latencies</p>
            </div>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <div className="flex justify-between items-center bg-brand-50/50 p-2.5 border border-brand-100 rounded-xl">
              <span className="font-semibold text-brand-900">API Gateway Status</span>
              <span className="text-emerald-700 font-bold">Online</span>
            </div>
            <div className="flex justify-between items-center bg-brand-50/50 p-2.5 border border-brand-100 rounded-xl">
              <span className="font-semibold text-brand-900">PostgreSQL latency</span>
              <span className="text-slate-900 font-bold">14ms</span>
            </div>
            <div className="flex justify-between items-center bg-brand-50/50 p-2.5 border border-brand-100 rounded-xl">
              <span className="font-semibold text-brand-900">Redis Memory Cache</span>
              <span className="text-slate-900 font-bold">2.4 GB</span>
            </div>
          </div>
        </div>

        {/* Security Logs */}
        <div className="lg:col-span-2 glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-brand-100">
            <div className="p-2 bg-red-100 rounded-xl text-red-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">Security & Access Logs</h3>
              <p className="text-[10px] text-brand-850">Recent login logs audit trails</p>
            </div>
          </div>

          <div className="divide-y divide-brand-100/50 text-xs font-sans text-brand-900">
            <div className="py-2.5 flex justify-between gap-4">
              <div>
                <strong>Role Access Override:</strong> User `admin@demo.com` modified system configuration properties.
                <span className="text-[10px] text-brand-800 block mt-0.5">Origin: IP 192.168.1.104</span>
              </div>
              <span className="text-[10px] text-brand-800 font-semibold shrink-0">Today, 02:40 PM</span>
            </div>

            <div className="py-2.5 flex justify-between gap-4">
              <div>
                <strong>Security Guard:</strong> Blocked unauthorized query attempt on restricted clinical patient paths.
                <span className="text-[10px] text-brand-800 block mt-0.5">Resource: /api/v1/patients/902</span>
              </div>
              <span className="text-red-750 font-bold shrink-0">Blocked</span>
            </div>

            <div className="py-2.5 flex justify-between gap-4">
              <div>
                <strong>Model Checkpoint Export:</strong> Model parameters backed up to AWS S3 storage node successfully.
                <span className="text-[10px] text-brand-800 block mt-0.5">Bucket: s3://skin-intelligence-checkpoints</span>
              </div>
              <span className="text-[10px] text-brand-850 font-semibold shrink-0">Today, 09:12 AM</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

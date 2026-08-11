import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { Users, Shield, Zap, Database } from "lucide-react";
import { motion } from "framer-motion";

function AdminDashboard() {
  const { user } = useAuth();

  const usersList = [
    { id: 1, name: "Verification User", email: "verified_user@skincare.com", role: "USER", status: "Active", joined: "2026-07-31" },
    { id: 2, name: "Dr. Audit Consultant", email: "consultant_audit@skincare.com", role: "SKINCARE_CONSULTANT", status: "Active", joined: "2026-07-30" },
    { id: 3, name: "System Administrator", email: "admin_audit@skincare.com", role: "ADMIN", status: "Active", joined: "2026-07-29" }
  ];

  return (
    <Layout>
      <div className="p-6 rounded-2xl bg-gradient-tech-blue text-white shadow-lg mb-6 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white m-0 flex items-center gap-2">
            Admin Control Panel 🛡️
          </h1>
          <p className="text-xs text-slate-300 mt-1 mb-0">
            Welcome, Administrator {user?.full_name || "Admin"}. System health, role management, and database telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-gradient-cyber-neon text-white shadow-xs">
            Provider: {user?.provider || "LOCAL"}
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-gradient-champagne text-slate-900 shadow-xs">
            ROLE: ADMIN
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl saas-card-premium border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Registered Users</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-cyber-neon text-white flex items-center justify-center shadow-xs">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">1,250</div>
          <span className="inline-block mt-1 text-[11px] font-bold text-emerald-500">+12% active this month</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl saas-card-premium border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Consultants</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-aurora text-white flex items-center justify-center shadow-xs">
              <Shield size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">42</div>
          <span className="inline-block mt-1 text-[11px] font-bold text-indigo-500">Verified Providers</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl saas-card-premium border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">AI Inferences Today</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-royal-purple text-white flex items-center justify-center shadow-xs">
              <Zap size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">8,940</div>
          <span className="inline-block mt-1 text-[11px] font-bold text-cyan-500">99.8% Uptime Latency</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl saas-card-premium border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Database Status</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-emerald text-white flex items-center justify-center shadow-xs">
              <Database size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-500 tracking-tight">Healthy</div>
          <span className="inline-block mt-1 text-[11px] font-bold text-slate-400">PostgreSQL Connection</span>
        </motion.div>
      </div>

      {/* User Administration Table */}
      <div className="p-6 rounded-2xl saas-card-premium border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          System Account Directory
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">ID</th>
                <th className="pb-3">User Name</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">System Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {usersList.map((usr) => (
                <tr key={usr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 text-slate-400">#{usr.id}</td>
                  <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{usr.name}</td>
                  <td className="py-3 text-slate-500">{usr.email}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      usr.role === "ADMIN" ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" :
                      usr.role === "SKINCARE_CONSULTANT" ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300" :
                      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    }`}>
                      {usr.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {usr.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{usr.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default AdminDashboard;
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/apiService";
import { Link } from "react-router-dom";
import { Activity, Droplets, Flame, Shield, ArrowRight, TrendingUp, CheckCircle2, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function UserDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [todayLogs, setTodayLogs] = useState({});
  const [streak, setStreak] = useState(0);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prof = await apiService.getProfile();
        setProfile(prof);
      } catch {
        // profile optional
      }

      try {
        const history = await apiService.getAssessmentHistory();
        if (history && history.length > 0) {
          setLatestAssessment(history[0]);
        }
      } catch {
        // assessment optional
      }

      try {
        const routineData = await apiService.getRoutines();
        setRoutines(routineData || []);
      } catch {
        setRoutines([]);
      }

      try {
        const trendsData = await apiService.getSkinHealthTrends();
        if (trendsData && trendsData.trends) {
          setTrends(trendsData.trends);
        }
      } catch {
        setTrends([]);
      }

      try {
        const todayStr = new Date().toISOString().split("T")[0];
        const logs = await apiService.getRoutineLogs(todayStr, todayStr);
        const logMap = {};
        logs.forEach((log) => {
          logMap[log.routine_type] = log.completed;
        });
        setTodayLogs(logMap);
      } catch {
        setTodayLogs({});
      }

      try {
        const allLogs = await apiService.getRoutineLogs();
        if (allLogs && allLogs.length > 0) {
          const sortedLogs = [...allLogs].sort((a, b) => new Date(b.logged_date) - new Date(a.logged_date));
          let currentStreak = 0;
          let checkDate = new Date();
          checkDate.setHours(0, 0, 0, 0);

          while (true) {
            const checkDateStr = checkDate.toISOString().split("T")[0];
            const dayLogs = sortedLogs.filter(
              (l) => new Date(l.logged_date).toISOString().split("T")[0] === checkDateStr && l.completed
            );

            if (dayLogs.length > 0) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              const todayStr = new Date().toISOString().split("T")[0];
              if (checkDateStr === todayStr) {
                checkDate.setDate(checkDate.getDate() - 1);
                continue;
              }
              break;
            }
          }
          setStreak(currentStreak);
        } else {
          setStreak(0);
        }
      } catch {
        setStreak(0);
      }
    };
    fetchData();
  }, []);

  const handleToggleRoutine = async (routineType) => {
    const isCompleted = !todayLogs[routineType];
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      await apiService.logRoutine({
        routine_type: routineType,
        logged_date: todayStr,
        completed: isCompleted,
        notes: `Logged via dashboard overview.`
      });

      setTodayLogs((prev) => ({
        ...prev,
        [routineType]: isCompleted
      }));
    } catch (err) {
      console.error("Failed to log routine:", err);
    }
  };

  const totalGenerated = routines.length;
  const completedToday = Object.values(todayLogs).filter(Boolean).length;

  const chartData = trends.map((t) => ({
    date: new Date(t.logged_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    score: t.overall_score
  }));

  return (
    <Layout>
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-tech-blue text-white shadow-lg mb-6 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white m-0 flex items-center gap-2">
            Welcome back, {user?.full_name || "User"} 👋
          </h1>
          <p className="text-xs text-slate-300 mt-1 mb-0">
            Here is your personalized daily skin health summary and clinical routine tracker.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-slate-200 border border-white/10 backdrop-blur-xs">
            Provider: {user?.provider || "LOCAL"}
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-gradient-cyber-neon text-white shadow-xs">
            Role: {user?.role}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl saas-card-premium border border-indigo-100/60 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Skin Health Score</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-aurora text-white flex items-center justify-center shadow-xs">
              <Activity size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {latestAssessment ? `${latestAssessment.overall_score}%` : "No Score"}
          </div>
          <span className="inline-block mt-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
            {latestAssessment ? latestAssessment.risk_level : "Take assessment"}
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl saas-card-premium border border-cyan-100/60 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Hydration Target</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-cyber-neon text-white flex items-center justify-center shadow-xs">
              <Droplets size={16} />
            </div>

          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {profile ? `${profile.water_intake} L` : "2.0 L"}
          </div>
          <span className="inline-block mt-1 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
            {profile?.climate ? `${profile.climate} climate` : "Set in profile"}
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Routine Streak</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {streak} Days
          </div>
          <span className="inline-block mt-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            Consistent habit
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">UV Protection</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Shield size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {profile?.uv_exposure || "Moderate"}
          </div>
          <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Exposure Level
          </span>
        </motion.div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Skincare Routine */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-700/60">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">
                  Today's Skincare Routine
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 m-0">
                  Morning & Evening Schedule
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {completedToday} / {totalGenerated > 0 ? totalGenerated : 0} Logged
              </span>
            </div>

            <div className="space-y-2.5">
              {totalGenerated > 0 ? (
                routines.map((routine) => {
                  const isChecked = !!todayLogs[routine.routine_type];
                  return (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      key={routine.id}
                      onClick={() => handleToggleRoutine(routine.routine_type)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800 opacity-60"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isChecked ? (
                          <CheckCircle2 size={18} className="text-emerald-500" />
                        ) : (
                          <Circle size={18} className="text-slate-300 dark:text-slate-600" />
                        )}
                        <div>
                          <div className={`text-xs font-semibold text-slate-900 dark:text-slate-100 ${isChecked ? "line-through" : ""}`}>
                            {routine.title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {routine.routine_type} • {routine.steps?.length || 0} Steps
                          </div>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        isChecked ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400" : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                      }`}>
                        {isChecked ? "Completed" : "Pending"}
                      </span>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-10">
                  <p className="text-xs text-slate-500 mb-4">No personalized routines generated yet.</p>
                  <Link
                    to="/routines"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs text-decoration-none"
                  >
                    Generate Routine <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Skin Condition Trend & Recharts preview */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-700/60">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">
                  Skin Health Trend
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 m-0">
                  AI Diagnostic Score Analytics
                </p>
              </div>
              <Link
                to="/analytics"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-decoration-none"
              >
                View Trends <ArrowRight size={12} />
              </Link>
            </div>

            {chartData.length > 0 ? (
              <div className="w-full h-48 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        color: '#F8FAFC',
                        fontSize: '11px',
                      }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-700 min-h-[200px]">
                <TrendingUp size={24} className="text-slate-400 mb-2" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Interactive Health Score Visualizer
                </h4>
                <p className="text-slate-500 text-[11px] max-w-xs mb-4">
                  Log your skin diagnostic assessments to visualize your score improvement over time.
                </p>
                <Link
                  to="/analytics"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs text-decoration-none"
                >
                  Explore Analytics
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default UserDashboard;
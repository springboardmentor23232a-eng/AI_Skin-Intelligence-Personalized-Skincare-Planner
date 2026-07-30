import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import JwtInspector from "../components/JwtInspector";
import { apiService } from "../services/api";
import { History, Activity, Plus, Trash2, CheckCircle, Target, Sparkles, Smile, Lightbulb, Droplets, Moon, Sun, Wind } from "lucide-react";

const WellnessDashboard = () => {
  const [goals, setGoals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Environmental Tracking State
  const [uvIndex, setUvIndex] = useState(6.2); // Moderate UV
  const [airQuality, setAirQuality] = useState("Good (AQI 42)");
  const [humidity, setHumidity] = useState("58%");

  // Hydration & Sleep Log State
  const [waterLog, setWaterLog] = useState(2400); // ml
  const [sleepHours, setSleepHours] = useState(7.5); // hours

  // New Goal Form Modal State
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalCategory, setGoalCategory] = useState("HYDRATION");
  const [targetMetric, setTargetMetric] = useState("Water Intake");
  const [targetValue, setTargetValue] = useState(3000);
  const [unit, setUnit] = useState("ml");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [goalsRes, activitiesRes, tipsRes] = await Promise.allSettled([
        apiService.getGoals(),
        apiService.getActivities(),
        apiService.getHealthTips(),
      ]);

      if (goalsRes.status === "fulfilled" && goalsRes.value.data) {
        setGoals(goalsRes.value.data);
      } else {
        setGoals([
          { id: 1, title: "Daily Hydration Target", category: "HYDRATION", targetMetric: "Hydration", currentProgress: 2400, targetValue: 3000, unit: "ml", status: "IN_PROGRESS" },
          { id: 2, title: "Deep Recovery Sleep Target", category: "SLEEP", targetMetric: "Sleep Hours", currentProgress: 7.5, targetValue: 8, unit: "hours/night", status: "IN_PROGRESS" },
          { id: 3, title: "Broad Spectrum Sunscreen SPF 50", category: "PROTECTION", targetMetric: "Reapplication", currentProgress: 2, targetValue: 3, unit: "times/day", status: "IN_PROGRESS" }
        ]);
      }

      if (activitiesRes.status === "fulfilled" && activitiesRes.value.data) {
        setActivities(activitiesRes.value.data);
      } else {
        setActivities([
          { id: 1, activityName: "Morning Double Cleanse & Mineral Sunscreen", durationMinutes: 10, caloriesBurned: 0, moodScore: 9, activityDate: new Date().toISOString().split('T')[0], notes: "UV index was high (6.2) — SPF 50 applied." },
          { id: 2, activityName: "Night Hyaluronic Acid & Ceramide Cream", durationMinutes: 15, caloriesBurned: 0, moodScore: 9, activityDate: new Date().toISOString().split('T')[0], notes: "Slept 7.5 hours. Skin barrier restored." }
        ]);
      }

      if (tipsRes.status === "fulfilled" && tipsRes.value.data) {
        setTips(tipsRes.value.data);
      } else {
        setTips([
          { id: 1, title: "Broad-Spectrum Mineral SPF 30+ Daily", content: "Daily sunscreen prevents photo-aging, dark spots, and moisture loss.", category: "PROTECTION" },
          { id: 2, title: "Layer Serums from Thinnest to Thickest", content: "Apply watery hyaluronic serums first, followed by creams to lock in epidermal hydration.", category: "SKINCARE" },
          { id: 3, title: "Hydration & Sleep Turnover", content: "Drinking 3L water daily supports cellular turnover during 8h sleep recovery.", category: "HYDRATION" }
        ]);
      }
    } catch (e) {
      console.warn("Using offline skincare dataset");
    } finally {
      setLoading(false);
    }
  };

  const handleAddWater = (amount) => {
    setWaterLog((prev) => Math.min(4000, prev + amount));
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    const newGoal = {
      title: goalTitle,
      category: goalCategory,
      targetMetric,
      targetValue: parseInt(targetValue),
      unit,
      currentProgress: 0,
      status: "IN_PROGRESS"
    };

    try {
      const res = await apiService.createGoal(newGoal);
      if (res.data) setGoals((prev) => [...prev, res.data]);
    } catch (err) {
      setGoals((prev) => [...prev, { id: Date.now(), ...newGoal }]);
    } finally {
      setShowGoalForm(false);
      setGoalTitle("");
    }
  };

  const handleUpdateProgress = async (id, currentVal, targetVal) => {
    const nextVal = Math.min(targetVal, currentVal + Math.round(targetVal * 0.1));
    try {
      await apiService.updateGoalProgress(id, nextVal);
    } catch (e) {
      // offline state update
    }
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, currentProgress: nextVal, status: nextVal >= targetVal ? "COMPLETED" : "IN_PROGRESS" } : g))
    );
  };

  const handleDeleteGoal = async (id) => {
    try {
      await apiService.deleteGoal(id);
    } catch (e) {
      // offline fallback
    }
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <div className="dashboard-content">
        <Sidebar />

        <main className="main-viewport">
          <JwtInspector />

          <div className="section-header">
            <div>
              <h2><History className="icon-title" style={{ color: 'var(--primary)' }} /> Skin History &amp; Environmental Wellness Tracking</h2>
              <p>Monitor daily hydration levels, nocturnal sleep turnover, and real-time environmental exposure metrics.</p>
            </div>
            <div className="header-actions">
              <button onClick={() => setShowGoalForm(!showGoalForm)} className="btn btn-primary">
                <Plus size={16} /> <span>New Goal</span>
              </button>
            </div>
          </div>

          {/* Environmental Exposure Tracker Banner */}
          <div className="grid-layout grid-3-col" style={{ marginBottom: '1.75rem' }}>
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.85rem', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--warning)', borderRadius: '50%' }}>
                <Sun size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>UV EXPOSURE INDEX</span>
                <h3 style={{ fontSize: '1.25rem' }}>{uvIndex} (Moderate)</h3>
                <small style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SPF 30+ Recommended</small>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.85rem', background: 'rgba(34, 197, 94, 0.12)', color: 'var(--success)', borderRadius: '50%' }}>
                <Wind size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>AIR QUALITY INDEX</span>
                <h3 style={{ fontSize: '1.25rem' }}>{airQuality}</h3>
                <small style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Low Pollutant Exposure</small>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.85rem', background: 'rgba(20, 184, 166, 0.12)', color: 'var(--secondary)', borderRadius: '50%' }}>
                <Droplets size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>AMBIENT HUMIDITY</span>
                <h3 style={{ fontSize: '1.25rem' }}>{humidity}</h3>
                <small style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Optimal Epidermal Hydration</small>
              </div>
            </div>
          </div>

          {/* Hydration & Sleep Tracker Row */}
          <div className="grid-layout grid-2-col" style={{ marginBottom: '1.75rem' }}>
            {/* Hydration Interactive Tracker */}
            <div className="glass-card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Hydration Tracker</h3>
                <Droplets size={20} style={{ color: 'var(--secondary)' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{waterLog} <small style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ 3000 ml</small></h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Daily target: 3000 ml for cell turnover</p>
                </div>
                <div className="jwt-status-chip">{Math.round((waterLog / 3000) * 100)}% Reached</div>
              </div>

              <div className="progress-bar-bg" style={{ height: '10px', borderRadius: '5px', background: 'var(--input-bg)', overflow: 'hidden', marginBottom: '1rem' }}>
                <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.round((waterLog / 3000) * 100))}%`, height: '100%', background: 'linear-gradient(90deg, var(--secondary), var(--primary))' }}></div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleAddWater(250)} className="btn btn-outline" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}>+ 250 ml Glass</button>
                <button onClick={() => handleAddWater(500)} className="btn btn-outline" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}>+ 500 ml Bottle</button>
              </div>
            </div>

            {/* Sleep Interactive Tracker */}
            <div className="glass-card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Sleep &amp; Recovery Turnover</h3>
                <Moon size={20} style={{ color: 'var(--accent)' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{sleepHours} <small style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ 8.0 Hours</small></h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Deep REM rest promotes collagen synthesis</p>
                </div>
                <div className="jwt-status-chip">{Math.round((sleepHours / 8.0) * 100)}% Sleep Target</div>
              </div>

              <div className="progress-bar-bg" style={{ height: '10px', borderRadius: '5px', background: 'var(--input-bg)', overflow: 'hidden', marginBottom: '1rem' }}>
                <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.round((sleepHours / 8.0) * 100))}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--primary))' }}></div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setSleepHours((prev) => Math.min(12, prev + 0.5))} className="btn btn-outline" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}>+ 0.5 Hrs Rest</button>
                <button onClick={() => setSleepHours(8.0)} className="btn btn-outline" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}>Set 8.0 Hrs Ideal</button>
              </div>
            </div>
          </div>

          {/* Active Goals & Tips Grid */}
          <div className="grid-layout grid-3-col">
            <div className="glass-card span-2">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Skincare Habit Goals</h3>
                <Target size={20} className="text-primary" />
              </div>

              <div className="goals-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {goals.map((g) => {
                  const pct = Math.min(100, Math.round((g.currentProgress / g.targetValue) * 100));
                  return (
                    <div key={g.id} className="goal-card-item" style={{
                      background: 'var(--input-bg)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)'
                    }}>
                      <div className="goal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span className="role-badge role-user">{g.category}</span>
                        <button onClick={() => handleDeleteGoal(g.id)} className="logout-btn"><Trash2 size={14} /></button>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>{g.title}</h4>
                      <div className="goal-progress-info" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                        <span>{g.currentProgress} / {g.targetValue} {g.unit}</span>
                        <span className="goal-pct" style={{ fontWeight: 700 }}>{pct}%</span>
                      </div>
                      <div className="progress-bar-bg" style={{ height: '6px', borderRadius: '3px', background: 'var(--border-color)', overflow: 'hidden' }}>
                        <div className="progress-bar-fill" style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Skincare Tips Feed */}
            <div className="glass-card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Dermatology Tips</h3>
                <Lightbulb size={20} style={{ color: 'var(--warning)' }} />
              </div>

              <div className="tips-feed">
                {tips.map((t, i) => (
                  <div key={i} className="tip-item-card" style={{
                    background: 'var(--input-bg)',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '0.75rem',
                    border: '1px solid var(--border-color)'
                  }}>
                    <span className="role-badge role-wellness_coach" style={{ fontSize: '0.65rem', marginBottom: '0.35rem', display: 'inline-block' }}>{t.category}</span>
                    <h4 style={{ fontSize: '0.88rem', marginBottom: '0.25rem' }}>{t.title}</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{t.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WellnessDashboard;

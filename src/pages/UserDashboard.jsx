import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import JwtInspector from "../components/JwtInspector";
import { useAuth } from "../context/AuthContext";
import { getTimeBasedGreeting } from "../utils/greeting";
import CameraModal from "../components/CameraModal";
import SkinAssessmentModule from "../components/SkinAssessmentModule";
import SkincareRoutineModule from "../components/SkincareRoutineModule";
import AiSkincareAssistant from "../components/AiSkincareAssistant";
import { Sparkles, Sun, Droplets, Moon, Flame, Search, Bell, Star, Heart, CheckCircle, TrendingUp, Camera } from "lucide-react";

const INITIAL_GOALS = [
  { id: "g1", title: "Drink Water", sub: "2.5 – 3 Liters daily", icon: <Droplets size={18} style={{ color: '#3B82F6' }} />, active: true, doneDays: 5, totalDays: 7, pct: 71, color: '#3B82F6' },
  { id: "g2", title: "Wash Face", sub: "Twice daily", icon: <Sparkles size={18} style={{ color: '#8B5CF6' }} />, active: true, doneDays: 7, totalDays: 7, pct: 100, color: '#8B5CF6' },
  { id: "g3", title: "Sunscreen", sub: "Apply SPF 30+", icon: <Sun size={18} style={{ color: '#F59E0B' }} />, active: false, doneDays: 4, totalDays: 7, pct: 57, color: '#F59E0B' },
  { id: "g4", title: "Moisturize", sub: "Morning & Night", icon: <Droplets size={18} style={{ color: '#10B981' }} />, active: true, doneDays: 6, totalDays: 7, pct: 86, color: '#10B981' },
  { id: "g5", title: "Sleep 7-8 Hours", sub: "Maintain good sleep", icon: <Moon size={18} style={{ color: '#6366F1' }} />, active: true, doneDays: 5, totalDays: 7, pct: 71, color: '#6366F1' },
  { id: "g6", title: "Exercise", sub: "At least 30 mins", icon: <Heart size={18} style={{ color: '#EC4899' }} />, active: false, doneDays: 2, totalDays: 7, pct: 29, color: '#EC4899' },
  { id: "g7", title: "Avoid Junk Food", sub: "Reduce oily & sugar", icon: <Sparkles size={18} style={{ color: '#F97316' }} />, active: true, doneDays: 3, totalDays: 7, pct: 43, color: '#F97316' }
];

const INITIAL_TIPS = [
  { id: "t1", title: "Always wear SPF 30+ sunscreen", desc: "Protects skin from UV rays and prevents pigmentation.", priority: "High", priorityColor: '#EF4444', icon: <Sun size={18} style={{ color: '#F59E0B' }} />, active: true },
  { id: "t2", title: "Stay hydrated", desc: "Drink enough water to keep your skin plump and glowing.", priority: "High", priorityColor: '#EF4444', icon: <Droplets size={18} style={{ color: '#3B82F6' }} />, active: true },
  { id: "t3", title: "Moisturize after cleansing", desc: "Locks in hydration and maintains skin barrier.", priority: "Medium", priorityColor: '#F59E0B', icon: <Droplets size={18} style={{ color: '#10B981' }} />, active: true },
  { id: "t4", title: "Maintain a good sleep routine", desc: "Quality sleep improves skin regeneration.", priority: "Medium", priorityColor: '#F59E0B', icon: <Moon size={18} style={{ color: '#6366F1' }} />, active: true },
  { id: "t5", title: "Eat antioxidant rich foods", desc: "Eat fruits, vegetables and nuts for healthy skin.", priority: "Low", priorityColor: '#10B981', icon: <Sparkles size={18} style={{ color: '#10B981' }} />, active: false }
];

const RECOMMENDED_PRODUCTS = [
  {
    id: "p1",
    brand: "La Roche-Posay",
    name: "Effaclar Purifying Gel",
    suitability: "For Oily & Acne Prone Skin",
    rating: "4.6",
    reviews: "890",
    price: "₹1,499",
    oldPrice: "₹1,799",
    discount: "17% OFF",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300",
    buyUrl: "https://www.laroche-posay.us"
  },
  {
    id: "p2",
    brand: "Minimalist",
    name: "Niacinamide 10% Serum",
    suitability: "For Acne Marks & Pores",
    rating: "4.7",
    reviews: "1.2k",
    price: "₹599",
    oldPrice: "₹699",
    discount: "14% OFF",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300",
    buyUrl: "https://beminimalist.co"
  },
  {
    id: "p3",
    brand: "CeraVe",
    name: "Moisturizing Cream",
    suitability: "For Dry to Very Dry Skin",
    rating: "4.8",
    reviews: "2.1k",
    price: "₹1,299",
    oldPrice: "₹1,650",
    discount: "21% OFF",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300",
    buyUrl: "https://www.cerave.com"
  },
  {
    id: "p4",
    brand: "Dot & Key",
    name: "Watermelon Sunscreen SPF 50",
    suitability: "For All Skin Types",
    rating: "4.7",
    reviews: "980",
    price: "₹399",
    oldPrice: "₹499",
    discount: "20% OFF",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300",
    buyUrl: "https://www.dotandkey.com"
  }
];

const UserDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace("#", "");
      const el = document.getElementById(targetId) || document.getElementById(targetId === "tips" ? "dermatology-tips" : targetId);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [location.hash]);
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [tips, setTips] = useState(INITIAL_TIPS);
  const [selectedBrand, setSelectedBrand] = useState("ALL");
  const [streakDays, setStreakDays] = useState(12);

  // Camera Modal State
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Toast Notification State
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg("");
    }, 3000);
  };

  const handleCapturePhoto = (imageData) => {
    if (imageData) {
      showToast("📷 Skin photo captured! Optical scan analysis updated.");
    }
  };

  const handleToggleGoal = (id) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const nextActive = !g.active;
          const nextDays = nextActive ? Math.min(g.totalDays, g.doneDays + 1) : Math.max(0, g.doneDays - 1);
          showToast(nextActive ? `✔ '${g.title}' marked as completed for today!` : `ℹ '${g.title}' habit toggled off.`);
          return {
            ...g,
            active: nextActive,
            doneDays: nextDays,
            pct: Math.round((nextDays / g.totalDays) * 100)
          };
        }
        return g;
      })
    );
  };

  const handleToggleTip = (id) => {
    setTips((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextActive = !t.active;
          showToast(nextActive ? `💡 Tip enabled: ${t.title}` : `ℹ Tip disabled: ${t.title}`);
          return { ...t, active: nextActive };
        }
        return t;
      })
    );
  };

  const handleLogStreak = () => {
    setStreakDays((prev) => prev + 1);
    showToast(`🔥 Routine logged! Streak increased to ${streakDays + 1} Days!`);
  };

  const getDisplayName = () => {
    if (!user || !user.name || user.name === "Google Account User" || user.name === "Google User") {
      return user?.email ? user.email.split("@")[0] : "Akash";
    }
    return user.name.split(" ")[0];
  };

  const filteredProducts = selectedBrand === "ALL" 
    ? RECOMMENDED_PRODUCTS 
    : RECOMMENDED_PRODUCTS.filter(p => p.brand.toUpperCase() === selectedBrand);

  return (
    <div className="dashboard-layout">
      <Navbar />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--primary)',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '0.88rem',
          fontWeight: 700,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <CheckCircle size={18} /> <span>{toastMsg}</span>
        </div>
      )}

      {/* Real-time WebCam Facial Scan Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapturePhoto}
        title="Facial Scan & Optical Analysis"
      />

      <div className="dashboard-content">
        <Sidebar />

        <main className="main-viewport">
          <JwtInspector />

          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                {getTimeBasedGreeting().greeting}, {getDisplayName()} {getTimeBasedGreeting().emoji}
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Here's your personalized skincare overview</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setIsCameraOpen(true)}
                className="btn btn-primary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '20px' }}
                title="Click to take a real-time facial optical skin photo"
              >
                <Camera size={16} /> <span>Click Skin Photo</span>
              </button>

              <div className="input-with-icon" style={{ width: '200px' }}>
                <Search className="input-icon" size={16} />
                <input type="text" placeholder="Search..." style={{ padding: '0.5rem 0.75rem 0.5rem 2.2rem', fontSize: '0.85rem', borderRadius: '20px' }} />
              </div>

              <div style={{ position: 'relative', cursor: 'pointer' }}>
                <div style={{ padding: '0.55rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '50%', color: 'var(--text-primary)' }}>
                  <Bell size={18} />
                </div>
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: 'var(--danger)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--input-bg)', padding: '0.35rem 0.75rem', borderRadius: '30px', border: '1px solid var(--border-color)' }}>
                <img src={user?.profile_picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>{getDisplayName()}</h4>
                  <small style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>{user?.role || 'USER'}</small>
                </div>
              </div>
            </div>
          </div>

          {/* Top Metric Cards Row (5 Stat Cards) */}
          <div className="grid-layout grid-5-col" style={{ marginBottom: '1.75rem' }}>
            {/* Stat 1: Skin Score */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Skin Score</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.12)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                82<span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>/100</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <TrendingUp size={14} /> ▲ 12% vs last month
              </div>
            </div>

            {/* Stat 2: Skin Type */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Skin Type</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.12)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Droplets size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent)' }}>
                Combination
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.35rem' }}>
                Balanced
              </div>
            </div>

            {/* Stat 3: Hydration */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Hydration</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Droplets size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#3B82F6' }}>
                Good
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.35rem' }}>
                2.1 L / 2.5 L
              </div>
            </div>

            {/* Stat 4: Sleep */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Sleep</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Moon size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--warning)' }}>
                7h 20m
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.35rem' }}>
                Good Rest
              </div>
            </div>

            {/* Stat 5: Streak (Interactive Log) */}
            <div className="glass-card" onClick={handleLogStreak} style={{ padding: '1.25rem', cursor: 'pointer' }} title="Click to log today's routine!">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Streak</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Flame size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--danger)' }}>
                {streakDays} Days
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600, marginTop: '0.35rem' }}>
                Keep it up! 🔥 (Log +1)
              </div>
            </div>
          </div>

          {/* Two-Column Main Content Section */}
          <div className="grid-layout grid-2-col" style={{ marginBottom: '2rem' }}>
            
            {/* Left Column: Skincare Habit Goals Card */}
            <div id="history" className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ padding: '0.4rem', background: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary)', display: 'flex' }}><Sparkles size={18} /></span>
                    Skincare Habit Goals
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Track your daily skincare habits</p>
                </div>
                <button className="btn btn-outline" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}>View All</button>
              </div>

              {/* Goals List with Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                  <span>HABIT</span>
                  <span style={{ textAlign: 'center' }}>TODAY</span>
                  <span style={{ textAlign: 'right' }}>WEEKLY PROGRESS</span>
                </div>

                {goals.map((g) => (
                  <div key={g.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ padding: '0.5rem', background: 'var(--input-bg)', borderRadius: '50%', display: 'flex' }}>
                        {g.icon}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.88rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>{g.title}</h4>
                        <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{g.sub}</small>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <label className="ios-toggle">
                        <input type="checkbox" checked={g.active} onChange={() => handleToggleGoal(g.id)} />
                        <span className="ios-slider"></span>
                      </label>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        <span>{g.doneDays} / {g.totalDays} days</span>
                        <span>{g.pct}%</span>
                      </div>
                      <div style={{ height: '6px', borderRadius: '3px', background: 'var(--border-color)', overflow: 'hidden' }}>
                        <div style={{ width: `${g.pct}%`, height: '100%', background: g.color, borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(34, 197, 94, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600 }}>
                <CheckCircle size={16} /> Great job! You're on the right track for healthy skin.
              </div>
            </div>

            {/* Right Column: Dermatology Tips Card */}
            <div id="dermatology-tips" className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ padding: '0.4rem', background: 'rgba(245, 158, 11, 0.12)', borderRadius: '50%', color: 'var(--warning)', display: 'flex' }}><Sun size={18} /></span>
                    Dermatology Tips
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Daily expert tips for healthy skin</p>
                </div>
                <button className="btn btn-outline" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}>View All</button>
              </div>

              {/* Tips List with Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tips.map((t) => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--input-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1 }}>
                      <div style={{ padding: '0.5rem', background: 'var(--bg-surface)', borderRadius: '50%', display: 'flex' }}>
                        {t.icon}
                      </div>
                      <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.88rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>{t.title}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>{t.desc}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '10px', background: `${t.priorityColor}20`, color: t.priorityColor }}>
                        {t.priority}
                      </span>
                      <label className="ios-toggle">
                        <input type="checkbox" checked={t.active} onChange={() => handleToggleTip(t.id)} />
                        <span className="ios-slider"></span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(124, 58, 237, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(124, 58, 237, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600 }}>
                <Sparkles size={16} /> Consistency is the key to beautiful skin!
              </div>
            </div>

          </div>

          {/* Google Gemini AI Skincare Assistant & Vision Scan */}
          <AiSkincareAssistant userProfile={user} />

          {/* Module 4: Skincare Routine Generation Engine Section */}
          <SkincareRoutineModule onToast={showToast} />

          {/* Module 3: Skin Assessment Engine Section */}
          <SkinAssessmentModule onToast={showToast} />

          {/* Specialist Consultation & Clinical Direct Support Card */}
          <div id="consult" className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
                  <span style={{ padding: '0.45rem', background: 'rgba(13, 148, 136, 0.12)', borderRadius: '50%', color: 'var(--secondary)', display: 'flex' }}>
                    <TrendingUp size={20} />
                  </span>
                  Consult a Skincare Specialist &amp; Dermatologist
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                  Request personalized guidance or clinical review from assigned certified specialists
                </p>
              </div>
              <button
                onClick={() => showToast("✉ Consultation request sent to certified Dermatologists & Consultants!")}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
              >
                Request Clinical Review
              </button>
            </div>
            <div style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CheckCircle size={24} style={{ color: 'var(--success)', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '0.9rem', margin: 0, fontWeight: 700 }}>Direct Clinical Access Active</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                  Your latest AI Skin Assessment and Personalized Routine are automatically shared with your assigned specialist.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Recommended For You Carousel */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles className="text-primary" size={20} /> Recommended For You
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>AI recommended products based on your skin analysis</p>
              </div>

              {/* Brand Filter Pills */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {["ALL", "LA ROCHE-POSAY", "MINIMALIST", "CERAVE", "DOT & KEY"].map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className="btn"
                    style={{
                      padding: '0.25rem 0.65rem',
                      fontSize: '0.72rem',
                      background: selectedBrand === b ? 'var(--primary)' : 'var(--input-bg)',
                      color: selectedBrand === b ? '#fff' : 'var(--text-secondary)',
                      borderColor: selectedBrand === b ? 'var(--primary)' : 'var(--border-color)'
                    }}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid-layout grid-4-col">
              {filteredProducts.map((p) => (
                <div key={p.id} className="product-card">
                  <div className="product-image-wrap">
                    <img src={p.image} alt={p.name} />
                  </div>

                  <div>
                    <span className="product-brand">{p.brand}</span>
                    <h4 className="product-title" style={{ fontSize: '0.92rem' }}>{p.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{p.suitability}</p>

                    <div style={{ fontSize: '0.78rem', color: 'var(--warning)', fontWeight: 700, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={13} fill="currentColor" /> {p.rating} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({p.reviews})</span>
                    </div>
                  </div>

                  <div className="product-card-footer">
                    <div>
                      <span className="product-price">{p.price}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '0.35rem' }}>{p.oldPrice}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--danger)', fontWeight: 800, marginLeft: '0.35rem' }}>{p.discount}</span>
                    </div>

                    <a href={p.buyUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                      View Product →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
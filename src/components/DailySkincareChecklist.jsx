import React, { useState } from "react";
import { CheckSquare, Square, Sun, Moon, Plus, CheckCircle2, Award } from "lucide-react";

const INITIAL_CHECKLIST_AM = [
  { id: "am-1", name: "Gentle Hydrating Cleanser", detail: "Wash face with lukewarm water", completed: true, category: "Cleansing" },
  { id: "am-2", name: "Niacinamide 10% Serum", detail: "Apply 3-4 drops to damp face", completed: true, category: "Treatment" },
  { id: "am-3", name: "Hyaluronic Acid Moisturizer", detail: "Lock in hydration with gel cream", completed: true, category: "Moisturizing" },
  { id: "am-4", name: "Broad-Spectrum Sunscreen SPF 50", detail: "Apply two finger lengths of SPF", completed: false, category: "Protection" },
];

const INITIAL_CHECKLIST_PM = [
  { id: "pm-1", name: "Micellar Water / Oil Cleanser", detail: "Remove sunscreen and daily grime", completed: true, category: "Double Cleanse" },
  { id: "pm-2", name: "Foaming Face Wash", detail: "Deep cleanse pores thoroughly", completed: true, category: "Cleansing" },
  { id: "pm-3", name: "Retinol 0.2% Night Treatment", detail: "Apply pea-sized amount on dry skin", completed: false, category: "Treatment" },
  { id: "pm-4", name: "Ceramide Barrier Repair Cream", detail: "Nourish and soothe skin overnight", completed: false, category: "Moisturizing" },
];

const DailySkincareChecklist = ({ onToast }) => {
  const [amList, setAmList] = useState(INITIAL_CHECKLIST_AM);
  const [pmList, setPmList] = useState(INITIAL_CHECKLIST_PM);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL | AM | PM
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("AM");
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleTask = (id, time) => {
    if (time === "AM") {
      setAmList((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const nextCompleted = !item.completed;
            if (onToast) {
              onToast(nextCompleted ? `✔ Completed AM: ${item.name}` : `ℹ Marked incomplete: ${item.name}`);
            }
            return { ...item, completed: nextCompleted };
          }
          return item;
        })
      );
    } else {
      setPmList((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const nextCompleted = !item.completed;
            if (onToast) {
              onToast(nextCompleted ? `🌙 Completed PM: ${item.name}` : `ℹ Marked incomplete: ${item.name}`);
            }
            return { ...item, completed: nextCompleted };
          }
          return item;
        })
      );
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    const newItem = {
      id: `${newTaskTime.toLowerCase()}-${Date.now()}`,
      name: newTaskName.trim(),
      detail: "Custom daily skincare step",
      completed: false,
      category: "Custom"
    };

    if (newTaskTime === "AM") {
      setAmList((prev) => [...prev, newItem]);
    } else {
      setPmList((prev) => [...prev, newItem]);
    }

    if (onToast) onToast(`✨ Added custom ${newTaskTime} step: "${newTaskName}"`);
    setNewTaskName("");
    setShowAddForm(false);
  };

  const amCompletedCount = amList.filter((i) => i.completed).length;
  const pmCompletedCount = pmList.filter((i) => i.completed).length;
  const totalCount = amList.length + pmList.length;
  const totalCompleted = amCompletedCount + pmCompletedCount;
  const overallPercentage = Math.round((totalCompleted / totalCount) * 100);

  return (
    <div id="checklist" className="glass-card" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "0.55rem", margin: 0 }}>
            <span style={{ padding: "0.45rem", background: "rgba(59, 130, 246, 0.12)", borderRadius: "50%", color: "#3B82F6", display: "flex" }}>
              <CheckSquare size={20} />
            </span>
            Daily Skincare Checklist
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "0.2rem 0 0 0" }}>
            Track your morning and evening skincare steps to build healthy glowing skin habits
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <div style={{ background: "var(--input-bg)", padding: "0.35rem 0.85rem", borderRadius: "20px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--primary)" }}>
            <Award size={16} /> <span>{totalCompleted}/{totalCount} Completed ({overallPercentage}%)</span>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-outline"
            style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}
          >
            <Plus size={14} /> Add Step
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.35rem" }}>
          <span style={{ color: "var(--text-muted)" }}>TODAY'S SKINCARE ADHERENCE</span>
          <span style={{ color: overallPercentage === 100 ? "var(--success)" : "var(--primary)" }}>
            {overallPercentage === 100 ? "🎉 All steps completed for today!" : `${overallPercentage}% Done`}
          </span>
        </div>
        <div style={{ height: "8px", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
          <div
            style={{
              width: `${overallPercentage}%`,
              height: "100%",
              background: overallPercentage === 100 ? "linear-gradient(90deg, #10B981, #059669)" : "linear-gradient(90deg, #3B82F6, #8B5CF6)",
              borderRadius: "4px",
              transition: "width 0.4s ease"
            }}
          />
        </div>
      </div>

      {/* Add Custom Task Dropdown Form */}
      {showAddForm && (
        <form onSubmit={handleAddTask} style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", marginBottom: "1.25rem" }}>
          <h4 style={{ fontSize: "0.88rem", fontWeight: 700, marginBottom: "0.6rem" }}>Add Custom Skincare Habit Step</h4>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <select
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(e.target.value)}
              style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--card-bg)", color: "var(--text-primary)" }}
            >
              <option value="AM">Morning (AM)</option>
              <option value="PM">Evening (PM)</option>
            </select>
            <input
              type="text"
              placeholder="e.g. Ice Facial Roller, Lip Sleeping Mask..."
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              style={{ flex: 1, minWidth: "200px", padding: "0.45rem 0.75rem", fontSize: "0.82rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--card-bg)", color: "var(--text-primary)" }}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}>
              Save Step
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem" }}>
        {["ALL", "AM", "PM"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn ${activeTab === tab ? "btn-primary" : "btn-outline"}`}
            style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem" }}
          >
            {tab === "AM" && <Sun size={13} style={{ marginRight: "3px" }} />}
            {tab === "PM" && <Moon size={13} style={{ marginRight: "3px" }} />}
            {tab === "ALL" ? "All Steps" : tab === "AM" ? "Morning Routine" : "Evening Routine"}
          </button>
        ))}
      </div>

      {/* Checklist Grid */}
      <div className="grid-layout grid-2-col">
        {/* AM Section */}
        {(activeTab === "ALL" || activeTab === "AM") && (
          <div style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border-color)" }}>
              <h4 style={{ fontSize: "0.92rem", fontWeight: 800, color: "#F59E0B", display: "flex", alignItems: "center", gap: "0.4rem", margin: 0 }}>
                <Sun size={16} /> Morning Routine (AM)
              </h4>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>
                {amCompletedCount}/{amList.length} Done
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {amList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleTask(item.id, "AM")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.65rem 0.85rem",
                    background: item.completed ? "rgba(16, 185, 129, 0.08)" : "var(--card-bg)",
                    border: item.completed ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-color)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {item.completed ? (
                    <CheckCircle2 size={20} style={{ color: "var(--success)", flexShrink: 0 }} />
                  ) : (
                    <Square size={20} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, textDecoration: item.completed ? "line-through" : "none", color: item.completed ? "var(--text-muted)" : "var(--text-primary)" }}>
                      {item.name}
                    </div>
                    <small style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{item.detail}</small>
                  </div>

                  <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.45rem", borderRadius: "10px", background: "rgba(59, 130, 246, 0.1)", color: "#3B82F6" }}>
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PM Section */}
        {(activeTab === "ALL" || activeTab === "PM") && (
          <div style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border-color)" }}>
              <h4 style={{ fontSize: "0.92rem", fontWeight: 800, color: "#6366F1", display: "flex", alignItems: "center", gap: "0.4rem", margin: 0 }}>
                <Moon size={16} /> Evening Routine (PM)
              </h4>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>
                {pmCompletedCount}/{pmList.length} Done
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {pmList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleTask(item.id, "PM")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.65rem 0.85rem",
                    background: item.completed ? "rgba(16, 185, 129, 0.08)" : "var(--card-bg)",
                    border: item.completed ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-color)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {item.completed ? (
                    <CheckCircle2 size={20} style={{ color: "var(--success)", flexShrink: 0 }} />
                  ) : (
                    <Square size={20} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, textDecoration: item.completed ? "line-through" : "none", color: item.completed ? "var(--text-muted)" : "var(--text-primary)" }}>
                      {item.name}
                    </div>
                    <small style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{item.detail}</small>
                  </div>

                  <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.45rem", borderRadius: "10px", background: "rgba(99, 102, 241, 0.1)", color: "#6366F1" }}>
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailySkincareChecklist;

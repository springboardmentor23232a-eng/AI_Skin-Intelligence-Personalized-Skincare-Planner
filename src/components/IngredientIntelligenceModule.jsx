import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { ShieldCheck, Search, Plus, Trash2, Zap, Sparkles } from "lucide-react";

const IngredientIntelligenceModule = ({ onToast }) => {
  const [ingredients, setIngredients] = useState([]);
  const [_conflicts, setConflicts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Multi-Ingredient Compatibility Audit state
  const [selectedIngredients, setSelectedIngredients] = useState([
    "Retinol (Vitamin A)", "Salicylic Acid (BHA)"
  ]);
  const [customInput, setCustomInput] = useState("");
  const [auditResult, setAuditResult] = useState(null);
  const [auditing, setAuditing] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const [ingRes, confRes] = await Promise.all([
          apiService.getIngredients(),
          apiService.getIngredientConflicts()
        ]);
        if (!ignore) {
          setIngredients(ingRes || []);
          setConflicts(confRes || []);
        }
      } catch (err) {
        console.warn("Could not load ingredients database:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    try {
      const res = await apiService.getIngredients(term);
      setIngredients(res || []);
    } catch (err) {
      console.warn("Error searching ingredients:", err);
    }
  };

  const handleAddIngredient = (name) => {
    if (!selectedIngredients.includes(name)) {
      setSelectedIngredients([...selectedIngredients, name]);
      if (onToast) onToast(`Added '${name}' to safety audit list.`);
    }
  };

  const handleRemoveIngredient = (name) => {
    setSelectedIngredients(selectedIngredients.filter(i => i !== name));
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (customInput.trim() && !selectedIngredients.includes(customInput.trim())) {
      setSelectedIngredients([...selectedIngredients, customInput.trim()]);
      setCustomInput("");
    }
  };

  const handleRunAudit = async () => {
    if (selectedIngredients.length < 2) {
      if (onToast) onToast("Please select at least 2 ingredients to analyze conflicts.");
      return;
    }
    setAuditing(true);
    try {
      const res = await apiService.analyzeIngredients({
        ingredients: selectedIngredients,
        skin_type: "Combination",
        skin_concerns: ["Acne", "Hyperpigmentation"]
      });
      setAuditResult(res);
      if (onToast) onToast("Ingredient compatibility audit completed!");
    } catch (err) {
      console.warn("Audit error:", err);
      if (onToast) onToast("Failed to run ingredient audit.");
    } finally {
      setAuditing(false);
    }
  };

  const getComedogenicBadge = (rating) => {
    if (rating === 0) return { label: "0 (Non-comedogenic)", color: "#10B981", bg: "rgba(16, 185, 129, 0.12)" };
    if (rating <= 2) return { label: `${rating} (Low Risk)`, color: "#3B82F6", bg: "rgba(59, 130, 246, 0.12)" };
    if (rating === 3) return { label: "3 (Moderate Risk)", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.12)" };
    return { label: `${rating} (Pore Clogger)`, color: "#EF4444", bg: "rgba(239, 68, 68, 0.12)" };
  };

  return (
    <div id="ingredients" className="glass-card" style={{ marginBottom: "2rem", padding: "1.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "0.6rem", margin: 0 }}>
            <span style={{ padding: "0.45rem", background: "rgba(16, 185, 129, 0.12)", borderRadius: "50%", color: "#10B981", display: "flex" }}>
              <ShieldCheck size={22} />
            </span>
            Ingredient Intelligence Engine
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0.25rem 0 0 0" }}>
            Search active cosmetic ingredients, audit comedogenic safety ratings, and run real-time conflict detection.
          </p>
        </div>

        <div className="input-with-icon" style={{ width: "240px" }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={handleSearch}
            style={{ padding: "0.5rem 0.75rem 0.5rem 2.2rem", fontSize: "0.85rem", borderRadius: "20px" }}
          />
        </div>
      </div>

      {/* Multi-Ingredient Conflict Audit Tool */}
      <div style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "1.25rem", marginBottom: "1.75rem" }}>
        <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 0.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Zap size={18} style={{ color: "var(--warning)" }} /> Routine Ingredient Interaction Checker
        </h4>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0 0 1rem 0" }}>
          Select or enter active ingredients to test for pairwise chemical conflicts, barrier irritation, and comedogenic risks.
        </p>

        {/* Active Selected Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
          {selectedIngredients.map((item) => (
            <span
              key={item}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                background: "var(--bg-surface)",
                border: "1px solid var(--primary-light)",
                color: "var(--primary)",
                padding: "0.3rem 0.65rem",
                borderRadius: "20px",
                fontSize: "0.78rem",
                fontWeight: 600
              }}
            >
              {item}
              <button
                onClick={() => handleRemoveIngredient(item)}
                style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: 0, display: "flex" }}
              >
                <Trash2 size={14} />
              </button>
            </span>
          ))}
        </div>

        {/* Custom Input Form & Audit Button */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <form onSubmit={handleAddCustom} style={{ display: "flex", gap: "0.5rem", flex: 1, minWidth: "220px" }}>
            <input
              type="text"
              placeholder="Add custom ingredient (e.g. Glycolic Acid)..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              style={{ flex: 1, padding: "0.45rem 0.75rem", fontSize: "0.82rem" }}
            />
            <button type="submit" className="btn btn-outline" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Plus size={14} /> Add
            </button>
          </form>

          <button
            onClick={handleRunAudit}
            disabled={auditing}
            className="btn btn-primary"
            style={{ padding: "0.45rem 1.25rem", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Sparkles size={16} /> {auditing ? "Auditing..." : "Run Compatibility Audit"}
          </button>
        </div>

        {/* Audit Results Panel */}
        {auditResult && (
          <div style={{ marginTop: "1.25rem", padding: "1rem", background: auditResult.overall_safety_rating === "HIGH_RISK" ? "rgba(239, 68, 68, 0.08)" : auditResult.overall_safety_rating === "CAUTION" ? "rgba(245, 158, 11, 0.08)" : "rgba(34, 197, 94, 0.08)", borderRadius: "var(--radius-sm)", border: `1px solid ${auditResult.overall_safety_rating === "HIGH_RISK" ? "rgba(239, 68, 68, 0.3)" : auditResult.overall_safety_rating === "CAUTION" ? "rgba(245, 158, 11, 0.3)" : "rgba(34, 197, 94, 0.3)"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <h5 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 800, color: auditResult.overall_safety_rating === "HIGH_RISK" ? "var(--danger)" : auditResult.overall_safety_rating === "CAUTION" ? "var(--warning)" : "var(--success)" }}>
                Status: {auditResult.overall_safety_rating}
              </h5>
              <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>Max Comedogenic Rating: {auditResult.max_comedogenic_rating} / 5</span>
            </div>
            <p style={{ fontSize: "0.82rem", margin: "0 0 0.75rem 0", color: "var(--text-primary)" }}>{auditResult.summary}</p>

            {auditResult.conflicts_found && auditResult.conflicts_found.length > 0 && (
              <div>
                <h6 style={{ fontSize: "0.8rem", fontWeight: 700, margin: "0 0 0.35rem 0", color: "var(--danger)" }}>Conflicts Detected:</h6>
                {auditResult.conflicts_found.map((c, i) => (
                  <div key={i} style={{ fontSize: "0.78rem", background: "var(--bg-surface)", padding: "0.5rem 0.75rem", borderRadius: "6px", marginBottom: "0.35rem", borderLeft: "3px solid var(--danger)" }}>
                    <strong>{c.ingredient_a} + {c.ingredient_b}</strong> ({c.severity} SEVERITY)
                    <p style={{ margin: "0.2rem 0 0 0", color: "var(--text-secondary)" }}>{c.warning_message}</p>
                    {c.recommendation && <small style={{ color: "var(--primary)", fontWeight: 600 }}>💡 Recommendation: {c.recommendation}</small>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ingredient Catalog Grid */}
      <h4 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem" }}>Ingredient Knowledge Catalog</h4>
      
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>Loading ingredient intelligence...</div>
      ) : ingredients.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>No ingredients found.</div>
      ) : (
        <div className="grid-layout grid-3-col">
          {ingredients.map((ing) => {
            const badge = getComedogenicBadge(ing.comedogenic_rating);
            return (
              <div
                key={ing.id}
                style={{
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  justify: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                    <h5 style={{ fontSize: "0.92rem", margin: 0, fontWeight: 800, color: "var(--text-primary)" }}>{ing.name}</h5>
                    <span style={{ fontSize: "0.65rem", fontWeight: 800, padding: "0.15rem 0.45rem", borderRadius: "10px", background: badge.bg, color: badge.color }}>
                      Comedogenic: {badge.label}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "var(--primary)", fontWeight: 700, background: "var(--primary-light)", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
                    {ing.category}
                  </span>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: "0.6rem 0 0.4rem 0" }}>{ing.description}</p>
                  <p style={{ fontSize: "0.74rem", color: "var(--success)", fontWeight: 600, margin: 0 }}>✨ Benefits: {ing.benefits}</p>
                </div>

                <div style={{ marginTop: "0.75rem", paddingTop: "0.5rem", borderTop: "1px dashed var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <small style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Target: {ing.target_concerns || "All"}</small>
                  <button
                    onClick={() => handleAddIngredient(ing.name)}
                    className="btn btn-outline"
                    style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "0.2rem" }}
                  >
                    <Plus size={12} /> Test
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IngredientIntelligenceModule;

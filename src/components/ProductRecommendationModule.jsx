import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import {
  ShoppingBag,
  Star,
  AlertTriangle,
  ExternalLink,
  Scale,
  Filter,
  Check,
  Zap,
  X,
  DollarSign,
  SlidersHorizontal,
  Tag,
  Info,
  Layers,
  RefreshCw,
  Terminal
} from "lucide-react";

const CATEGORIES = [
  { id: "ALL", label: "All Categories" },
  { id: "Face Wash", label: "Face Wash" },
  { id: "Moisturizer", label: "Moisturizer" },
  { id: "Sunscreen", label: "Sunscreen" },
  { id: "Serum", label: "Serum" },
  { id: "Toner", label: "Toner" },
  { id: "Treatment Products", label: "Treatment Products" },
  { id: "Face Masks", label: "Face Masks" }
];

const BUDGET_TIERS = [
  { id: "ALL", label: "All Prices" },
  { id: "BUDGET", label: "Budget Friendly (≤ ₹500)", maxPrice: 500 },
  { id: "MID", label: "Mid-Range (₹501 - ₹1,200)", minPrice: 501, maxPrice: 1200 },
  { id: "PREMIUM", label: "Premium (> ₹1,200)", minPrice: 1201 }
];

const SKIN_TYPES = ["Oily", "Dry", "Combination", "Sensitive", "Normal"];
const SKIN_CONCERNS = ["Acne", "Hyperpigmentation", "Enlarged Pores", "Redness", "Aging", "Dehydration", "Dullness", "Blackheads"];

const ProductRecommendationModule = ({ onToast }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting State
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedBudgetTier, setSelectedBudgetTier] = useState("ALL");
  const [sortBy, setSortBy] = useState("suitability");
  const [budgetOnly, setBudgetOnly] = useState(false);

  // Custom Skin Suitability Profiler State
  const [showProfilerModal, setShowProfilerModal] = useState(false);
  const [customSkinType, setCustomSkinType] = useState("Combination");
  const [customConcerns, setCustomConcerns] = useState(["Acne", "Enlarged Pores"]);

  // Product Comparison State
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [comparingLoading, setComparingLoading] = useState(false);

  // Alternative Products State
  const [showAlternativesModal, setShowAlternativesModal] = useState(false);
  const [targetProductForAlternatives, setTargetProductForAlternatives] = useState(null);
  const [alternativesList, setAlternativesList] = useState([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);

  const handleOpenAlternativesModal = async (product) => {
    setTargetProductForAlternatives(product);
    setShowAlternativesModal(true);
    setLoadingAlternatives(true);
    try {
      const alts = await apiService.getProductAlternatives(product.id);
      setAlternativesList(alts || []);
    } catch (err) {
      console.warn("Failed to fetch alternative products:", err);
      setAlternativesList([]);
    } finally {
      setLoadingAlternatives(false);
    }
  };


  useEffect(() => {
    let ignore = false;
    async function fetchProducts() {
      setLoading(true);
      try {
        let res;
        const params = {
          category: selectedCategory === "ALL" ? "" : selectedCategory,
          sort_by: sortBy,
          budget_only: budgetOnly || selectedBudgetTier === "BUDGET"
        };

        if (selectedBudgetTier === "MID") {
          params.max_price = 1200;
        } else if (selectedBudgetTier === "BUDGET") {
          params.max_price = 500;
        }

        if (customSkinType || customConcerns.length > 0) {
          res = await apiService.getCustomProductRecommendations({
            skin_type: customSkinType,
            skin_concerns: customConcerns,
            category: selectedCategory === "ALL" ? "" : selectedCategory
          }, params);
        } else {
          res = await apiService.getMyProductRecommendations(params);
        }

        if (!ignore) {
          let items = res || [];
          if (selectedBudgetTier === "MID") {
            items = items.filter(p => p.price > 500 && p.price <= 1200);
          } else if (selectedBudgetTier === "PREMIUM") {
            items = items.filter(p => p.price > 1200);
          }
          setRecommendations(items);
        }
      } catch (err) {
        console.warn("Error fetching product recommendations:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      ignore = true;
    };
  }, [selectedCategory, selectedBudgetTier, sortBy, budgetOnly, customSkinType, customConcerns]);

  // UPPER COMMAND HANDLER
  const handleExecuteCommand = async (commandType) => {
    switch (commandType) {
      case "AI_MATCH":
        if (onToast) onToast("⚡ Upper Command Executed: Recalibrating AI Suitability Scores...");
        setLoading(true);
        try {
          const res = await apiService.getCustomProductRecommendations({
            skin_type: customSkinType,
            skin_concerns: customConcerns,
            category: selectedCategory === "ALL" ? "" : selectedCategory
          }, { sort_by: "suitability" });
          setRecommendations(res || []);
          if (onToast) onToast("✔ Upper Command Complete: AI Suitability Matrix Updated!");
        } catch (_err) {
          if (onToast) onToast("ℹ AI Suitability scores refreshed.");
        } finally {
          setLoading(false);
        }
        break;

      case "BUDGET_PICK":
        setSelectedBudgetTier("BUDGET");
        setBudgetOnly(true);
        if (onToast) onToast("💰 Upper Command Executed: Budget-Friendly Filter (≤ ₹500) Applied!");
        break;

      case "FACEWASH":
        setSelectedCategory("Face Wash");
        if (onToast) onToast("🧴 Upper Command Executed: Loaded Face Wash Product Recommendations!");
        break;

      case "FACEMASK":
        setSelectedCategory("Face Masks");
        if (onToast) onToast("🧖 Upper Command Executed: Loaded Face Masks Product Recommendations!");
        break;

      case "TONER":
        setSelectedCategory("Toner");
        if (onToast) onToast("💧 Upper Command Executed: Loaded Toner Product Recommendations!");
        break;

      case "TREATMENT":
        setSelectedCategory("Treatment Products");
        if (onToast) onToast("🧪 Upper Command Executed: Loaded Treatment Products Recommendations!");
        break;

      case "COMPARE":
        if (selectedForCompare.length >= 2) {
          handleOpenComparisonModal();
          if (onToast) onToast("⚖️ Upper Command Executed: Side-by-Side Product Comparison Matrix Launched!");
        } else if (recommendations.length >= 2) {
          const autoSelect = recommendations.slice(0, 2);
          setSelectedForCompare(autoSelect);
          if (onToast) onToast(`⚖️ Upper Command Executed: Auto-selected '${autoSelect[0].name}' & '${autoSelect[1].name}' for comparison!`);
          setTimeout(() => {
            handleOpenComparisonModalWithItems(autoSelect);
          }, 200);
        } else {
          if (onToast) onToast("ℹ Please select products to compare.");
        }
        break;

      case "RESET":
        setSelectedCategory("ALL");
        setSelectedBudgetTier("ALL");
        setBudgetOnly(false);
        setSortBy("suitability");
        setSelectedForCompare([]);
        setCustomSkinType("Combination");
        setCustomConcerns(["Acne", "Enlarged Pores"]);
        if (onToast) onToast("🔄 Upper Command Executed: Reset All Product Engine Commands & Filters!");
        break;

      default:
        break;
    }
  };

  const handleOpenComparisonModalWithItems = async (itemsList) => {
    setComparingLoading(true);
    setShowCompareModal(true);
    try {
      const ids = itemsList.map(p => p.id);
      const res = await apiService.compareProducts(ids, customSkinType, customConcerns);
      setComparisonData(res);
    } catch (_err) {
      const items = itemsList;
      const bestOverall = [...items].sort((a, b) => b.match_score - a.match_score)[0];
      const budgetCandidates = items.filter(p => p.price <= 500);
      const bestBudget = budgetCandidates.length > 0
        ? [...budgetCandidates].sort((a, b) => b.match_score - a.match_score)[0]
        : [...items].sort((a, b) => a.price - b.price)[0];

      setComparisonData({
        products: items,
        best_overall_id: bestOverall?.id,
        best_budget_id: bestBudget?.id,
        comparison_summary: `Compared ${items.length} products. '${bestOverall?.brand} ${bestOverall?.name}' offers top suitability (${bestOverall?.match_score}%). '${bestBudget?.brand} ${bestBudget?.name}' is top budget pick.`
      });
    } finally {
      setComparingLoading(false);
    }
  };

  const toggleCompareSelection = (product) => {
    if (selectedForCompare.some(p => p.id === product.id)) {
      setSelectedForCompare(prev => prev.filter(p => p.id !== product.id));
      if (onToast) onToast(`Removed '${product.name}' from comparison tray.`);
    } else {
      if (selectedForCompare.length >= 4) {
        if (onToast) onToast("⚠️ Maximum 4 products can be compared side-by-side at once.");
        return;
      }
      setSelectedForCompare(prev => [...prev, product]);
      if (onToast) onToast(`Added '${product.name}' to comparison tray.`);
    }
  };

  const handleOpenComparisonModal = () => {
    handleOpenComparisonModalWithItems(selectedForCompare);
  };

  const toggleConcern = (concern) => {
    setCustomConcerns(prev =>
      prev.includes(concern) ? prev.filter(c => c !== concern) : [...prev, concern]
    );
  };

  const getMatchBadgeStyle = (level) => {
    if (level === "EXCELLENT_MATCH") return { bg: "rgba(34, 197, 94, 0.14)", color: "#10B981", border: "1px solid rgba(34, 197, 94, 0.35)", label: "EXCELLENT" };
    if (level === "GOOD_MATCH") return { bg: "rgba(59, 130, 246, 0.14)", color: "#3B82F6", border: "1px solid rgba(59, 130, 246, 0.35)", label: "GOOD MATCH" };
    return { bg: "rgba(245, 158, 11, 0.14)", color: "#F59E0B", border: "1px solid rgba(245, 158, 11, 0.35)", label: "MODERATE" };
  };

  return (
    <div id="products" className="glass-card" style={{ marginBottom: "2rem", padding: "1.75rem", position: "relative" }}>
      
      {/* UPPER COMMAND CENTER / ENGINE CONTROL TOOLBAR */}
      <div
        id="product-command-bar"
        className="upper-command-bar"
        style={{
          background: "linear-gradient(135deg, rgba(124, 58, 237, 0.12), rgba(16, 185, 129, 0.12))",
          border: "1px solid rgba(124, 58, 237, 0.3)",
          borderRadius: "var(--radius-md)",
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.85rem"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ padding: "0.35rem 0.65rem", background: "var(--accent)", color: "#ffffff", borderRadius: "12px", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Terminal size={14} /> UPPER COMMAND CENTER
            </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Product Recommendation Control Commands
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", color: "var(--success)", fontWeight: 700 }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }}></span>
            ENGINE COMMAND STATUS: ACTIVE (v2.4)
          </div>
        </div>

        {/* Command Action Buttons */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => handleExecuteCommand("AI_MATCH")}
            className="btn"
            style={{ padding: "0.38rem 0.75rem", fontSize: "0.76rem", fontWeight: 700, background: "var(--primary)", color: "#fff", border: "none", borderRadius: "15px", display: "flex", alignItems: "center", gap: "0.35rem" }}
            title="Execute Upper Command to run AI suitability match matrix"
          >
            <Zap size={14} /> Command: Run AI Match Engine
          </button>

          <button
            onClick={() => handleExecuteCommand("BUDGET_PICK")}
            className="btn"
            style={{ padding: "0.38rem 0.75rem", fontSize: "0.76rem", fontWeight: 700, background: "rgba(34, 197, 94, 0.15)", color: "#10B981", border: "1px solid #10B981", borderRadius: "15px", display: "flex", alignItems: "center", gap: "0.35rem" }}
            title="Execute Upper Command to filter budget-friendly products under ₹500"
          >
            <DollarSign size={14} /> Command: Budget Friendly (≤ ₹500)
          </button>

          <button
            onClick={() => handleExecuteCommand("FACEWASH")}
            className="btn"
            style={{ padding: "0.38rem 0.75rem", fontSize: "0.76rem", fontWeight: 700, background: "rgba(59, 130, 246, 0.15)", color: "#3B82F6", border: "1px solid #3B82F6", borderRadius: "15px", display: "flex", alignItems: "center", gap: "0.35rem" }}
            title="Execute Upper Command for Face Wash Category"
          >
            🧴 Command: Face Wash
          </button>

          <button
            onClick={() => handleExecuteCommand("FACEMASK")}
            className="btn"
            style={{ padding: "0.38rem 0.75rem", fontSize: "0.76rem", fontWeight: 700, background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", border: "1px solid #F59E0B", borderRadius: "15px", display: "flex", alignItems: "center", gap: "0.35rem" }}
            title="Execute Upper Command for Face Masks Category"
          >
            🧖 Command: Face Masks
          </button>

          <button
            onClick={() => handleExecuteCommand("TONER")}
            className="btn"
            style={{ padding: "0.38rem 0.75rem", fontSize: "0.76rem", fontWeight: 700, background: "rgba(6, 182, 212, 0.15)", color: "#06B6D4", border: "1px solid #06B6D4", borderRadius: "15px", display: "flex", alignItems: "center", gap: "0.35rem" }}
            title="Execute Upper Command for Toner Category"
          >
            💧 Command: Toner
          </button>

          <button
            onClick={() => handleExecuteCommand("TREATMENT")}
            className="btn"
            style={{ padding: "0.38rem 0.75rem", fontSize: "0.76rem", fontWeight: 700, background: "rgba(236, 72, 153, 0.15)", color: "#EC4899", border: "1px solid #EC4899", borderRadius: "15px", display: "flex", alignItems: "center", gap: "0.35rem" }}
            title="Execute Upper Command for Treatment Products Category"
          >
            🧪 Command: Treatment
          </button>

          <button
            onClick={() => handleExecuteCommand("COMPARE")}
            className="btn"
            style={{ padding: "0.38rem 0.75rem", fontSize: "0.76rem", fontWeight: 700, background: "rgba(139, 92, 246, 0.15)", color: "var(--accent)", border: "1px solid var(--accent)", borderRadius: "15px", display: "flex", alignItems: "center", gap: "0.35rem" }}
            title="Execute Upper Command for Side-by-Side Product Comparison"
          >
            <Scale size={14} /> Command: Side-by-Side Compare
          </button>

          <button
            onClick={() => handleExecuteCommand("RESET")}
            className="btn btn-outline"
            style={{ padding: "0.38rem 0.75rem", fontSize: "0.76rem", fontWeight: 600, borderRadius: "15px", display: "flex", alignItems: "center", gap: "0.35rem" }}
            title="Reset engine commands & parameters"
          >
            <RefreshCw size={14} /> Reset Commands
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ fontSize: "1.35rem", display: "flex", alignItems: "center", gap: "0.6rem", margin: 0, fontWeight: 800 }}>
            <span style={{ padding: "0.5rem", background: "rgba(139, 92, 246, 0.14)", borderRadius: "50%", color: "var(--accent)", display: "flex" }}>
              <ShoppingBag size={22} />
            </span>
            Product Discovery &amp; Suitability Engine
          </h3>
          <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", margin: "0.3rem 0 0 0" }}>
            AI-driven suitability scoring, budget-friendly recommendations, direct shopping links (Nykaa &amp; Amazon), and side-by-side product comparison.
          </p>
        </div>

        {/* Profiler Button & Compare Action Counter */}
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <button
            onClick={() => setShowProfilerModal(true)}
            className="btn btn-outline"
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem", borderRadius: "20px" }}
          >
            <SlidersHorizontal size={14} /> Adjust Suitability Profile
          </button>

          {selectedForCompare.length > 0 && (
            <button
              onClick={handleOpenComparisonModal}
              className="btn btn-primary"
              style={{
                padding: "0.45rem 0.9rem",
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                borderRadius: "20px",
                boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)"
              }}
            >
              <Scale size={15} /> Compare ({selectedForCompare.length}/4)
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Choice Row */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Layers size={14} /> SELECT PRODUCT CATEGORY:
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="btn"
              style={{
                padding: "0.38rem 0.85rem",
                fontSize: "0.78rem",
                fontWeight: 700,
                background: selectedCategory === cat.id ? "var(--primary)" : "var(--input-bg)",
                color: selectedCategory === cat.id ? "#ffffff" : "var(--text-secondary)",
                borderColor: selectedCategory === cat.id ? "var(--primary)" : "var(--border-color)",
                borderRadius: "20px",
                transition: "all 0.2s ease"
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Budget Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.85rem 1rem",
          background: "var(--input-bg)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-color)",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        {/* Budget Tiers & Quick Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <DollarSign size={15} style={{ color: "var(--success)" }} /> Budget Filter:
          </span>

          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
            {BUDGET_TIERS.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setSelectedBudgetTier(tier.id)}
                className="btn"
                style={{
                  padding: "0.25rem 0.65rem",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  background: selectedBudgetTier === tier.id ? "rgba(34, 197, 94, 0.15)" : "var(--bg-surface)",
                  color: selectedBudgetTier === tier.id ? "#10B981" : "var(--text-secondary)",
                  border: selectedBudgetTier === tier.id ? "1px solid #10B981" : "1px solid var(--border-color)",
                  borderRadius: "15px"
                }}
              >
                {tier.label}
              </button>
            ))}
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", marginLeft: "0.5rem" }}>
            <input
              type="checkbox"
              checked={budgetOnly}
              onChange={(e) => setBudgetOnly(e.target.checked)}
              style={{ width: "15px", height: "15px", accentColor: "var(--success)" }}
            />
            <span style={{ color: "var(--success)" }}>💰 Budget Picks Only (≤ ₹500)</span>
          </label>
        </div>

        {/* Sort Options */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Filter size={14} /> Sort By:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "0.3rem 0.65rem",
              fontSize: "0.78rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
              fontWeight: 600
            }}
          >
            <option value="suitability">Highest Suitability Score</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
          </select>
        </div>
      </div>

      {/* Active Suitability Filter Indicator Bar */}
      {(customSkinType || customConcerns.length > 0) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justify: "space-between",
            padding: "0.5rem 0.85rem",
            background: "rgba(139, 92, 246, 0.08)",
            border: "1px solid rgba(139, 92, 246, 0.25)",
            borderRadius: "var(--radius-sm)",
            marginBottom: "1.25rem",
            fontSize: "0.78rem",
            color: "var(--accent)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <Zap size={15} />
            <span><strong>Target Skin Profile:</strong> Skin Type: <em>{customSkinType}</em> | Concerns: <em>{customConcerns.join(", ") || "General"}</em></span>
          </div>
          <button
            onClick={() => {
              setCustomSkinType("Combination");
              setCustomConcerns(["Acne", "Enlarged Pores"]);
            }}
            style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "0.72rem", textDecoration: "underline", fontWeight: 700 }}
          >
            Reset Profile
          </button>
        </div>
      )}

      {/* Product List Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Calculating suitability scores &amp; budget options...
        </div>
      ) : recommendations.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          <Info size={32} style={{ marginBottom: "0.5rem", color: "var(--text-muted)" }} />
          <div>No products match the selected category &amp; budget criteria.</div>
          <button
            onClick={() => {
              setSelectedCategory("ALL");
              setSelectedBudgetTier("ALL");
              setBudgetOnly(false);
            }}
            className="btn btn-outline"
            style={{ marginTop: "1rem", fontSize: "0.8rem", padding: "0.4rem 0.85rem" }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid-layout grid-4-col">
          {recommendations.map((prod) => {
            const badgeStyle = getMatchBadgeStyle(prod.match_level);
            const isSelected = selectedForCompare.some(p => p.id === prod.id);

            return (
              <div
                key={prod.id}
                className="product-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justify: "space-between",
                  border: isSelected ? "2px solid var(--accent)" : "1px solid var(--border-color)",
                  boxShadow: isSelected ? "0 4px 16px rgba(139, 92, 246, 0.25)" : "none",
                  transition: "all 0.25 ease",
                  position: "relative"
                }}
              >
                <div>
                  {/* Product Image & Badges Overlay */}
                  <div className="product-image-wrap" style={{ position: "relative" }}>
                    <img src={prod.image_url || "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300"} alt={prod.name} />

                    {/* Match Score Badge */}
                    <span
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: badgeStyle.bg,
                        color: badgeStyle.color,
                        border: badgeStyle.border,
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        padding: "0.2rem 0.55rem",
                        borderRadius: "12px",
                        backdropFilter: "blur(6px)"
                      }}
                    >
                      ⚡ {prod.match_score}% SUITABILITY
                    </span>

                    {/* Budget Pick Badge */}
                    {prod.is_budget_friendly && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: "8px",
                          left: "8px",
                          background: "rgba(34, 197, 94, 0.9)",
                          color: "#ffffff",
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          padding: "0.18rem 0.5rem",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          gap: "3px"
                        }}
                      >
                        <Tag size={10} /> BUDGET PICK
                      </span>
                    )}

                    {/* Compare Select Checkbox Badge */}
                    <button
                      onClick={() => toggleCompareSelection(prod)}
                      title={isSelected ? "Remove from comparison" : "Select for side-by-side comparison"}
                      style={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        background: isSelected ? "var(--accent)" : "rgba(0, 0, 0, 0.6)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "50%",
                        width: "26px",
                        height: "26px",
                        display: "flex",
                        alignItems: "center",
                        justify: "center",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {isSelected ? <Check size={14} /> : <Scale size={13} />}
                    </button>
                  </div>

                  {/* Details Section */}
                  <div style={{ marginTop: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="product-brand">{prod.brand}</span>
                      <span style={{ fontSize: "0.65rem", background: "var(--input-bg)", color: "var(--text-muted)", padding: "0.1rem 0.4rem", borderRadius: "8px" }}>
                        {prod.category}
                      </span>
                    </div>

                    <h4 className="product-title" style={{ fontSize: "0.92rem", marginBottom: "0.25rem" }}>{prod.name}</h4>

                    <div style={{ fontSize: "0.73rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                      <strong>Skin Type:</strong> {prod.target_skin_types}
                    </div>

                    {/* Matched Concerns Chips */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.5rem" }}>
                      {prod.matched_concerns.map((mc, idx) => (
                        <span key={idx} style={{ fontSize: "0.64rem", background: "var(--primary-light)", color: "var(--primary)", padding: "0.1rem 0.4rem", borderRadius: "10px", fontWeight: 600 }}>
                          ✓ {mc}
                        </span>
                      ))}
                    </div>

                    {/* Active Ingredients preview */}
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.5rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      🧪 <em>{prod.active_ingredients}</em>
                    </div>

                    {/* Safety Alert */}
                    {prod.safety_warnings && prod.safety_warnings.length > 0 && (
                      <div style={{ fontSize: "0.68rem", color: "var(--warning)", background: "rgba(245, 158, 11, 0.1)", padding: "0.35rem 0.5rem", borderRadius: "4px", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <AlertTriangle size={12} style={{ flexShrink: 0 }} /> {prod.safety_warnings[0]}
                      </div>
                    )}

                    {/* Rating */}
                    <div style={{ fontSize: "0.78rem", color: "var(--warning)", fontWeight: 700, marginBottom: "0.65rem", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Star size={13} fill="currentColor" /> {prod.rating} <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>({prod.reviews_count} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Footer with Price & Shopping Links */}
                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                    <div>
                      <span className="product-price" style={{ fontSize: "1.1rem" }}>₹{prod.price}</span>
                      {prod.is_budget_friendly && (
                        <span style={{ fontSize: "0.65rem", color: "var(--success)", fontWeight: 800, marginLeft: "0.35rem" }}>
                          VALUE PICK
                        </span>
                      )}
                    </div>

                    {/* Checkbox Compare Toggle */}
                    <label style={{ fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer", color: isSelected ? "var(--accent)" : "var(--text-muted)", fontWeight: isSelected ? 700 : 500 }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCompareSelection(prod)}
                        style={{ accentColor: "var(--accent)" }}
                      />
                      Compare
                    </label>
                  </div>

                  {/* Dual Shopping Links: Nykaa & Amazon */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                    <a
                      href={prod.nykaa_url || `https://www.nykaa.com/search/result/?q=${encodeURIComponent(prod.brand + ' ' + prod.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn"
                      style={{
                        padding: "0.35rem 0.4rem",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        background: "#fc2779",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justify: "center",
                        gap: "0.25rem",
                        textDecoration: "none"
                      }}
                    >
                      🛍️ Nykaa <ExternalLink size={10} />
                    </a>

                    <a
                      href={prod.amazon_url || `https://www.amazon.in/s?k=${encodeURIComponent(prod.brand + ' ' + prod.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn"
                      style={{
                        padding: "0.35rem 0.4rem",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        background: "#ff9900",
                        color: "#111111",
                        border: "none",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justify: "center",
                        gap: "0.25rem",
                        textDecoration: "none"
                      }}
                    >
                      📦 Amazon <ExternalLink size={10} />
                    </a>
                  </div>

                  {/* Find Alternatives Action Button */}
                  <button
                    onClick={() => handleOpenAlternativesModal(prod)}
                    className="btn btn-outline"
                    style={{
                      width: "100%",
                      marginTop: "0.45rem",
                      padding: "0.32rem",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "var(--accent)",
                      borderColor: "var(--accent)",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.3rem",
                      background: "rgba(139, 92, 246, 0.05)"
                    }}
                  >
                    <RefreshCw size={12} /> Find Alternatives
                  </button>
                </div>
              </div>
            );

          })}
        </div>
      )}

      {/* Floating Compare Action Tray */}
      {selectedForCompare.length > 0 && (
        <div
          style={{
            position: "sticky",
            bottom: "20px",
            zIndex: 900,
            marginTop: "1.5rem",
            background: "var(--bg-surface)",
            border: "2px solid var(--accent)",
            borderRadius: "var(--radius-md)",
            padding: "0.85rem 1.25rem",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
            display: "flex",
            justify: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            backdropFilter: "blur(10px)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Scale size={18} style={{ color: "var(--accent)" }} />
              Product Comparison Tray ({selectedForCompare.length}/4 Selected)
            </span>

            {/* Thumbnail Pills */}
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {selectedForCompare.map((item) => (
                <span
                  key={item.id}
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-color)",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}
                >
                  {item.name.substring(0, 16)}...
                  <X
                    size={12}
                    style={{ cursor: "pointer", color: "var(--danger)" }}
                    onClick={() => toggleCompareSelection(item)}
                  />
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setSelectedForCompare([])}
              className="btn btn-outline"
              style={{ padding: "0.4rem 0.75rem", fontSize: "0.78rem" }}
            >
              Clear All
            </button>
            <button
              onClick={handleOpenComparisonModal}
              className="btn btn-primary"
              style={{ padding: "0.4rem 1rem", fontSize: "0.82rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              Compare Side-by-Side →
            </button>
          </div>
        </div>
      )}

      {/* Adjust Suitability Profile Modal */}
      {showProfilerModal && (
        <div className="modal-backdrop" style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="glass-card" style={{ maxWidth: "520px", width: "90%", padding: "1.75rem", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <SlidersHorizontal size={18} style={{ color: "var(--accent)" }} /> Adjust Skin Suitability Profile
              </h3>
              <button onClick={() => setShowProfilerModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
              Customize your target skin profile to re-evaluate suitability scoring across all product categories.
            </p>

            {/* Skin Type Selection */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "0.5rem" }}>
                Select Your Skin Type:
              </label>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {SKIN_TYPES.map((st) => (
                  <button
                    key={st}
                    onClick={() => setCustomSkinType(st)}
                    className="btn"
                    style={{
                      padding: "0.35rem 0.75rem",
                      fontSize: "0.78rem",
                      background: customSkinType === st ? "var(--primary)" : "var(--input-bg)",
                      color: customSkinType === st ? "#fff" : "var(--text-secondary)",
                      borderColor: customSkinType === st ? "var(--primary)" : "var(--border-color)",
                      borderRadius: "15px"
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Concerns Selection */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "0.5rem" }}>
                Select Skin Concerns:
              </label>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {SKIN_CONCERNS.map((sc) => {
                  const isChecked = customConcerns.includes(sc);
                  return (
                    <button
                      key={sc}
                      onClick={() => toggleConcern(sc)}
                      className="btn"
                      style={{
                        padding: "0.3rem 0.65rem",
                        fontSize: "0.75rem",
                        background: isChecked ? "rgba(139, 92, 246, 0.15)" : "var(--input-bg)",
                        color: isChecked ? "var(--accent)" : "var(--text-secondary)",
                        border: isChecked ? "1px solid var(--accent)" : "1px solid var(--border-color)",
                        borderRadius: "12px"
                      }}
                    >
                      {isChecked ? "✓ " : "+ "} {sc}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                setShowProfilerModal(false);
                if (onToast) onToast("✔ Re-calculated suitability scores for your updated profile!");
              }}
              className="btn btn-primary btn-block"
              style={{ padding: "0.55rem", fontSize: "0.85rem", fontWeight: 700 }}
            >
              Apply Profile &amp; Calculate Scores
            </button>
          </div>
        </div>
      )}

      {/* Side-by-Side Product Comparison Modal */}
      {showCompareModal && (
        <div className="modal-backdrop" style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(6px)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div
            className="glass-card"
            style={{
              maxWidth: "1100px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.75rem",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-color)"
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Scale size={20} style={{ color: "var(--accent)" }} /> Side-by-Side Product Comparison
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0.2rem 0 0 0" }}>
                  Detailed comparative breakdown of suitability match, active ingredients, budget metrics, and shopping options.
                </p>
              </div>
              <button onClick={() => setShowCompareModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={22} />
              </button>
            </div>

            {comparingLoading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                Generating comparative suitability matrix...
              </div>
            ) : comparisonData && comparisonData.products.length > 0 ? (
              <div>
                {/* Summary Banner */}
                {comparisonData.comparison_summary && (
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      background: "rgba(139, 92, 246, 0.1)",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.82rem",
                      color: "var(--accent)",
                      fontWeight: 600,
                      marginBottom: "1.25rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}
                  >
                    <Info size={16} style={{ flexShrink: 0 }} /> {comparisonData.comparison_summary}
                  </div>
                )}

                {/* Comparison Grid Table */}
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
                    <thead>
                      <tr>
                        <th style={{ padding: "0.75rem", textAlign: "left", background: "var(--input-bg)", width: "160px", fontSize: "0.78rem", color: "var(--text-muted)" }}>FEATURES</th>
                        {comparisonData.products.map((prod) => {
                          const isBestOverall = prod.id === comparisonData.best_overall_id;
                          const isBestBudget = prod.id === comparisonData.best_budget_id;
                          return (
                            <th key={prod.id} style={{ padding: "0.75rem", textAlign: "center", background: "var(--input-bg)", borderLeft: "1px solid var(--border-color)" }}>
                              {isBestOverall && (
                                <span style={{ display: "inline-block", background: "rgba(34, 197, 94, 0.18)", color: "#10B981", fontSize: "0.62rem", fontWeight: 800, padding: "0.15rem 0.5rem", borderRadius: "10px", marginBottom: "0.3rem" }}>
                                  🏆 BEST OVERALL MATCH
                                </span>
                              )}
                              {isBestBudget && !isBestOverall && (
                                <span style={{ display: "inline-block", background: "rgba(245, 158, 11, 0.18)", color: "#F59E0B", fontSize: "0.62rem", fontWeight: 800, padding: "0.15rem 0.5rem", borderRadius: "10px", marginBottom: "0.3rem" }}>
                                  💰 BEST BUDGET PICK
                                </span>
                              )}
                              <img src={prod.image_url} alt={prod.name} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", margin: "0 auto 0.4rem display: block" }} />
                              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>{prod.brand}</div>
                              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>{prod.name}</div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Price Row */}
                      <tr>
                        <td style={{ padding: "0.75rem", fontWeight: 700, fontSize: "0.8rem", borderBottom: "1px solid var(--border-color)" }}>Price</td>
                        {comparisonData.products.map((prod) => (
                          <td key={prod.id} style={{ padding: "0.75rem", textAlign: "center", borderBottom: "1px solid var(--border-color)", borderLeft: "1px solid var(--border-color)" }}>
                            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>₹{prod.price}</div>
                            {prod.is_budget_friendly && <span style={{ fontSize: "0.65rem", color: "var(--success)", fontWeight: 800 }}>≤ ₹500 Budget Option</span>}
                          </td>
                        ))}
                      </tr>

                      {/* Suitability Score Row */}
                      <tr>
                        <td style={{ padding: "0.75rem", fontWeight: 700, fontSize: "0.8rem", borderBottom: "1px solid var(--border-color)" }}>Suitability Score</td>
                        {comparisonData.products.map((prod) => (
                          <td key={prod.id} style={{ padding: "0.75rem", textAlign: "center", borderBottom: "1px solid var(--border-color)", borderLeft: "1px solid var(--border-color)" }}>
                            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: prod.match_score >= 85 ? "#10B981" : "#3B82F6" }}>
                              ⚡ {prod.match_score}%
                            </div>
                            <div style={{ width: "80%", margin: "0.3rem auto 0", height: "6px", background: "var(--border-color)", borderRadius: "3px" }}>
                              <div style={{ width: `${prod.match_score}%`, height: "100%", background: prod.match_score >= 85 ? "#10B981" : "#3B82F6", borderRadius: "3px" }}></div>
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Category Row */}
                      <tr>
                        <td style={{ padding: "0.75rem", fontWeight: 700, fontSize: "0.8rem", borderBottom: "1px solid var(--border-color)" }}>Category</td>
                        {comparisonData.products.map((prod) => (
                          <td key={prod.id} style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.8rem", borderBottom: "1px solid var(--border-color)", borderLeft: "1px solid var(--border-color)" }}>
                            {prod.category}
                          </td>
                        ))}
                      </tr>

                      {/* Target Skin Types Row */}
                      <tr>
                        <td style={{ padding: "0.75rem", fontWeight: 700, fontSize: "0.8rem", borderBottom: "1px solid var(--border-color)" }}>Target Skin Types</td>
                        {comparisonData.products.map((prod) => (
                          <td key={prod.id} style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.78rem", borderBottom: "1px solid var(--border-color)", borderLeft: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                            {prod.target_skin_types}
                          </td>
                        ))}
                      </tr>

                      {/* Matched Concerns Row */}
                      <tr>
                        <td style={{ padding: "0.75rem", fontWeight: 700, fontSize: "0.8rem", borderBottom: "1px solid var(--border-color)" }}>Matched Concerns</td>
                        {comparisonData.products.map((prod) => (
                          <td key={prod.id} style={{ padding: "0.75rem", textAlign: "center", borderBottom: "1px solid var(--border-color)", borderLeft: "1px solid var(--border-color)" }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem", justifyContent: "center" }}>
                              {prod.matched_concerns.map((mc, idx) => (
                                <span key={idx} style={{ fontSize: "0.65rem", background: "var(--primary-light)", color: "var(--primary)", padding: "0.1rem 0.4rem", borderRadius: "8px", fontWeight: 600 }}>
                                  ✓ {mc}
                                </span>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Active Ingredients Row */}
                      <tr>
                        <td style={{ padding: "0.75rem", fontWeight: 700, fontSize: "0.8rem", borderBottom: "1px solid var(--border-color)" }}>Active Ingredients</td>
                        {comparisonData.products.map((prod) => (
                          <td key={prod.id} style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.75rem", borderBottom: "1px solid var(--border-color)", borderLeft: "1px solid var(--border-color)" }}>
                            🧪 {prod.active_ingredients}
                          </td>
                        ))}
                      </tr>

                      {/* Safety Alerts Row */}
                      <tr>
                        <td style={{ padding: "0.75rem", fontWeight: 700, fontSize: "0.8rem", borderBottom: "1px solid var(--border-color)" }}>Safety Warnings</td>
                        {comparisonData.products.map((prod) => (
                          <td key={prod.id} style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.72rem", borderBottom: "1px solid var(--border-color)", borderLeft: "1px solid var(--border-color)" }}>
                            {prod.safety_warnings && prod.safety_warnings.length > 0 ? (
                              <span style={{ color: "var(--warning)" }}>⚠️ {prod.safety_warnings[0]}</span>
                            ) : (
                              <span style={{ color: "var(--success)" }}>✓ Patch test safe</span>
                            )}
                          </td>
                        ))}
                      </tr>

                      {/* Rating Row */}
                      <tr>
                        <td style={{ padding: "0.75rem", fontWeight: 700, fontSize: "0.8rem", borderBottom: "1px solid var(--border-color)" }}>Rating &amp; Reviews</td>
                        {comparisonData.products.map((prod) => (
                          <td key={prod.id} style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.8rem", borderBottom: "1px solid var(--border-color)", borderLeft: "1px solid var(--border-color)" }}>
                            ⭐ {prod.rating} / 5 ({prod.reviews_count} reviews)
                          </td>
                        ))}
                      </tr>

                      {/* Buy Links Row */}
                      <tr>
                        <td style={{ padding: "0.75rem", fontWeight: 700, fontSize: "0.8rem" }}>Direct Purchase</td>
                        {comparisonData.products.map((prod) => (
                          <td key={prod.id} style={{ padding: "0.75rem", borderLeft: "1px solid var(--border-color)" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                              <a
                                href={prod.nykaa_url || `https://www.nykaa.com/search/result/?q=${encodeURIComponent(prod.brand + ' ' + prod.name)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn"
                                style={{ padding: "0.35rem", fontSize: "0.72rem", fontWeight: 700, background: "#fc2779", color: "#fff", border: "none", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}
                              >
                                Buy on Nykaa 🛍️
                              </a>
                              <a
                                href={prod.amazon_url || `https://www.amazon.in/s?k=${encodeURIComponent(prod.brand + ' ' + prod.name)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn"
                                style={{ padding: "0.35rem", fontSize: "0.72rem", fontWeight: 700, background: "#ff9900", color: "#111", border: "none", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}
                              >
                                Buy on Amazon 📦
                              </a>
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                No comparison details available.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alternative Products Suggestion Modal */}
      {showAlternativesModal && targetProductForAlternatives && (
        <div className="modal-backdrop" style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(6px)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div
            className="glass-card"
            style={{
              maxWidth: "850px",
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "1.75rem",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-color)"
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <RefreshCw size={18} style={{ color: "var(--accent)" }} /> Alternative Product Suggestions
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0.2rem 0 0 0" }}>
                  Budget-friendly and high-suitability substitutes for <strong>{targetProductForAlternatives.brand} {targetProductForAlternatives.name}</strong> (₹{targetProductForAlternatives.price}).
                </p>
              </div>
              <button onClick={() => setShowAlternativesModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={22} />
              </button>
            </div>

            {loadingAlternatives ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                Fetching matching alternatives &amp; budget options...
              </div>
            ) : alternativesList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                No alternative products found in this category.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {alternativesList.map((alt) => {
                  const priceDiff = targetProductForAlternatives.price - alt.price;
                  const isCheaper = priceDiff > 0;

                  return (
                    <div
                      key={alt.id}
                      style={{
                        display: "flex",
                        gap: "1rem",
                        padding: "1rem",
                        borderRadius: "8px",
                        background: "var(--input-bg)",
                        border: "1px solid var(--border-color)",
                        alignItems: "center"
                      }}
                    >
                      <img
                        src={alt.image_url || "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300"}
                        alt={alt.name}
                        style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "8px" }}
                      />

                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{alt.brand}</span>
                          {isCheaper && (
                            <span style={{ fontSize: "0.65rem", background: "rgba(34, 197, 94, 0.2)", color: "#10B981", padding: "0.15rem 0.45rem", borderRadius: "8px", fontWeight: 800 }}>
                              💰 ₹{Math.abs(priceDiff).toFixed(0)} CHEAPER
                            </span>
                          )}
                          {alt.is_budget_friendly && (
                            <span style={{ fontSize: "0.65rem", background: "rgba(245, 158, 11, 0.2)", color: "#F59E0B", padding: "0.15rem 0.45rem", borderRadius: "8px", fontWeight: 800 }}>
                              VALUE PICK
                            </span>
                          )}
                        </div>

                        <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "0.95rem" }}>{alt.name}</h4>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                          🧪 <em>{alt.active_ingredients}</em>
                        </div>

                        <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          <span>⚡ Suitability: <strong style={{ color: "var(--accent)" }}>{alt.match_score}%</strong></span>
                          <span>⭐ Rating: <strong>{alt.rating}</strong> ({alt.reviews_count})</span>
                        </div>
                      </div>

                      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "0.4rem", minWidth: "140px" }}>
                        <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)" }}>₹{alt.price}</div>
                        <button
                          onClick={() => {
                            setShowAlternativesModal(false);
                            setSelectedForCompare([targetProductForAlternatives, alt]);
                            setShowCompareModal(true);
                            apiService.compareProducts(
                              [targetProductForAlternatives.id, alt.id],
                              customSkinType,
                              customConcerns
                            ).then(res => setComparisonData(res));
                          }}
                          className="btn btn-outline"
                          style={{ fontSize: "0.72rem", padding: "0.3rem 0.5rem", fontWeight: 700, borderColor: "var(--accent)", color: "var(--accent)" }}
                        >
                          Scale Compare ⚖️
                        </button>
                        <a
                          href={alt.nykaa_url || `https://www.nykaa.com/search/result/?q=${encodeURIComponent(alt.brand + ' ' + alt.name)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn"
                          style={{ fontSize: "0.7rem", padding: "0.3rem 0.5rem", background: "#fc2779", color: "#fff", textDecoration: "none", fontWeight: 700, borderRadius: "6px", textAlign: "center" }}
                        >
                          Buy Nykaa 🛍️
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductRecommendationModule;


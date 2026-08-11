import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiService from "../services/apiService";
import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";
import { FlaskConical, Check, AlertTriangle, Search, Info } from "lucide-react";

function IngredientIntelligencePage() {
  const [ingredients, setIngredients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const [checkerSelection, setCheckerSelection] = useState([]);
  const [checkResult, setCheckResult] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchIngredientsData = async () => {
      try {
        const data = await apiService.getIngredients();
        if (isMounted) {
          setIngredients(data);
        }
      } catch {
        if (isMounted) setIngredients([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchIngredientsData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleCheckerItem = (ingName) => {
    setCheckerSelection((prev) =>
      prev.includes(ingName) ? prev.filter((i) => i !== ingName) : [...prev, ingName]
    );
  };

  const handleRunCompatibilityCheck = async (e) => {
    e.preventDefault();
    if (checkerSelection.length < 2) {
      setToast({ message: "Please select at least 2 ingredients to analyze compatibility.", type: "warning" });
      return;
    }

    setChecking(true);
    try {
      const result = await apiService.checkIngredientCompatibility(checkerSelection);
      setCheckResult(result);
      if (result.is_safe) {
        setToast({ message: "Great choice! No active ingredient conflicts detected.", type: "success" });
      } else {
        setToast({ message: `Conflict Warning! Found ${result.conflicts_found.length} unsafe combination(s).`, type: "danger" });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.detail || "Failed to analyze compatibility", type: "danger" });
    } finally {
      setChecking(false);
    }
  };

  const filteredIngredients = ingredients.filter((ing) => {
    const matchesSearch =
      ing.name.toLowerCase().includes(search.toLowerCase()) ||
      ing.category.toLowerCase().includes(search.toLowerCase()) ||
      ing.suitable_skin_concerns.some((c) => c.toLowerCase().includes(search.toLowerCase()));

    if (selectedCategory === "ALL") return matchesSearch;
    return matchesSearch && ing.usage_time === selectedCategory;
  });

  if (loading) {
    return (
      <Layout>
        <div className="p-4">
          <Skeleton height="40px" width="300px" className="mb-3" />
          <Skeleton height="350px" width="100%" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-gradient-aurora" style={{ letterSpacing: "-0.02em" }}>
            Ingredient Intelligence & Safety Checker 🧪
          </h4>
          <p className="text-secondary small mb-0">
            Analyze active ingredient chemistry, compatibility conflicts, and safety guidelines
          </p>
        </div>
      </div>


      {/* Interactive Safety Compatibility Checker Widget */}
      <div className="saas-card mb-4 shadow-sm" style={{ border: "1px solid var(--border-strong)" }}>
        <div className="saas-card-header pb-2">
          <div>
            <h6 className="fw-semibold mb-1 d-flex align-items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <FlaskConical size={16} />
              <span>AI Ingredient Safety Compatibility Checker</span>
            </h6>
            <span className="saas-card-subtitle">Select 2 or more active ingredients to evaluate interaction safety</span>
          </div>
          <span className="badge-saas badge-saas-primary" style={{ fontSize: "0.7rem" }}>
            {checkerSelection.length} Selected
          </span>
        </div>

        <form onSubmit={handleRunCompatibilityCheck} className="mt-3">
          <div className="d-flex flex-wrap gap-2 mb-3">
            {ingredients.map((ing) => {
              const selected = checkerSelection.includes(ing.name);
              return (
                <button
                  key={ing.id}
                  type="button"
                  className={`btn btn-sm ${selected ? "btn-saas" : "btn-saas-secondary"}`}
                  onClick={() => handleToggleCheckerItem(ing.name)}
                  style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                >
                  {selected ? "✓ " : "+ "} {ing.name}
                </button>
              );
            })}
          </div>

          <div className="d-flex justify-content-between align-items-center pt-2">
            <button
              type="button"
              className="btn btn-sm btn-link text-muted text-decoration-none"
              onClick={() => {
                setCheckerSelection([]);
                setCheckResult(null);
              }}
              style={{ fontSize: "0.75rem" }}
            >
              Clear Selections
            </button>

            <button
              type="submit"
              className="btn btn-saas"
              disabled={checking || checkerSelection.length < 2}
              style={{ fontSize: "0.8rem", padding: "6px 12px" }}
            >
              {checking ? "Analyzing Chemistry..." : "Run Compatibility Safety Check"}
            </button>
          </div>
        </form>

        {/* Compatibility Results Display */}
        {checkResult && (
          <div
            className={`mt-4 p-3 rounded border ${
              checkResult.is_safe ? "bg-success bg-opacity-10 border-success" : "bg-danger bg-opacity-10 border-danger"
            }`}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              {checkResult.is_safe ? (
                <Check size={16} className="text-success" />
              ) : (
                <AlertTriangle size={16} className="text-danger" />
              )}
              <h6 className={`fw-semibold mb-0 ${checkResult.is_safe ? "text-success" : "text-danger"}`} style={{ fontSize: "0.9rem" }}>
                {checkResult.is_safe ? "Safe Synergy Confirmed" : "High Risk Ingredient Conflict"}
              </h6>
            </div>

            <p className="fw-semibold small mb-3" style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{checkResult.recommendation}</p>

            {checkResult.conflicts_found?.length > 0 && (
              <div className="d-flex flex-column gap-2 mt-2">
                {checkResult.conflicts_found.map((c, i) => (
                  <div key={i} className="p-3 rounded bg-surface border border-danger border-opacity-50" style={{ backgroundColor: "var(--bg-surface)" }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className="text-danger small" style={{ fontSize: "0.75rem" }}>
                        Conflict: {c.ingredient_a} ↔ {c.ingredient_b}
                      </strong>
                      <span className="badge-saas badge-saas-danger" style={{ fontSize: "0.65rem" }}>{c.risk_level}</span>
                    </div>
                    <p className="small text-secondary mb-0" style={{ fontSize: "0.75rem" }}>{c.warning}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ingredient Knowledge Base Directory */}
      <div className="saas-card">
        <div className="saas-card-header flex-column flex-md-row align-items-start align-items-md-center gap-3 mb-4">
          <div className="w-100 max-w-xs position-relative">
            <Search size={14} className="position-absolute text-muted" style={{ left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              className="form-control-saas"
              placeholder="Search ingredient or concern..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "30px", fontSize: "0.8rem" }}
            />
          </div>

          <div className="d-flex gap-2 ms-auto">
            {["ALL", "MORNING", "NIGHT", "BOTH"].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`btn btn-sm ${selectedCategory === cat ? "btn-saas" : "btn-saas-secondary"}`}
                onClick={() => setSelectedCategory(cat)}
                style={{ fontSize: "0.75rem", padding: "4px 10px" }}
              >
                {cat === "ALL" ? "All Times" : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="row g-3">
          {filteredIngredients.map((ing) => (
            <div key={ing.id} className="col-md-6 col-lg-4">
              <div className="saas-card h-100 p-3" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="fw-semibold mb-0" style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}>
                    {ing.name}
                  </h6>
                  <span className="badge-saas badge-saas-primary" style={{ fontSize: "0.65rem" }}>{ing.usage_time}</span>
                </div>

                <div className="small fw-semibold mb-2" style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                  {ing.category}
                </div>

                <p className="text-secondary mb-3" style={{ fontSize: "0.8rem", lineHeight: "1.4" }}>{ing.description}</p>

                <div className="mb-3">
                  <span className="small text-muted d-block fw-semibold mb-1" style={{ fontSize: "0.7rem" }}>Target Concerns:</span>
                  <div className="d-flex flex-wrap gap-1">
                    {ing.suitable_skin_concerns?.map((conc, i) => (
                      <span key={i} className="badge-saas badge-saas-info" style={{ fontSize: "0.65rem" }}>
                        {conc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <span className="small text-muted d-block fw-semibold mb-1" style={{ fontSize: "0.7rem" }}>Key Benefits:</span>
                  <ul className="ps-3 mb-0 text-secondary" style={{ fontSize: "0.75rem" }}>
                    {ing.benefits?.slice(0, 3).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>

                {ing.safety_warnings && (
                  <div className="pt-2 border-top text-secondary small d-flex gap-1 align-items-start" style={{ fontSize: "0.75rem" }}>
                    <Info size={12} className="text-muted flex-shrink-0" style={{ marginTop: "2px" }} />
                    <span>{ing.safety_warnings}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default IngredientIntelligencePage;

import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiService from "../services/apiService";
import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";

function IngredientIntelligencePage() {
  const [ingredients, setIngredients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  // Checker State
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
        setToast({ message: "✅ Great choice! No active ingredient conflicts detected.", type: "success" });
      } else {
        setToast({ message: `⚠️ Conflict Warning! Found ${result.conflicts_found.length} unsafe combination(s).`, type: "danger" });
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
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Ingredient Intelligence & Safety Checker
          </h2>
          <p className="text-secondary small mb-0">
            Analyze active ingredient chemistry, compatibility conflicts, and dermatologist safety guidelines
          </p>
        </div>
      </div>

      {/* Interactive Safety Compatibility Checker Widget */}
      <div className="saas-card mb-4 shadow-lg border-primary border-opacity-25" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
        <div className="saas-card-header pb-2">
          <div>
            <h5 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
              🧪 AI Ingredient Safety Compatibility Checker
            </h5>
            <span className="saas-card-subtitle">Select 2 or more active ingredients to evaluate interaction safety</span>
          </div>
          <span className="badge badge-saas badge-saas-primary">
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
                >
                  {selected ? "✓ " : "+ "} {ing.name}
                </button>
              );
            })}
          </div>

          <div className="d-flex justify-content-between align-items-center pt-2">
            <button
              type="button"
              className="btn btn-sm btn-link text-muted"
              onClick={() => {
                setCheckerSelection([]);
                setCheckResult(null);
              }}
            >
              Clear Selections
            </button>

            <button
              type="submit"
              className="btn btn-saas"
              disabled={checking || checkerSelection.length < 2}
            >
              {checking ? "Analyzing Chemistry..." : "🔍 Run Compatibility Safety Check"}
            </button>
          </div>
        </form>

        {/* Compatibility Results Display */}
        {checkResult && (
          <div
            className={`mt-4 p-4 rounded border ${
              checkResult.is_safe ? "bg-success bg-opacity-10 border-success" : "bg-danger bg-opacity-10 border-danger"
            }`}
          >
            {checkResult.user_allergy_conflicts && checkResult.user_allergy_conflicts.length > 0 && (
              <div className="p-3 mb-3 rounded bg-warning bg-opacity-25 border border-warning text-warning-emphasis">
                <h6 className="fw-bold mb-1">⚠️ PERSONAL PROFILE CONFLICT</h6>
                <p className="small mb-0">
                  The selected ingredient(s) <strong>{checkResult.user_allergy_conflicts.join(", ")}</strong> match an allergy or sensitivity stored in your personal skin profile.
                </p>
              </div>
            )}

            <div className="d-flex align-items-center gap-2 mb-2">
              <span style={{ fontSize: "1.5rem" }}>{checkResult.is_safe ? "✅" : "⚠️"}</span>
              <h5 className={`fw-bold mb-0 ${checkResult.is_safe ? "text-success" : "text-danger"}`}>
                {checkResult.is_safe ? "Safe Synergy Confirmed" : "High Risk Ingredient Conflict"}
              </h5>
            </div>

            <p className="fw-semibold small mb-3">{checkResult.recommendation}</p>

            {checkResult.conflicts_found?.length > 0 && (
              <div className="d-flex flex-column gap-2 mt-2">
                {checkResult.conflicts_found.map((c, i) => (
                  <div key={i} className="p-3 rounded bg-surface border border-danger border-opacity-50">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className="text-danger small">
                        🚫 Conflict: {c.ingredient_a} ↔ {c.ingredient_b}
                      </strong>
                      <span className="badge badge-saas badge-saas-danger">{c.risk_level}</span>
                    </div>
                    <p className="small text-secondary mb-0">{c.warning}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ingredient Knowledge Base Directory */}
      <div className="saas-card">
        <div className="saas-card-header flex-column flex-md-row align-items-start align-items-md-center gap-3 mb-3">
          <div className="w-100 max-w-xs">
            <input
              type="text"
              className="form-control-saas"
              placeholder="Search ingredient or concern..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="d-flex gap-2 ms-auto">
            {["ALL", "MORNING", "NIGHT", "BOTH"].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`btn btn-sm ${selectedCategory === cat ? "btn-saas" : "btn-saas-secondary"}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "ALL" ? "All Times" : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="row g-4">
          {filteredIngredients.map((ing) => (
            <div key={ing.id} className="col-md-6 col-lg-4">
              <div className="saas-card h-100 p-4 border" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="fw-bold mb-0" style={{ color: "var(--text-primary)" }}>
                    {ing.name}
                  </h5>
                  <span className="badge badge-saas badge-saas-primary">{ing.usage_time}</span>
                </div>

                <div className="small fw-semibold text-accent mb-2" style={{ color: "var(--accent-primary)", fontSize: "0.8rem" }}>
                  {ing.category}
                </div>

                <p className="small text-secondary mb-3">{ing.description}</p>

                <div className="mb-3">
                  <span className="small text-muted d-block fw-semibold mb-1">Target Concerns:</span>
                  <div className="d-flex flex-wrap gap-1">
                    {ing.suitable_skin_concerns?.map((conc, i) => (
                      <span key={i} className="badge badge-saas badge-saas-info">
                        {conc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <span className="small text-muted d-block fw-semibold mb-1">Key Benefits:</span>
                  <ul className="ps-3 mb-0 small text-secondary">
                    {ing.benefits?.slice(0, 3).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>

                {ing.safety_warnings && (
                  <div className="pt-2 border-top text-warning small">
                    <strong>⚠️ Note:</strong> {ing.safety_warnings}
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

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import apiService from "../services/apiService";
import { useTheme } from "../context/ThemeContext";
import { Sparkles, History, X, Star, RefreshCw } from "lucide-react";

export default function ProductRecommendationsPage() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("recommendations"); // 'recommendations' | 'history'
  const [budgetTier, setBudgetTier] = useState("ALL"); // 'ALL' | 'LOW' | 'MEDIUM' | 'PREMIUM'
  const [loading, setLoading] = useState(true);
  const [recommendationSession, setRecommendationSession] = useState(null);
  const [historySessions, setHistorySessions] = useState([]);
  
  const [selectedForComparison, setSelectedForComparison] = useState([]); // product objects
  const [comparisonResult, setComparisonResult] = useState(null);
  const [activeAlternativeData, setActiveAlternativeData] = useState(null);

  const fetchRecommendations = async (tier) => {
    setLoading(true);
    try {
      const session = await apiService.generateRecommendations(tier);
      setRecommendationSession(session);
    } catch (err) {
      console.error("Failed to generate AI recommendations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(budgetTier);
  }, [budgetTier]);

  const fetchHistory = async () => {
    try {
      const history = await apiService.getRecommendationHistory();
      setHistorySessions(history);
    } catch (err) {
      console.error("Failed to load recommendation history", err);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "history") {
      fetchHistory();
    }
  };

  const toggleSelectForCompare = (item) => {
    const exists = selectedForComparison.some((p) => p.product.id === item.product.id);
    if (exists) {
      setSelectedForComparison(selectedForComparison.filter((p) => p.product.id !== item.product.id));
    } else {
      if (selectedForComparison.length >= 4) {
        alert("You can compare a maximum of 4 products at a time.");
        return;
      }
      setSelectedForComparison([...selectedForComparison, item]);
    }
  };

  const handleExecuteComparison = async () => {
    if (selectedForComparison.length < 2) {
      alert("Please select at least 2 products to compare.");
      return;
    }
    try {
      const ids = selectedForComparison.map((item) => item.product.id);
      const res = await apiService.compareProducts(ids);
      setComparisonResult(res);
    } catch (err) {
      console.error("Comparison failed", err);
    }
  };

  const handleFetchAlternatives = async (productId) => {
    setActiveAlternativeData(null);
    try {
      const res = await apiService.getProductAlternatives(productId);
      setActiveAlternativeData(res);
    } catch (err) {
      console.error("Failed to fetch alternative products", err);
    }
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 85) return "badge-saas-success";
    if (score >= 70) return "badge-saas-info";
    return "badge-saas-warning";
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${isDarkMode ? "bg-dark text-light" : "bg-light text-dark"}`}>
      <Navbar />
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main className="flex-grow-1 p-4" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h4 className="fw-bold m-0 d-flex align-items-center gap-2 text-gradient-aurora" style={{ letterSpacing: "-0.02em" }}>
                <Sparkles size={22} className="text-primary" />
                <span>AI Skincare Recommendation Engine</span>
              </h4>
              <p className="text-secondary m-0 small">
                Personalized product formulations matching your skin profile, active routine, and clinical assessment.
              </p>
            </div>

            
            <div className="d-flex gap-2 p-1 rounded" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}>
              <button
                className={`btn btn-sm d-flex align-items-center gap-2 ${activeTab === "recommendations" ? "btn-saas" : "btn-saas-secondary"}`}
                onClick={() => handleTabChange("recommendations")}
                style={{ fontSize: "0.8rem", border: "none" }}
              >
                <Sparkles size={12} />
                <span>Live Recommendations</span>
              </button>
              <button
                className={`btn btn-sm d-flex align-items-center gap-2 ${activeTab === "history" ? "btn-saas" : "btn-saas-secondary"}`}
                onClick={() => handleTabChange("history")}
                style={{ fontSize: "0.8rem", border: "none" }}
              >
                <History size={12} />
                <span>Saved Session History</span>
              </button>
            </div>
          </div>

          {activeTab === "recommendations" && (
            <>
              {/* Budget Tier Selector Bar */}
              <div className="saas-card mb-4 shadow-sm">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="text-secondary small fw-semibold me-2" style={{ fontSize: "0.75rem" }}>Filter by Budget Tier:</span>
                    {[
                      { key: "ALL", label: "All Prices" },
                      { key: "LOW", label: "Low (≤ $20)" },
                      { key: "MEDIUM", label: "Medium ($20 - $50)" },
                      { key: "PREMIUM", label: "Premium ($50+)" }
                    ].map((tier) => (
                      <button
                        key={tier.key}
                        className={`btn btn-sm ${
                          budgetTier === tier.key ? "btn-saas" : "btn-saas-secondary"
                        }`}
                        onClick={() => setBudgetTier(tier.key)}
                        style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                      >
                        {tier.label}
                      </button>
                    ))}
                  </div>

                  {/* Selected for Comparison Bar Indicator */}
                  {selectedForComparison.length > 0 && (
                    <div className="d-flex align-items-center gap-3">
                      <span className="small text-secondary fw-semibold" style={{ fontSize: "0.75rem" }}>
                        {selectedForComparison.length} selected for compare
                      </span>
                      <button className="btn btn-saas btn-sm" onClick={handleExecuteComparison} style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
                        Compare Side-by-Side
                      </button>
                      <button
                        className="btn btn-saas-secondary btn-sm p-1 rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: "24px", height: "24px" }}
                        onClick={() => setSelectedForComparison([])}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations Content */}
              {loading ? (
                <div className="text-center my-5 py-5">
                  <div className="spinner-border spinner-border-sm text-secondary" role="status">
                    <span className="visually-hidden">Calculating...</span>
                  </div>
                  <p className="mt-3 text-secondary small">Calculating Match Scores...</p>
                </div>
              ) : !recommendationSession || recommendationSession.recommended_products.length === 0 ? (
                <div className="text-center py-5 saas-card">
                  <Sparkles size={24} className="text-muted mx-auto mb-2" />
                  <h6 className="fw-semibold">No suitable products found for selected budget tier</h6>
                  <p className="text-secondary small">Try selecting 'All Prices' to explore more formulations.</p>
                </div>
              ) : (
                <>
                  {/* Session Overview Stats */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div className="stat-card">
                        <div className="stat-label">Compatibility Match</div>
                        <div className="stat-value">{recommendationSession.overall_match_score}%</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="stat-card">
                        <div className="stat-label">Formulations Recommended</div>
                        <div className="stat-value">{recommendationSession.recommended_products.length} Items</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="stat-card">
                        <div className="stat-label">Active Budget Filter</div>
                        <div className="stat-value" style={{ fontSize: "1.5rem" }}>{budgetTier}</div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Product Cards Grid */}
                  <div className="row g-3">
                    {recommendationSession.recommended_products.map((item) => {
                      const prod = item.product;
                      const isSelected = selectedForComparison.some((p) => p.product.id === prod.id);

                      return (
                        <div key={prod.id} className="col-lg-4 col-md-6">
                          <div
                            className="saas-card h-100 d-flex flex-column p-3 position-relative"
                            style={{
                              borderColor: isSelected ? "var(--text-primary)" : "var(--border-subtle)",
                              borderWidth: isSelected ? "1.5px" : "1px"
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span className={`badge-saas ${getScoreBadgeClass(item.suitability_score)}`} style={{ fontSize: "0.7rem" }}>
                                {item.suitability_score}% Match
                              </span>
                              <span className="badge-saas badge-saas-primary" style={{ fontSize: "0.7rem" }}>
                                {item.budget_tier}
                              </span>
                            </div>

                            <div className="small text-uppercase fw-semibold text-muted mb-1" style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}>{prod.brand}</div>
                            <h6 className="fw-semibold mb-2" style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>{prod.name}</h6>

                            <div className="d-flex align-items-center gap-1 mb-3">
                              <Star size={12} className="text-warning fill-warning" />
                              <span className="fw-semibold small" style={{ fontSize: "0.75rem" }}>{prod.rating} / 5.0</span>
                            </div>

                            {item.allergy_warnings.length > 0 && (
                              <div className="p-2 rounded small mb-3 text-danger d-flex gap-1" style={{ backgroundColor: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)", fontSize: "0.75rem" }}>
                                <div>
                                  {item.allergy_warnings.map((w, idx) => (
                                    <div key={idx}>{w}</div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="mb-3 flex-grow-1">
                              <div className="small text-muted fw-semibold mb-1" style={{ fontSize: "0.7rem" }}>Rationale:</div>
                              <ul className="ps-3 m-0 small text-secondary" style={{ fontSize: "0.75rem" }}>
                                {item.match_reasons.map((r, idx) => (
                                  <li key={idx}>{r}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="d-flex gap-2 mt-auto">
                              <button
                                className={`btn btn-sm flex-grow-1 ${
                                  isSelected ? "btn-saas" : "btn-saas-secondary"
                                }`}
                                onClick={() => toggleSelectForCompare(item)}
                                style={{ fontSize: "0.75rem" }}
                              >
                                {isSelected ? "Comparing" : "+ Compare"}
                              </button>
                              <button
                                className="btn btn-saas-secondary btn-sm"
                                onClick={() => handleFetchAlternatives(prod.id)}
                                style={{ fontSize: "0.75rem" }}
                              >
                                <RefreshCw size={12} className="me-1" />
                                Alternatives
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div>
              <h6 className="fw-semibold mb-3">Past AI Recommendation Sessions</h6>
              {historySessions.length === 0 ? (
                <div className="text-center py-5 saas-card">
                  <p className="text-secondary small mb-0">No saved recommendation history found.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {historySessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3 rounded d-flex justify-content-between align-items-center"
                      style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}
                    >
                      <div>
                        <div className="fw-semibold" style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>Session #{sess.id} — Budget Filter: {sess.budget_tier}</div>
                        <div className="text-muted small" style={{ fontSize: "0.75rem" }}>{new Date(sess.created_at).toLocaleString()}</div>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <span className="badge-saas badge-saas-success" style={{ fontSize: "0.75rem" }}>
                          Match Score: {sess.overall_match_score}%
                        </span>
                        <span className="small text-secondary" style={{ fontSize: "0.75rem" }}>
                          {sess.recommended_products.length} products
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Product Comparison Modal */}
      {comparisonResult && (
        <div className="modal-backdrop-saas" onClick={() => setComparisonResult(null)}>
          <div className="modal-content-saas" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px" }}>
            <div className="modal-header-saas">
              <div>
                <h6 className="fw-semibold m-0" style={{ fontSize: "1rem" }}>Side-by-Side Product Comparison</h6>
                <p className="small text-muted m-0" style={{ fontSize: "0.75rem" }}>{comparisonResult.recommendation_note}</p>
              </div>
              <button type="button" className="btn border-0 p-1" onClick={() => setComparisonResult(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body-saas" style={{ overflowX: "auto" }}>
              <table className="table-saas">
                <thead>
                  <tr>
                    <th>Attribute</th>
                    {comparisonResult.comparison.map((item) => (
                      <th key={item.id} className={item.id === comparisonResult.best_match_product_id ? "table-success" : ""}>
                        {item.id === comparisonResult.best_match_product_id && (
                          <span className="badge-saas badge-saas-success mb-1" style={{ fontSize: "0.65rem" }}>Best Match</span>
                        )}
                        <div className="fw-semibold" style={{ fontSize: "0.8rem" }}>{item.name}</div>
                        <div className="small text-muted" style={{ fontSize: "0.7rem" }}>{item.brand}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="fw-semibold">Suitability Match</td>
                    {comparisonResult.comparison.map((item) => (
                      <td key={item.id}>
                        <span className={`badge-saas ${getScoreBadgeClass(item.suitability_score)}`} style={{ fontSize: "0.7rem" }}>
                          {item.suitability_score}%
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="fw-semibold">Price & Rating</td>
                    {comparisonResult.comparison.map((item) => (
                      <td key={item.id}>
                        <div className="fw-semibold text-secondary" style={{ fontSize: "0.8rem" }}>${item.price.toFixed(2)}</div>
                        <div className="small text-warning" style={{ fontSize: "0.75rem" }}>★ {item.rating}</div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="fw-semibold">Active Ingredients</td>
                    {comparisonResult.comparison.map((item) => (
                      <td key={item.id}>
                        <div className="d-flex flex-wrap gap-1">
                          {item.active_ingredients.map((ing, idx) => (
                            <span key={idx} className="badge-saas badge-saas-info" style={{ fontSize: "0.65rem" }}>
                              {ing}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="fw-semibold">Suitable Skin Types</td>
                    {comparisonResult.comparison.map((item) => (
                      <td key={item.id}>
                        <span className="small text-secondary" style={{ fontSize: "0.75rem" }}>{item.suitable_skin_types.join(", ")}</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="fw-semibold">Target Concerns</td>
                    {comparisonResult.comparison.map((item) => (
                      <td key={item.id}>
                        <span className="small text-secondary" style={{ fontSize: "0.75rem" }}>{item.suitable_concerns.join(", ")}</span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="modal-footer-saas">
              <button className="btn btn-saas-secondary btn-sm" onClick={() => setComparisonResult(null)} style={{ fontSize: "0.8rem" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Products Modal */}
      {activeAlternativeData && (
        <div className="modal-backdrop-saas" onClick={() => setActiveAlternativeData(null)}>
          <div className="modal-content-saas" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-saas">
              <div>
                <h6 className="fw-semibold m-0" style={{ fontSize: "1rem" }}>Equivalent Product Alternatives</h6>
                <p className="small text-muted m-0" style={{ fontSize: "0.75rem" }}>
                  Alternatives for: <strong>{activeAlternativeData.original_product.brand} {activeAlternativeData.original_product.name}</strong>
                </p>
              </div>
              <button type="button" className="btn border-0 p-1" onClick={() => setActiveAlternativeData(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body-saas">
              {activeAlternativeData.alternatives.length === 0 ? (
                <p className="text-secondary text-center small">No alternative formulations available in this category.</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {activeAlternativeData.alternatives.map((alt) => (
                    <div
                      key={alt.product.id}
                      className="p-3 rounded d-flex justify-content-between align-items-center"
                      style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}
                    >
                      <div>
                        <span className="badge-saas badge-saas-primary me-2" style={{ fontSize: "0.65rem" }}>{alt.product.category}</span>
                        <span className="fw-semibold" style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>{alt.product.brand} {alt.product.name}</span>
                        <div className="small text-muted mt-1" style={{ fontSize: "0.75rem" }}>{alt.reason}</div>
                      </div>
                      <div className="text-end">
                        <div className="fw-semibold text-secondary" style={{ fontSize: "0.85rem" }}>${alt.product.price.toFixed(2)}</div>
                        <span className="badge-saas badge-saas-success" style={{ fontSize: "0.65rem" }}>
                          {alt.price_difference < 0 ? `${alt.price_difference.toFixed(2)} Cheaper` : `+${alt.price_difference.toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer-saas">
              <button className="btn btn-saas-secondary btn-sm" onClick={() => setActiveAlternativeData(null)} style={{ fontSize: "0.8rem" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

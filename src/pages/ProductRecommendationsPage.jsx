import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import apiService from "../services/apiService";
import { useTheme } from "../context/ThemeContext";

export default function ProductRecommendationsPage() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("recommendations"); // 'recommendations' | 'history'
  const [budgetTier, setBudgetTier] = useState("ALL"); // 'ALL' | 'LOW' | 'MEDIUM' | 'PREMIUM'
  const [loading, setLoading] = useState(true);
  const [recommendationSession, setRecommendationSession] = useState(null);
  const [historySessions, setHistorySessions] = useState([]);
  
  // Selection for Comparison
  const [selectedForComparison, setSelectedForComparison] = useState([]); // product objects
  const [comparisonResult, setComparisonResult] = useState(null);

  // Alternatives Modal State
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
    if (score >= 85) return "bg-success text-white";
    if (score >= 70) return "bg-info text-dark";
    return "bg-warning text-dark";
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${isDarkMode ? "bg-dark text-light" : "bg-light text-dark"}`}>
      <Navbar />
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main className="flex-grow-1 p-4" style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h2 className="fw-bold m-0 d-flex align-items-center gap-2">
                <span className="fs-3">🎯</span> AI Skincare Recommendation Engine
              </h2>
              <p className="text-secondary m-0">
                Personalized product formulations matching your skin profile, active routine, and clinical assessment.
              </p>
            </div>
            
            <div className="d-flex gap-2">
              <button
                className={`btn rounded-pill px-4 ${activeTab === "recommendations" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => handleTabChange("recommendations")}
              >
                ✨ Live Recommendations
              </button>
              <button
                className={`btn rounded-pill px-4 ${activeTab === "history" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => handleTabChange("history")}
              >
                📜 Saved Session History
              </button>
            </div>
          </div>

          {activeTab === "recommendations" && (
            <>
              {/* Budget Tier Selector Bar */}
              <div className={`card p-3 mb-4 border-0 shadow-sm rounded-4 ${isDarkMode ? "bg-secondary bg-opacity-10 text-light" : "bg-white"}`}>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-secondary small">Filter by Budget Tier:</span>
                    {[
                      { key: "ALL", label: "All Prices" },
                      { key: "LOW", label: "Low Budget (≤ $20)" },
                      { key: "MEDIUM", label: "Medium ($20 - $50)" },
                      { key: "PREMIUM", label: "Premium ($50+)" }
                    ].map((tier) => (
                      <button
                        key={tier.key}
                        className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                          budgetTier === tier.key ? "btn-primary" : "btn-outline-secondary"
                        }`}
                        onClick={() => setBudgetTier(tier.key)}
                      >
                        {tier.label}
                      </button>
                    ))}
                  </div>

                  {/* Selected for Comparison Bar Indicator */}
                  {selectedForComparison.length > 0 && (
                    <div className="d-flex align-items-center gap-3">
                      <span className="small text-info fw-bold">
                        {selectedForComparison.length} Product(s) Selected for Compare
                      </span>
                      <button className="btn btn-sm btn-info text-dark rounded-pill fw-bold" onClick={handleExecuteComparison}>
                        📊 Compare Side-by-Side
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger rounded-circle p-1"
                        style={{ width: "24px", height: "24px", lineHeight: "10px" }}
                        onClick={() => setSelectedForComparison([])}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations Content */}
              {loading ? (
                <div className="text-center my-5 py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Calculating Match Scores...</span>
                  </div>
                  <p className="mt-3 text-secondary">Analyzing skin type, concerns, and allergy safety matrix...</p>
                </div>
              ) : !recommendationSession || recommendationSession.recommended_products.length === 0 ? (
                <div className="text-center py-5">
                  <span className="fs-1">🔍</span>
                  <h4 className="mt-3">No suitable products found for selected budget tier</h4>
                  <p className="text-secondary">Try selecting 'All Prices' to explore more formulations.</p>
                </div>
              ) : (
                <>
                  {/* Session Overview Stats */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div className={`card p-3 border-0 shadow-sm rounded-4 ${isDarkMode ? "bg-secondary bg-opacity-10" : "bg-white"}`}>
                        <div className="small text-secondary fw-semibold">Overall Compatibility Match</div>
                        <div className="fs-3 fw-bold text-success">
                          {recommendationSession.overall_match_score}%
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className={`card p-3 border-0 shadow-sm rounded-4 ${isDarkMode ? "bg-secondary bg-opacity-10" : "bg-white"}`}>
                        <div className="small text-secondary fw-semibold">Top Formulations Recommended</div>
                        <div className="fs-3 fw-bold text-primary">
                          {recommendationSession.recommended_products.length} Items
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className={`card p-3 border-0 shadow-sm rounded-4 ${isDarkMode ? "bg-secondary bg-opacity-10" : "bg-white"}`}>
                        <div className="small text-secondary fw-semibold">Active Budget Filter</div>
                        <div className="fs-4 fw-bold text-info">{budgetTier}</div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Product Cards Grid */}
                  <div className="row g-4">
                    {recommendationSession.recommended_products.map((item) => {
                      const prod = item.product;
                      const isSelected = selectedForComparison.some((p) => p.product.id === prod.id);

                      return (
                        <div key={prod.id} className="col-lg-4 col-md-6">
                          <div
                            className={`card h-100 border-0 rounded-4 shadow-sm transition-all position-relative ${
                              isDarkMode ? "bg-secondary bg-opacity-10 text-light" : "bg-white"
                            } ${isSelected ? "border border-2 border-info" : ""}`}
                          >
                            <div className="card-body p-4 d-flex flex-column">
                              {/* Header Badges */}
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className={`badge px-3 py-2 rounded-pill fw-bold ${getScoreBadgeClass(item.suitability_score)}`}>
                                  ⚡ {item.suitability_score}% Match Score
                                </span>
                                <span className="badge bg-secondary bg-opacity-20 text-secondary px-3 py-1 rounded-pill">
                                  {item.budget_tier} Tier (${prod.price})
                                </span>
                              </div>

                              <div className="small text-uppercase fw-bold text-secondary mb-1">{prod.brand}</div>
                              <h5 className="fw-bold card-title mb-2">{prod.name}</h5>

                              {/* Category & Rating */}
                              <div className="d-flex align-items-center gap-2 mb-3">
                                <span className="badge bg-primary bg-opacity-10 text-primary">{prod.category}</span>
                                <span className="small text-warning fw-semibold">★ {prod.rating}</span>
                              </div>

                              {/* Allergy Warnings If Any */}
                              {item.allergy_warnings.length > 0 && (
                                <div className="alert alert-warning p-2 small mb-3 rounded-3">
                                  {item.allergy_warnings.map((w, idx) => (
                                    <div key={idx}>{w}</div>
                                  ))}
                                </div>
                              )}

                              {/* Match Reasons */}
                              <div className="mb-3 flex-grow-1">
                                <div className="small text-secondary fw-semibold mb-1">AI Recommendation Rationale:</div>
                                <ul className="ps-3 m-0 small text-secondary">
                                  {item.match_reasons.map((r, idx) => (
                                    <li key={idx}>{r}</li>
                                  ))}
                                </ul>
                              </div>

                              {/* Action Buttons */}
                              <div className="d-flex gap-2 mt-auto">
                                <button
                                  className={`btn btn-sm flex-grow-1 rounded-pill fw-semibold ${
                                    isSelected ? "btn-info text-dark" : "btn-outline-primary"
                                  }`}
                                  onClick={() => toggleSelectForCompare(item)}
                                >
                                  {isSelected ? "✓ Comparing" : "+ Compare"}
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                                  onClick={() => handleFetchAlternatives(prod.id)}
                                >
                                  🔄 Alternatives
                                </button>
                              </div>
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
              <h4 className="fw-bold mb-3">Past AI Recommendation Sessions</h4>
              {historySessions.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-secondary">No saved recommendation history found.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {historySessions.map((sess) => (
                    <div
                      key={sess.id}
                      className={`card p-4 border-0 shadow-sm rounded-4 ${
                        isDarkMode ? "bg-secondary bg-opacity-10 text-light" : "bg-white"
                      }`}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold text-primary">Session #{sess.id} — Budget Filter: {sess.budget_tier}</span>
                        <span className="small text-secondary">{new Date(sess.created_at).toLocaleString()}</span>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <span className="badge bg-success px-3 py-2 rounded-pill">
                          Match Score: {sess.overall_match_score}%
                        </span>
                        <span className="small text-secondary">
                          {sess.recommended_products.length} products evaluated & saved
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
        <div className="modal show d-block tab-modal-backdrop" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className={`modal-content border-0 rounded-4 shadow-lg ${isDarkMode ? "bg-dark text-light" : "bg-white"}`}>
              <div className="modal-header border-0">
                <div>
                  <h4 className="fw-bold m-0">📊 Side-by-Side Product Comparison</h4>
                  <p className="small text-info m-0">{comparisonResult.recommendation_note}</p>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setComparisonResult(null)}></button>
              </div>

              <div className="modal-body p-4" style={{ overflowX: "auto" }}>
                <table className={`table table-bordered align-middle ${isDarkMode ? "table-dark" : ""}`}>
                  <thead>
                    <tr>
                      <th style={{ minWidth: "150px" }}>Attribute</th>
                      {comparisonResult.comparison.map((item) => (
                        <th key={item.id} style={{ minWidth: "220px" }} className={item.id === comparisonResult.best_match_product_id ? "table-success" : ""}>
                          {item.id === comparisonResult.best_match_product_id && (
                            <span className="badge bg-success rounded-pill mb-1">🏆 Best Overall Match</span>
                          )}
                          <div className="fw-bold">{item.name}</div>
                          <div className="small text-secondary">{item.brand}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-bold">Suitability Match</td>
                      {comparisonResult.comparison.map((item) => (
                        <td key={item.id}>
                          <span className={`badge px-3 py-2 rounded-pill ${getScoreBadgeClass(item.suitability_score)}`}>
                            {item.suitability_score}%
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="fw-bold">Price & Rating</td>
                      {comparisonResult.comparison.map((item) => (
                        <td key={item.id}>
                          <div className="fw-bold text-success">${item.price.toFixed(2)}</div>
                          <div className="small text-warning">★ {item.rating} / 5</div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="fw-bold">Active Ingredients</td>
                      {comparisonResult.comparison.map((item) => (
                        <td key={item.id}>
                          <div className="d-flex flex-wrap gap-1">
                            {item.active_ingredients.map((ing, idx) => (
                              <span key={idx} className="badge bg-info bg-opacity-20 text-info border border-info rounded-pill px-2 py-1">
                                {ing}
                              </span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="fw-bold">Suitable Skin Types</td>
                      {comparisonResult.comparison.map((item) => (
                        <td key={item.id}>
                          <span className="small text-secondary">{item.suitable_skin_types.join(", ")}</span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="fw-bold">Target Concerns</td>
                      {comparisonResult.comparison.map((item) => (
                        <td key={item.id}>
                          <span className="small text-secondary">{item.suitable_concerns.join(", ")}</span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="modal-footer border-0">
                <button className="btn btn-secondary rounded-pill px-4" onClick={() => setComparisonResult(null)}>
                  Close Comparison
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Products Modal */}
      {activeAlternativeData && (
        <div className="modal show d-block tab-modal-backdrop" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className={`modal-content border-0 rounded-4 shadow-lg ${isDarkMode ? "bg-dark text-light" : "bg-white"}`}>
              <div className="modal-header border-0">
                <div>
                  <h4 className="fw-bold m-0">🔄 Equivalent Product Alternatives</h4>
                  <p className="small text-secondary m-0">
                    Comparing alternatives for: <strong>{activeAlternativeData.original_product.brand} {activeAlternativeData.original_product.name}</strong> (${activeAlternativeData.original_product.price})
                  </p>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setActiveAlternativeData(null)}></button>
              </div>

              <div className="modal-body p-4">
                {activeAlternativeData.alternatives.length === 0 ? (
                  <p className="text-secondary text-center">No alternative formulations available in this category.</p>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {activeAlternativeData.alternatives.map((alt) => (
                      <div
                        key={alt.product.id}
                        className={`card p-3 border-0 rounded-3 shadow-sm ${
                          isDarkMode ? "bg-secondary bg-opacity-10 text-light" : "bg-light"
                        }`}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span className="badge bg-primary bg-opacity-10 text-primary me-2">{alt.product.category}</span>
                            <span className="fw-bold">{alt.product.brand} {alt.product.name}</span>
                            <div className="small text-secondary mt-1">{alt.reason}</div>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold text-success fs-5">${alt.product.price.toFixed(2)}</div>
                            <span className={`badge rounded-pill ${alt.price_difference < 0 ? "bg-success" : "bg-secondary"}`}>
                              {alt.price_difference < 0 ? `${alt.price_difference.toFixed(2)} Cheaper` : `+${alt.price_difference.toFixed(2)}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer border-0">
                <button className="btn btn-secondary rounded-pill px-4" onClick={() => setActiveAlternativeData(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

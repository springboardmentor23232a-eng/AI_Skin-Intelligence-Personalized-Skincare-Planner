import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import apiService from "../services/apiService";
import { useTheme } from "../context/ThemeContext";

// Helper for Indian Currency Formatting (₹)
export const formatINR = (price) => {
  if (price === undefined || price === null || isNaN(price)) return "₹0";
  const num = typeof price === "number" ? price : parseFloat(price) || 0;
  // If price is stored as USD float (e.g. 14.99, 182.00), convert to INR (~85x) for display if < 300
  const inrAmount = num < 300 ? Math.round(num * 85) : Math.round(num);
  return `₹${inrAmount.toLocaleString("en-IN")}`;
};

// Safe Image Component with Placeholder Fallback
const ProductImage = ({ src, alt, className = "", style = {} }) => {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return (
      <div
        className={`d-flex flex-column align-items-center justify-content-center bg-secondary bg-opacity-10 border border-secondary border-opacity-20 rounded-4 p-3 ${className}`}
        style={{ minHeight: "180px", width: "100%", ...style }}
      >
        <span style={{ fontSize: "2.8rem" }}>✨</span>
        <span className="small text-secondary fw-semibold mt-2 text-center text-truncate px-2" style={{ maxWidth: "100%" }}>
          {alt || "Skincare Product"}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-4 ${className}`}
      style={{ objectFit: "cover", width: "100%", height: "200px", ...style }}
      onError={() => setImgError(true)}
      loading="lazy"
    />
  );
};

// Multi-store Purchase Buttons (Nykaa, Tira, Purplle, Amazon)
export const StorePurchaseButtons = ({ purchaseLinks, fallbackUrl, price, size = "sm", fullWidth = true }) => {
  const storeThemes = {
    nykaa: { label: "Nykaa", bgClass: "btn-outline-danger" },
    tira: { label: "Tira", bgClass: "btn-outline-dark" },
    purplle: { label: "Purplle", bgClass: "btn-outline-primary" },
    amazon: { label: "Amazon", bgClass: "btn-outline-warning text-dark" },
  };

  const links = purchaseLinks && typeof purchaseLinks === "object"
    ? Object.entries(purchaseLinks).filter(([_, url]) => Boolean(url))
    : [];

  if (links.length > 0) {
    return (
      <div className={`d-flex flex-wrap gap-1 align-items-center ${fullWidth ? "w-100" : ""}`}>
        {links.map(([storeKey, url]) => {
          const theme = storeThemes[storeKey.toLowerCase()] || {
            label: storeKey.charAt(0).toUpperCase() + storeKey.slice(1),
            bgClass: "btn-outline-secondary"
          };
          return (
            <a
              key={storeKey}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn btn-${size} ${theme.bgClass} rounded-pill fw-bold flex-grow-1 text-decoration-none d-inline-flex align-items-center justify-content-center gap-1 py-1 px-2`}
              style={{ fontSize: size === "sm" ? "0.76rem" : "0.85rem" }}
              title={`Buy on ${theme.label}`}
            >
              <span>🛒</span>
              <span>{theme.label}</span>
            </a>
          );
        })}
      </div>
    );
  }

  if (fallbackUrl) {
    return (
      <a
        href={fallbackUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn btn-${size} btn-success rounded-pill fw-bold w-100 d-flex align-items-center justify-content-center gap-2`}
      >
        🛒 Buy Now {price !== undefined ? `(${formatINR(price)})` : ""}
      </a>
    );
  }

  return (
    <button className={`btn btn-${size} btn-secondary rounded-pill fw-semibold w-100`} disabled>
      Purchase link unavailable
    </button>
  );
};

export default function ProductRecommendationsPage() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("recommendations"); // 'recommendations' | 'history'
  const [budgetTier, setBudgetTier] = useState("ALL"); // 'ALL' | 'LOW' | 'MEDIUM' | 'PREMIUM'
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [recommendationSession, setRecommendationSession] = useState(null);
  const [historySessions, setHistorySessions] = useState([]);
  
  // Selection for Comparison
  const [selectedForComparison, setSelectedForComparison] = useState([]); // Array of RecommendedProductItem
  const [comparisonResult, setComparisonResult] = useState(null);

  // Active Detail Modal State
  const [activeDetailItem, setActiveDetailItem] = useState(null); // RecommendedProductItem

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
      alert("Select at least 2 products to compare.");
      return;
    }
    try {
      const ids = selectedForComparison.map((item) => item.product.id);
      const res = await apiService.compareProducts(ids);
      setComparisonResult(res);
    } catch (err) {
      console.error("Comparison failed", err);
      alert("Failed to compare products. Please try again.");
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

  // Filter recommendations by category if selected
  const filteredProducts = (recommendationSession?.recommended_products || []).filter((item) => {
    if (categoryFilter === "ALL") return true;
    return item.product.category.toLowerCase() === categoryFilter.toLowerCase();
  });

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
                Personalized, e-commerce formulation matching based on your skin type, active concerns, allergies, and clinical assessment.
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
              {/* Filter Controls Bar */}
              <div className={`card p-3 mb-4 border-0 shadow-sm rounded-4 ${isDarkMode ? "bg-secondary bg-opacity-10 text-light" : "bg-white"}`}>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  {/* Budget Tier Filters */}
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="fw-bold text-secondary small">Filter by Budget:</span>
                    {[
                      { key: "ALL", label: "All Prices" },
                      { key: "LOW", label: "Budget (≤ ₹1,500)" },
                      { key: "MEDIUM", label: "Mid-Range (₹1,500 - ₹4,000)" },
                      { key: "PREMIUM", label: "Premium (₹4,000+)" }
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

                  {/* Category Filter */}
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-secondary small">Category:</span>
                    <select
                      className={`form-select form-select-sm rounded-pill px-3 fw-semibold ${
                        isDarkMode ? "bg-dark text-light border-secondary" : ""
                      }`}
                      style={{ width: "160px" }}
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="ALL">All Categories</option>
                      <option value="Cleanser">Cleansers</option>
                      <option value="Serum">Serums</option>
                      <option value="Moisturizer">Moisturizers</option>
                      <option value="Sunscreen">Sunscreens</option>
                      <option value="Treatment">Treatments</option>
                      <option value="Toner">Toners</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sticky Comparison Tray Banner when 1+ products selected */}
              {selectedForComparison.length > 0 && (
                <div
                  className="card p-3 mb-4 border-2 border-info shadow-lg rounded-4 text-light bg-dark d-flex flex-row justify-content-between align-items-center flex-wrap gap-3"
                  style={{ sticky: "top", top: "80px", zIndex: 100 }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="fs-4">📊</span>
                    <div>
                      <div className="fw-bold text-info">Comparison Selection Active</div>
                      <div className="small text-secondary">
                        {selectedForComparison.length} product(s) added:{" "}
                        <strong className="text-light">
                          {selectedForComparison.map((i) => i.product.name).join(", ")}
                        </strong>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-info text-dark rounded-pill px-4 fw-bold"
                      onClick={handleExecuteComparison}
                    >
                      Compare Side-by-Side ({selectedForComparison.length})
                    </button>
                    <button
                      className="btn btn-outline-danger rounded-pill px-3 btn-sm"
                      onClick={() => setSelectedForComparison([])}
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              )}

              {/* Recommendations Content */}
              {loading ? (
                <div className="text-center my-5 py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Calculating Personal Compatibility Scores...</span>
                  </div>
                  <p className="mt-3 text-secondary">Evaluating skin type, active concerns, allergies, and ingredient profiles...</p>
                </div>
              ) : !recommendationSession || filteredProducts.length === 0 ? (
                <div className="text-center py-5">
                  <span className="fs-1">🔍</span>
                  <h4 className="mt-3">No matching products found</h4>
                  <p className="text-secondary">Try relaxing your budget or category filters to explore more personalized options.</p>
                </div>
              ) : (
                <>
                  {/* Session Overview Stats */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div className={`card p-3 border-0 shadow-sm rounded-4 ${isDarkMode ? "bg-secondary bg-opacity-10" : "bg-white"}`}>
                        <div className="small text-secondary fw-semibold">Personal Compatibility Index</div>
                        <div className="fs-3 fw-bold text-success">
                          {recommendationSession.overall_match_score}% Match
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className={`card p-3 border-0 shadow-sm rounded-4 ${isDarkMode ? "bg-secondary bg-opacity-10" : "bg-white"}`}>
                        <div className="small text-secondary fw-semibold">Personalized Products Evaluated</div>
                        <div className="fs-3 fw-bold text-primary">
                          {filteredProducts.length} Formulations
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className={`card p-3 border-0 shadow-sm rounded-4 ${isDarkMode ? "bg-secondary bg-opacity-10" : "bg-white"}`}>
                        <div className="small text-secondary fw-semibold">Active Filter Mode</div>
                        <div className="fs-4 fw-bold text-info">{budgetTier} Tier</div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Product Cards Grid (Clean E-Commerce Style) */}
                  <div className="row g-4">
                    {filteredProducts.map((item) => {
                      const prod = item.product;
                      const isSelected = selectedForComparison.some((p) => p.product.id === prod.id);

                      return (
                        <div key={prod.id} className="col-lg-4 col-md-6">
                          <div
                            className={`card h-100 border-0 rounded-4 shadow-sm transition-all position-relative ${
                              isDarkMode ? "bg-secondary bg-opacity-10 text-light" : "bg-white"
                            } ${isSelected ? "border border-2 border-info shadow" : ""}`}
                          >
                            <div className="card-body p-4 d-flex flex-column">
                              {/* Header Badge & Suitability Match Score */}
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className={`badge px-3 py-2 rounded-pill fw-bold ${getScoreBadgeClass(item.suitability_score)}`}>
                                  ⚡ {item.suitability_score}% Match Score
                                </span>
                                <span className="badge bg-secondary bg-opacity-20 text-secondary px-3 py-1 rounded-pill">
                                  {prod.category}
                                </span>
                              </div>

                              {/* Product Image Component with Fallback (Clickable -> Opens Detail Modal) */}
                              <div
                                className="mb-3 cursor-pointer overflow-hidden rounded-4 position-relative"
                                style={{ cursor: "pointer" }}
                                onClick={() => setActiveDetailItem(item)}
                              >
                                <ProductImage src={prod.image_url} alt={prod.name} />
                              </div>

                              {/* Simple Product Info */}
                              <div className="small text-uppercase fw-bold text-secondary mb-1">{prod.brand}</div>
                              <h5
                                className="fw-bold card-title mb-2 cursor-pointer text-hover-primary"
                                style={{ cursor: "pointer" }}
                                onClick={() => setActiveDetailItem(item)}
                              >
                                {prod.name}
                              </h5>

                              {/* Rating & Price in Indian Currency (₹) */}
                              <div className="d-flex align-items-center justify-content-between mb-3 mt-auto">
                                <div className="d-flex align-items-center gap-1">
                                  <span className="text-warning">★</span>
                                  <span className="fw-semibold small">{prod.rating} / 5.0</span>
                                </div>
                                <div className="fs-5 fw-bold text-success">
                                  {formatINR(prod.price)}
                                </div>
                              </div>

                              {/* Action Buttons: View Details, Compare, Multi-Store Buy */}
                              <div className="d-flex flex-column gap-2 mt-2">
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-sm btn-outline-primary flex-grow-1 rounded-pill fw-semibold"
                                    onClick={() => setActiveDetailItem(item)}
                                  >
                                    🔍 View Details
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-info rounded-pill px-2 fw-semibold"
                                    onClick={() => handleFetchAlternatives(prod.id)}
                                    title="View equivalent or budget alternatives"
                                  >
                                    🔄 Alternatives
                                  </button>
                                  <button
                                    className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                                      isSelected ? "btn-info text-dark" : "btn-outline-secondary"
                                    }`}
                                    onClick={() => toggleSelectForCompare(item)}
                                  >
                                    {isSelected ? "✓ Comparing" : "+ Compare"}
                                  </button>
                                </div>

                                {/* Multi-store purchase buttons */}
                                <div className="mt-1">
                                  <StorePurchaseButtons
                                    purchaseLinks={prod.purchase_links}
                                    fallbackUrl={prod.purchase_url}
                                    price={prod.price}
                                    size="sm"
                                  />
                                </div>
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

      {/* Feature 1: Comprehensive Product Detail Modal */}
      {activeDetailItem && (
        <div className="modal show d-block tab-modal-backdrop" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className={`modal-content border-0 rounded-4 shadow-lg ${isDarkMode ? "bg-dark text-light" : "bg-white"}`}>
              <div className="modal-header border-0 pb-0">
                <div>
                  <span className="badge bg-primary rounded-pill px-3 py-1 mb-2">{activeDetailItem.product.category}</span>
                  <h4 className="fw-bold m-0">{activeDetailItem.product.name}</h4>
                  <div className="text-secondary fw-semibold small">{activeDetailItem.product.brand}</div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setActiveDetailItem(null)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-4">
                  {/* Left Column: Image & Core Stats */}
                  <div className="col-md-5">
                    <ProductImage src={activeDetailItem.product.image_url} alt={activeDetailItem.product.name} style={{ height: "260px" }} />

                    <div className="d-flex align-items-center justify-content-between mt-3 p-3 rounded-4 bg-primary bg-opacity-10">
                      <div>
                        <div className="small text-secondary">Price (INR)</div>
                        <div className="fs-4 fw-bold text-success">{formatINR(activeDetailItem.product.price)}</div>
                      </div>
                      <div className="border-start border-secondary opacity-25 ps-3 text-end">
                        <div className="small text-secondary">Personal Match</div>
                        <div className={`fs-5 fw-bold ${getScoreBadgeClass(activeDetailItem.suitability_score)} badge px-3 py-1 rounded-pill`}>
                          ⚡ {activeDetailItem.suitability_score}%
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons in Modal */}
                    <div className="mt-3 d-flex flex-column gap-2">
                      <div>
                        <div className="small text-secondary fw-semibold mb-1">Available at Authorized Stores:</div>
                        <StorePurchaseButtons
                          purchaseLinks={activeDetailItem.product.purchase_links}
                          fallbackUrl={activeDetailItem.product.purchase_url}
                          price={activeDetailItem.product.price}
                          size="md"
                        />
                      </div>

                      <div className="d-flex gap-2 mt-1">
                        <button
                          className="btn btn-outline-info rounded-pill fw-semibold flex-grow-1 py-2"
                          onClick={() => {
                            const pId = activeDetailItem.product.id;
                            setActiveDetailItem(null);
                            handleFetchAlternatives(pId);
                          }}
                        >
                          🔄 Explore Alternatives
                        </button>
                        <button
                          className={`btn rounded-pill fw-semibold flex-grow-1 py-2 ${
                            selectedForComparison.some((p) => p.product.id === activeDetailItem.product.id)
                              ? "btn-info text-dark"
                              : "btn-outline-secondary"
                          }`}
                          onClick={() => toggleSelectForCompare(activeDetailItem)}
                        >
                          {selectedForComparison.some((p) => p.product.id === activeDetailItem.product.id)
                            ? "✓ In Comparison"
                            : "+ Add to Compare"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Detailed Personalization & Ingredients */}
                  <div className="col-md-7">
                    {/* Why Recommended Section */}
                    <div className="p-3 rounded-4 bg-success bg-opacity-10 border border-success border-opacity-25 mb-3">
                      <h6 className="fw-bold text-success mb-2 d-flex align-items-center gap-2">
                        💡 Why this product was recommended for you:
                      </h6>
                      <ul className="ps-3 m-0 small">
                        {activeDetailItem.match_reasons.map((reason, idx) => (
                          <li key={idx} className="mb-1">{reason}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Allergy Warnings if any */}
                    {activeDetailItem.allergy_warnings.length > 0 && (
                      <div className="alert alert-warning p-3 rounded-4 small mb-3">
                        <div className="fw-bold mb-1">⚠️ Safety & Sensitivity Warnings:</div>
                        {activeDetailItem.allergy_warnings.map((w, idx) => (
                          <div key={idx}>{w}</div>
                        ))}
                      </div>
                    )}

                    <h6 className="fw-bold text-primary mb-1">Description</h6>
                    <p className="text-secondary small mb-3">{activeDetailItem.product.description}</p>

                    <h6 className="fw-bold text-info mb-2">Active Clinical Ingredients</h6>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {activeDetailItem.product.active_ingredients.map((ing, idx) => (
                        <span key={idx} className="badge bg-info bg-opacity-20 text-info border border-info rounded-pill px-3 py-2">
                          ⚡ {ing}
                        </span>
                      ))}
                    </div>

                    <h6 className="fw-bold text-success mb-2">Suitable Skin Types</h6>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {activeDetailItem.product.suitable_skin_types.map((st, idx) => (
                        <span key={idx} className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1">
                          ✓ {st}
                        </span>
                      ))}
                    </div>

                    <h6 className="fw-bold text-warning mb-2">Target Skin Concerns</h6>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {activeDetailItem.product.suitable_concerns.map((sc, idx) => (
                        <span key={idx} className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-1">
                          🎯 {sc}
                        </span>
                      ))}
                    </div>

                    {activeDetailItem.product.usage_instructions && (
                      <>
                        <h6 className="fw-bold text-secondary mb-1">Usage Instructions</h6>
                        <p className="text-secondary small m-0">{activeDetailItem.product.usage_instructions}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-secondary rounded-pill px-4" onClick={() => setActiveDetailItem(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature 4 & 10: Side-by-Side Product Comparison Modal with Best Match Highlight */}
      {comparisonResult && (
        <div className="modal show d-block tab-modal-backdrop" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
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
                {/* Highlight Best Match For You */}
                {(() => {
                  const bestItem = comparisonResult.comparison.find(
                    (item) => item.id === comparisonResult.best_match_product_id
                  );
                  if (!bestItem) return null;
                  return (
                    <div className="alert alert-success p-3 rounded-4 mb-4 border border-success border-opacity-50 shadow-sm d-flex align-items-center gap-3">
                      <span className="fs-1">🏆</span>
                      <div>
                        <div className="fw-bold fs-5 text-success">Best Match For You: {bestItem.brand} {bestItem.name}</div>
                        <div className="small text-dark text-opacity-75">
                          Personalized Suitability Rating: <strong>{bestItem.suitability_score}%</strong> — Top recommended product based on your skin type, primary concerns, and safety parameters.
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <table className={`table table-bordered align-middle ${isDarkMode ? "table-dark" : ""}`}>
                  <thead>
                    <tr>
                      <th style={{ minWidth: "160px" }}>Attribute</th>
                      {comparisonResult.comparison.map((item) => (
                        <th
                          key={item.id}
                          style={{ minWidth: "240px" }}
                          className={item.id === comparisonResult.best_match_product_id ? "table-success text-dark fw-bold" : ""}
                        >
                          {item.id === comparisonResult.best_match_product_id && (
                            <span className="badge bg-success text-white rounded-pill mb-2 d-block">
                              🏆 Best Match For You
                            </span>
                          )}
                          <div className="fw-bold">{item.name}</div>
                          <div className="small text-secondary">{item.brand} ({item.category})</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-bold">Price (INR)</td>
                      {comparisonResult.comparison.map((item) => (
                        <td key={item.id}>
                          <div className="fw-bold text-success fs-5">{formatINR(item.price)}</div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="fw-bold">Suitability Score</td>
                      {comparisonResult.comparison.map((item) => (
                        <td key={item.id}>
                          <span className={`badge px-3 py-2 rounded-pill ${getScoreBadgeClass(item.suitability_score)}`}>
                            ⚡ {item.suitability_score}% Match
                          </span>
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
                    <tr>
                      <td className="fw-bold">User Personal Match</td>
                      {comparisonResult.comparison.map((item) => (
                        <td key={item.id}>
                          <ul className="ps-3 m-0 small text-secondary">
                            {item.pros.map((pro, idx) => (
                              <li key={idx}>{pro}</li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="fw-bold">Available Stores & Buy Links</td>
                      {comparisonResult.comparison.map((item) => {
                        const fullProd = selectedForComparison.find((p) => p.product.id === item.id)?.product;
                        return (
                          <td key={item.id}>
                            <StorePurchaseButtons
                              purchaseLinks={item.purchase_links || fullProd?.purchase_links}
                              fallbackUrl={item.purchase_url || fullProd?.purchase_url}
                              price={item.price}
                              size="sm"
                            />
                          </td>
                        );
                      })}
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
                    Comparing alternatives for: <strong>{activeAlternativeData.original_product.brand} {activeAlternativeData.original_product.name}</strong> ({formatINR(activeAlternativeData.original_product.price)})
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
                          <div className="text-end d-flex flex-column align-items-end gap-2">
                            <div>
                              <div className="fw-bold text-success fs-5">{formatINR(alt.product.price)}</div>
                              <span className={`badge rounded-pill ${alt.price_difference < 0 ? "bg-success" : "bg-secondary"}`}>
                                {alt.price_difference < 0 ? `Budget Saver` : `Premium Alternative`}
                              </span>
                            </div>
                            <StorePurchaseButtons
                              purchaseLinks={alt.product.purchase_links}
                              fallbackUrl={alt.product.purchase_url}
                              price={alt.product.price}
                              size="sm"
                              fullWidth={false}
                            />
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

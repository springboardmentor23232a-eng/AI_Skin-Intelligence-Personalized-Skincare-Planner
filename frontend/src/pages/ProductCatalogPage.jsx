import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import apiService from "../services/apiService";
import { useTheme } from "../context/ThemeContext";

export default function ProductCatalogPage() {
  const { isDarkMode } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSkinType, setSelectedSkinType] = useState("All");
  const [selectedConcern, setSelectedConcern] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(200);
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  const categories = ["All", "Cleanser", "Serum", "Moisturizer", "Sunscreen", "Treatment", "Toner"];
  const skinTypes = ["All", "Oily", "Dry", "Combination", "Sensitive", "Normal"];
  const skinConcerns = [
    "All",
    "Acne / Breakouts",
    "Hyperpigmentation",
    "Dryness & Dehydration",
    "Sensitivity",
    "Fine Lines & Wrinkles",
    "Redness & Rosacea",
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (selectedSkinType !== "All") params.skin_type = selectedSkinType;
      if (selectedConcern !== "All") params.concern = selectedConcern;
      if (searchQuery) params.search = searchQuery;
      if (maxPrice < 200) params.max_price = maxPrice;

      const data = await apiService.getProducts(params);
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products database", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedSkinType, selectedConcern, searchQuery, maxPrice]);

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSelectedSkinType("All");
    setSelectedConcern("All");
    setSearchQuery("");
    setMaxPrice(200);
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
                <span className="fs-3">🛍️</span> Skincare Product Intelligence Catalog
              </h2>
              <p className="text-secondary m-0">
                Explore clinical formulations, active ingredient profiles, and dermatological suitability ratings.
              </p>
            </div>
            <button className="btn btn-outline-primary rounded-pill px-4" onClick={fetchProducts}>
              🔄 Refresh Catalog
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className={`card p-4 mb-4 border-0 shadow-sm rounded-4 ${isDarkMode ? "bg-secondary bg-opacity-10 text-light" : "bg-white"}`}>
            <div className="row g-3">
              {/* Search Bar */}
              <div className="col-md-4">
                <label className="form-label small text-secondary fw-semibold">Search Products or Brands</label>
                <div className="input-group">
                  <span className={`input-group-text ${isDarkMode ? "bg-dark text-light border-secondary" : "bg-light"}`}>🔍</span>
                  <input
                    type="text"
                    className={`form-control ${isDarkMode ? "bg-dark text-light border-secondary" : ""}`}
                    placeholder="e.g. CeraVe, Niacinamide, Retinol..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="col-md-2 col-6">
                <label className="form-label small text-secondary fw-semibold">Category</label>
                <select
                  className={`form-select ${isDarkMode ? "bg-dark text-light border-secondary" : ""}`}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Skin Type Filter */}
              <div className="col-md-2 col-6">
                <label className="form-label small text-secondary fw-semibold">Skin Type</label>
                <select
                  className={`form-select ${isDarkMode ? "bg-dark text-light border-secondary" : ""}`}
                  value={selectedSkinType}
                  onChange={(e) => setSelectedSkinType(e.target.value)}
                >
                  {skinTypes.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Concern Filter */}
              <div className="col-md-2 col-6">
                <label className="form-label small text-secondary fw-semibold">Primary Concern</label>
                <select
                  className={`form-select ${isDarkMode ? "bg-dark text-light border-secondary" : ""}`}
                  value={selectedConcern}
                  onChange={(e) => setSelectedConcern(e.target.value)}
                >
                  {skinConcerns.map((sc) => (
                    <option key={sc} value={sc}>
                      {sc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Slider */}
              <div className="col-md-2 col-6">
                <label className="form-label small text-secondary fw-semibold">Max Price (${maxPrice})</label>
                <input
                  type="range"
                  className="form-range mt-2"
                  min="5"
                  max="200"
                  step="5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary border-opacity-25">
              <span className="small text-secondary">
                Showing <strong>{products.length}</strong> matching formulations
              </span>
              <button className="btn btn-sm btn-link text-decoration-none" onClick={handleResetFilters}>
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          {loading ? (
            <div className="text-center my-5 py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading Products...</span>
              </div>
              <p className="mt-3 text-secondary">Analyzing clinical database...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-5">
              <span className="fs-1">🔍</span>
              <h4 className="mt-3">No matching skincare products found</h4>
              <p className="text-secondary">Try relaxing your search terms or filter parameters.</p>
              <button className="btn btn-primary rounded-pill mt-2" onClick={handleResetFilters}>
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {products.map((prod) => (
                <div key={prod.id} className="col-lg-4 col-md-6">
                  <div
                    className={`card h-100 border-0 rounded-4 shadow-sm transition-all hover-lift ${
                      isDarkMode ? "bg-secondary bg-opacity-10 text-light" : "bg-white"
                    }`}
                    style={{ transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
                  >
                    <div className="card-body p-4 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold">
                          {prod.category}
                        </span>
                        <span className="fw-bold text-success fs-5">${prod.price.toFixed(2)}</span>
                      </div>

                      <div className="small text-uppercase fw-bold text-secondary mb-1">{prod.brand}</div>
                      <h5 className="fw-bold card-title mb-2">{prod.name}</h5>

                      <div className="d-flex align-items-center gap-1 mb-3">
                        <span className="text-warning">★</span>
                        <span className="fw-semibold small">{prod.rating} / 5.0</span>
                      </div>

                      <p className="card-text text-secondary small flex-grow-1 line-clamp-3">
                        {prod.description}
                      </p>

                      <div className="mt-3">
                        <div className="small text-secondary fw-semibold mb-2">Active Ingredients:</div>
                        <div className="d-flex flex-wrap gap-1 mb-3">
                          {prod.active_ingredients.map((ing, idx) => (
                            <span key={idx} className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded-pill px-2 py-1">
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        className="btn btn-outline-primary w-100 rounded-pill mt-auto fw-semibold"
                        onClick={() => setActiveModalProduct(prod)}
                      >
                        View Full Details & Suitability
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Product Detail Modal */}
      {activeModalProduct && (
        <div className="modal show d-block tab-modal-backdrop" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className={`modal-content border-0 rounded-4 shadow-lg ${isDarkMode ? "bg-dark text-light" : "bg-white"}`}>
              <div className="modal-header border-0 pb-0">
                <div>
                  <span className="badge bg-primary rounded-pill px-3 py-1 mb-2">{activeModalProduct.category}</span>
                  <h4 className="fw-bold m-0">{activeModalProduct.name}</h4>
                  <div className="text-secondary fw-semibold small">{activeModalProduct.brand}</div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setActiveModalProduct(null)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <h6 className="fw-bold text-primary mb-2">Product Overview</h6>
                    <p className="text-secondary">{activeModalProduct.description}</p>

                    <h6 className="fw-bold text-primary mb-2">Usage Instructions</h6>
                    <p className="text-secondary small">{activeModalProduct.usage_instructions || "Apply as directed by dermatologist."}</p>

                    <div className="d-flex align-items-center gap-3 mt-3 p-3 rounded-3 bg-primary bg-opacity-10">
                      <div>
                        <div className="small text-secondary">Market Price</div>
                        <div className="fs-4 fw-bold text-success">${activeModalProduct.price.toFixed(2)}</div>
                      </div>
                      <div className="border-start border-secondary opacity-25 ps-3">
                        <div className="small text-secondary">Clinical Score</div>
                        <div className="fs-5 fw-bold text-warning">★ {activeModalProduct.rating} / 5</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-bold text-info mb-2">Active Ingredients Profile</h6>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {activeModalProduct.active_ingredients.map((ing, idx) => (
                        <span key={idx} className="badge bg-info bg-opacity-20 text-info border border-info rounded-pill px-3 py-2">
                          ⚡ {ing}
                        </span>
                      ))}
                    </div>

                    <h6 className="fw-bold text-success mb-2">Suitable Skin Types</h6>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {activeModalProduct.suitable_skin_types.map((st, idx) => (
                        <span key={idx} className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1">
                          ✓ {st}
                        </span>
                      ))}
                    </div>

                    <h6 className="fw-bold text-warning mb-2">Target Skin Concerns</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {activeModalProduct.suitable_concerns.map((sc, idx) => (
                        <span key={idx} className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-1">
                          🎯 {sc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-secondary rounded-pill px-4" onClick={() => setActiveModalProduct(null)}>
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

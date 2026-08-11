import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import apiService from "../services/apiService";
import { useTheme } from "../context/ThemeContext";
import { ShoppingBag, RefreshCw, Search, Star, X } from "lucide-react";

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
        <main className="flex-grow-1 p-4" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h4 className="fw-bold m-0 d-flex align-items-center gap-2 text-gradient-cyber" style={{ letterSpacing: "-0.02em" }}>
                <ShoppingBag size={22} className="text-primary" />
                <span>Skincare Product Intelligence Catalog</span>
              </h4>
              <p className="text-secondary m-0 small">
                Explore clinical formulations, active ingredient profiles, and dermatological suitability ratings.
              </p>
            </div>

            <button className="btn btn-saas-secondary btn-sm" onClick={fetchProducts}>
              <RefreshCw size={12} className="me-1" /> Refresh
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="saas-card mb-4 shadow-sm">
            <div className="row g-3">
              {/* Search Bar */}
              <div className="col-md-4">
                <label className="form-label-saas">Search Products or Brands</label>
                <div className="position-relative">
                  <Search size={14} className="position-absolute text-muted" style={{ left: "10px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    className="form-control-saas"
                    placeholder="e.g. CeraVe, Niacinamide..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: "30px", fontSize: "0.8rem" }}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="col-md-2 col-6">
                <label className="form-label-saas">Category</label>
                <select
                  className="form-control-saas"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ fontSize: "0.8rem" }}
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
                <label className="form-label-saas">Skin Type</label>
                <select
                  className="form-control-saas"
                  value={selectedSkinType}
                  onChange={(e) => setSelectedSkinType(e.target.value)}
                  style={{ fontSize: "0.8rem" }}
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
                <label className="form-label-saas">Primary Concern</label>
                <select
                  className="form-control-saas"
                  value={selectedConcern}
                  onChange={(e) => setSelectedConcern(e.target.value)}
                  style={{ fontSize: "0.8rem" }}
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
                <label className="form-label-saas">Max Price (${maxPrice})</label>
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

            <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top" style={{ borderColor: "var(--border-subtle)" }}>
              <span className="small text-secondary" style={{ fontSize: "0.75rem" }}>
                Showing <strong>{products.length}</strong> matching formulations
              </span>
              <button className="btn btn-sm btn-link text-decoration-none text-muted" onClick={handleResetFilters} style={{ fontSize: "0.75rem" }}>
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          {loading ? (
            <div className="text-center my-5 py-5">
              <div className="spinner-border spinner-border-sm text-secondary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-secondary small">Analyzing formulations...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-5 saas-card">
              <ShoppingBag size={24} className="text-muted mx-auto mb-2" />
              <h6 className="fw-semibold">No matching skincare products found</h6>
              <p className="text-secondary small mb-3">Try relaxing your search terms or filter parameters.</p>
              <button className="btn btn-saas btn-sm" onClick={handleResetFilters}>
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="row g-3">
              {products.map((prod) => (
                <div key={prod.id} className="col-lg-4 col-md-6">
                  <div className="saas-card h-100 d-flex flex-column p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge-saas badge-saas-primary" style={{ fontSize: "0.7rem" }}>
                        {prod.category}
                      </span>
                      <span className="fw-semibold text-secondary" style={{ fontSize: "0.9rem" }}>${prod.price.toFixed(2)}</span>
                    </div>

                    <div className="small text-uppercase fw-semibold text-muted mb-1" style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}>{prod.brand}</div>
                    <h6 className="fw-semibold mb-2" style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>{prod.name}</h6>

                    <div className="d-flex align-items-center gap-1 mb-3">
                      <Star size={12} className="text-warning fill-warning" />
                      <span className="fw-semibold small" style={{ fontSize: "0.75rem" }}>{prod.rating} / 5.0</span>
                    </div>

                    <p className="text-secondary small flex-grow-1 mb-3" style={{ fontSize: "0.8rem", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {prod.description}
                    </p>

                    <div className="mt-auto">
                      <div className="d-flex flex-wrap gap-1 mb-3">
                        {prod.active_ingredients.map((ing, idx) => (
                          <span key={idx} className="badge-saas badge-saas-info" style={{ fontSize: "0.65rem" }}>
                            {ing}
                          </span>
                        ))}
                      </div>

                      <button
                        className="btn btn-saas-secondary w-100 btn-sm"
                        onClick={() => setActiveModalProduct(prod)}
                        style={{ fontSize: "0.75rem" }}
                      >
                        View Full Details
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
        <div className="modal-backdrop-saas" onClick={() => setActiveModalProduct(null)}>
          <div className="modal-content-saas" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "640px" }}>
            <div className="modal-header-saas">
              <div>
                <span className="badge-saas badge-saas-primary mb-2" style={{ fontSize: "0.65rem" }}>{activeModalProduct.category}</span>
                <h6 className="fw-semibold m-0" style={{ fontSize: "1rem" }}>{activeModalProduct.name}</h6>
                <div className="text-muted small" style={{ fontSize: "0.75rem" }}>{activeModalProduct.brand}</div>
              </div>
              <button type="button" className="btn border-0 p-1" onClick={() => setActiveModalProduct(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body-saas">
              <div className="row g-3">
                <div className="col-md-6">
                  <h6 className="small fw-semibold text-muted text-uppercase mb-2" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>Product Overview</h6>
                  <p className="text-secondary small mb-3" style={{ fontSize: "0.8rem", lineHeight: "1.4" }}>{activeModalProduct.description}</p>

                  <h6 className="small fw-semibold text-muted text-uppercase mb-2" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>Usage Instructions</h6>
                  <p className="text-secondary small mb-3" style={{ fontSize: "0.8rem", lineHeight: "1.4" }}>{activeModalProduct.usage_instructions || "Apply as directed by skincare protocol."}</p>

                  <div className="d-flex align-items-center gap-3 p-3 rounded" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}>
                    <div>
                      <div className="small text-muted" style={{ fontSize: "0.7rem" }}>Price</div>
                      <div className="fw-semibold" style={{ fontSize: "1rem" }}>${activeModalProduct.price.toFixed(2)}</div>
                    </div>
                    <div className="border-start border-secondary opacity-25 ps-3" style={{ height: "24px" }} />
                    <div>
                      <div className="small text-muted" style={{ fontSize: "0.7rem" }}>Score</div>
                      <div className="fw-semibold" style={{ fontSize: "1rem" }}>{activeModalProduct.rating} / 5.0</div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <h6 className="small fw-semibold text-muted text-uppercase mb-2" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>Active Ingredients Profile</h6>
                  <div className="d-flex flex-wrap gap-1 mb-3">
                    {activeModalProduct.active_ingredients.map((ing, idx) => (
                      <span key={idx} className="badge-saas badge-saas-info" style={{ fontSize: "0.7rem" }}>
                        {ing}
                      </span>
                    ))}
                  </div>

                  <h6 className="small fw-semibold text-muted text-uppercase mb-2" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>Suitable Skin Types</h6>
                  <div className="d-flex flex-wrap gap-1 mb-3">
                    {activeModalProduct.suitable_skin_types.map((st, idx) => (
                      <span key={idx} className="badge-saas badge-saas-success" style={{ fontSize: "0.7rem" }}>
                        {st}
                      </span>
                    ))}
                  </div>

                  <h6 className="small fw-semibold text-muted text-uppercase mb-2" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>Target Skin Concerns</h6>
                  <div className="d-flex flex-wrap gap-1">
                    {activeModalProduct.suitable_concerns.map((sc, idx) => (
                      <span key={idx} className="badge-saas badge-saas-warning" style={{ fontSize: "0.7rem" }}>
                        {sc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer-saas">
              <button className="btn btn-saas-secondary btn-sm" onClick={() => setActiveModalProduct(null)} style={{ fontSize: "0.8rem" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

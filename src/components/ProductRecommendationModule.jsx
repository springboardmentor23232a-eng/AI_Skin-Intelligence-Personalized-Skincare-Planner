import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { ShoppingBag, Star, AlertTriangle, ExternalLink } from "lucide-react";

const ProductRecommendationModule = ({ _onToast }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function loadRecs() {
      try {
        const res = await apiService.getMyProductRecommendations(selectedCategory === "ALL" ? "" : selectedCategory);
        if (!ignore) setRecommendations(res || []);
      } catch (err) {
        console.warn("Could not load product recommendations:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadRecs();
    return () => {
      ignore = true;
    };
  }, [selectedCategory]);

  const getMatchBadgeStyle = (level) => {
    if (level === "EXCELLENT_MATCH") return { bg: "rgba(34, 197, 94, 0.12)", color: "#10B981", border: "1px solid rgba(34, 197, 94, 0.3)" };
    if (level === "GOOD_MATCH") return { bg: "rgba(59, 130, 246, 0.12)", color: "#3B82F6", border: "1px solid rgba(59, 130, 246, 0.3)" };
    return { bg: "rgba(245, 158, 11, 0.12)", color: "#F59E0B", border: "1px solid rgba(245, 158, 11, 0.3)" };
  };

  return (
    <div id="products" className="glass-card" style={{ marginBottom: "2rem", padding: "1.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "0.6rem", margin: 0 }}>
            <span style={{ padding: "0.45rem", background: "rgba(139, 92, 246, 0.12)", borderRadius: "50%", color: "var(--accent)", display: "flex" }}>
              <ShoppingBag size={22} />
            </span>
            Product Recommendation Engine
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0.25rem 0 0 0" }}>
            AI-generated product matches based on your latest skin health assessment, concerns, and active ingredients compatibility.
          </p>
        </div>

        {/* Category Filters */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {["ALL", "Cleanser", "Serum", "Moisturizer", "Sunscreen", "Exfoliant", "Mask"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="btn"
              style={{
                padding: "0.3rem 0.75rem",
                fontSize: "0.75rem",
                background: selectedCategory === cat ? "var(--primary)" : "var(--input-bg)",
                color: selectedCategory === cat ? "#fff" : "var(--text-secondary)",
                borderColor: selectedCategory === cat ? "var(--primary)" : "var(--border-color)",
                borderRadius: "20px"
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)", fontSize: "0.88rem" }}>
          Calculating AI match scores & recommendations...
        </div>
      ) : recommendations.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
          No recommended products found for category '{selectedCategory}'.
        </div>
      ) : (
        <div className="grid-layout grid-4-col">
          {recommendations.map((prod) => {
            const badgeStyle = getMatchBadgeStyle(prod.match_level);
            return (
              <div key={prod.id} className="product-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div className="product-image-wrap" style={{ position: "relative" }}>
                    <img src={prod.image_url || "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300"} alt={prod.name} />
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
                        padding: "0.2rem 0.5rem",
                        borderRadius: "12px",
                        backdropFilter: "blur(4px)"
                      }}
                    >
                      ⚡ {prod.match_score}% MATCH
                    </span>
                  </div>

                  <div style={{ marginTop: "0.75rem" }}>
                    <span className="product-brand">{prod.brand}</span>
                    <h4 className="product-title" style={{ fontSize: "0.92rem", marginBottom: "0.25rem" }}>{prod.name}</h4>
                    
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                      Target: {prod.target_skin_types}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.6rem" }}>
                      {prod.matched_concerns.map((mc, idx) => (
                        <span key={idx} style={{ fontSize: "0.65rem", background: "var(--primary-light)", color: "var(--primary)", padding: "0.1rem 0.4rem", borderRadius: "10px", fontWeight: 600 }}>
                          ✓ {mc}
                        </span>
                      ))}
                    </div>

                    {prod.safety_warnings && prod.safety_warnings.length > 0 && (
                      <div style={{ fontSize: "0.7rem", color: "var(--warning)", background: "rgba(245, 158, 11, 0.1)", padding: "0.35rem 0.5rem", borderRadius: "4px", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <AlertTriangle size={12} /> {prod.safety_warnings[0]}
                      </div>
                    )}

                    <div style={{ fontSize: "0.78rem", color: "var(--warning)", fontWeight: 700, marginBottom: "0.65rem", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Star size={13} fill="currentColor" /> {prod.rating} <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>({prod.reviews_count} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="product-card-footer" style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.65rem", marginTop: "0.5rem" }}>
                  <div>
                    <span className="product-price">₹{prod.price}</span>
                  </div>

                  <a
                    href={prod.buyUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                  >
                    View Store <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductRecommendationModule;

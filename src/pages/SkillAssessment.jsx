import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import JwtInspector from "../components/JwtInspector";
import CameraModal from "../components/CameraModal";
import { Sparkles, Camera, Upload, ShieldCheck, Star, Globe, ShoppingCart } from "lucide-react";

// Product Recommendations Dataset for CeraVe, Cetaphil, La Roche-Posay, Neutrogena, The Ordinary, Minimalist, Dot & Key
const BRAND_PRODUCTS = [
  {
    id: "p1",
    name: "Hydrating Facial Cleanser",
    brand: "CeraVe",
    brandUrl: "https://www.cerave.com",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500",
    description: "Gentle non-foaming cleanser with 3 essential ceramides and hyaluronic acid for moisture barrier preservation.",
    ingredients: ["Ceramides 1, 3, 6-II", "Hyaluronic Acid", "Glycerin"],
    benefits: ["Barrier Repair", "Non-Stripping Cleansing", "24h Dewy Finish"],
    suitableSkinType: "Dry, Combination, Sensitive",
    suitableConcerns: "Dryness, Barrier Repair, Dehydration",
    instructions: "Apply morning & evening to wet skin. Massage gently and rinse thoroughly with lukewarm water.",
    price: "$15.99",
    oldPrice: "$19.99",
    discount: "20% OFF",
    rating: 4.8,
    reviews: "2.4k",
    buyUrl: "https://www.cerave.com/skincare/cleansers/hydrating-facial-cleanser"
  },
  {
    id: "p2",
    name: "Gentle Skin Cleanser",
    brand: "Cetaphil",
    brandUrl: "https://www.cetaphil.com",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500",
    description: "Dermatologist-recommended hydrating formula with Niacinamide and Panthenol for daily sensitive skin cleansing.",
    ingredients: ["Niacinamide (B3)", "Panthenol (B5)", "Glycerin"],
    benefits: ["Soothes Redness", "Hypoallergenic", "Soap-Free"],
    suitableSkinType: "Sensitive, Normal, Dry",
    suitableConcerns: "Sensitivity, Redness, Irritation",
    instructions: "Use daily without water or massage onto wet skin and rinse.",
    price: "$13.49",
    oldPrice: "$16.99",
    discount: "21% OFF",
    rating: 4.7,
    reviews: "1.8k",
    buyUrl: "https://www.cetaphil.com/us/cleansers/gentle-skin-cleanser/302990110227.html"
  },
  {
    id: "p3",
    name: "Anthelios Melt-in Milk Sunscreen SPF 60",
    brand: "La Roche-Posay",
    brandUrl: "https://www.laroche-posay.us",
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500",
    description: "Award-winning broad spectrum UVA/UVB protection infused with Cell-Ox Shield technology and antioxidants.",
    ingredients: ["Avobenzone", "Cell-Ox Shield", "Thermal Spring Water"],
    benefits: ["UVA/UVB Protection", "Fast Absorbing", "Water Resistant 80m"],
    suitableSkinType: "All Skin Types, Sensitive",
    suitableConcerns: "UV Damage, Photo-Aging, Sunburn Protection",
    instructions: "Apply generously 15 minutes before sun exposure. Reapply after 80 minutes of swimming or sweating.",
    price: "$25.99",
    oldPrice: "$31.99",
    discount: "18% OFF",
    rating: 4.9,
    reviews: "3.1k",
    buyUrl: "https://www.laroche-posay.us/our-products/sunscreen/body-sunscreen/anthelios-melt-in-milk-sunscreen-spf-60-antheliosbody spf60.html"
  },
  {
    id: "p4",
    name: "Hydro Boost Water Gel Moisturizer",
    brand: "Neutrogena",
    brandUrl: "https://www.neutrogena.com",
    image: "https://images.unsplash.com/photo-1608248597261-83325705438f?w=500",
    description: "Oil-free gel moisturizer that instantly quenches dry skin and keeps it looking smooth and supple.",
    ingredients: ["Hyaluronic Acid", "Olive Extract", "Glycerin"],
    benefits: ["Intense Hydration", "Oil-Free Gel", "Non-Comedogenic"],
    suitableSkinType: "Oily, Combination, Dehydrated",
    suitableConcerns: "Dehydration, Dullness, Oil Control",
    instructions: "Smooth evenly over face and neck morning and night after cleansing.",
    price: "$19.99",
    oldPrice: "$24.99",
    discount: "20% OFF",
    rating: 4.6,
    reviews: "1.5k",
    buyUrl: "https://www.neutrogena.com/products/skincare/neutrogena-hydro-boost-water-gel/6811047.html"
  },
  {
    id: "p5",
    name: "Niacinamide 10% + Zinc 1%",
    brand: "The Ordinary",
    brandUrl: "https://theordinary.com",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500",
    description: "High-strength vitamin and mineral formula to reduce the appearance of skin blemishes and congestion.",
    ingredients: ["10% Niacinamide", "1% Zinc PCA", "Tamarind Extract"],
    benefits: ["Controls Sebum", "Minimizes Pores", "Evens Texture"],
    suitableSkinType: "Oily, Combination, Blemish-Prone",
    suitableConcerns: "Acne, Enlarged Pores, Uneven Texture",
    instructions: "Apply to entire face morning and evening before heavier creams.",
    price: "$6.00",
    oldPrice: "$8.50",
    discount: "29% OFF",
    rating: 4.5,
    reviews: "4.2k",
    buyUrl: "https://theordinary.com/en-us/niacinamide-10-zinc-1-acne-serum-100436.html"
  },
  {
    id: "p6",
    name: "10% Vitamin C Face Serum",
    brand: "Minimalist",
    brandUrl: "https://beminimalist.co",
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?w=500",
    description: "Stable Ethyl Ascorbic Acid serum with Centella Water for glowing, radiant skin and pigment brightening.",
    ingredients: ["10% Ethyl Ascorbic Acid", "Centella Asiatica Water", "Acetyl Glucosamine"],
    benefits: ["Brightens Dark Spots", "Fights Free Radicals", "Collagen Support"],
    suitableSkinType: "All Skin Types",
    suitableConcerns: "Hyperpigmentation, Dark Spots, Dullness",
    instructions: "Apply 2-3 drops in the morning after cleansing. Follow with moisturizer and sunscreen.",
    price: "$12.99",
    oldPrice: "$15.99",
    discount: "18% OFF",
    rating: 4.7,
    reviews: "1.9k",
    buyUrl: "https://beminimalist.co/products/vitamin-c-10"
  },
  {
    id: "p7",
    name: "Watermelon Cooling Sunscreen SPF 50",
    brand: "Dot & Key",
    brandUrl: "https://www.dotandkey.com",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500",
    description: "Lightweight fluid sunscreen enriched with real watermelon extract & Hyaluronic acid for zero white cast cooling.",
    ingredients: ["Watermelon Extract", "Hyaluronic Acid", "Titanium Dioxide"],
    benefits: ["Zero White Cast", "Instant Cooling", "Blue Light Defense"],
    suitableSkinType: "Oily, Sensitive, Combination",
    suitableConcerns: "Sunburn, Tanning, Heat Rash",
    instructions: "Dot across face and neck 20 mins before stepping outdoors.",
    price: "$11.50",
    oldPrice: "$14.99",
    discount: "23% OFF",
    rating: 4.8,
    reviews: "1.1k",
    buyUrl: "https://www.dotandkey.com/products/watermelon-cooling-sunscreen-spf-50-pa"
  }
];

const SkillAssessment = () => {
  const [skinType, setSkinType] = useState("COMBINATION");
  const [skinConcern, setSkinConcern] = useState("HYPERPIGMENTATION");
  const [sunExposure, setSunExposure] = useState("MODERATE");
  const [waterIntake, setWaterIntake] = useState(2500);

  // Image Upload & Real-Time Camera States
  const [selectedImage, setSelectedImage] = useState(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const [assessmentResult, setAssessmentResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerCameraCapture = () => {
    setIsCameraModalOpen(true);
  };

  const handleCameraCapture = (capturedDataUrl) => {
    setSelectedImage(capturedDataUrl);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      let detectedDisease = "No Malignant Pathologies Detected (Healthy Barrier)";
      if (skinConcern === "ACNE") detectedDisease = "Grade I Acne Vulgaris (Mild Inflammatory Lesions)";
      if (skinConcern === "ROSACEA") detectedDisease = "Erythematotelangiectatic Rosacea (Facial Flush)";
      if (skinConcern === "ECZEMA") detectedDisease = "Atopic Dermatitis Flare (Epidermal Barrier Compromise)";
      if (skinConcern === "HYPERPIGMENTATION") detectedDisease = "Post-Inflammatory Hyperpigmentation (PIH)";

      const score = skinType === "SENSITIVE" ? 78 : skinType === "DRY" ? 82 : 89;

      const filteredProducts = BRAND_PRODUCTS.filter(p => 
        p.suitableSkinType.toLowerCase().includes(skinType.toLowerCase()) || 
        p.suitableSkinType.toLowerCase().includes("all") ||
        p.suitableConcerns.toLowerCase().includes(skinConcern.toLowerCase())
      );

      setAssessmentResult({
        skinType,
        detectedDisease,
        assessmentScore: score,
        aiDiagnosis: `AI Optical Intelligence Diagnosis:\n• Detected Skin Type: ${skinType} Skin.\n• Detected Condition: ${detectedDisease}.\n• Barrier Index: ${score}/100.\n• Daily Water Intake: ${waterIntake} ml logged.\n\nKey Recommendation: Maintain gentle non-stripping cleansing, layer barrier-restoring ceramide formulations, and apply broad-spectrum SPF 30+ daily.`,
        recommendedProducts: filteredProducts.length > 0 ? filteredProducts : BRAND_PRODUCTS.slice(0, 4)
      });

      setLoading(false);
    }, 1200);
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <div className="dashboard-content">
        <Sidebar />

        <main className="main-viewport">
          <JwtInspector />

          <div className="section-header">
            <div>
              <h2><Sparkles className="icon-title" style={{ color: 'var(--primary)' }} /> AI Skin Analysis &amp; Disease Detection Engine</h2>
              <p>Upload a clear photo or use real-time camera scan to evaluate skin type, detect concerns, and get expert brand recommendations.</p>
            </div>
          </div>

          <div className="grid-layout grid-2-col">
            {/* Input & Image Upload Card */}
            <div className="glass-card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3>Scan &amp; Input Data</h3>
                <Sparkles size={20} style={{ color: 'var(--primary)' }} />
              </div>

              {/* Image Upload & Camera Capture Zone */}
              <div style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center',
                background: 'var(--input-bg)',
                marginBottom: '1.5rem',
                position: 'relative'
              }}>
                {selectedImage ? (
                  <div style={{ position: 'relative', width: '100%', maxHeight: '200px', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <img src={selectedImage} alt="Uploaded Skin Preview" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(15, 23, 42, 0.75)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div>
                    <Camera size={36} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>Upload Photo or Capture Facial Scan</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>JPG, PNG or WEBP up to 10MB</p>
                    
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                      <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                        <Upload size={16} /> <span>Upload Image</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                      </label>

                      <button type="button" onClick={triggerCameraCapture} className="btn btn-primary">
                        <Camera size={16} /> <span>Camera Capture</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <CameraModal
                isOpen={isCameraModalOpen}
                onClose={() => setIsCameraModalOpen(false)}
                onCapture={handleCameraCapture}
                title="Facial Optical Skin Scanner"
              />

              <form onSubmit={handleAnalyze} className="form-container">
                <div className="grid-2-col">
                  <div className="form-group">
                    <label>Self-Reported Skin Type</label>
                    <select value={skinType} onChange={(e) => setSkinType(e.target.value)}>
                      <option value="DRY">Dry Skin</option>
                      <option value="COMBINATION">Combination Skin</option>
                      <option value="OILY">Oily / Acne-Prone</option>
                      <option value="SENSITIVE">Sensitive Skin</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Primary Concern</label>
                    <select value={skinConcern} onChange={(e) => setSkinConcern(e.target.value)}>
                      <option value="HYPERPIGMENTATION">Hyperpigmentation &amp; Dark Spots</option>
                      <option value="ACNE">Acne &amp; Active Blemishes</option>
                      <option value="ROSACEA">Redness &amp; Rosacea</option>
                      <option value="ECZEMA">Eczema &amp; Dry Patches</option>
                      <option value="UV_DAMAGE">UV Sun Damage &amp; Wrinkles</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2-col">
                  <div className="form-group">
                    <label>Daily Water Intake (ml)</label>
                    <input type="number" value={waterIntake} onChange={(e) => setWaterIntake(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label>Sun Exposure Level</label>
                    <select value={sunExposure} onChange={(e) => setSunExposure(e.target.value)}>
                      <option value="LOW">Low (Indoor / Office)</option>
                      <option value="MODERATE">Moderate (1-2h Sun)</option>
                      <option value="HIGH">High (Outdoor / Athletic)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  <Sparkles size={18} />
                  <span>{loading ? "Processing AI Analysis..." : "Run AI Skin Intelligence Analysis"}</span>
                </button>
              </form>
            </div>

            {/* AI Diagnosis Output Card */}
            <div className="glass-card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3>AI Optical Diagnosis</h3>
                {assessmentResult && (
                  <span className="jwt-status-chip">Barrier Score: {assessmentResult.assessmentScore}/100</span>
                )}
              </div>

              {!assessmentResult ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <Sparkles size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                  <h4>No Optical Scan Executed</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>Upload an image or adjust input metrics above and click "Run AI Skin Intelligence Analysis" to generate report.</p>
                </div>
              ) : (
                <div className="ai-results-wrapper">
                  <div className="score-banner" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    background: 'var(--input-bg)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '50%',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      flexDirection: 'column'
                    }}>
                      <span style={{ fontSize: '1.35rem', fontWeight: 800 }}>{assessmentResult.assessmentScore}</span>
                      <small style={{ fontSize: '0.65rem' }}>/ 100</small>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{assessmentResult.detectedDisease}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <strong>Skin Type:</strong> {assessmentResult.skinType}
                      </p>
                    </div>
                  </div>

                  <div className="analysis-box" style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem'
                  }}>
                    <h5 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>AI Clinical Findings</h5>
                    <p style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {assessmentResult.aiDiagnosis}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Recommendations Grid (CeraVe, Cetaphil, La Roche-Posay, Neutrogena, The Ordinary, Minimalist, Dot & Key) */}
          <div style={{ marginTop: '2.5rem' }}>
            <div className="section-header">
              <div>
                <h2><ShieldCheck className="icon-title" style={{ color: 'var(--secondary)' }} /> Targeted Product Recommendations</h2>
                <p>Curated skincare products from certified brands tailored to your skin type and analysis findings.</p>
              </div>
            </div>

            <div className="grid-layout grid-3-col">
              {(assessmentResult?.recommendedProducts || BRAND_PRODUCTS).map((p) => (
                <div key={p.id} className="product-card">
                  <div className="product-image-wrap">
                    <img src={p.image} alt={p.name} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span className="product-brand-tag">{p.brand}</span>
                      <a href={p.brandUrl} target="_blank" rel="noreferrer" className="link-with-icon" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '2px' }} title="Official Brand Site">
                        <Globe size={12} /> Official Site
                      </a>
                    </div>

                    <h4 className="product-title">{p.name}</h4>
                    <p className="product-details">{p.description}</p>

                    {/* Benefits checklist */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>Proven Benefits:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {p.benefits.map((b, idx) => (
                          <span key={idx} className="product-pill" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                            ✔ {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Ingredients pills */}
                    <div style={{ marginBottom: '0.85rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>Key Ingredients:</span>
                      <div className="product-pill-group">
                        {p.ingredients.map((ing, idx) => (
                          <span key={idx} className="product-pill">{ing}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                      <strong>Suitable Skin Types:</strong> {p.suitableSkinType}
                    </div>
                  </div>

                  <div className="product-card-footer">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                        <span className="product-price">{p.price}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{p.oldPrice}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--danger)', fontWeight: 800 }}>{p.discount}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--warning)', fontWeight: 700, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Star size={12} fill="currentColor" /> {p.rating} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({p.reviews})</span>
                      </div>
                    </div>

                    <a href={p.buyUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}>
                      <ShoppingCart size={14} /> <span>Buy Now</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SkillAssessment;

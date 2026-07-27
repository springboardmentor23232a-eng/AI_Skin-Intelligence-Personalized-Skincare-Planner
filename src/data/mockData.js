export const MOCK_USER_PROFILE = {
  name: "Ayush Singh",
  email: "ayush@example.com",
  role: "User",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
  skinType: "Combination (Oily T-Zone)",
  ageGroup: "22-28",
  concerns: ["Acne Scars", "Hyperpigmentation", "Uneven Texture"],
  allergies: ["Fragrance", "High-strength Benzoyl Peroxide"],
  sensitivities: ["Alcohol Denat", "Essential Oils"],
  lifestyle: {
    sleepHours: 7.5,
    sleepQuality: "Good",
    waterIntakeLiters: 2.8,
    sunExposureHours: 2.0,
    stressLevel: "Moderate",
    uvIndexToday: 6,
    city: "Mumbai, India",
    humidity: "78%"
  },
  scores: {
    condition: 78,
    lifestyle: 82,
    sleep: 75,
    routineConsistency: 90,
    hydration: 85,
    overall: 81.65 // 0.35*78 + 0.20*82 + 0.15*75 + 0.20*90 + 0.10*85
  }
};

export const INGREDIENT_DATABASE = [
  {
    id: "niacinamide",
    name: "Niacinamide (Vitamin B3)",
    rating: 98,
    safety: "Very Safe (Low Irritation)",
    category: "Vitamin / Antioxidant",
    benefits: ["Soothes redness", "Minimizes pore size", "Regulates sebum", "Fades dark spots"],
    bestFor: ["Oily Skin", "Acne-prone", "Hyperpigmentation"],
    conflicts: ["Pure L-Ascorbic Acid (Vitamin C at high concentration in same step)"],
    synergies: ["Hyaluronic Acid", "Zinc PCA", "Salicylic Acid", "Ceramides"],
    description: "Multi-functional power ingredient that strengthens epidermal barrier function, reduces transepidermal water loss, and balances oil production."
  },
  {
    id: "retinol",
    name: "Retinol / Retinoids (0.3% - 1%)",
    rating: 92,
    safety: "Use with Care (Requires Sunscreen)",
    category: "Cell Communicating / Anti-Aging",
    benefits: ["Accelerates cell turnover", "Boosts collagen", "Smooths fine lines", "Clears clogged pores"],
    bestFor: ["Aging Skin", "Textured Skin", "Acne Scars"],
    conflicts: ["AHAs/BHAs (Glycolic/Salicylic in same routine step)", "Benzoyl Peroxide", "Vitamin C"],
    synergies: ["Hyaluronic Acid", "Ceramides", "Niacinamide (Applied 15 mins prior)"],
    description: "Gold standard gold-class ingredient for cellular renewal. Promotes collagen synthesis while reducing hyperpigmentation."
  },
  {
    id: "vitamin-c",
    name: "L-Ascorbic Acid (Vitamin C 15%)",
    rating: 94,
    safety: "Safe (Potential mild tingling)",
    category: "Antioxidant / Brightening",
    benefits: ["Neutralizes free radicals", "Brightens complexion", "Boosts SPF protection", "Fades melanin spots"],
    bestFor: ["Dull Skin", "Hyperpigmentation", "Sun Damage"],
    conflicts: ["Retinol", "Copper Peptides", "AHA/BHA Acids"],
    synergies: ["Vitamin E", "Ferulic Acid", "Hyaluronic Acid"],
    description: "Potent topical antioxidant that inhibits tyrosinase activity to reduce dark spot formation and shield against oxidative environmental damage."
  },
  {
    id: "salicylic-acid",
    name: "Salicylic Acid (BHA 2%)",
    rating: 90,
    safety: "Safe for Oily/Acne Skin",
    category: "Exfoliant (Beta Hydroxy Acid)",
    benefits: ["Lipophilic pore cleanser", "Dissolves sebum", "Anti-inflammatory", "Prevents breakouts"],
    bestFor: ["Acne-prone", "Blackheads", "Oily T-Zone"],
    conflicts: ["Retinoids (at same time)", "Strong Physical Scrubs"],
    synergies: ["Niacinamide", "Centella Asiatica", "Tea Tree Extract"],
    description: "Oil-soluble acid that penetrates deep into pores to dissolve keratin plugs, excess sebum, and acne-causing bacteria."
  },
  {
    id: "hyaluronic-acid",
    name: "Hyaluronic Acid (Multi-Molecular)",
    rating: 99,
    safety: "Ultra Gentle & Safe",
    category: "Humectant / Hydration",
    benefits: ["Binds 1000x water weight", "Plumps skin layer", "Soothes irritation", "Restores moisture barrier"],
    bestFor: ["All Skin Types", "Dehydrated Skin", "Sensitive Skin"],
    conflicts: ["None"],
    synergies: ["Ceramides", "Peptides", "Niacinamide", "Glycerin"],
    description: "Essential moisture magnet that draws atmospheric moisture into the epidermis, restoring supple volume and soothing dehydration."
  },
  {
    id: "ceramides",
    name: "Ceramide NP, AP, EOP",
    rating: 99,
    safety: "Ultra Gentle & Safe",
    category: "Barrier Repair Lipids",
    benefits: ["Rebuilds stratum corneum", "Locks in hydration", "Protects against irritants", "Reduces flaking"],
    bestFor: ["Dry Skin", "Damaged Barrier", "Eczema-prone", "Post-Peel"],
    conflicts: ["None"],
    synergies: ["Cholesterol", "Free Fatty Acids", "Hyaluronic Acid"],
    description: "Bio-identical lipids that form 50% of the skin lipid matrix, sealing micro-tears and keeping harmful pollutants out."
  }
];

export const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Radiance B3 + Zinc Purifying Serum",
    brand: "DermAI Labs",
    category: "Serum",
    suitabilityScore: 97,
    price: "$28",
    rating: 4.9,
    keyIngredients: ["Niacinamide 10%", "Zinc PCA 1%", "Hyaluronic Acid"],
    bestFor: "Acne Scars, Excess Sebum, Texture",
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 2,
    name: "Ceramide Barrier Repair Moisture Surge Cream",
    brand: "SkinScience",
    category: "Moisturizer",
    suitabilityScore: 95,
    price: "$34",
    rating: 4.8,
    keyIngredients: ["Ceramides 3%", "Squalane", "Centella Asiatica"],
    bestFor: "Barrier Repair, Hydration, Sensitivity",
    imageUrl: "https://images.unsplash.com/photo-1608248597263-000796df9c11?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 3,
    name: "Invisible Sheer Sunscreen Fluid SPF 50+ PA++++",
    brand: "UV Shield Pro",
    category: "Sunscreen",
    suitabilityScore: 98,
    price: "$26",
    rating: 4.95,
    keyIngredients: ["Tinosorb S", "Uvinul A Plus", "Vitamin E"],
    bestFor: "Daily Protection, Zero White Cast, Oily Skin",
    imageUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 4,
    name: "Gentle Amino Acid Hydrating Cleanser",
    brand: "PureBotanics",
    category: "Face Wash",
    suitabilityScore: 93,
    price: "$22",
    rating: 4.7,
    keyIngredients: ["Sodium Cocoyl Glycinate", "Panthenol", "Green Tea Extract"],
    bestFor: "Daily Cleansing, pH 5.5 Balanced",
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 5,
    name: "Overnight Renewal Micro-Encapsulated Retinol 0.5%",
    brand: "DermAI Labs",
    category: "Night Treatment",
    suitabilityScore: 89,
    price: "$42",
    rating: 4.85,
    keyIngredients: ["Encapsulated Retinol", "Bakuchiol", "Peptides"],
    bestFor: "Fine Lines, Texture, Collagen Renewal",
    imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=400"
  }
];

export const MOCK_CLIENTS_CONSULTANT = [
  {
    id: "C-101",
    name: "Krithika",
    age: 26,
    skinType: "Oily / Acne-Prone",
    skinScore: 74,
    primaryConcern: "Active Papular Acne & PIH",
    lastAssessment: "2 days ago",
    status: "Action Required",
    riskLevel: "Moderate",
    assignedRoutine: "Acne Clearing & Barrier Support",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "C-102",
    name: "Jayanthi",
    age: 34,
    skinType: "Dry & Sensitive",
    skinScore: 88,
    primaryConcern: "Dehydration & Rosacea Redness",
    lastAssessment: "Yesterday",
    status: "Progressing Well",
    riskLevel: "Low",
    assignedRoutine: "Calming Barrier Repair",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "C-103",
    name: "Karthik",
    age: 41,
    skinType: "Combination / Aging",
    skinScore: 68,
    primaryConcern: "Sun Damage & Melasma Spots",
    lastAssessment: "5 days ago",
    status: "Needs Derm Review",
    riskLevel: "High",
    assignedRoutine: "Pigment Control Protocol",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150"
  }
];

export const MOCK_PATIENTS_DERMATOLOGIST = [
  {
    id: "P-401",
    patientName: "Dr. Rahul Sharma (Ref: Patient Jayanthi)",
    age: 29,
    diagnosis: "Grade 3 Inflammatory Acne vulgaris",
    recommendedPrescription: "Topical Adapalene 0.3% + Clindamycin 1% gel",
    biopsyStatus: "Not Required",
    phototype: "Fitzpatrick Type III",
    severityIndex: 7.8,
    visitDate: "2026-07-24",
    notes: "Patient shows 40% reduction in lesion count after 4 weeks of barrier recovery prior to retinoid ramp-up."
  },
  {
    id: "P-402",
    patientName: "Ref: Patient Aliyah Khan",
    age: 45,
    diagnosis: "Moderate Erythematotelangiectatic Rosacea",
    recommendedPrescription: "Ivermectin 1% Cream OD + Oxymetazoline 1% for flareups",
    biopsyStatus: "Clear",
    phototype: "Fitzpatrick Type II",
    severityIndex: 6.2,
    visitDate: "2026-07-22",
    notes: "Advised zero physical scrubs. Added Ceramide-dominant lipid replenishing emulsion."
  }
];

export const MOCK_ADMIN_METRICS = {
  totalUsers: 14820,
  activeRoutines: 11450,
  aiClassificationAccuracy: "98.4%",
  avgResponseTimeMs: 142,
  apiGatewayRequestsToday: "428,910",
  activeDermatologists: 68,
  activeConsultants: 194,
  systemStatus: "Healthy (Docker & Cloud Operational)",
  recentLogs: [
    { id: 1, time: "11:24:02", service: "FastAPI Gateway", message: "POST /api/v1/skin-assessment 200 OK (118ms)", level: "INFO" },
    { id: 2, time: "11:22:45", service: "AI Recommendation Engine", message: "FAISS vector lookup completed in 24ms (Ranked 50 items)", level: "INFO" },
    { id: 3, time: "11:20:18", service: "Ingredient IQ Module", message: "Allergy risk flag triggered: Benzoyl Peroxide vs Sensitive Skin", level: "WARN" },
    { id: 4, time: "11:15:00", service: "PostgreSQL DB Pool", message: "Automated incremental backup synced to AWS S3", level: "SUCCESS" }
  ]
};

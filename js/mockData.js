/**
 * Mock Data Store & Master Product Catalog for PanaceaAI Platform
 * Contains 30+ real-world clinically formulated skincare products with
 * actual INR prices, e-commerce direct links (Amazon, Nykaa, Flipkart),
 * suitability scoring algorithms, product comparison matrices, and dupe suggestions.
 */

export const MOCK_ROLES = {
  USER: {
    id: 'user',
    name: 'DermaCare User',
    title: 'Skincare Consumer',
    badgeClass: 'badge-user',
    icon: '👤',
    description: 'Track skin health, manage routines & get personalized product recommendations.'
  },
  CONSULTANT: {
    id: 'consultant',
    name: 'Sarah Jenkins',
    title: 'Certified Skincare Consultant',
    badgeClass: 'badge-consultant',
    icon: '💼',
    description: 'Evaluate client profiles, build routines, and manage skincare recommendations.'
  },
  DERMATOLOGIST: {
    id: 'dermatologist',
    name: 'Dr. Elena Rostova, MD',
    title: 'Board-Certified Dermatologist',
    badgeClass: 'badge-dermatologist',
    icon: '🩺',
    description: 'Review clinical diagnostics, manage patient prescriptions, and track skin conditions.'
  },
  ADMIN: {
    id: 'admin',
    name: 'System Administrator',
    title: 'Platform Superadmin',
    badgeClass: 'badge-admin',
    icon: '🛡️',
    description: 'Monitor microservices, manage user permissions, and track platform metrics.'
  }
};

export const MOCK_USER_DATA = {
  profile: {
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    skinType: 'Combination',
    ageGroup: '25 - 34',
    primaryConcerns: ['Acne & Breakouts', 'Post-Inflammatory Hyperpigmentation', 'Redness'],
    allergies: ['Fragrance (Parfum)', 'High-Concentration Essential Oils'],
    sensitivities: ['Alcohol Denat', 'L-Ascorbic Acid > 15%']
  },
  hydrationMl: 1750,
  skinScore: {
    overall: 78,
    grade: 'Good (Improving)',
    changeThisWeek: '+4 pts',
    breakdown: [
      { name: 'Skin Condition Assessment', weight: '35%', score: 75, status: 'Moderate', color: '#C59B27' },
      { name: 'Lifestyle Habits', weight: '20%', score: 80, status: 'Optimal', color: '#2E7D32' },
      { name: 'Sleep Quality', weight: '15%', score: 70, status: 'Needs Attention', color: '#D97706' },
      { name: 'Routine Consistency', weight: '20%', score: 85, status: 'Excellent', color: '#E899A5' },
      { name: 'Hydration Level', weight: '10%', score: 80, status: 'Optimal', color: '#8E24AA' }
    ]
  },
  routine: {
    season: 'Summer ☀️',
    morning: [
      { id: 'm1', step_number: 1, step: '🧼 Cleansing', title: 'Gentle Hydrating Gel Cleanser', product_recommendation: 'The Derma Co 2% Salicylic Acid Face Wash with Witch Hazel', key_ingredients: ['Salicylic Acid 2%', 'Witch Hazel'], time: '8:00 AM', completed: true, icon: '🧼' },
      { id: 'm2', step_number: 2, step: '💧 Treatment', title: '10% Niacinamide & Zinc Serum', product_recommendation: 'Minimalist 10% Niacinamide Face Serum with Zinc PCA', key_ingredients: ['Niacinamide 10%', 'Zinc PCA 1%', 'EUK-134'], time: '8:05 AM', completed: true, icon: '💧' },
      { id: 'm3', step_number: 3, step: '🧴 Moisturizing', title: 'Ceramide Barrier Relief Cream', product_recommendation: 'CeraVe Moisturizing Cream with 3 Essential Ceramides', key_ingredients: ['Ceramides NP/AP/EOP', 'Hyaluronic Acid'], time: '8:10 AM', completed: true, icon: '🧴' },
      { id: 'm4', step_number: 4, step: '☀️ Sun Protection', title: 'Broad Spectrum SPF 50+ Invisible Fluid', product_recommendation: 'Aqualogica Radiance+ Dewy Sunscreen SPF 50+ PA++++', key_ingredients: ['Watermelon Extract', 'Niacinamide', 'Hyaluronic Acid'], time: '8:15 AM', completed: false, icon: '☀️' }
    ],
    evening: [
      { id: 'e1', step_number: 1, step: '🧼 Cleansing', title: 'PM Double Cleansing Micellar Water', product_recommendation: 'Bioderma Sensibio H2O Soothing Micellar Water', key_ingredients: ['Micellar Fatty Acid Esters', 'Cucumber Extract'], time: '9:00 PM', completed: false, icon: '🧼' },
      { id: 'e2', step_number: 2, step: '✨ Exfoliation', title: '2% BHA Salicylic Acid Liquid Exfoliant', product_recommendation: "Paula's Choice Skin Perfecting 2% BHA Liquid Exfoliant", key_ingredients: ['Salicylic Acid 2%', 'Green Tea Extract', 'Methylpropanediol'], time: '9:05 PM', completed: false, icon: '✨' },
      { id: 'e3', step_number: 3, step: '💧 Treatment', title: 'Night Renewal Retinol / Azelaic Serum', product_recommendation: 'Minimalist 0.3% Retinol Face Serum with CoQ10', key_ingredients: ['Retinol 0.3%', 'Coenzyme Q10', 'Squalane'], time: '9:10 PM', completed: false, icon: '💧' },
      { id: 'e4', step_number: 4, step: '🧴 Moisturizing', title: 'Overnight Recovery Barrier Seal', product_recommendation: 'Dot & Key Cica Calming Blemish Clearing Night Gel', key_ingredients: ['Centella Asiatica (Cica)', 'Niacinamide', 'Tea Tree Oil'], time: '9:15 PM', completed: false, icon: '🧴' },
      { id: 'e5', step_number: 5, step: '🌙 Night Care', title: 'Hydrating Sleeping Mask & Lip Butter', product_recommendation: 'Laneige Water Sleeping Mask EX with Probiotic Complex', key_ingredients: ['Probiotic Derived Complex', 'Squalane', 'Trehalose'], time: '9:20 PM', completed: false, icon: '🌙' }
    ],
    weeklyPlan: [
      { day: 'Wed & Sun Evening', focus: 'BHA Chemical Exfoliation', category: '✨ Exfoliation', treatment_name: "Paula's Choice 2% BHA Liquid Exfoliant", instructions: 'Pore clearing & smooth texture renewal.', icon: '✨' },
      { day: 'Friday Evening', focus: 'Deep Moisture Sheet Mask', category: '💧 Treatment', treatment_name: 'Cosrx Advanced Snail 96 Mucin Power Essence', instructions: 'Intense moisture infusion for 15-20 min.', icon: '💧' },
      { day: 'Saturday Morning', focus: 'Weekend Lip & Eye Ritual', category: '🌙 Night Care', treatment_name: 'Beauty of Joseon Revive Eye Serum Ginseng + Retinal', instructions: 'Nourish delicate eye & lip zones.', icon: '🌙' }
    ],
    seasonalTips: {
      season: 'Summer ☀️',
      climate_impact: 'High UV index, elevated humidity & sweat production.',
      key_focus: 'Lightweight Hydration, Sebum Control & SPF 50+ Sun Protection',
      routine_adjustments: [
        'Switch heavy occlusive creams to lightweight oil-free gel moisturizers.',
        'Ensure daily SPF is 50+ PA++++ and water/sweat resistant.',
        'Reapply sunscreen every 2 hours during direct outdoor exposure.'
      ],
      recommended_ingredients: ['Niacinamide', 'Zinc Oxide', 'Green Tea Extract', 'Hyaluronic Acid'],
      avoid_ingredients: ['Heavy Occlusive Mineral Oils', 'Alcohol Denat in toners']
    },
    adaptiveNotes: {
      mode: '🌟 Optimal Maintenance Mode',
      health_score_delta: 4.0,
      message: 'Your routine has been updated dynamically based on your latest skin profile & +4 pt score gain.',
      adjustments_made: ['Allergy safety filter active', 'AM/PM routines optimized for Combination skin type']
    }
  },

  // Dashboard quick preview products (top matches)
  recommendedProducts: [
    {
      id: 101,
      name: 'Minimalist 10% Niacinamide Face Serum with Zinc PCA',
      brand: 'Minimalist',
      category: 'Serum',
      matchScore: '98%',
      keyIngredients: ['Niacinamide 10%', 'Zinc PCA 1%', 'EUK-134'],
      reason: 'Perfect match for combination skin with active redness and post-acne pigmentation.',
      price: '₹599',
      mrp: '₹699',
      badge: 'Top Match 🌟',
      e_commerce_links: {
        amazon: 'https://www.amazon.in/s?k=Minimalist+10+Niacinamide+Serum',
        nykaa: 'https://www.nykaa.com/search/result/?q=Minimalist+10+Niacinamide+Serum',
        flipkart: 'https://www.flipkart.com/search?q=Minimalist+10+Niacinamide+Serum'
      }
    },
    {
      id: 102,
      name: 'CeraVe Moisturizing Cream with 3 Essential Ceramides',
      brand: 'CeraVe',
      category: 'Moisturizer',
      matchScore: '96%',
      keyIngredients: ['Ceramides NP/AP/EOP', 'Hyaluronic Acid', 'Glycerin'],
      reason: 'Dermatologist gold standard for barrier repair without pore-clogging heavy oils.',
      price: '₹899',
      mrp: '₹999',
      badge: 'Derm Favorite 🩺',
      e_commerce_links: {
        amazon: 'https://www.amazon.in/s?k=CeraVe+Moisturizing+Cream',
        nykaa: 'https://www.nykaa.com/search/result/?q=CeraVe+Moisturizing+Cream',
        flipkart: 'https://www.flipkart.com/search?q=CeraVe+Moisturizing+Cream'
      }
    },
    {
      id: 103,
      name: 'Aqualogica Radiance+ Dewy Sunscreen SPF 50+ PA++++',
      brand: 'Aqualogica',
      category: 'Sunscreen',
      matchScore: '94%',
      keyIngredients: ['Watermelon Extract', 'Niacinamide 2%', 'Hyaluronic Acid'],
      reason: 'Ultra-lightweight invisible dewy fluid with no white cast, perfect for summer humidity.',
      price: '₹449',
      mrp: '₹499',
      badge: 'Best Budget 💰',
      e_commerce_links: {
        amazon: 'https://www.amazon.in/s?k=Aqualogica+Radiance+Dewy+Sunscreen',
        nykaa: 'https://www.nykaa.com/search/result/?q=Aqualogica+Radiance+Dewy+Sunscreen',
        flipkart: 'https://www.flipkart.com/search?q=Aqualogica+Radiance+Dewy+Sunscreen'
      }
    },
    {
      id: 104,
      name: 'The Derma Co 2% Salicylic Acid Face Wash with Witch Hazel',
      brand: 'The Derma Co',
      category: 'Face Wash',
      matchScore: '92%',
      keyIngredients: ['Salicylic Acid 2%', 'Witch Hazel', 'Willow Bark'],
      reason: 'Deeply cleanses congested pores and regulates excess sebum without stripping hydration.',
      price: '₹349',
      mrp: '₹399',
      badge: 'Best for Acne ✨',
      e_commerce_links: {
        amazon: 'https://www.amazon.in/s?k=The+Derma+Co+2+Salicylic+Acid+Face+Wash',
        nykaa: 'https://www.nykaa.com/search/result/?q=The+Derma+Co+2+Salicylic+Acid+Face+Wash',
        flipkart: 'https://www.flipkart.com/search?q=The+Derma+Co+2+Salicylic+Acid+Face+Wash'
      }
    }
  ]
};

// ════════════════════════════════════════════════════════════════
// MASTER PRODUCT CATALOG (30+ Real Formulations with Actual Prices)
// ════════════════════════════════════════════════════════════════
export const MASTER_PRODUCT_CATALOG = [
  // 1. Cleansers / Face Wash
  {
    id: 104,
    name: 'The Derma Co 2% Salicylic Acid Face Wash with Witch Hazel',
    brand: 'The Derma Co',
    category: 'Face Wash',
    price: 349,
    mrp: 399,
    discount: '13% OFF',
    budget_tier: 'Budget',
    rating: 4.6,
    reviews_count: 8420,
    key_active_ingredients: ['Salicylic Acid 2%', 'Witch Hazel', 'Willow Bark'],
    full_ingredient_list: ['Aqua', 'Sodium Lauroyl Sarcosinate', 'Salicylic Acid', 'Witch Hazel Extract', 'Glycerin', 'Willow Bark Extract', 'Phenoxyethanol'],
    target_concerns: ['Acne & Breakouts', 'Blackheads', 'Oiliness', 'Clogged Pores'],
    suitable_skin_types: ['Oily', 'Combination', 'Acne-Prone'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Refreshing foaming gel',
    pros: ['Unclogs deep pores', 'Fragrance-free', 'Very affordable'],
    cons: ['May be drying for severely dehydrated skin if used >2x daily'],
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=The+Derma+Co+2+Salicylic+Acid+Face+Wash',
      nykaa: 'https://www.nykaa.com/search/result/?q=The+Derma+Co+2+Salicylic+Acid+Face+Wash',
      flipkart: 'https://www.flipkart.com/search?q=The+Derma+Co+2+Salicylic+Acid+Face+Wash',
      tira: 'https://www.tirabeauty.com/search?q=The+Derma+Co+Face+Wash'
    },
    dupe_ids: [105, 106]
  },
  {
    id: 105,
    name: 'Cetaphil Gentle Skin Cleanser for Dry to Normal Sensitive Skin',
    brand: 'Cetaphil',
    category: 'Face Wash',
    price: 399,
    mrp: 435,
    discount: '8% OFF',
    budget_tier: 'Budget',
    rating: 4.8,
    reviews_count: 14500,
    key_active_ingredients: ['Niacinamide', 'Panthenol (Pro-Vitamin B5)', 'Glycerin'],
    full_ingredient_list: ['Water', 'Cetyl Alcohol', 'Propylene Glycol', 'Sodium Lauryl Sulfate', 'Stearyl Alcohol', 'Niacinamide', 'Panthenol', 'Glycerin'],
    target_concerns: ['Dryness', 'Redness', 'Sensitivity', 'Barrier Impairment'],
    suitable_skin_types: ['Dry', 'Sensitive', 'Normal', 'Combination'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Non-foaming creamy lotion',
    pros: ['Dermatologist recommended', 'Non-irritating', 'Hypoallergenic'],
    cons: ['Does not foam for heavy makeup removal'],
    image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=Cetaphil+Gentle+Skin+Cleanser',
      nykaa: 'https://www.nykaa.com/search/result/?q=Cetaphil+Gentle+Skin+Cleanser',
      flipkart: 'https://www.flipkart.com/search?q=Cetaphil+Gentle+Skin+Cleanser',
      tira: 'https://www.tirabeauty.com/search?q=Cetaphil+Cleanser'
    },
    dupe_ids: [104, 106]
  },
  {
    id: 106,
    name: 'CeraVe Hydrating Cleanser with Ceramides & Hyaluronic Acid',
    brand: 'CeraVe',
    category: 'Face Wash',
    price: 749,
    mrp: 850,
    discount: '12% OFF',
    budget_tier: 'Mid-Range',
    rating: 4.9,
    reviews_count: 19800,
    key_active_ingredients: ['3 Essential Ceramides', 'Hyaluronic Acid', 'MVE Technology'],
    full_ingredient_list: ['Aqua', 'Glycerin', 'Cetearyl Alcohol', 'Ceramide NP', 'Ceramide AP', 'Ceramide EOP', 'Sodium Hyaluronate', 'Cholesterol', 'Phytosphingosine'],
    target_concerns: ['Barrier Impairment', 'Dryness', 'Flakiness', 'Sensitivity'],
    suitable_skin_types: ['Dry', 'Sensitive', 'Normal', 'Combination'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Soothing lotion-gel',
    pros: ['Triple ceramide barrier protection', 'Sulfate-free', 'National Eczema Association accepted'],
    cons: ['Mild feel for those who prefer bubbly foam'],
    image_url: 'https://images.unsplash.com/photo-1608248597263-00079e96446b?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=CeraVe+Hydrating+Cleanser',
      nykaa: 'https://www.nykaa.com/search/result/?q=CeraVe+Hydrating+Cleanser',
      flipkart: 'https://www.flipkart.com/search?q=CeraVe+Hydrating+Cleanser',
      sephora: 'https://sephora.nnnow.com/search?q=CeraVe'
    },
    dupe_ids: [105, 104]
  },
  {
    id: 107,
    name: 'Bioderma Sensibio H2O Soothing Micellar Cleansing Water',
    brand: 'Bioderma',
    category: 'Face Wash',
    price: 995,
    mrp: 1195,
    discount: '17% OFF',
    budget_tier: 'Mid-Range',
    rating: 4.9,
    reviews_count: 22400,
    key_active_ingredients: ['Micellar Fatty Acid Esters', 'Cucumber Fruit Extract', 'DAF Complex'],
    full_ingredient_list: ['Water', 'PEG-6 Caprylic/Capric Glycerides', 'Fructooligosaccharides', 'Mannitol', 'Xylitol', 'Rhamnose', 'Cucumis Sativus Fruit Extract', 'Propylene Glycol', 'Disodium EDTA'],
    target_concerns: ['Redness', 'Sensitivity', 'Impurity Build-up', 'Rosacea'],
    suitable_skin_types: ['Sensitive', 'All', 'Normal', 'Dry'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Weightless refreshing water',
    pros: ['No-rinse makeup & dirt removal', 'Physiological pH 5.5', 'Clinically proven skin tolerance'],
    cons: ['Premium price for micellar solution'],
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=Bioderma+Sensibio+H2O',
      nykaa: 'https://www.nykaa.com/search/result/?q=Bioderma+Sensibio+H2O',
      flipkart: 'https://www.flipkart.com/search?q=Bioderma+Sensibio+H2O',
      tira: 'https://www.tirabeauty.com/search?q=Bioderma+Sensibio'
    },
    dupe_ids: [105]
  },

  // 2. Serums & Ampoules
  {
    id: 101,
    name: 'Minimalist 10% Niacinamide Face Serum with Zinc PCA',
    brand: 'Minimalist',
    category: 'Serum',
    price: 599,
    mrp: 699,
    discount: '14% OFF',
    budget_tier: 'Budget',
    rating: 4.8,
    reviews_count: 18200,
    key_active_ingredients: ['Niacinamide 10%', 'Zinc PCA 1%', 'EUK-134'],
    full_ingredient_list: ['Aqua', 'Niacinamide', 'Glycerin', 'Butylene Glycol', 'Zinc PCA', 'Phenoxyethanol', 'Ethylhexylglycerin', 'Hydroxyethylcellulose', 'EUK-134'],
    target_concerns: ['Acne & Breakouts', 'Post-Inflammatory Hyperpigmentation', 'Oiliness', 'Enlarged Pores', 'Redness'],
    suitable_skin_types: ['Oily', 'Combination', 'Acne-Prone', 'Normal'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Fast-absorbing water-based fluid',
    pros: ['High clinical purity', 'Balances sebum in 2 weeks', 'Contains antioxidant EUK-134'],
    cons: ['High 10% concentration may cause mild tingling on ultra-sensitive barrier'],
    image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=Minimalist+10+Niacinamide+Serum',
      nykaa: 'https://www.nykaa.com/search/result/?q=Minimalist+10+Niacinamide+Serum',
      flipkart: 'https://www.flipkart.com/search?q=Minimalist+10+Niacinamide+Serum',
      tira: 'https://www.tirabeauty.com/search?q=Minimalist+Niacinamide'
    },
    dupe_ids: [201, 202]
  },
  {
    id: 201,
    name: 'The Ordinary Niacinamide 10% + Zinc 1% High-Strength Serum',
    brand: 'The Ordinary',
    category: 'Serum',
    price: 600,
    mrp: 650,
    discount: '8% OFF',
    budget_tier: 'Mid-Range',
    rating: 4.7,
    reviews_count: 32000,
    key_active_ingredients: ['Niacinamide 10%', 'Zinc PCA 1%', 'Tamarindus Indica Seed Gum'],
    full_ingredient_list: ['Aqua', 'Niacinamide', 'Pentylene Glycol', 'Zinc PCA', 'Dimethyl Isosorbide', 'Tamarindus Indica Seed Gum', 'Xanthan Gum', 'Isoceteth-20', 'Ethoxydiglycol', 'Phenoxyethanol', 'Chlorphenesin'],
    target_concerns: ['Acne & Breakouts', 'Oiliness', 'Blemishes', 'Enlarged Pores'],
    suitable_skin_types: ['Oily', 'Combination', 'Acne-Prone'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Slightly viscous gel serum',
    pros: ['Iconic global formulation', 'Controls T-zone shine', 'Clean minimalist formula'],
    cons: ['Can pill if layered too quickly under heavy makeup'],
    image_url: 'https://images.unsplash.com/photo-1608248597263-00079e96446b?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=The+Ordinary+Niacinamide+10+Zinc+1',
      nykaa: 'https://www.nykaa.com/search/result/?q=The+Ordinary+Niacinamide',
      flipkart: 'https://www.flipkart.com/search?q=The+Ordinary+Niacinamide',
      sephora: 'https://sephora.nnnow.com/search?q=The+Ordinary'
    },
    dupe_ids: [101, 202]
  },
  {
    id: 202,
    name: 'Plum 15% Vitamin C Face Serum with Mandarin & Kakadu Plum',
    brand: 'Plum',
    category: 'Serum',
    price: 550,
    mrp: 790,
    discount: '30% OFF',
    budget_tier: 'Budget',
    rating: 4.7,
    reviews_count: 11200,
    key_active_ingredients: ['Ethyl Ascorbic Acid 15%', 'Kakadu Plum Extract', 'Japanese Mandarin'],
    full_ingredient_list: ['Aqua', '3-O-Ethyl Ascorbic Acid', 'Propanediol', 'Glycerin', 'Terminalia Ferdinandiana Fruit Extract', 'Citrus Reticulata Peel Extract', 'Sodium Hyaluronate', 'Phenoxyethanol'],
    target_concerns: ['Post-Inflammatory Hyperpigmentation', 'Dark Spots', 'Dullness', 'Sun Damage'],
    suitable_skin_types: ['Normal', 'Combination', 'Oily', 'Dry'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Silky quick-drying liquid',
    pros: ['Stable 15% Vitamin C derivative', '30% discount value', 'Rapid glow renewal'],
    cons: ['Requires daily SPF 50+ pairing'],
    image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=Plum+15+Vitamin+C+Serum',
      nykaa: 'https://www.nykaa.com/search/result/?q=Plum+15+Vitamin+C+Serum',
      flipkart: 'https://www.flipkart.com/search?q=Plum+15+Vitamin+C+Serum',
      tira: 'https://www.tirabeauty.com/search?q=Plum+Vitamin+C'
    },
    dupe_ids: [203, 101]
  },
  {
    id: 203,
    name: 'The Ordinary Hyaluronic Acid 2% + B5 Hydration Serum',
    brand: 'The Ordinary',
    category: 'Serum',
    price: 700,
    mrp: 750,
    discount: '7% OFF',
    budget_tier: 'Mid-Range',
    rating: 4.8,
    reviews_count: 24300,
    key_active_ingredients: ['Multi-Molecular Hyaluronic Acid 2%', 'Pro-Vitamin B5 (Panthenol)', 'Ahnfeltia Concinna Extract'],
    full_ingredient_list: ['Aqua', 'Sodium Hyaluronate', 'Sodium Hyaluronate Crosspolymer', 'Panthenol', 'Ahnfeltia Concinna Extract', 'Glycerin', 'Pentylene Glycol', 'Propanediol'],
    target_concerns: ['Dehydration', 'Fine Lines', 'Flakiness', 'Dullness'],
    suitable_skin_types: ['All', 'Dry', 'Dehydrated', 'Sensitive'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Water-plumping lightweight serum',
    pros: ['Multi-depth cellular hydration', 'Instant plump effect', 'Great for layering'],
    cons: ['Must be applied onto damp skin and sealed with moisturizer'],
    image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=The+Ordinary+Hyaluronic+Acid+2+B5',
      nykaa: 'https://www.nykaa.com/search/result/?q=The+Ordinary+Hyaluronic+Acid',
      flipkart: 'https://www.flipkart.com/search?q=The+Ordinary+Hyaluronic+Acid',
      sephora: 'https://sephora.nnnow.com/search?q=The+Ordinary+Hyaluronic'
    },
    dupe_ids: [202, 101]
  },
  {
    id: 204,
    name: 'Minimalist 0.3% Retinol Face Serum with CoQ10 & Squalane',
    brand: 'Minimalist',
    category: 'Serum',
    price: 679,
    mrp: 699,
    discount: '3% OFF',
    budget_tier: 'Mid-Range',
    rating: 4.8,
    reviews_count: 9800,
    key_active_ingredients: ['Pure Retinol 0.3%', 'Coenzyme Q10 1%', 'Plant Squalane'],
    full_ingredient_list: ['Caprylic/Capric Triglyceride', 'Squalane', 'Retinol', 'Ubiquinone (CoQ10)', 'Tocopherol', 'BHT'],
    target_concerns: ['Fine Lines', 'Wrinkles', 'Loss of Elasticity', 'Post-Acne Texture'],
    suitable_skin_types: ['Aging', 'Combination', 'Normal', 'Dry'],
    comedogenic_level: 1,
    fragrance_free: true,
    texture: 'Silky water-free squalane oil-serum',
    pros: ['High stability waterless formulation', 'Potent anti-aging & collagen boost', 'Nourishing squalane base'],
    cons: ['Not recommended during pregnancy/nursing; start 2 nights/week'],
    image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=Minimalist+0.3+Retinol+Serum',
      nykaa: 'https://www.nykaa.com/search/result/?q=Minimalist+0.3+Retinol+Serum',
      flipkart: 'https://www.flipkart.com/search?q=Minimalist+0.3+Retinol+Serum',
      tira: 'https://www.tirabeauty.com/search?q=Minimalist+Retinol'
    },
    dupe_ids: [205]
  },
  {
    id: 205,
    name: 'Beauty of Joseon Revive Eye Serum Ginseng + Retinal',
    brand: 'Beauty of Joseon',
    category: 'Eye & Lip Care',
    price: 1190,
    mrp: 1450,
    discount: '18% OFF',
    budget_tier: 'Mid-Range',
    rating: 4.9,
    reviews_count: 14600,
    key_active_ingredients: ['Ginseng Root Extract 10%', 'Retinal Liposome 2%', 'Niacinamide'],
    full_ingredient_list: ['Panax Ginseng Root Extract', 'Water', 'Glycerin', 'Dipropylene Glycol', 'Caprylic/Capric Triglyceride', '1,2-Hexanediol', 'Pentaerythrityl Tetraethylhexanoate', 'Niacinamide', 'Retinal'],
    target_concerns: ['Under-Eye Dark Circles', 'Crow\'s Feet', 'Loss of Firmness', 'Fine Lines'],
    suitable_skin_types: ['All', 'Sensitive', 'Aging', 'Normal'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Lightweight silky emulsion',
    pros: ['Encapsulated retinal is gentler and 11x faster than retinol', 'Korean hanbang ginseng nourishment', 'Large 30ml tube for face and eyes'],
    cons: ['Requires gradual tolerance build-up'],
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=Beauty+of+Joseon+Revive+Eye+Serum',
      nykaa: 'https://www.nykaa.com/search/result/?q=Beauty+of+Joseon+Revive+Eye+Serum',
      flipkart: 'https://www.flipkart.com/search?q=Beauty+of+Joseon+Revive+Eye+Serum',
      tira: 'https://www.tirabeauty.com/search?q=Beauty+of+Joseon+Eye+Serum'
    },
    dupe_ids: [204]
  },

  // 3. Moisturizers & Barrier Creams
  {
    id: 102,
    name: 'CeraVe Moisturizing Cream with 3 Essential Ceramides',
    brand: 'CeraVe',
    category: 'Moisturizer',
    price: 899,
    mrp: 999,
    discount: '10% OFF',
    budget_tier: 'Mid-Range',
    rating: 4.9,
    reviews_count: 28400,
    key_active_ingredients: ['Ceramides 1, 3, 6-II', 'Hyaluronic Acid', 'Glycerin', 'Cholesterol'],
    full_ingredient_list: ['Aqua', 'Glycerin', 'Cetearyl Alcohol', 'Caprylic/Capric Triglyceride', 'Ceramide NP', 'Ceramide AP', 'Ceramide EOP', 'Sodium Hyaluronate', 'Cholesterol', 'Phytosphingosine', 'Dimethicone'],
    target_concerns: ['Barrier Impairment', 'Dryness', 'Redness', 'Sensitivity', 'Eczema'],
    suitable_skin_types: ['Dry', 'Sensitive', 'Combination', 'Normal'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Velvety rich cream with matte seal',
    pros: ['24-hour hydration with MVE sustained release', 'Non-greasy finish', 'Clinically proven skin barrier restoration'],
    cons: ['Heavy for extremely humid summer afternoons on very oily skin'],
    image_url: 'https://images.unsplash.com/photo-1608248597263-00079e96446b?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=CeraVe+Moisturizing+Cream',
      nykaa: 'https://www.nykaa.com/search/result/?q=CeraVe+Moisturizing+Cream',
      flipkart: 'https://www.flipkart.com/search?q=CeraVe+Moisturizing+Cream',
      sephora: 'https://sephora.nnnow.com/search?q=CeraVe+Moisturizing'
    },
    dupe_ids: [301, 302]
  },
  {
    id: 301,
    name: 'Dot & Key Cica Calming Blemish Clearing Night Gel',
    brand: 'Dot & Key',
    category: 'Moisturizer',
    price: 445,
    mrp: 495,
    discount: '10% OFF',
    budget_tier: 'Budget',
    rating: 4.7,
    reviews_count: 9400,
    key_active_ingredients: ['Centella Asiatica (Cica)', 'Niacinamide 2%', 'Tea Tree Oil', 'Hyaluronic Acid'],
    full_ingredient_list: ['Aqua', 'Centella Asiatica Extract', 'Niacinamide', 'Melaleuca Alternifolia (Tea Tree) Leaf Oil', 'Sodium Hyaluronate', 'Carbomer', 'Allantoin'],
    target_concerns: ['Acne & Breakouts', 'Redness', 'Oiliness', 'Active Inflammation'],
    suitable_skin_types: ['Oily', 'Acne-Prone', 'Combination', 'Sensitive'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Cooling ultra-lightweight watery gel',
    pros: ['Instantly calms active angry zits', 'Zero heaviness', 'Budget-friendly'],
    cons: ['Not rich enough for very dry winter conditions'],
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=Dot+Key+Cica+Calming+Night+Gel',
      nykaa: 'https://www.nykaa.com/search/result/?q=Dot+Key+Cica+Calming+Night+Gel',
      flipkart: 'https://www.flipkart.com/search?q=Dot+Key+Cica+Night+Gel',
      tira: 'https://www.tirabeauty.com/search?q=Dot+and+Key+Cica'
    },
    dupe_ids: [302, 102]
  },
  {
    id: 302,
    name: 'Neutrogena Hydro Boost Water Gel with Hyaluronic Acid',
    brand: 'Neutrogena',
    category: 'Moisturizer',
    price: 990,
    mrp: 1100,
    discount: '10% OFF',
    budget_tier: 'Mid-Range',
    rating: 4.8,
    reviews_count: 21500,
    key_active_ingredients: ['Purified Hyaluronic Acid', 'Amino Acids', 'Electrolytes'],
    full_ingredient_list: ['Water', 'Dimethicone', 'Glycerin', 'Dimethicone/Vinyl Dimethicone Crosspolymer', 'Phenoxyethanol', 'Cetearyl Olivate', 'Polyacrylamide', 'Sorbitan Olivate', 'Sodium Hyaluronate'],
    target_concerns: ['Dehydration', 'Oiliness', 'Dullness', 'T-Zone Congestion'],
    suitable_skin_types: ['Combination', 'Oily', 'Normal'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Refreshing hydro-quench water gel',
    pros: ['Absorbs instantly within 5 seconds', '72-hour sustained hydration', 'Oil-free formula'],
    cons: ['Contains mild dimethicone base'],
    image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=Neutrogena+Hydro+Boost+Water+Gel',
      nykaa: 'https://www.nykaa.com/search/result/?q=Neutrogena+Hydro+Boost+Water+Gel',
      flipkart: 'https://www.flipkart.com/search?q=Neutrogena+Hydro+Boost+Water+Gel',
      tira: 'https://www.tirabeauty.com/search?q=Neutrogena+Hydro+Boost'
    },
    dupe_ids: [301, 303]
  },
  {
    id: 303,
    name: 'Sebamed Clear Face Care Gel with Hyaluronic Acid & Aloe',
    brand: 'Sebamed',
    category: 'Moisturizer',
    price: 490,
    mrp: 520,
    discount: '6% OFF',
    budget_tier: 'Budget',
    rating: 4.75,
    reviews_count: 6700,
    key_active_ingredients: ['Hyaluronic Acid', 'Aloe Barbadensis', 'Panthenol', 'Allantoin'],
    full_ingredient_list: ['Aqua', 'Aloe Barbadensis Leaf Juice', 'Propylene Glycol', 'Glycerin', 'Sorbitol', 'Sodium Hyaluronate', 'Panthenol', 'Allantoin', 'Sodium Carbomer'],
    target_concerns: ['Acne & Breakouts', 'Bacterial Flora Balance', 'Oiliness', 'Sensitivity'],
    suitable_skin_types: ['Acne-Prone', 'Oily', 'Sensitive'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: '100% oil-free clear healing gel',
    pros: ['Exact pH 5.5 prevents acne bacteria multiplication', '0% oils, 0% emulsifiers, 0% fragrance', 'Dermatologist developed'],
    cons: ['Very simple minimal ingredient list'],
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=Sebamed+Clear+Face+Care+Gel',
      nykaa: 'https://www.nykaa.com/search/result/?q=Sebamed+Clear+Face+Care+Gel',
      flipkart: 'https://www.flipkart.com/search?q=Sebamed+Clear+Face+Care+Gel',
      tira: 'https://www.tirabeauty.com/search?q=Sebamed+Clear+Face'
    },
    dupe_ids: [301, 102]
  },
  {
    id: 304,
    name: 'La Roche-Posay Cicaplast Baume B5+ Ultra-Repairing Soothing Balm',
    brand: 'La Roche-Posay',
    category: 'Moisturizer',
    price: 1350,
    mrp: 1500,
    discount: '10% OFF',
    budget_tier: 'Mid-Range',
    rating: 4.95,
    reviews_count: 26000,
    key_active_ingredients: ['Madecassoside (Centella)', 'Panthenol 5%', 'Tribioma Prebiotic', 'Shea Butter', 'Zinc Gluconate'],
    full_ingredient_list: ['Aqua', 'Hydrogenated Polyisobutene', 'Dimethicone', 'Glycerin', 'Butyrospermum Parkii Butter', 'Panthenol', 'Madecassoside', 'Zinc Gluconate', 'Manganese Gluconate'],
    target_concerns: ['Severely Compromised Barrier', 'Redness', 'Post-Procedure Irritation', 'Dryness', 'Rosacea'],
    suitable_skin_types: ['Sensitive', 'Dry', 'Damaged Barrier', 'Normal'],
    comedogenic_level: 1,
    fragrance_free: true,
    texture: 'Rich restorative multi-purpose balm',
    pros: ['Dermatologist #1 SOS recovery balm', 'Repairs barrier in 1 hour', 'Safe for all ages including babies'],
    cons: ['Rich texture intended for PM slugging/spot recovery on oily zones'],
    image_url: 'https://images.unsplash.com/photo-1608248597263-00079e96446b?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=La+Roche-Posay+Cicaplast+Baume+B5',
      nykaa: 'https://www.nykaa.com/search/result/?q=La+Roche-Posay+Cicaplast',
      flipkart: 'https://www.flipkart.com/search?q=La+Roche-Posay+Cicaplast',
      sephora: 'https://sephora.nnnow.com/search?q=La+Roche-Posay'
    },
    dupe_ids: [102, 301]
  },

  // 4. Sunscreens & UV Protection
  {
    id: 103,
    name: 'Aqualogica Radiance+ Dewy Sunscreen SPF 50+ PA++++ with Watermelon & Niacinamide',
    brand: 'Aqualogica',
    category: 'Sunscreen',
    price: 449,
    mrp: 499,
    discount: '10% OFF',
    budget_tier: 'Budget',
    rating: 4.8,
    reviews_count: 16700,
    key_active_ingredients: ['Watermelon Extract', 'Niacinamide 2%', 'Hyaluronic Acid', 'UV Filters'],
    full_ingredient_list: ['Aqua', 'Ethylhexyl Methoxycinnamate', 'Butyl Methoxydibenzoylmethane', 'Niacinamide', 'Citrullus Lanatus (Watermelon) Fruit Extract', 'Sodium Hyaluronate', 'Glycerin'],
    target_concerns: ['Sun Damage', 'Hyperpigmentation', 'Dullness', 'Tanning'],
    suitable_skin_types: ['All', 'Combination', 'Normal', 'Oily'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Lightweight water-burst invisible cream',
    pros: ['Zero white cast on Indian skin tones', 'Dewy glowing finish without stickiness', 'Blue light protection'],
    cons: ['Not waterproof for intensive ocean swimming'],
    image_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=Aqualogica+Radiance+Dewy+Sunscreen',
      nykaa: 'https://www.nykaa.com/search/result/?q=Aqualogica+Radiance+Dewy+Sunscreen',
      flipkart: 'https://www.flipkart.com/search?q=Aqualogica+Radiance+Dewy+Sunscreen',
      tira: 'https://www.tirabeauty.com/search?q=Aqualogica+Sunscreen'
    },
    dupe_ids: [401, 402]
  },
  {
    id: 401,
    name: 'Dr. Sheth\'s Ceramide & Vitamin C Sunscreen SPF 50+ PA+++',
    brand: 'Dr. Sheth\'s',
    category: 'Sunscreen',
    price: 499,
    mrp: 599,
    discount: '17% OFF',
    budget_tier: 'Budget',
    rating: 4.75,
    reviews_count: 14200,
    key_active_ingredients: ['Ceramide Complex 1%', 'Ethyl Ascorbic Acid (Vitamin C) 1%', 'Zinc Oxide', 'Titanium Dioxide'],
    full_ingredient_list: ['Aqua', 'Octyl Methoxycinnamate', 'Octocrylene', 'Ethylhexyl Salicylate', 'Ceramide NP', '3-O-Ethyl Ascorbic Acid', 'Glycerin', 'Zinc Oxide'],
    target_concerns: ['Sun Damage', 'Hyperpigmentation', 'Barrier Impairment', 'Dullness'],
    suitable_skin_types: ['Combination', 'Dry', 'Sensitive', 'Normal'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Moisturizing non-sticky lotion',
    pros: ['Combines UV protection with barrier ceramides', 'Formulated specifically for Indian skin biology', 'Non-comedogenic'],
    cons: ['Needs 60 seconds to fully set before makeup'],
    image_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=Dr+Sheths+Ceramide+Vitamin+C+Sunscreen',
      nykaa: 'https://www.nykaa.com/search/result/?q=Dr+Sheths+Ceramide+Vitamin+C+Sunscreen',
      flipkart: 'https://www.flipkart.com/search?q=Dr+Sheths+Ceramide+Vitamin+C+Sunscreen',
      tira: 'https://www.tirabeauty.com/search?q=Dr+Sheths+Sunscreen'
    },
    dupe_ids: [103, 402]
  },
  {
    id: 402,
    name: 'Beauty of Joseon Relief Sun : Rice + Probiotics SPF50+ PA++++',
    brand: 'Beauty of Joseon',
    category: 'Sunscreen',
    price: 1100,
    mrp: 1450,
    discount: '24% OFF',
    budget_tier: 'Mid-Range',
    rating: 4.95,
    reviews_count: 38000,
    key_active_ingredients: ['Rice Extract 30%', 'Grain Fermented Probiotics', 'Niacinamide'],
    full_ingredient_list: ['Water', 'Oryza Sativa (Rice) Extract (30%)', 'Dibutyl Adipate', 'Propanediol', 'Diethylamino Hydroxybenzoyl Hexyl Benzoate', 'Polymethylsilsesquioxane', 'Niacinamide', 'Lactobacillus/Rice Ferment'],
    target_concerns: ['Sun Damage', 'Dryness', 'Redness', 'Uneven Skin Tone', 'Barrier Support'],
    suitable_skin_types: ['Sensitive', 'Dry', 'Combination', 'Normal'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Nourishing lightweight organic serum-cream',
    pros: ['Global viral Holy Grail sunscreen', 'Zero eye sting & zero white cast', 'Leaves skin luminous and calm'],
    cons: ['May feel too moisturizing for extreme summer oiliness without setting powder'],
    image_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=Beauty+of+Joseon+Relief+Sun+Rice+Probiotics',
      nykaa: 'https://www.nykaa.com/search/result/?q=Beauty+of+Joseon+Relief+Sun',
      flipkart: 'https://www.flipkart.com/search?q=Beauty+of+Joseon+Relief+Sun',
      tira: 'https://www.tirabeauty.com/search?q=Beauty+of+Joseon+Sunscreen'
    },
    dupe_ids: [103, 401]
  },
  {
    id: 403,
    name: 'La Roche-Posay Anthelios UVMune 400 Invisible Fluid SPF 50+',
    brand: 'La Roche-Posay',
    category: 'Sunscreen',
    price: 2450,
    mrp: 2750,
    discount: '11% OFF',
    budget_tier: 'Premium',
    rating: 4.9,
    reviews_count: 18900,
    key_active_ingredients: ['Mexoryl 400 (Ultra-Long UVA Filter)', 'Netlock Technology', 'Glycerin', 'Vitamin E'],
    full_ingredient_list: ['Aqua', 'Alcohol Denat', 'Triethyl Citrate', 'Diisopropyl Sebacate', 'Silica', 'Ethylhexyl Salicylate', 'Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine', 'Butyl Methoxydibenzoylmethane', 'Glycerin', 'Methoxypropylamino Cyclohexenylidene Ethoxyethylcyanoacetate'],
    target_concerns: ['Sun Damage', 'Deep Cellular UV DNA Damage', 'Melasma', 'Aging'],
    suitable_skin_types: ['All', 'Sensitive', 'Combination', 'Normal'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Ultra-thin shake-well fluid',
    pros: ['Gold standard protection against 380-400nm ultra-long UVA rays', 'Extreme water/sweat/sand resistance', 'Non-greasy invisible finish'],
    cons: ['Contains trace alcohol denat for netlock quick-dry; premium luxury price'],
    image_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=La+Roche-Posay+Anthelios+UVMune+400',
      nykaa: 'https://www.nykaa.com/search/result/?q=La+Roche-Posay+Anthelios',
      flipkart: 'https://www.flipkart.com/search?q=La+Roche-Posay+Anthelios',
      sephora: 'https://sephora.nnnow.com/search?q=La+Roche-Posay+Sunscreen'
    },
    dupe_ids: [402, 103]
  },

  // 5. Toners & Essences
  {
    id: 501,
    name: 'Cosrx Advanced Snail 96 Mucin Power Essence',
    brand: 'Cosrx',
    category: 'Toner & Essence',
    price: 1150,
    mrp: 1450,
    discount: '21% OFF',
    budget_tier: 'Mid-Range',
    rating: 4.9,
    reviews_count: 42000,
    key_active_ingredients: ['Snail Secretion Filtrate 96.3%', 'Sodium Hyaluronate', 'Allantoin', 'Panthenol', 'Arginine'],
    full_ingredient_list: ['Snail Secretion Filtrate', 'Betaine', 'Butylene Glycol', '1,2-Hexanediol', 'Sodium Polyacrylate', 'Phenoxyethanol', 'Sodium Hyaluronate', 'Allantoin', 'Ethyl Hexanediol', 'Carbomer', 'Panthenol', 'Arginine'],
    target_concerns: ['Dehydration', 'Barrier Impairment', 'Redness', 'Post-Acne Texture', 'Dullness'],
    suitable_skin_types: ['All', 'Sensitive', 'Dry', 'Combination', 'Acne-Prone'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Gliding elastic hydrating essence',
    pros: ['96% snail mucin provides glass-skin radiance', 'Soothes inflamed, irritated skin', 'Cruelty-free mucin harvesting'],
    cons: ['Slime-like texture requires patting in for 30 seconds'],
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=Cosrx+Advanced+Snail+96+Mucin+Power+Essence',
      nykaa: 'https://www.nykaa.com/search/result/?q=Cosrx+Snail+96+Essence',
      flipkart: 'https://www.flipkart.com/search?q=Cosrx+Snail+96+Essence',
      tira: 'https://www.tirabeauty.com/search?q=Cosrx+Snail+Mucin'
    },
    dupe_ids: [502, 203]
  },
  {
    id: 502,
    name: 'Paula\'s Choice Skin Perfecting 2% BHA Liquid Exfoliant',
    brand: 'Paula\'s Choice',
    category: 'Exfoliant & Treatment',
    price: 1200,
    mrp: 1300,
    discount: '8% OFF',
    budget_tier: 'Mid-Range',
    rating: 4.85,
    reviews_count: 36500,
    key_active_ingredients: ['Salicylic Acid 2%', 'Green Tea Leaf Extract', 'Methylpropanediol'],
    full_ingredient_list: ['Water', 'Methylpropanediol', 'Butylene Glycol', 'Salicylic Acid 2%', 'Polysorbate 20', 'Camellia Oleifera (Green Tea) Leaf Extract', 'Sodium Hydroxide', 'Tetrasodium EDTA'],
    target_concerns: ['Acne & Breakouts', 'Blackheads', 'Large Pores', 'Rough Texture', 'Sebaceous Filaments'],
    suitable_skin_types: ['Oily', 'Combination', 'Acne-Prone', 'Normal'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Water-light penetrating liquid',
    pros: ['Global #1 clinical chemical exfoliant', 'Unclogs pores inside and out', 'Noticeably shrinks pore appearance in 1 week'],
    cons: ['Start 2-3 nights per week to prevent over-exfoliation'],
    image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=Paulas+Choice+2+BHA+Liquid+Exfoliant',
      nykaa: 'https://www.nykaa.com/search/result/?q=Paulas+Choice+2+BHA+Liquid',
      flipkart: 'https://www.flipkart.com/search?q=Paulas+Choice+2+BHA',
      sephora: 'https://sephora.nnnow.com/search?q=Paulas+Choice'
    },
    dupe_ids: [104, 101]
  },
  {
    id: 503,
    name: 'Minimalist PHA 3% + Biotic Soothing Alcohol-Free Toner',
    brand: 'Minimalist',
    category: 'Toner & Essence',
    price: 399,
    mrp: 499,
    discount: '20% OFF',
    budget_tier: 'Budget',
    rating: 4.7,
    reviews_count: 8100,
    key_active_ingredients: ['Gluconolactone (PHA) 3%', 'Probiotics & Prebiotics', 'Polyglutamic Acid', 'Niacinamide'],
    full_ingredient_list: ['Aqua', 'Gluconolactone', 'Niacinamide', 'Pentylene Glycol', 'Glycerin', 'Bifida Ferment Lysate', 'Polyglutamic Acid', 'Phenoxyethanol', 'Ethylhexylglycerin'],
    target_concerns: ['Dullness', 'Mild Congestion', 'Redness', 'Dehydration'],
    suitable_skin_types: ['Sensitive', 'Dry', 'Combination', 'Normal'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Refreshing hydrating toner liquid',
    pros: ['PHA provides gentle exfoliation safe for sensitive skin', 'Alcohol-free and barrier-friendly', 'Super affordable'],
    cons: ['Milder results compared to strong AHA/BHA for severe cystic acne'],
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=Minimalist+PHA+3+Toner',
      nykaa: 'https://www.nykaa.com/search/result/?q=Minimalist+PHA+3+Toner',
      flipkart: 'https://www.flipkart.com/search?q=Minimalist+PHA+3+Toner',
      tira: 'https://www.tirabeauty.com/search?q=Minimalist+Toner'
    },
    dupe_ids: [501, 502]
  },

  // 6. Face Masks & Treatments
  {
    id: 601,
    name: 'Laneige Water Sleeping Mask EX with Probiotic Complex',
    brand: 'Laneige',
    category: 'Face Mask',
    price: 1980,
    mrp: 2200,
    discount: '10% OFF',
    budget_tier: 'Premium',
    rating: 4.9,
    reviews_count: 17400,
    key_active_ingredients: ['Sleeping Micro Biome (Probiotics)', 'Plant-Derived Squalane', 'Trehalose', 'Hyaluronic Acid'],
    full_ingredient_list: ['Water', 'Butylene Glycol', 'Glycerin', 'Trehalose', 'Methyl Trimethicone', '1,2-Hexanediol', 'Squalane', 'Lactobacillus Ferment Lysate', 'Propanediol', 'Sodium Hyaluronate'],
    target_concerns: ['Dehydration', 'Dullness', 'Loss of Glow', 'Fatigued Skin Barrier'],
    suitable_skin_types: ['All', 'Dry', 'Dehydrated', 'Combination'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Ultra-cushiony refreshing sleeping gel mask',
    pros: ['Wake up with visibly rested, bouncy, glass-skin complexion', 'Deep moisture barrier overnight recharge', 'Non-sticky pillow-safe formula'],
    cons: ['Prestige pricing'],
    image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=Laneige+Water+Sleeping+Mask+EX',
      nykaa: 'https://www.nykaa.com/search/result/?q=Laneige+Water+Sleeping+Mask',
      flipkart: 'https://www.flipkart.com/search?q=Laneige+Water+Sleeping+Mask',
      tira: 'https://www.tirabeauty.com/search?q=Laneige+Sleeping+Mask'
    },
    dupe_ids: [301, 501]
  },
  {
    id: 602,
    name: 'The Ordinary AHA 30% + BHA 2% Peeling Solution (The Red Peel)',
    brand: 'The Ordinary',
    category: 'Exfoliant & Treatment',
    price: 950,
    mrp: 1050,
    discount: '10% OFF',
    budget_tier: 'Mid-Range',
    rating: 4.8,
    reviews_count: 38900,
    key_active_ingredients: ['Glycolic Acid', 'Lactic Acid', 'Salicylic Acid 2%', 'Tasmanian Pepperberry', 'Hyaluronic Acid'],
    full_ingredient_list: ['Glycolic Acid', 'Aqua', 'Aloe Barbadensis Leaf Water', 'Sodium Hydroxide', 'Daucus Carota Sativa Extract', 'Propanediol', 'Cocamidopropyl Dimethylamine', 'Salicylic Acid', 'Lactic Acid', 'Tartaric Acid', 'Citric Acid', 'Tasmanian Pepperberry'],
    target_concerns: ['Post-Inflammatory Hyperpigmentation', 'Rough Texture', 'Dullness', 'Uneven Skin Tone'],
    suitable_skin_types: ['Oily', 'Combination', 'Tolerant Skin'],
    comedogenic_level: 0,
    fragrance_free: true,
    texture: 'Deep ruby wash-off peeling solution',
    pros: ['Dramatic 10-minute facial glow reset', 'Clears stubborn skin texture and pigmentation', 'Tasmanian pepperberry reduces tingling'],
    cons: ['MUST NOT be left on for >10 minutes; not for broken or ultra-sensitive skin'],
    image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
    e_commerce_links: {
      amazon: 'https://www.amazon.in/s?k=The+Ordinary+AHA+30+BHA+2+Peeling+Solution',
      nykaa: 'https://www.nykaa.com/search/result/?q=The+Ordinary+Peeling+Solution',
      flipkart: 'https://www.flipkart.com/search?q=The+Ordinary+Peeling+Solution',
      sephora: 'https://sephora.nnnow.com/search?q=The+Ordinary+Peel'
    },
    dupe_ids: [502, 101]
  }
];

export const MOCK_CONSULTANT_DATA = {
  clients: [
    { id: 'c101', name: 'Maya Lin', skinType: 'Oily / Acne-Prone', lastAssessment: 'Yesterday', score: 64, status: 'Needs Routine Update', priority: 'High' },
    { id: 'c102', name: 'David Miller', skinType: 'Dry / Dehydrated', lastAssessment: '3 days ago', score: 82, status: 'On Track', priority: 'Normal' },
    { id: 'c103', name: 'Sophia Chen', skinType: 'Sensitive / Rosacea', lastAssessment: '5 days ago', score: 71, status: 'Review Recommended', priority: 'Medium' },
    { id: 'c104', name: 'Marcus Vance', skinType: 'Normal / Hyperpigmentation', lastAssessment: '1 week ago', score: 88, status: 'Routine Active', priority: 'Normal' }
  ],
  pendingReviews: 3,
  routinesCreatedThisMonth: 28,
  clientSatisfactionRate: '98.4%'
};

export const MOCK_DERMATOLOGIST_DATA = {
  patients: [
    { id: 'p201', name: 'Emma Watson', condition: 'Severe Inflammatory Acne (Grade 3)', lastVisit: 'Jul 20, 2026', prescription: 'Topical Adapalene 0.3% + Clindamycin 1%', status: 'Follow-up Scheduled' },
    { id: 'p202', name: 'Robert Thorne', condition: 'Erythematotelangiectatic Rosacea', lastVisit: 'Jul 15, 2026', prescription: 'Ivermectin 1% Cream + Barrier Foam', status: 'Improving' },
    { id: 'p203', name: 'Priya Sharma', condition: 'Melasma (Dermal-Epidermal)', lastVisit: 'Jul 10, 2026', prescription: 'Tranexamic Acid 5% + Azelaic Acid 15%', status: 'Stable' }
  ],
  clinicalReportsCount: 14,
  activeTreatmentsCount: 42,
  urgentConsultations: 2
};

export const MOCK_ADMIN_DATA = {
  metrics: {
    totalUsers: '1,420',
    assessmentsCompleted: '3,890',
    recommendationAccuracy: '94.2%',
    activeRoutines: '1,180',
    systemUptime: '99.98%'
  },
  microservices: [
    { name: 'User Service', endpoint: '/api/v1/users', port: '8001', status: 'Healthy', latency: '24ms', load: '12%' },
    { name: 'Skin Profile Service', endpoint: '/api/v1/profile', port: '8002', status: 'Healthy', latency: '18ms', load: '8%' },
    { name: 'Skin Assessment Service', endpoint: '/api/v1/assessment', port: '8003', status: 'Healthy', latency: '45ms', load: '28%' },
    { name: 'Routine Planner Service', endpoint: '/api/v1/routine', port: '8004', status: 'Healthy', latency: '32ms', load: '15%' },
    { name: 'Ingredient Intelligence Service', endpoint: '/api/v1/ingredients', port: '8005', status: 'Healthy', latency: '52ms', load: '34%' },
    { name: 'Product Recommendation Service', endpoint: '/api/v1/recommendations', port: '8006', status: 'Healthy', latency: '68ms', load: '42%' },
    { name: 'Skin Health Scoring Service', endpoint: '/api/v1/score', port: '8007', status: 'Healthy', latency: '15ms', load: '9%' },
    { name: 'Progress Tracking Service', endpoint: '/api/v1/progress', port: '8008', status: 'Healthy', latency: '29ms', load: '19%' },
    { name: 'Notification Service', endpoint: '/api/v1/notifications', port: '8009', status: 'Healthy', latency: '12ms', load: '5%' },
    { name: 'Analytics Service', endpoint: '/api/v1/analytics', port: '8010', status: 'Healthy', latency: '38ms', load: '22%' },
    { name: 'Report Export Service', endpoint: '/api/v1/reports', port: '8011', status: 'Healthy', latency: '84ms', load: '14%' },
    { name: 'Admin Service', endpoint: '/api/v1/admin', port: '8012', status: 'Healthy', latency: '20ms', load: '6%' }
  ],
  recentAuditLogs: [
    { time: '09:14:22', user: 'Admin', event: 'Microservice Health Check Executed', status: 'Success' },
    { time: '08:52:10', user: 'Dr. Elena Rostova', event: 'Patient Medical Profile Updated (p201)', status: 'Success' },
    { time: '08:30:45', user: 'Sarah Jenkins', event: 'New Routine Plan Published for Client (c101)', status: 'Success' },
    { time: '07:45:00', user: 'System Cron', event: 'FAISS Vector Index Optimization Complete', status: 'Success' }
  ]
};

// ════════════════════════════════════════════════════════════════
// HELPER ENGINES: Suitability Scoring, Comparison, Alternatives
// ════════════════════════════════════════════════════════════════

/**
 * Calculates 0-100% Suitability Match Score for a product against user profile
 */
export function calculateProductSuitability(product, profile = MOCK_USER_DATA.profile) {
  const userSkinType = profile.skinType || 'Combination';
  const userConcerns = profile.primaryConcerns || [];
  const userAllergies = profile.allergies || [];
  const userSensitivities = profile.sensitivities || [];

  let score = 70; // Baseline compatibility score
  const breakdown = [];
  const pros = [...(product.pros || [])];
  const cons = [...(product.cons || [])];
  let badge = 'Compatible 👍';
  let badgeClass = 'badge-secondary';

  // 1. Skin Type Match (+15 pts or -15 pts)
  const suitableTypes = product.suitable_skin_types || [];
  const matchesType = suitableTypes.some(t => userSkinType.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase() === 'all');
  if (matchesType) {
    score += 15;
    breakdown.push({ item: `Skin Type Match (${userSkinType})`, pts: '+15', status: 'Optimal' });
  } else {
    score -= 15;
    breakdown.push({ item: `Skin Type Non-Optimal (${userSkinType})`, pts: '-15', status: 'Caution' });
  }

  // 2. Target Concerns Resolution (+10 pts per matching concern, max +20 pts)
  const targetConcerns = product.target_concerns || [];
  let concernMatches = 0;
  for (const uc of userConcerns) {
    if (targetConcerns.some(tc => tc.toLowerCase().includes(uc.toLowerCase()) || uc.toLowerCase().includes(tc.toLowerCase()))) {
      concernMatches++;
    }
  }
  if (concernMatches > 0) {
    const concernPts = Math.min(concernMatches * 10, 20);
    score += concernPts;
    breakdown.push({ item: `Addresses ${concernMatches} Active Skin Concerns`, pts: `+${concernPts}`, status: 'Optimal' });
  }

  // 3. Comedogenic Safety (+5 pts if 0)
  if (product.comedogenic_level === 0) {
    score += 5;
    breakdown.push({ item: 'Non-Comedogenic Formulation (Level 0)', pts: '+5', status: 'Optimal' });
  }

  // 4. Fragrance & Allergen Safety Check (-50 pts penalty if allergen detected)
  const allIngredients = (product.full_ingredient_list || []).map(i => i.toLowerCase());
  const flaggedAllergens = [];
  
  for (const alg of [...userAllergies, ...userSensitivities]) {
    const algNorm = alg.toLowerCase().split('(')[0].trim();
    if (allIngredients.some(ing => ing.includes(algNorm))) {
      flaggedAllergens.push(alg);
    }
  }

  if (flaggedAllergens.length > 0) {
    score -= 50;
    badge = '⚠️ Allergen Warning';
    badgeClass = 'badge-danger';
    breakdown.push({ item: `Contains Flagged Allergen: ${flaggedAllergens.join(', ')}`, pts: '-50', status: 'Critical Warning' });
  } else {
    breakdown.push({ item: 'Allergy & Sensitivity Safe (0 Flagged)', pts: '+0', status: 'Safe' });
    if (score >= 94) {
      badge = 'Top Match 🌟';
      badgeClass = 'badge-accent';
    } else if (score >= 85) {
      badge = 'Great Choice ✨';
      badgeClass = 'badge-success';
    } else {
      badge = 'Compatible 👍';
      badgeClass = 'badge-secondary';
    }
  }

  const finalScore = Math.max(10, Math.min(100, Math.round(score)));

  return {
    score: finalScore,
    scoreFormatted: `${finalScore}%`,
    badge,
    badgeClass,
    breakdown,
    flaggedAllergens,
    pros,
    cons,
    reason: `Scored ${finalScore}% compatibility based on ${userSkinType} skin formulation, active ingredient synergy, and allergen safety profile.`
  };
}

/**
 * Filter & Search Product Catalog
 */
export function filterProductCatalog(options = {}, profile = MOCK_USER_DATA.profile) {
  const {
    query = '',
    category = 'All',
    budget_tier = 'All',
    min_price = 0,
    max_price = 10000,
    skin_type = 'All',
    target_concern = 'All',
    brand = 'All',
    min_score = 0,
    sort_by = 'match_desc' // match_desc, price_asc, price_desc, rating_desc, popular_desc
  } = options;

  let results = MASTER_PRODUCT_CATALOG.map(prod => {
    const suitability = calculateProductSuitability(prod, profile);
    return {
      ...prod,
      suitability
    };
  });

  // Query search across name, brand, key ingredients, category, and concerns
  if (query && query.trim() !== '') {
    const q = query.toLowerCase().trim();
    results = results.filter(p => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.key_active_ingredients || []).some(k => k.toLowerCase().includes(q)) ||
        (p.target_concerns || []).some(tc => tc.toLowerCase().includes(q))
      );
    });
  }

  // Category filter
  if (category && category !== 'All') {
    results = results.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
  }

  // Budget tier filter
  if (budget_tier && budget_tier !== 'All') {
    results = results.filter(p => p.budget_tier.toLowerCase() === budget_tier.toLowerCase());
  }

  // Price range filter
  results = results.filter(p => p.price >= min_price && p.price <= max_price);

  // Skin type filter
  if (skin_type && skin_type !== 'All') {
    results = results.filter(p => (p.suitable_skin_types || []).some(st => st.toLowerCase() === skin_type.toLowerCase() || st.toLowerCase() === 'all'));
  }

  // Target concern filter
  if (target_concern && target_concern !== 'All') {
    results = results.filter(p => (p.target_concerns || []).some(tc => tc.toLowerCase().includes(target_concern.toLowerCase())));
  }

  // Brand filter
  if (brand && brand !== 'All') {
    results = results.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  }

  // Minimum suitability score filter
  if (min_score > 0) {
    results = results.filter(p => p.suitability.score >= min_score);
  }

  // Sorting
  results.sort((a, b) => {
    if (sort_by === 'match_desc') {
      return b.suitability.score - a.suitability.score || b.rating - a.rating;
    }
    if (sort_by === 'price_asc') {
      return a.price - b.price;
    }
    if (sort_by === 'price_desc') {
      return b.price - a.price;
    }
    if (sort_by === 'rating_desc') {
      return b.rating - a.rating;
    }
    if (sort_by === 'popular_desc') {
      return b.reviews_count - a.reviews_count;
    }
    return 0;
  });

  return results;
}

/**
 * Generates Side-by-Side Product Comparison Matrix (Amazon/Flipkart Style)
 */
export function generateProductComparison(productIds = [], profile = MOCK_USER_DATA.profile) {
  const products = productIds
    .map(id => MASTER_PRODUCT_CATALOG.find(p => p.id === Number(id)))
    .filter(Boolean);

  if (products.length === 0) {
    return { success: false, message: 'No valid products selected for comparison.' };
  }

  let highestScore = -1;
  let winner = null;

  const matrix = products.map(prod => {
    const suitability = calculateProductSuitability(prod, profile);
    if (suitability.score > highestScore) {
      highestScore = suitability.score;
      winner = prod;
    }
    return {
      product: prod,
      suitability,
      priceFormatted: `₹${prod.price}`,
      mrpFormatted: `₹${prod.mrp}`,
      ratingFormatted: `${prod.rating} ★ (${prod.reviews_count.toLocaleString()} reviews)`,
      keyActives: (prod.key_active_ingredients || []).join(', '),
      concerns: (prod.target_concerns || []).join(', '),
      skinTypes: (prod.suitable_skin_types || []).join(', '),
      texture: prod.texture || 'Refreshing lightweight formula',
      comedogenic: `Level ${prod.comedogenic_level} (Non-Comedogenic)`,
      fragranceFree: prod.fragrance_free ? '✅ 100% Fragrance Free' : '⚠️ Contains Fragrance',
      pros: prod.pros || [],
      cons: prod.cons || []
    };
  });

  return {
    success: true,
    count: matrix.length,
    matrix,
    winner: winner ? {
      id: winner.id,
      name: winner.name,
      brand: winner.brand,
      score: highestScore,
      reason: `🏆 AI Winner: Best overall formulation fit for ${profile.skinType || 'Combination'} skin with ${highestScore}% compatibility score!`
    } : null
  };
}

/**
 * Get Alternative Products & Budget Dupes
 */
export function getAlternativeProductsFor(productId, profile = MOCK_USER_DATA.profile) {
  const target = MASTER_PRODUCT_CATALOG.find(p => p.id === Number(productId));
  if (!target) return { success: false, message: 'Product not found' };

  const targetSuitability = calculateProductSuitability(target, profile);

  // 1. Budget Dupes: Lower price in same or complementary category
  const budgetDupes = MASTER_PRODUCT_CATALOG
    .filter(p => p.id !== target.id && p.price < target.price && (p.category === target.category || (target.dupe_ids || []).includes(p.id)))
    .map(p => ({ ...p, suitability: calculateProductSuitability(p, profile) }))
    .sort((a, b) => a.price - b.price);

  // 2. Sensitive / Fragrance-Free Safer Picks (High match score, 0 flagged allergens)
  const saferPicks = MASTER_PRODUCT_CATALOG
    .filter(p => p.id !== target.id && p.category === target.category && p.fragrance_free)
    .map(p => ({ ...p, suitability: calculateProductSuitability(p, profile) }))
    .filter(p => p.suitability.flaggedAllergens.length === 0)
    .sort((a, b) => b.suitability.score - a.suitability.score);

  // 3. Premium / High-Potency Upgrade
  const premiumUpgrades = MASTER_PRODUCT_CATALOG
    .filter(p => p.id !== target.id && p.price > target.price && p.category === target.category)
    .map(p => ({ ...p, suitability: calculateProductSuitability(p, profile) }))
    .sort((a, b) => b.rating - a.rating);

  return {
    success: true,
    originalProduct: { ...target, suitability: targetSuitability },
    budgetDupes: budgetDupes.slice(0, 3),
    saferPicks: saferPicks.slice(0, 3),
    premiumUpgrades: premiumUpgrades.slice(0, 3)
  };
}

// ════════════════════════════════════════════════════════════════
// MODULE 8: PROGRESS TRACKING & ANALYTICS DATA STORE & HELPERS
// ════════════════════════════════════════════════════════════════

export const MOCK_PROGRESS_TRACKING_DATA = {
  checkpoints: [
    {
      id: 1,
      user_id: 1,
      log_date: '24 Oct 2025',
      checkpoint_title: 'Baseline Intake Scan',
      tag: 'Baseline (Day 1)',
      overall_skin_health_score: 68.5,
      hydration_level: 48.0,
      oiliness_level: 74.0,
      sensitivity_level: 38.0,
      acne_severity: 42.0,
      pigmentation_score: 35.0,
      wrinkles_score: 18.0,
      barrier_strength: 52.0,
      redness_reactivity: 36.0,
      photo_url: 'assets/hero_skin_scan.png',
      routine_adherence_rate: 60.0,
      clinical_notes: 'Initial intake: Elevated transepidermal water loss, active follicular congestion along T-zone, and reactive flushing.',
      key_improvements: ['Baseline Established'],
      active_concerns_snapshot: ['Acne & Breakouts', 'Barrier Impairment', 'Post-Acne Melanin']
    },
    {
      id: 2,
      user_id: 1,
      log_date: '02 Nov 2025',
      checkpoint_title: 'Week 2 - Active Introduction',
      tag: 'Week 2 Checkpoint',
      overall_skin_health_score: 72.0,
      hydration_level: 56.0,
      oiliness_level: 68.0,
      sensitivity_level: 32.0,
      acne_severity: 32.0,
      pigmentation_score: 32.0,
      wrinkles_score: 16.0,
      barrier_strength: 64.0,
      redness_reactivity: 28.0,
      photo_url: 'assets/hero_skin_scan.png',
      routine_adherence_rate: 88.0,
      clinical_notes: 'Niacinamide 10% + BHA 2% response: Sebum output reduced by 8%, active inflammatory papules calming down.',
      key_improvements: ['+8% Hydration', '-10% Sebum Congestion', 'Inflammation Soothed'],
      active_concerns_snapshot: ['Acne & Breakouts', 'Post-Acne Melanin']
    },
    {
      id: 3,
      user_id: 1,
      log_date: '14 Nov 2025',
      checkpoint_title: 'Week 4 - Barrier Consolidation',
      tag: 'Week 4 Checkpoint',
      overall_skin_health_score: 75.8,
      hydration_level: 65.0,
      oiliness_level: 58.0,
      sensitivity_level: 24.0,
      acne_severity: 20.0,
      pigmentation_score: 26.0,
      wrinkles_score: 14.0,
      barrier_strength: 76.0,
      redness_reactivity: 22.0,
      photo_url: 'assets/hero_skin_scan.png',
      routine_adherence_rate: 93.5,
      clinical_notes: 'Ceramide barrier cream stabilized lipid membrane. Redness reactivity plunged by 38% compared to baseline.',
      key_improvements: ['+17% Hydration', '-22% Acne Severity', '+24% Barrier Strength'],
      active_concerns_snapshot: ['Post-Acne Melanin']
    },
    {
      id: 4,
      user_id: 1,
      log_date: '24 Nov 2025',
      checkpoint_title: 'Current 30-Day Milestone Scan',
      tag: 'Current (Day 30)',
      overall_skin_health_score: 79.4,
      hydration_level: 74.0,
      oiliness_level: 52.0,
      sensitivity_level: 18.0,
      acne_severity: 12.0,
      pigmentation_score: 19.5,
      wrinkles_score: 11.0,
      barrier_strength: 86.0,
      redness_reactivity: 15.0,
      photo_url: 'assets/hero_skin_scan.png',
      routine_adherence_rate: 96.0,
      clinical_notes: 'Outstanding clinical transformation: Stratum corneum moisture restored, zero cystic flares, hyperpigmentation fading noticeably.',
      key_improvements: ['+26% Hydration Plumpness', '-71% Acne Severity Reduction', '+34% Barrier Resilience', '-58% Redness Flushes'],
      active_concerns_snapshot: ['Maintenance & Sun Protection']
    }
  ],

  adherence: {
    current_streak_days: 18,
    longest_streak_days: 24,
    weekly_compliance_pct: 96.5,
    biweekly_compliance_pct: 94.8,
    monthly_compliance_pct: 92.4,
    morning_adherence_avg: 98.0,
    evening_adherence_avg: 89.5,
    total_sessions_logged: 58,
    adherence_to_score_correlation: 'Strong Positive (r = +0.89)',
    adherence_insights: [
      'Your 18-day active streak is driving a +4.0 pt acceleration in skin barrier score.',
      'Morning routine compliance (98.0%) is exceptionally consistent; sunscreen was applied 29/30 days.',
      'Evening double cleansing on Wednesday & Sunday aligned perfectly with BHA exfoliation days.'
    ]
  },

  beforeAfterComparison: {
    days_elapsed: 30,
    baseline_date: '24 Oct 2025',
    current_date: '24 Nov 2025',
    baseline_image: 'assets/hero_skin_scan.png',
    current_image: 'assets/dark_banner_portrait.png',
    baseline_score: 68.5,
    current_score: 79.4,
    score_delta: 10.9,
    verdict: 'Exceptional Clinical Transformation (+10.9 pts)',
    clinical_summary: 'Over the 30-day intervention period, skin health advanced from 68.5 to 79.4/100. Primary victories include complete clearance of active inflammatory acne papules (-71.4%) and barrier lipid reinforcement (+65.4%).',
    biomarker_deltas: [
      { parameter: 'Hydration (Moisture Plumpness)', baseline_val: 48.0, current_val: 74.0, delta_val: 26.0, delta_percentage: 54.2, status: 'Significantly Improved', color: '#0284C7', clinical_insight: 'Hyaluronic acid + Ceramide layering increased intracellular moisture capacity by +54.2%.' },
      { parameter: 'Acne & Blemish Severity', baseline_val: 42.0, current_val: 12.0, delta_val: -30.0, delta_percentage: -71.4, status: 'Significantly Improved', color: '#2E7D32', clinical_insight: '2% Salicylic Acid + 10% Niacinamide dissolved micro-comedones, cutting active blemishes by -71.4%.' },
      { parameter: 'Barrier Integrity Score', baseline_val: 52.0, current_val: 86.0, delta_val: 34.0, delta_percentage: 65.4, status: 'Significantly Improved', color: '#C59B27', clinical_insight: 'Lipid bilayer consolidation stopped moisture leakage and irritation.' },
      { parameter: 'Erythema & Redness Reactivity', baseline_val: 36.0, current_val: 15.0, delta_val: -21.0, delta_percentage: -58.3, status: 'Significantly Improved', color: '#8E24AA', clinical_insight: 'Centella Asiatica + Zinc PCA calmed flushing by -58.3%.' },
      { parameter: 'Post-Inflammatory Pigmentation', baseline_val: 35.0, current_val: 19.5, delta_val: -15.5, delta_percentage: -44.3, status: 'Improved', color: '#D97706', clinical_insight: 'Consistent SPF 50+ prevention and PM retinol faded melanin clusters.' },
      { parameter: 'Sebum / Oiliness Regulation', baseline_val: 74.0, current_val: 52.0, delta_val: -22.0, delta_percentage: -29.7, status: 'Improved', color: '#475569', clinical_insight: 'Transition to water-gel hydrators normalized T-zone sebum balance.' }
    ],
    top_positive_drivers: [
      'Consistent daily sunscreen application preventing UV melanocyte stimulation.',
      'PM ceramide lipid sealing stopping transepidermal water loss.',
      'High routine adherence (96%) providing steady therapeutic concentrations.'
    ],
    remaining_targets: [
      'Continue fading faint post-inflammatory hyperpigmentation on lateral cheeks.',
      'Maintain night-time hydration buffering during seasonal humidity transitions.'
    ]
  },

  improvementReport: {
    overall_health_change: '+10.9 pts (68.5 -> 79.4 / 100)',
    velocity_summary: '+2.54 pts gained per week on average',
    top_improving_factors: [
      { category: 'Inflammation & Blemish Count', metric: 'Acne Severity Index', improvement_pct: 71.4, direction: 'down', impact_level: 'Critical', clinical_explanation: 'Follicular micro-congestion resolved through daily 0.5% - 2.0% BHA salicylic pore flushing.' },
      { category: 'Lipid Matrix Resilience', metric: 'Stratum Corneum Barrier Strength', improvement_pct: 65.4, direction: 'up', impact_level: 'Critical', clinical_explanation: 'Ceramide NP/AP supplementation sealed intercellular cement, stopping transepidermal dehydration.' },
      { category: 'Moisture Volume', metric: 'Epidermal Hydration Level', improvement_pct: 54.2, direction: 'up', impact_level: 'High', clinical_explanation: 'Multi-molecular weight hyaluronic acid restored cellular turgor and smoothed surface fine lines.' },
      { category: 'Vascular Reactivity', metric: 'Erythema & Flushing Reactivity', improvement_pct: 58.3, direction: 'down', impact_level: 'High', clinical_explanation: 'Elimination of sensitizing fragrances and introduction of Centella Asiatica calmed capillary dilation.' }
    ],
    areas_for_optimization: [
      { category: 'Melanin Uniformity', metric: 'Post-Inflammatory Hyperpigmentation', improvement_pct: 44.3, direction: 'down', impact_level: 'Moderate', clinical_explanation: 'Melanin clusters are clearing, but require 4-6 more weeks of gentle PM retinol and AM Vitamin C / Azelaic pairing.' }
    ],
    ai_dermatologist_verdict: "Patient demonstrated textbook response to the barrier-first protocol. Active inflammatory breakouts are virtually resolved. Recommend transitioning into 'Optimal Glow Maintenance Mode' with slight increase in PM antioxidant concentration.",
    next_stage_routine_adjustments: [
      'Upgrade evening Retinol frequency from 2x/week to 3x/week on alternating nights.',
      'Introduce Azelaic Acid 10% on non-retinol mornings for targeted dark spot acceleration.',
      'Continue daily SPF 50+ mineral fluid as non-negotiable UV defense.'
    ]
  }
};

export function generateTrendTrajectoryData(timeframe = '30d') {
  const points = [];
  const start = new Date();
  start.setDate(start.getDate() - 30);

  // 30 days historical
  for (let i = 0; i <= 30; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const factor = i / 30.0;
    const score = Math.round((68.5 + 10.9 * (1 - Math.exp(-2.2 * factor))) * 10) / 10;
    points.push({
      day: `Day ${i}`,
      date_formatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score,
      is_projected: false,
      hydration: Math.round((48.0 + 26.0 * factor) * 10) / 10,
      sebum: Math.round((74.0 - 22.0 * factor) * 10) / 10,
      barrier: Math.round((52.0 + 34.0 * factor) * 10) / 10,
      sensitivity: Math.round((38.0 - 20.0 * factor) * 10) / 10,
      adherence_pct: Math.min(100, Math.round((65.0 + 31.0 * factor) * 10) / 10)
    });
  }

  // 30 days forecast
  const now = new Date();
  for (let j = 1; j <= 30; j++) {
    const d = new Date(now);
    d.setDate(d.getDate() + j);
    const factor = j / 30.0;
    const score = Math.round((79.4 + 7.1 * (1 - Math.exp(-1.8 * factor))) * 10) / 10;
    points.push({
      day: `+${j}d Forecast`,
      date_formatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score,
      is_projected: true,
      hydration: Math.min(92, Math.round((74.0 + 10.0 * factor) * 10) / 10),
      sebum: Math.max(45, Math.round((52.0 - 6.0 * factor) * 10) / 10),
      barrier: Math.min(95, Math.round((86.0 + 8.0 * factor) * 10) / 10),
      sensitivity: Math.max(12, Math.round((18.0 - 5.0 * factor) * 10) / 10),
      adherence_pct: 96.0
    });
  }

  return {
    timeframe,
    improvement_velocity_pts_per_week: 2.54,
    projected_score_30d: 84.5,
    projected_score_60d: 87.8,
    target_score: 85.0,
    estimated_days_to_target: 22,
    trajectory_curve: points,
    key_trend_indicators: [
      { indicator: 'Barrier Restoration Index', trend: 'Rapid Ascent', delta: '+65.4%', direction: 'positive' },
      { indicator: 'Sebum Secretion Stability', trend: 'Normalized Balance', delta: '-29.7%', direction: 'positive' },
      { indicator: 'Micro-Vascular Sensitivity', trend: 'Steady Cooling', delta: '-52.6%', direction: 'positive' },
      { indicator: 'Photodamage Repair Rate', trend: 'Continuous Gradual', delta: '+44.3%', direction: 'positive' }
    ]
  };
}

export function generateCalendar30Days() {
  const list = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const isMissed = i === 18;
    const isPartial = i === 25 || i === 28;
    const comp = isMissed ? 50 : (isPartial ? 75 : 100);
    list.push({
      date: d.toISOString().split('T')[0],
      day_number: d.getDate(),
      day_name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      status: isMissed ? 'Partial' : (isPartial ? 'Partial' : 'Complete'),
      compliance_pct: comp,
      morning_pct: comp >= 75 ? 100 : 75,
      evening_pct: comp === 100 ? 100 : 50,
      water_target_met: comp >= 75,
      streak_active: i < 18
    });
  }
  return list;
}


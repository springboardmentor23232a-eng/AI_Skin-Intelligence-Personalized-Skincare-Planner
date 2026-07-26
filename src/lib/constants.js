/**
 * AI Skin Intelligence Platform Constants
 * Based on Project Requirements Document
 */

export const USER_ROLES = {
  CONSUMER: 'consumer',
  CONSULTANT: 'consultant',
  DERMATOLOGIST: 'dermatologist',
  ADMIN: 'admin',
};

export const SKIN_TYPES = [
  'Dry',
  'Oily',
  'Combination',
  'Sensitive',
  'Normal',
];

export const SKIN_CONCERNS = [
  'Acne',
  'Hyperpigmentation',
  'Dark Spots',
  'Dry Skin',
  'Oily Skin',
  'Sensitive Skin',
  'Wrinkles',
  'Fine Lines',
  'Redness',
  'Uneven Skin Tone',
];

export const ACTIVE_INGREDIENTS = [
  { name: 'Retinoids', category: 'Cell Renewal & Anti-Aging', riskLevel: 'Moderate' },
  { name: 'Niacinamide', category: 'Barrier Repair & Tone', riskLevel: 'Low' },
  { name: 'Vitamin C', category: 'Antioxidant & Brightening', riskLevel: 'Low' },
  { name: 'Hyaluronic Acid', category: 'Hydration', riskLevel: 'Very Low' },
  { name: 'Salicylic Acid', category: 'BHA Exfoliant', riskLevel: 'Moderate' },
  { name: 'Ceramides', category: 'Barrier Repair', riskLevel: 'Very Low' },
  { name: 'Peptides', category: 'Collagen Support', riskLevel: 'Low' },
  { name: 'AHAs/BHAs', category: 'Chemical Exfoliant', riskLevel: 'Moderate' },
];

export const PRODUCT_CATEGORIES = [
  'Face Wash',
  'Moisturizer',
  'Sunscreen',
  'Serum',
  'Toner',
  'Treatment Products',
  'Face Masks',
];

// Document Section 7: Weighted Scoring Model Weights
export const SCORING_WEIGHTS = {
  SKIN_ASSESSMENT: 0.35,  // 35%
  LIFESTYLE_HABITS: 0.20, // 20%
  ROUTINE_CONSISTENCY: 0.20, // 20%
  SLEEP_QUALITY: 0.15,   // 15%
  HYDRATION_LEVEL: 0.10,  // 10%
};

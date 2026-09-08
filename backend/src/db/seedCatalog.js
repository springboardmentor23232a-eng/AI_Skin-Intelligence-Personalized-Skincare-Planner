/**
 * Seed data for the ingredient intelligence + product recommendation
 * catalog. Ingredient names here intentionally match the `ingredients`
 * tags already used inside routineGenerator.js's BASE_MORNING/BASE_EVENING/
 * CONCERN_ADJUSTMENTS/SAFE_FALLBACKS — so a routine step's `ingredients`
 * array and a catalog product's `ingredients` array both refer to the same
 * vocabulary, letting the two systems line up without duplicating logic.
 *
 * Called once from db/init.js, after the schema is created. Uses
 * ON CONFLICT DO NOTHING (unique on ingredients.name / no natural key on
 * products, so products are matched by name+brand) so it's safe to run on
 * every container start / every `npm run db:init`, exactly like the demo
 * user seed already does.
 */

const INGREDIENTS = [
  {
    name: 'Salicylic Acid (BHA)',
    category: 'Exfoliant',
    description: 'An oil-soluble beta-hydroxy acid that penetrates into pores to dissolve excess oil and dead skin buildup.',
    benefits: ['Clears and prevents clogged pores', 'Reduces active breakouts', 'Smooths rough texture'],
    suitable_skin_types: ['Oily', 'Combination'],
    suitable_concerns: ['acne', 'enlarged pores', 'oiliness'],
    irritation_potential: 'medium',
    allergy_notes: 'Related to aspirin — avoid if you have a salicylate allergy. Can cause dryness/peeling if overused.',
    comedogenic_rating: 0,
    usage_guidance: 'Start 2-3x/week in the evening, increase gradually. Always follow with moisturizer.',
    avoid_with: ['retinol', 'benzoyl peroxide'],
  },
  {
    name: 'Benzoyl Peroxide',
    category: 'Active',
    description: 'An antibacterial treatment that targets acne-causing bacteria beneath the skin surface.',
    benefits: ['Reduces inflammatory acne', 'Kills acne-causing bacteria'],
    suitable_skin_types: ['Oily', 'Combination'],
    suitable_concerns: ['acne'],
    irritation_potential: 'high',
    allergy_notes: 'Can bleach fabric/towels. Can be drying or irritating on sensitive skin — patch test first.',
    comedogenic_rating: 0,
    usage_guidance: 'Apply as a thin layer to affected areas only, typically in the evening.',
    avoid_with: ['retinol', 'salicylic acid'],
  },
  {
    name: 'Niacinamide',
    category: 'Active',
    description: 'Vitamin B3 derivative that regulates oil production and strengthens the skin barrier.',
    benefits: ['Balances sebum production', 'Minimizes the look of pores', 'Supports barrier repair', 'Evens tone'],
    suitable_skin_types: ['Oily', 'Combination', 'Dry', 'Sensitive', 'Normal'],
    suitable_concerns: ['oiliness', 'enlarged pores', 'redness', 'pigmentation'],
    irritation_potential: 'low',
    allergy_notes: 'Generally well tolerated; rare reports of flushing at very high concentrations.',
    comedogenic_rating: 0,
    usage_guidance: 'Suitable for daily use, morning or evening, layers well with most other actives.',
    avoid_with: [],
  },
  {
    name: 'Vitamin C (Ascorbic Acid)',
    category: 'Antioxidant',
    description: 'A potent antioxidant that neutralizes free-radical damage and brightens uneven tone.',
    benefits: ['Brightens dull or uneven skin tone', 'Protects against environmental/UV damage', 'Boosts collagen production'],
    suitable_skin_types: ['Normal', 'Dry', 'Combination', 'Oily'],
    suitable_concerns: ['pigmentation', 'uneven skin tone', 'fine lines'],
    irritation_potential: 'medium',
    allergy_notes: 'Can sting on compromised or very sensitive skin. Oxidizes with light/air — store away from sunlight.',
    comedogenic_rating: 0,
    usage_guidance: 'Best used in the morning, under sunscreen, for daytime antioxidant protection.',
    avoid_with: ['benzoyl peroxide'],
  },
  {
    name: 'Ceramide',
    category: 'Emollient',
    description: 'A lipid naturally found in skin that helps rebuild and maintain the protective skin barrier.',
    benefits: ['Restores barrier function', 'Reduces moisture loss', 'Calms flaking and tightness'],
    suitable_skin_types: ['Dry', 'Sensitive', 'Normal'],
    suitable_concerns: ['dryness', 'redness', 'irritation'],
    irritation_potential: 'low',
    allergy_notes: 'Very well tolerated, including by reactive/compromised skin.',
    comedogenic_rating: 1,
    usage_guidance: 'Safe for twice-daily use as part of a moisturizer or dedicated barrier treatment.',
    avoid_with: [],
  },
  {
    name: 'Hyaluronic Acid',
    category: 'Humectant',
    description: 'A humectant that draws and holds water in the skin for a plumping hydration boost.',
    benefits: ['Intense hydration', 'Plumps and smooths fine dehydration lines'],
    suitable_skin_types: ['Dry', 'Normal', 'Combination', 'Oily'],
    suitable_concerns: ['dryness', 'fine lines'],
    irritation_potential: 'low',
    allergy_notes: 'Very well tolerated by nearly all skin types.',
    comedogenic_rating: 0,
    usage_guidance: 'Apply to damp skin and seal with a moisturizer to lock in the hydration it draws in.',
    avoid_with: [],
  },
  {
    name: 'Centella Asiatica',
    category: 'Soothing Agent',
    description: 'A botanical extract traditionally used to calm irritation and support skin repair.',
    benefits: ['Calms redness and reactivity', 'Supports barrier recovery', 'Reduces visible irritation'],
    suitable_skin_types: ['Sensitive', 'Dry', 'Normal', 'Combination'],
    suitable_concerns: ['redness', 'irritation', 'sensitivity'],
    irritation_potential: 'low',
    allergy_notes: 'Rare reports of contact sensitivity; generally one of the gentler actives available.',
    comedogenic_rating: 0,
    usage_guidance: 'Safe for daily use, morning and evening, especially on reactive skin.',
    avoid_with: [],
  },
  {
    name: 'Tranexamic Acid',
    category: 'Active',
    description: 'A brightening active that interrupts the pigment-production pathway to fade dark spots.',
    benefits: ['Fades dark spots and post-acne marks', 'Evens overall tone'],
    suitable_skin_types: ['Normal', 'Dry', 'Combination', 'Oily'],
    suitable_concerns: ['pigmentation'],
    irritation_potential: 'low',
    allergy_notes: 'Generally well tolerated; consult a doctor if you have a personal/family history of clotting disorders.',
    comedogenic_rating: 0,
    usage_guidance: 'Typically used in the evening; results build gradually over several weeks.',
    avoid_with: [],
  },
  {
    name: 'Retinol',
    category: 'Active',
    description: 'A vitamin A derivative that accelerates cell turnover and stimulates collagen production.',
    benefits: ['Softens fine lines', 'Improves texture over time', 'Supports collagen renewal'],
    suitable_skin_types: ['Normal', 'Dry', 'Combination', 'Oily'],
    suitable_concerns: ['fine lines', 'uneven skin tone'],
    irritation_potential: 'high',
    allergy_notes: 'Not recommended during pregnancy/breastfeeding. Increases sun sensitivity — daily SPF is essential.',
    comedogenic_rating: 0,
    usage_guidance: 'Start 2-3x/week at night, alternate with rest nights, and always follow with sunscreen the next morning.',
    avoid_with: ['salicylic acid', 'benzoyl peroxide', 'vitamin c'],
  },
  {
    name: 'Peptide',
    category: 'Active',
    description: 'Short chains of amino acids that signal skin to support firmness and collagen production.',
    benefits: ['Supports firmness and elasticity', 'Complements retinol/vitamin C routines'],
    suitable_skin_types: ['Normal', 'Dry', 'Combination', 'Sensitive'],
    suitable_concerns: ['fine lines'],
    irritation_potential: 'low',
    allergy_notes: 'Very well tolerated, including alongside most other actives.',
    comedogenic_rating: 0,
    usage_guidance: 'Safe for daily use, morning or evening.',
    avoid_with: [],
  },
  {
    name: 'Clay (Kaolin/Bentonite)',
    category: 'Treatment',
    description: 'Mineral clay that absorbs excess oil and draws impurities out of congested pores.',
    benefits: ['Absorbs excess sebum', 'Deep-cleans congested pores', 'Reduces visible shine'],
    suitable_skin_types: ['Oily', 'Combination'],
    suitable_concerns: ['oiliness', 'acne', 'enlarged pores'],
    irritation_potential: 'medium',
    allergy_notes: 'Can be over-drying on dry/sensitive skin if left on too long or used too frequently.',
    comedogenic_rating: 0,
    usage_guidance: 'Use as a 5-10 minute mask, 1-2x per week; rinse before it fully dries and tightens.',
    avoid_with: [],
  },
  {
    name: 'AHA (Glycolic Acid)',
    category: 'Exfoliant',
    description: 'A water-soluble acid that exfoliates the skin surface to reveal smoother, more even texture.',
    benefits: ['Smooths texture', 'Fades pigmentation over time', 'Encourages cell turnover'],
    suitable_skin_types: ['Normal', 'Dry', 'Combination', 'Oily'],
    suitable_concerns: ['pigmentation', 'uneven skin tone'],
    irritation_potential: 'medium',
    allergy_notes: 'Increases sun sensitivity — daily SPF is essential. Can irritate compromised or very sensitive skin.',
    comedogenic_rating: 0,
    usage_guidance: '1x per week to start; always pair with daily sunscreen.',
    avoid_with: ['retinol'],
  },
  {
    name: 'Enzyme Exfoliant (Papain/Bromelain)',
    category: 'Exfoliant',
    description: 'Fruit-derived enzymes that gently dissolve dead surface cells without the intensity of acids.',
    benefits: ['Gentle resurfacing', 'Brightens dull skin', 'Lower irritation risk than acids'],
    suitable_skin_types: ['Sensitive', 'Dry', 'Normal', 'Combination'],
    suitable_concerns: ['dryness', 'redness', 'irritation'],
    irritation_potential: 'low',
    allergy_notes: 'A good acid alternative for reactive skin; still patch test if you have known fruit-enzyme sensitivities.',
    comedogenic_rating: 0,
    usage_guidance: 'Every 10-14 days as a short-contact mask.',
    avoid_with: [],
  },
  {
    name: 'Mineral Sunscreen (Zinc Oxide)',
    category: 'Sunscreen Filter',
    description: 'A physical/mineral UV filter that sits on top of skin and reflects UV rays.',
    benefits: ['Broad-spectrum UV protection', 'Well tolerated by reactive/sensitive skin'],
    suitable_skin_types: ['Sensitive', 'Dry', 'Normal', 'Combination', 'Oily'],
    suitable_concerns: [],
    irritation_potential: 'low',
    allergy_notes: 'The go-to sunscreen filter for fragrance/chemical-sunscreen sensitivities.',
    comedogenic_rating: 0,
    usage_guidance: 'Apply every morning as the last step, reapply every 2 hours in direct sun.',
    avoid_with: [],
  },
  {
    name: 'Chemical Sunscreen Filters (incl. Oxybenzone)',
    category: 'Sunscreen Filter',
    description: 'Organic UV filters that absorb UV radiation and convert it to heat.',
    benefits: ['Broad-spectrum UV protection', 'Typically lighter, less visible finish than mineral filters'],
    suitable_skin_types: ['Normal', 'Combination', 'Oily'],
    suitable_concerns: [],
    irritation_potential: 'medium',
    allergy_notes: 'A common source of sunscreen sensitivity/breakouts — avoid if fragrance/chemical-sunscreen sensitive.',
    comedogenic_rating: 2,
    usage_guidance: 'Apply every morning as the last step, reapply every 2 hours in direct sun.',
    avoid_with: [],
  },
  {
    name: 'Fragrance (Parfum)',
    category: 'Additive',
    description: 'Added scent compounds, natural or synthetic, used to give a product a pleasant smell.',
    benefits: ['Cosmetic scent only — no skincare benefit'],
    suitable_skin_types: ['Normal', 'Oily', 'Combination'],
    suitable_concerns: [],
    irritation_potential: 'high',
    allergy_notes: 'One of the most common skincare allergens/irritants — avoid entirely if you have sensitive or reactive skin.',
    comedogenic_rating: 0,
    usage_guidance: 'Choose fragrance-free formulas if you have any known sensitivity.',
    avoid_with: [],
  },
  {
    name: 'Sulfates',
    category: 'Surfactant',
    description: 'Foaming cleansing agents (e.g. sodium lauryl sulfate) that lift away oil and debris.',
    benefits: ['Deep, foaming cleanse'],
    suitable_skin_types: ['Oily', 'Combination'],
    suitable_concerns: ['oiliness'],
    irritation_potential: 'medium',
    allergy_notes: 'Can strip natural oils and worsen dryness/sensitivity — avoid on dry or reactive skin.',
    comedogenic_rating: 0,
    usage_guidance: 'Fine for oily skin in moderation; dry/sensitive skin should choose a sulfate-free cleanser.',
    avoid_with: [],
  },
];

// Placeholder product photography, generated from the brand's own theme
// palette — NOT a claim of real product photography. No product image is
// ever scraped or fabricated as if it were the manufacturer's own asset;
// this is purely a neutral visual placeholder until a verified product
// photo is supplied. See image_url comment on the `products` table.
function placeholderImage(category) {
  const encoded = encodeURIComponent(category || 'Skincare');
  return `https://placehold.co/400x400/e6f0fc/1c6fd6?text=${encoded}`;
}

// Retailer each seed product is *suggested* to be searched on — used only
// to drive the "Search on <store>" fallback button. This is never treated
// as proof the exact product exists there, and no product_url is ever
// fabricated to go with it (see product_url column comment + productLinks.js
// resolveProductUrl / buildStoreSearchUrl on the frontend).
const PRODUCTS = [
  { name: 'Gentle Foaming Cleanser', brand: 'DermaBase', category: 'Cleansing', description: 'A daily foaming cleanser that removes oil and buildup without over-stripping.', skin_types: ['Oily', 'Combination', 'Normal'], skin_concerns: ['oiliness'], ingredients: ['Sulfates'], price: 14.99, usage_instructions: 'Massage onto damp skin morning and evening, rinse thoroughly.', sensitivity_warnings: ['sulfate', 'fragrance'], store_name: 'Nykaa', rating: 4.2, fragrance_free: false, sensitive_skin_friendly: false },
  { name: 'Fragrance-Free Gentle Cleanser', brand: 'PureBarrier', category: 'Cleansing', description: 'A sulfate-free, fragrance-free cleanser for dry or reactive skin.', skin_types: ['Dry', 'Sensitive', 'Normal'], skin_concerns: ['dryness', 'redness', 'irritation'], ingredients: ['Ceramide'], price: 16.5, usage_instructions: 'Massage onto damp skin morning and evening, rinse thoroughly.', sensitivity_warnings: [], store_name: 'Purplle', rating: 4.5, fragrance_free: true, sensitive_skin_friendly: true },
  { name: 'Double Cleanse Oil-to-Foam', brand: 'DermaBase', category: 'Cleansing', description: 'A two-in-one oil then foam cleanse to fully remove sunscreen, makeup, and pollution buildup.', skin_types: ['Oily', 'Combination', 'Normal'], skin_concerns: ['oiliness'], ingredients: ['Sulfates'], price: 19.0, usage_instructions: 'Massage the oil phase onto dry skin first, then emulsify with water and cleanse again.', sensitivity_warnings: ['sulfate', 'fragrance'], store_name: 'Amazon', rating: 4.1, fragrance_free: false, sensitive_skin_friendly: false },
  { name: 'Micellar Balancing Toner', brand: 'BalanceLab', category: 'Toner', description: 'An alcohol-free toner that removes cleanser residue and preps skin for treatment steps.', skin_types: ['Oily', 'Combination', 'Normal'], skin_concerns: ['oiliness', 'enlarged pores'], ingredients: ['Niacinamide'], price: 13.5, usage_instructions: 'Sweep over the face with a cotton pad after cleansing, morning and evening.', sensitivity_warnings: [], store_name: 'Nykaa', rating: 4.3, fragrance_free: true, sensitive_skin_friendly: false },
  { name: 'Hydrating Rosewater Toner', brand: 'CalmSkin', category: 'Toner', description: 'A soothing, alcohol-free toner that replenishes moisture and calms redness after cleansing.', skin_types: ['Dry', 'Sensitive', 'Normal'], skin_concerns: ['dryness', 'redness', 'irritation'], ingredients: ['Centella Asiatica', 'Hyaluronic Acid'], price: 15.0, usage_instructions: 'Sweep over the face with a cotton pad or pat in with palms after cleansing.', sensitivity_warnings: [], store_name: 'Purplle', rating: 4.6, fragrance_free: true, sensitive_skin_friendly: true },
  { name: 'Exfoliating Glycolic Toner', brand: 'GlowScience', category: 'Toner', description: 'A low-strength daily glycolic toner that smooths texture and evens tone over time.', skin_types: ['Normal', 'Dry', 'Combination', 'Oily'], skin_concerns: ['uneven skin tone', 'pigmentation'], ingredients: ['AHA (Glycolic Acid)'], price: 18.0, usage_instructions: 'Sweep over clean, dry skin in the evening; always follow with SPF the next morning.', sensitivity_warnings: [], store_name: 'Amazon', rating: 4.0, fragrance_free: true, sensitive_skin_friendly: false },
  { name: 'Salicylic Acid (BHA) Serum 2%', brand: 'ClearScience', category: 'Treatment', description: 'A leave-on exfoliating treatment that clears and prevents clogged pores.', skin_types: ['Oily', 'Combination'], skin_concerns: ['acne', 'enlarged pores', 'oiliness'], ingredients: ['Salicylic Acid (BHA)'], price: 22.0, usage_instructions: 'Apply a thin layer 2-3 evenings per week, increasing gradually.', sensitivity_warnings: ['salicylic acid'], store_name: 'Nykaa', rating: 4.4, fragrance_free: true, sensitive_skin_friendly: false },
  { name: 'Benzoyl Peroxide Spot Gel 2.5%', brand: 'ClearScience', category: 'Treatment', description: 'A targeted overnight spot treatment for active breakouts.', skin_types: ['Oily', 'Combination'], skin_concerns: ['acne'], ingredients: ['Benzoyl Peroxide'], price: 12.5, usage_instructions: 'Dab onto blemishes only, in the evening.', sensitivity_warnings: ['benzoyl peroxide'], store_name: 'Amazon', rating: 4.0, fragrance_free: true, sensitive_skin_friendly: false },
  { name: 'Niacinamide 10% Serum', brand: 'BalanceLab', category: 'Treatment', description: 'An oil-regulating, pore-refining daily serum suitable for most skin types.', skin_types: ['Oily', 'Combination', 'Normal'], skin_concerns: ['oiliness', 'enlarged pores', 'redness'], ingredients: ['Niacinamide'], price: 17.0, usage_instructions: 'Apply morning and/or evening before moisturizer.', sensitivity_warnings: [], store_name: 'Nykaa', rating: 4.6, fragrance_free: true, sensitive_skin_friendly: false },
  { name: 'Vitamin C Brightening Serum', brand: 'GlowScience', category: 'Treatment', description: 'A morning antioxidant serum that brightens tone and defends against environmental damage.', skin_types: ['Normal', 'Dry', 'Combination', 'Oily'], skin_concerns: ['pigmentation', 'uneven skin tone'], ingredients: ['Vitamin C (Ascorbic Acid)'], price: 24.0, usage_instructions: 'Apply in the morning before moisturizer and sunscreen.', sensitivity_warnings: [], store_name: 'Purplle', rating: 4.3, fragrance_free: true, sensitive_skin_friendly: false },
  { name: 'Tranexamic Acid Dark Spot Serum', brand: 'GlowScience', category: 'Treatment', description: 'A targeted evening treatment for stubborn dark spots and post-acne marks.', skin_types: ['Normal', 'Dry', 'Combination', 'Oily'], skin_concerns: ['pigmentation'], ingredients: ['Tranexamic Acid'], price: 26.0, usage_instructions: 'Apply in the evening; visible results typically build over 6-8 weeks.', sensitivity_warnings: [], store_name: 'Nykaa', rating: 4.2, fragrance_free: true, sensitive_skin_friendly: false },
  { name: 'Centella Asiatica Calming Serum', brand: 'CalmSkin', category: 'Treatment', description: 'A soothing daily serum for redness-prone and reactive skin.', skin_types: ['Sensitive', 'Dry', 'Normal', 'Combination'], skin_concerns: ['redness', 'irritation'], ingredients: ['Centella Asiatica'], price: 19.5, usage_instructions: 'Apply morning and evening on clean skin.', sensitivity_warnings: [], store_name: 'Purplle', rating: 4.7, fragrance_free: true, sensitive_skin_friendly: true },
  { name: 'Retinol 0.3% Night Treatment', brand: 'RenewLab', category: 'Treatment', description: 'A beginner-strength retinol treatment for texture and fine lines.', skin_types: ['Normal', 'Dry', 'Combination', 'Oily'], skin_concerns: ['fine lines', 'uneven skin tone'], ingredients: ['Retinol'], price: 28.0, usage_instructions: 'Start 2-3 nights per week; always follow with SPF the next morning.', sensitivity_warnings: ['retinol'], store_name: 'Amazon', rating: 4.1, fragrance_free: true, sensitive_skin_friendly: false },
  { name: 'Peptide Firming Serum', brand: 'RenewLab', category: 'Treatment', description: 'A daily peptide serum that supports firmness and pairs well with retinol/vitamin C routines.', skin_types: ['Normal', 'Dry', 'Combination', 'Sensitive'], skin_concerns: ['fine lines'], ingredients: ['Peptide'], price: 27.0, usage_instructions: 'Apply morning or evening on clean skin, before moisturizer.', sensitivity_warnings: [], store_name: 'Nykaa', rating: 4.4, fragrance_free: true, sensitive_skin_friendly: true },
  { name: 'Lightweight Gel Moisturizer', brand: 'BalanceLab', category: 'Moisturizing', description: 'An oil-free, non-comedogenic daily moisturizer for oily/combination skin.', skin_types: ['Oily', 'Combination'], skin_concerns: ['oiliness'], ingredients: ['Hyaluronic Acid', 'Niacinamide'], price: 18.0, usage_instructions: 'Apply morning and evening as the last hydrating step before SPF.', sensitivity_warnings: [], store_name: 'Nykaa', rating: 4.3, fragrance_free: true, sensitive_skin_friendly: false },
  { name: 'Ceramide Barrier Repair Cream', brand: 'PureBarrier', category: 'Moisturizing', description: 'A rich, barrier-supporting cream for dry or compromised skin.', skin_types: ['Dry', 'Sensitive', 'Normal'], skin_concerns: ['dryness', 'redness'], ingredients: ['Ceramide', 'Hyaluronic Acid'], price: 23.0, usage_instructions: 'Apply morning and evening on damp skin.', sensitivity_warnings: [], store_name: 'Purplle', rating: 4.6, fragrance_free: true, sensitive_skin_friendly: true },
  { name: 'Fragrance-Free Barrier Moisturizer', brand: 'PureBarrier', category: 'Moisturizing', description: 'A gentle, fragrance-free daily moisturizer for reactive or sensitized skin.', skin_types: ['Sensitive', 'Dry', 'Normal'], skin_concerns: ['redness', 'irritation'], ingredients: ['Ceramide'], price: 21.0, usage_instructions: 'Apply morning and evening.', sensitivity_warnings: [], store_name: 'Amazon', rating: 4.5, fragrance_free: true, sensitive_skin_friendly: true },
  { name: 'Broad-Spectrum Mineral Sunscreen SPF 50', brand: 'SunShield', category: 'Sun Protection', description: 'A mineral, fragrance-free sunscreen well suited to sensitive or reactive skin.', skin_types: ['Sensitive', 'Dry', 'Normal', 'Combination', 'Oily'], skin_concerns: [], ingredients: ['Mineral Sunscreen (Zinc Oxide)'], price: 20.0, usage_instructions: 'Apply as the last morning step, reapply every 2 hours in direct sun.', sensitivity_warnings: [], store_name: 'Nykaa', rating: 4.5, fragrance_free: true, sensitive_skin_friendly: true },
  { name: 'Lightweight Daily Sunscreen SPF 50', brand: 'SunShield', category: 'Sun Protection', description: 'A fast-absorbing, non-greasy sunscreen for daily wear under makeup.', skin_types: ['Normal', 'Combination', 'Oily'], skin_concerns: [], ingredients: ['Chemical Sunscreen Filters (incl. Oxybenzone)'], price: 22.0, usage_instructions: 'Apply as the last morning step, reapply every 2 hours in direct sun.', sensitivity_warnings: ['oxybenzone', 'chemical sunscreen'], store_name: 'Purplle', rating: 4.2, fragrance_free: false, sensitive_skin_friendly: false },
  { name: 'Tinted Mineral Sunscreen SPF 45', brand: 'SunShield', category: 'Sun Protection', description: 'A tinted mineral sunscreen that evens tone while protecting, well suited to daily wear.', skin_types: ['Normal', 'Dry', 'Combination', 'Sensitive'], skin_concerns: ['uneven skin tone'], ingredients: ['Mineral Sunscreen (Zinc Oxide)'], price: 24.5, usage_instructions: 'Apply as the last morning step, reapply every 2 hours in direct sun.', sensitivity_warnings: [], store_name: 'Amazon', rating: 4.4, fragrance_free: true, sensitive_skin_friendly: true },
  { name: 'Occlusive Night Repair Balm', brand: 'RenewLab', category: 'Night Care', description: 'A rich overnight balm that seals in hydration and active ingredients while you sleep.', skin_types: ['Dry', 'Normal', 'Combination'], skin_concerns: ['dryness'], ingredients: ['Ceramide'], price: 25.0, usage_instructions: 'Apply as the final evening step over your other treatments.', sensitivity_warnings: ['fragrance'], store_name: 'Nykaa', rating: 4.1, fragrance_free: false, sensitive_skin_friendly: false },
  { name: 'Fragrance-Free Repair Balm', brand: 'PureBarrier', category: 'Night Care', description: 'A fragrance-free overnight balm for sensitized or allergy-prone skin.', skin_types: ['Sensitive', 'Dry', 'Normal'], skin_concerns: ['dryness', 'irritation'], ingredients: ['Ceramide'], price: 24.0, usage_instructions: 'Apply as the final evening step.', sensitivity_warnings: [], store_name: 'Purplle', rating: 4.6, fragrance_free: true, sensitive_skin_friendly: true },
  { name: 'Oil-Absorbing Clay Mask', brand: 'ClearScience', category: 'Exfoliation', description: 'A weekly clay mask that draws out excess oil and unclogs congested pores.', skin_types: ['Oily', 'Combination'], skin_concerns: ['oiliness', 'acne', 'enlarged pores'], ingredients: ['Clay (Kaolin/Bentonite)'], price: 15.0, usage_instructions: 'Apply for 5-10 minutes, 1-2x per week, then rinse.', sensitivity_warnings: [], store_name: 'Nykaa', rating: 4.0, fragrance_free: true, sensitive_skin_friendly: false },
  { name: 'Brightening AHA Weekly Peel Pads', brand: 'GlowScience', category: 'Exfoliation', description: 'Pre-soaked glycolic acid pads for weekly resurfacing and tone-evening.', skin_types: ['Normal', 'Dry', 'Combination', 'Oily'], skin_concerns: ['pigmentation', 'uneven skin tone'], ingredients: ['AHA (Glycolic Acid)'], price: 21.0, usage_instructions: 'Wipe over clean, dry skin 1x per week in the evening; always follow with SPF the next day.', sensitivity_warnings: [], store_name: 'Amazon', rating: 4.3, fragrance_free: true, sensitive_skin_friendly: false },
  { name: 'Gentle Enzyme Exfoliating Mask', brand: 'CalmSkin', category: 'Exfoliation', description: 'A low-irritation enzyme mask for sensitive or reactive skin that still needs gentle exfoliation.', skin_types: ['Sensitive', 'Dry', 'Normal', 'Combination'], skin_concerns: ['dryness', 'redness', 'irritation'], ingredients: ['Enzyme Exfoliant (Papain/Bromelain)'], price: 19.0, usage_instructions: 'Apply for 8-10 minutes every 10-14 days.', sensitivity_warnings: [], store_name: 'Purplle', rating: 4.5, fragrance_free: true, sensitive_skin_friendly: true },
];

async function seedCatalog(client) {
  let ingredientsInserted = 0;
  for (const ing of INGREDIENTS) {
    const { rowCount } = await client.query(
      `INSERT INTO ingredients
         (name, category, description, benefits, suitable_skin_types, suitable_concerns,
          irritation_potential, allergy_notes, comedogenic_rating, usage_guidance, avoid_with)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (name) DO NOTHING`,
      [
        ing.name, ing.category, ing.description,
        JSON.stringify(ing.benefits), JSON.stringify(ing.suitable_skin_types), JSON.stringify(ing.suitable_concerns),
        ing.irritation_potential, ing.allergy_notes, ing.comedogenic_rating, ing.usage_guidance, JSON.stringify(ing.avoid_with),
      ]
    );
    ingredientsInserted += rowCount;
  }

  // Products are upserted (matched by name+brand, same as before) rather
  // than skipped once they exist, so re-running db:init on an existing
  // install migrates old rows to carry the new shopping/comparison fields
  // (image_url, store_name, rating, fragrance_free, sensitive_skin_friendly)
  // instead of leaving them permanently blank. product_url is deliberately
  // never written here — it stays whatever it already was (untouched by
  // COALESCE) so a real URL entered later is never clobbered by reseeding,
  // and a never-set one correctly keeps showing "Search on <store>" instead
  // of a fabricated link.
  let productsInserted = 0;
  let productsUpdated = 0;
  for (const p of PRODUCTS) {
    const existing = await client.query('SELECT id FROM products WHERE name = $1 AND brand = $2', [p.name, p.brand]);
    const imageUrl = placeholderImage(p.category);
    if (existing.rows[0]) {
      await client.query(
        `UPDATE products SET
           category = $3, description = $4, skin_types = $5, skin_concerns = $6, ingredients = $7,
           price = $8, usage_instructions = $9, sensitivity_warnings = $10,
           image_url = COALESCE(image_url, $11), store_name = COALESCE(store_name, $12),
           rating = COALESCE(rating, $13), fragrance_free = $14, sensitive_skin_friendly = $15,
           updated_at = NOW()
         WHERE name = $1 AND brand = $2`,
        [
          p.name, p.brand, p.category, p.description,
          JSON.stringify(p.skin_types), JSON.stringify(p.skin_concerns), JSON.stringify(p.ingredients),
          p.price, p.usage_instructions, JSON.stringify(p.sensitivity_warnings),
          imageUrl, p.store_name, p.rating, p.fragrance_free, p.sensitive_skin_friendly,
        ]
      );
      productsUpdated += 1;
      continue;
    }
    await client.query(
      `INSERT INTO products
         (name, brand, category, description, skin_types, skin_concerns, ingredients, price,
          usage_instructions, sensitivity_warnings, image_url, store_name, rating,
          fragrance_free, sensitive_skin_friendly)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        p.name, p.brand, p.category, p.description,
        JSON.stringify(p.skin_types), JSON.stringify(p.skin_concerns), JSON.stringify(p.ingredients),
        p.price, p.usage_instructions, JSON.stringify(p.sensitivity_warnings),
        imageUrl, p.store_name, p.rating, p.fragrance_free, p.sensitive_skin_friendly,
      ]
    );
    productsInserted += 1;
  }

  return { ingredientsInserted, productsInserted, productsUpdated };
}

module.exports = { seedCatalog };

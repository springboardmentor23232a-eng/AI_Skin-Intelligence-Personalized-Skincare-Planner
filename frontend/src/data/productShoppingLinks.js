/**
 * Shopping platform redirect links for products.
 * Structured so that later the FastAPI backend can return:
 * {
 *   "id": 1,
 *   "name": "Product Name",
 *   "shoppingLinks": {
 *     "amazon": "...",
 *     "nykaa": "...",
 *     "purplle": "..."
 *   }
 * }
 */

export const productShoppingLinks = [
  {
    id: 1,
    name: "Hydrating Gentle Skin Cleanser",
    brand: "Cetaphil",
    shoppingLinks: {
      amazon: "https://www.amazon.in/dp/B01CCGW4OE",
      nykaa: "https://www.nykaa.com/cetaphil-gentle-skin-cleanser/p/2099",
      purplle: "https://www.purplle.com/product/cetaphil-gentle-skin-cleanser-125-ml"
    }
  },
  {
    id: 2,
    name: "Salicylic Acid Active Clearing Cleanser",
    brand: "The Ordinary",
    shoppingLinks: {
      amazon: "https://www.amazon.in/dp/B00949CTQQ",
      nykaa: "https://www.nykaa.com/the-ordinary-salicylic-acid-2percent-masque/p/5001594",
      purplle: null
    }
  },
  {
    id: 3,
    name: "Effaclar Foaming Gel Cleanser",
    brand: "La Roche-Posay",
    shoppingLinks: {
      amazon: "https://www.amazon.in/dp/B000IO694U",
      nykaa: "https://www.nykaa.com/la-roche-posay-effaclar-purifying-foaming-gel-cleanser/p/10313",
      purplle: null
    }
  },
  {
    id: 4,
    name: "Daily Moisture Barrier Restoration Lotion",
    brand: "Cetaphil",
    shoppingLinks: {
      amazon: "https://www.amazon.in/dp/B001ET76EY",
      nykaa: "https://www.nykaa.com/cetaphil-moisturising-lotion/p/2101",
      purplle: "https://www.purplle.com/product/cetaphil-moisturising-lotion-100-ml"
    }
  },
  {
    id: 5,
    name: "Hydro Boost Water Gel Moisturizer",
    brand: "Neutrogena",
    shoppingLinks: {
      amazon: "https://www.amazon.in/dp/B00NR1YQHM",
      nykaa: "https://www.nykaa.com/neutrogena-hydro-boost-water-gel/p/259489",
      purplle: "https://www.purplle.com/product/neutrogena-hydro-boost-water-gel-50-g"
    }
  },
  {
    id: 6,
    name: "Ceramide Barrier Relief Balm",
    brand: "Minimalist",
    shoppingLinks: {
      amazon: "https://www.amazon.in/dp/B0991VJ855",
      nykaa: "https://www.nykaa.com/minimalist-0-3-ceramide-moisturizer-with-madecassoside-for-dry-damaged-skin/p/2791834",
      purplle: "https://www.purplle.com/product/minimalist-0-3-ceramide-barrier-repair-moisturizer-cream-50-g"
    }
  },
  {
    id: 7,
    name: "Matte Mineral Sunscreen SPF 50",
    brand: "Minimalist",
    shoppingLinks: {
      amazon: "https://www.amazon.in/dp/B096V1DF5D",
      nykaa: "https://www.nykaa.com/minimalist-spf-50-sunscreen-with-multi-vitamins-broad-spectrum/p/2791831",
      purplle: "https://www.purplle.com/product/minimalist-spf-50-pa-sunscreen-50-g"
    }
  },
  {
    id: 8,
    name: "Ceramide Comfort Sun Shield SPF 50",
    brand: "Re'equil",
    shoppingLinks: {
      amazon: "https://www.amazon.in/dp/B07R18471Q",
      nykaa: "https://www.nykaa.com/re-equil-ultra-matte-dry-touch-sunscreen-gel-spf-50-pa/p/594858",
      purplle: "https://www.purplle.com/product/re-equil-ultra-matte-dry-touch-sunscreen-gel-spf-50-pa-50g"
    }
  },
  {
    id: 9,
    name: "Aura Bright 10% Niacinamide Serum",
    brand: "Minimalist",
    shoppingLinks: {
      amazon: "https://www.amazon.in/dp/B08F9W1N9D",
      nykaa: "https://www.nykaa.com/minimalist-10-niacinamide-face-serum-for-acne-marks-blemishes/p/1067982",
      purplle: "https://www.purplle.com/product/minimalist-10-niacinamide-face-serum-30-ml"
    }
  },
  {
    id: 10,
    name: "Radiant Glow 10% Vitamin C Serum",
    brand: "Minimalist",
    shoppingLinks: {
      amazon: "https://www.amazon.in/dp/B08F9V6K9F",
      nykaa: "https://www.nykaa.com/minimalist-10-vitamin-c-face-serum-for-glowing-skin/p/1067981",
      purplle: "https://www.purplle.com/product/minimalist-10-vitamin-c-face-serum-30-ml"
    }
  },
  {
    id: 11,
    name: "Multi-Peptide Youth Recovery Serum",
    brand: "The Ordinary",
    shoppingLinks: {
      amazon: "https://www.amazon.in/dp/B0779X5P2D",
      nykaa: "https://www.nykaa.com/the-ordinary-buffet-multi-technology-peptide-serum/p/5001589",
      purplle: null
    }
  },
  {
    id: 12,
    name: "BHA Pore Refining 2% Toner",
    brand: "Paula's Choice",
    shoppingLinks: {
      amazon: "https://www.amazon.in/dp/B00949CTQQ",
      nykaa: "https://www.nykaa.com/paula-s-choice-skin-perfecting-2-bha-liquid-exfoliant/p/524855",
      purplle: null
    }
  },
  {
    id: 13,
    name: "Hydrating Milky Rice Toner",
    brand: "I'm From",
    shoppingLinks: {
      amazon: "https://www.amazon.in/dp/B07K23HV61",
      nykaa: "https://www.nykaa.com/i-m-from-rice-toner/p/1183577",
      purplle: null
    }
  },
  {
    id: 14,
    name: "0.3% Retinol Youth Renewal Cream",
    brand: "Minimalist",
    shoppingLinks: {
      amazon: "https://www.amazon.in/dp/B091JMGZ33",
      nykaa: "https://www.nykaa.com/minimalist-0-3-retinol-face-serum-for-anti-aging/p/1344403",
      purplle: "https://www.purplle.com/product/minimalist-0-3-retinol-face-serum-30-ml"
    }
  },
  {
    id: 15,
    name: "AHA 10% Lactic Acid Exfoliating Serum",
    brand: "The Ordinary",
    shoppingLinks: {
      amazon: "https://www.amazon.in/dp/B0716QXZ7F",
      nykaa: "https://www.nykaa.com/the-ordinary-lactic-acid-10percent-ha-2percent/p/5001592",
      purplle: null
    }
  },
  {
    id: 16,
    name: "Jeju Volcanic Pore Clay Mask",
    brand: "Innisfree",
    shoppingLinks: {
      amazon: "https://www.amazon.in/dp/B07D3BNJ4T",
      nykaa: "https://www.nykaa.com/innisfree-super-volcanic-pore-clay-mask-2x/p/354770",
      purplle: "https://www.purplle.com/product/innisfree-super-volcanic-pore-clay-mask-2x-100-ml"
    }
  },
  {
    id: 17,
    name: "Hyaluronic Hydrating Sheet Mask",
    brand: "L'Oreal",
    shoppingLinks: {
      amazon: "https://www.amazon.in/dp/B08C7K8K4H",
      nykaa: "https://www.nykaa.com/l-oreal-paris-revitalift-hyaluronic-acid-plumping-fresh-mix-serum-sheet-mask/p/853380",
      purplle: "https://www.purplle.com/product/l-oreal-paris-revitalift-hyaluronic-acid-plumping-fresh-mix-serum-sheet-mask-33-g"
    }
  }
];

// Lookup indices for fast matching
const linksById = {};
const linksByName = {};

productShoppingLinks.forEach((item) => {
  if (item.id) linksById[item.id] = item.shoppingLinks;
  if (item.name) linksByName[item.name.toLowerCase().trim()] = item.shoppingLinks;
});

/**
 * Helper to retrieve shopping links for a given product.
 * Prioritizes product.shoppingLinks if already returned by backend.
 */
export const getProductShoppingLinks = (product) => {
  if (!product) return null;
  if (product.shoppingLinks) {
    return product.shoppingLinks;
  }
  if (product.id && linksById[product.id]) {
    return linksById[product.id];
  }
  if (product.name) {
    const key = product.name.toLowerCase().trim();
    if (linksByName[key]) {
      return linksByName[key];
    }
  }
  return null;
};

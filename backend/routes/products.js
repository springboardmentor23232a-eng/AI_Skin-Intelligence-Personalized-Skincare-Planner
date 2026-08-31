const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env.backup') });

// PostgreSQL connection
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'skin_intelligence',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
});

function withShoppingLinks(product) {
    if (!product) return product;
    const query = encodeURIComponent(`${product.brand || ''} ${product.product_name || ''}`.trim());
    return {
        ...product,
        amazon_link: product.amazon_link || `https://www.amazon.in/s?k=${query}`,
        nykaa_link: product.nykaa_link || `https://www.nykaa.com/search/result/?q=${query}`,
        google_shopping_link: product.google_shopping_link || `https://www.google.com/search?tbm=shop&q=${query}`,
    };
}

function normalizeSearchText(value = '') {
    return String(value || '')
        .toLowerCase()
        .replace(/[%+]/g, ' ')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function escapeRegex(value = '') {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSearchVariants(value = '') {
    const raw = String(value || '').trim();
    const normalized = normalizeSearchText(raw);
    if (!raw && !normalized) return [];

    const variants = new Set();
    if (raw) variants.add(raw.toLowerCase());
    if (normalized) variants.add(normalized);

    const tokens = normalized.split(' ').filter(Boolean);
    if (tokens.length > 1) {
        variants.add(tokens.join(' '));
        variants.add(tokens.slice(-Math.min(4, tokens.length)).join(' '));
        variants.add(tokens.slice(0, Math.min(4, tokens.length)).join(' '));
    }

    return [...variants].filter(Boolean);
}

// Add CORS headers to all responses
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Get all product categories
router.get('/categories', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM product_categories ORDER BY sort_order'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get products by category
router.get('/category/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const result = await pool.query(
            'SELECT * FROM products WHERE category_id = $1 AND is_active = true ORDER BY price_tier, current_price',
            [categoryId]
        );
        res.json(result.rows.map(withShoppingLinks));
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get all products with optional filters
router.get('/', async (req, res) => {
    try {
        const { category, tier, skin_type, concern, brand } = req.query;
        
        let query = 'SELECT p.*, pc.name as category_name, pc.icon as category_icon FROM products p JOIN product_categories pc ON p.category_id = pc.id WHERE p.is_active = true';
        const params = [];
        let paramCount = 1;

        if (category) {
            query += ` AND pc.name = $${paramCount}`;
            params.push(category);
            paramCount++;
        }

        if (tier) {
            query += ` AND p.price_tier = $${paramCount}`;
            params.push(tier);
            paramCount++;
        }

        if (skin_type) {
            query += ` AND $${paramCount} = ANY(p.skin_types)`;
            params.push(skin_type);
            paramCount++;
        }

        if (concern) {
            query += ` AND $${paramCount} = ANY(p.concerns)`;
            params.push(concern);
            paramCount++;
        }

        if (brand) {
            query += ` AND p.brand ILIKE $${paramCount}`;
            params.push(`%${brand}%`);
            paramCount++;
        }

        query += ' ORDER BY pc.sort_order, p.price_tier, p.current_price';

        const result = await pool.query(query, params);
        res.json(result.rows.map(withShoppingLinks));
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

function inferTags(product) {
    const text = `${product.product_name || ''} ${product.category_name || ''} ${product.brand || ''} ${(product.ingredients || []).join(' ')}`.toLowerCase();
    const concernMap = {
        acne: ['salicylic', 'bha', 'blemish', 'acne', 'niacinamide', 'retinol'],
        pores: ['niacinamide', 'salicylic', 'bha', 'lha', 'pores'],
        redness: ['centella', 'cica', 'calming', 'green tea', 'sooth'],
        dark_spots: ['vitamin c', 'pigment', 'discolor', 'bright', 'ferulic'],
        dryness: ['hyaluronic', 'ceramide', 'moistur', 'hydrating', 'cream', 'b5'],
        sensitivity: ['centella', 'cica', 'gentle', 'ceramide', 'calming'],
        blackheads: ['salicylic', 'bha', 'lha', 'exfol'],
        texture: ['retinol', 'aha', 'glycolic', 'exfol', 'peel', 'pha', 'peptide'],
        dullness: ['vitamin c', 'glycolic', 'aha', 'bright', 'niacinamide']
    };
    const inferredConcerns = Object.entries(concernMap)
        .filter(([, keywords]) => keywords.some(keyword => text.includes(keyword)))
        .map(([concern]) => concern);

    const inferredTypes = [];
    if (/(foaming|salicylic|niacinamide|bha|gel|oil)/.test(text)) inferredTypes.push('oily');
    if (/(hydrating|cream|ceramide|hyaluronic|la mer)/.test(text)) inferredTypes.push('dry');
    if (/(gentle|cica|centella|ceramide|calming)/.test(text)) inferredTypes.push('sensitive');
    if (inferredTypes.includes('oily') || inferredTypes.includes('dry')) inferredTypes.push('combination');
    if (!inferredTypes.length) inferredTypes.push('oily', 'dry', 'combination', 'normal', 'sensitive');

    return {
        concerns: (product.concerns && product.concerns.length) ? product.concerns : inferredConcerns,
        skin_types: (product.skin_types && product.skin_types.length) ? product.skin_types : inferredTypes
    };
}

function scoreCatalogProduct(product, profile) {
    const { skin_type, skin_concerns = [], budget_tier } = profile;
    const tags = inferTags(product);
    let score = 45;
    const reasons = [];

    if (product.price_tier === budget_tier) {
        score += 25;
        reasons.push(`Matches ${budget_tier} budget`);
    } else if (
        (budget_tier === 'luxury' && product.price_tier === 'premium') ||
        (budget_tier === 'budget' && product.price_tier === 'premium') ||
        (budget_tier === 'premium' && product.price_tier !== 'luxury')
    ) {
        score += 8;
    }

    if (!skin_type || tags.skin_types.includes(skin_type)) {
        score += 18;
        reasons.push(`Suitable for ${skin_type || 'your'} skin`);
    } else {
        score -= 12;
        reasons.push(`Better suited to ${tags.skin_types.slice(0, 2).join(', ')} skin`);
    }

    const matchedConcerns = skin_concerns.filter(concern => tags.concerns.includes(concern));
    score += Math.min(24, matchedConcerns.length * 8);
    if (matchedConcerns.length) {
        reasons.push(`Targets ${matchedConcerns.join(', ')}`);
    } else if (product.category_name) {
        reasons.push(`${product.category_name} from the catalog`);
    }

    return {
        ...withShoppingLinks(product),
        match_score: Math.max(1, Math.min(99, score)),
        match_reasons: reasons,
        inferred_concerns: tags.concerns
    };
}

function normalizeBudgetTier(tier) {
    const value = String(tier || 'budget').toLowerCase();
    if (value === 'mid_range' || value === 'midrange' || value === 'mid-range') return 'premium';
    if (['budget', 'premium', 'luxury'].includes(value)) return value;
    return 'budget';
}

// Get personalized product recommendations based on skin profile
router.post('/recommendations', async (req, res) => {
    try {
        const skin_type = req.body.skin_type;
        const skin_concerns = req.body.skin_concerns || [];
        const allergies = req.body.allergies || [];
        const budget_tier = normalizeBudgetTier(req.body.budget_tier);

        console.log('Generating recommendations for:', { skin_type, skin_concerns, budget_tier, allergies });

        let query = `
            SELECT p.*, pc.name as category_name, pc.icon as category_icon
            FROM products p
            JOIN product_categories pc ON p.category_id = pc.id
            WHERE p.is_active = true
              AND COALESCE(p.product_type, '') <> 'service'
        `;
        const params = [];
        let paramCount = 1;

        if (allergies.length > 0) {
            const allergyConditions = allergies.map((allergy, index) => {
                const paramIndex = paramCount + index;
                return `NOT (LOWER($${paramIndex}) = ANY(SELECT LOWER(unnest(COALESCE(p.ingredients, ARRAY[]::text[])))))`;
            }).join(' AND ');
            query += ` AND (${allergyConditions})`;
            allergies.forEach(allergy => params.push(String(allergy).trim()));
            paramCount += allergies.length;
        }

        const result = await pool.query(query, params);
        const scored = result.rows
            .map(product => scoreCatalogProduct(product, { skin_type, skin_concerns, budget_tier }))
            .sort((a, b) => {
                if (b.match_score !== a.match_score) return b.match_score - a.match_score;
                if (a.price_tier === budget_tier && b.price_tier !== budget_tier) return -1;
                if (b.price_tier === budget_tier && a.price_tier !== budget_tier) return 1;
                return Number(a.current_price || 0) - Number(b.current_price || 0);
            });

        const groupedRecommendations = {};
        scored.forEach(product => {
            if (!groupedRecommendations[product.category_name]) {
                groupedRecommendations[product.category_name] = {
                    category: product.category_name,
                    icon: product.category_icon,
                    products: []
                };
            }
            if (groupedRecommendations[product.category_name].products.length < 2) {
                groupedRecommendations[product.category_name].products.push(product);
            }
        });

        const recommendations = Object.values(groupedRecommendations)
            .sort((a, b) => (b.products[0]?.match_score || 0) - (a.products[0]?.match_score || 0))
            .slice(0, 6);

        res.json({
            recommendations,
            total_products: recommendations.reduce((sum, group) => sum + group.products.length, 0),
            filters_used: { skin_type, skin_concerns, budget_tier, allergies }
        });
    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
});

// Search products by name or brand
router.get('/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const searchTerms = buildSearchVariants(query);

        if (!searchTerms.length) {
            return res.json([]);
        }

        const clauses = [];

        searchTerms.forEach((term) => {
            const normalizedTerm = normalizeSearchText(term);
            if (!normalizedTerm) return;

            const regexPattern = normalizedTerm
                .split(/\s+/)
                .filter(Boolean)
                .map(part => escapeRegex(part))
                .join('.*');

            clauses.push(`(
                REGEXP_REPLACE(LOWER(COALESCE(p.product_name, '')), '[^a-z0-9]+', ' ', 'g') ~* '${regexPattern}'
                OR REGEXP_REPLACE(LOWER(COALESCE(p.brand, '')), '[^a-z0-9]+', ' ', 'g') ~* '${regexPattern}'
                OR REGEXP_REPLACE(LOWER(COALESCE(CONCAT(p.brand, ' ', p.product_name), '')), '[^a-z0-9]+', ' ', 'g') ~* '${regexPattern}'
                OR REGEXP_REPLACE(LOWER(COALESCE(p.ingredients::text, '')), '[^a-z0-9]+', ' ', 'g') ~* '${regexPattern}'
            )`);
        });

        const result = await pool.query(
            `SELECT p.*, pc.name as category_name, pc.icon as category_icon
             FROM products p
             JOIN product_categories pc ON p.category_id = pc.id
             WHERE p.is_active = true
             AND (${clauses.join(' OR ')})
             ORDER BY p.current_price ASC`
        );

        const scored = result.rows.map(product => {
            const combinedText = `${product.brand || ''} ${product.product_name || ''} ${(product.ingredients || []).join(' ')}`.toLowerCase();
            const score = searchTerms.reduce((total, term) => {
                if (!term) return total;
                return total + (combinedText.includes(term) ? 2 : 0);
            }, 0);
            return { ...withShoppingLinks(product), _searchScore: score };
        }).sort((a, b) => (b._searchScore || 0) - (a._searchScore || 0) || Number(a.current_price || 0) - Number(b.current_price || 0));

        res.json(scored.map(({ _searchScore, ...product }) => product));
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Failed to search products' });
    }
});

// Get single product by ID
router.get('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const result = await pool.query(
            'SELECT p.*, pc.name as category_name, pc.icon as category_icon FROM products p JOIN product_categories pc ON p.category_id = pc.id WHERE p.id = $1',
            [productId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(withShoppingLinks(result.rows[0]));
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Compare multiple products
router.post('/compare', async (req, res) => {
    try {
        const { product_ids, product_names, user_profile } = req.body;
        const requestedNames = Array.isArray(product_names) ? product_names.filter(Boolean) : [];
        const requestedIds = Array.isArray(product_ids) ? product_ids.filter(Boolean) : [];

        if ((!requestedIds || requestedIds.length < 2) && (!requestedNames || requestedNames.length < 2)) {
            return res.status(400).json({ error: 'At least 2 products required for comparison' });
        }

        let products = [];
        if (requestedIds.length >= 2) {
            const query = `
                SELECT p.*, pc.name as category_name, pc.icon as category_icon
                FROM products p
                JOIN product_categories pc ON p.category_id = pc.id
                WHERE p.id = ANY($1) AND p.is_active = true
            `;

            const result = await pool.query(query, [requestedIds]);
            products = result.rows.map(withShoppingLinks);
        }

        if (products.length >= 2) {
            const recommendations = generateComparisonRecommendations(products, user_profile);
            const overall_best = findBestProduct(products, user_profile);
            const ai_advice = await getGroqComparisonAdvice(products, user_profile, { recommendations, overall_best });

            return res.json({
                products,
                comparison_table: generateComparisonTable(products),
                recommendations,
                overall_best,
                ai_advice
            });
        }

        const fallbackNames = requestedNames.slice(0, 2);
        const comparison = {
            products: fallbackNames.map((name, index) => ({
                id: `manual-${index}`,
                product_name: name,
                brand: 'User search',
                current_price: null,
                price_tier: 'unknown',
                product_type: 'comparison',
                size: 'N/A',
                skin_types: [],
                concerns: [],
                ingredients: [],
                amazon_link: `https://www.amazon.in/s?k=${encodeURIComponent(name)}`,
                nykaa_link: `https://www.nykaa.com/search/result/?q=${encodeURIComponent(name)}`,
                google_shopping_link: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(name)}`
            })),
            comparison_table: {
                Price: { ['manual-0']: 'Not in catalog', ['manual-1']: 'Not in catalog' },
                'Price Tier': { ['manual-0']: 'Not in catalog', ['manual-1']: 'Not in catalog' },
                Brand: { ['manual-0']: 'User search', ['manual-1']: 'User search' },
                'Product Type': { ['manual-0']: 'AI comparison only', ['manual-1']: 'AI comparison only' },
                'Skin Types': { ['manual-0']: 'Not available', ['manual-1']: 'Not available' },
                Concerns: { ['manual-0']: 'Not available', ['manual-1']: 'Not available' },
                Ingredients: { ['manual-0']: 'Not available', ['manual-1']: 'Not available' },
                Effectiveness: { ['manual-0']: 'AI review pending', ['manual-1']: 'AI review pending' },
                Availability: { ['manual-0']: 'AI estimate', ['manual-1']: 'AI estimate' }
            },
            recommendations: fallbackNames.map((name, index) => ({
                product_id: `manual-${index}`,
                product_name: name,
                score: 0,
                reasons: ['User-supplied comparison term; not found in catalog']
            })),
            overall_best: {
                product: { product_name: fallbackNames[0] },
                reasons: ['DB match unavailable; Groq comparison used'],
                score: 0
            },
            ai_advice: await getGroqComparisonAdviceFromNames(fallbackNames, user_profile)
        };

        res.json(comparison);
    } catch (error) {
        console.error('Error comparing products:', error);
        res.status(500).json({ error: 'Failed to compare products' });
    }
});

async function getGroqComparisonAdvice(products, user_profile, dbSummary) {
    const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API;
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
        return null;
    }

    try {
        const productFacts = products.map(product => ({
            name: product.product_name,
            brand: product.brand,
            price: Number(product.current_price || 0),
            price_tier: product.price_tier,
            size: product.size,
            skin_types: product.skin_types || [],
            concerns: product.concerns || [],
            ingredients: product.ingredients || [],
            product_type: product.product_type || 'N/A'
        }));

        const scoreMap = Object.fromEntries((dbSummary?.recommendations || []).map(item => [item.product_name, item.score]));
        const overallBest = dbSummary?.overall_best?.product?.product_name || 'No clear winner';

        const prompt = `Compare these skincare products for this user. Use only the verified product facts supplied below.\n\nUser profile: ${JSON.stringify(user_profile || {})}\nProducts: ${JSON.stringify(productFacts)}\nDB scores: ${JSON.stringify(scoreMap)}\nOverall best DB pick: ${overallBest}\n\nReturn JSON with exactly: {"summary":"...","best_choice_reason":"...","pros_and_cons":{"Product A":{"pros":[...],"cons":[...]},...},"safety_note":"..."}. Do not invent products or claims. Keep the answer specific to the supplied products.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-120b',
                temperature: 0.2,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: 'You are a careful skincare product comparison advisor.' },
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Groq response failed: ${response.status}`);
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (!content) return null;

        const parsed = JSON.parse(content);
        if (!parsed || typeof parsed !== 'object' || !parsed.summary || !parsed.best_choice_reason || !parsed.pros_and_cons || !parsed.safety_note) {
            return null;
        }

        return parsed;
    } catch (error) {
        console.warn('Groq comparison advice unavailable:', error.message || error);
        return null;
    }
}

async function getGroqComparisonAdviceFromNames(productNames, user_profile) {
    const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API;
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
        return null;
    }

    const names = Array.isArray(productNames) ? productNames.filter(Boolean).slice(0, 2) : [];
    if (names.length < 2) return null;

    try {
        const prompt = `These two skincare products were searched by the user but were not found in the catalog: ${JSON.stringify(names)}. The user profile is ${JSON.stringify(user_profile || {})}. Please provide a helpful comparison based on the product names alone, without inventing ingredients or claims. Return JSON with exactly: {"summary":"...","best_choice_reason":"...","pros_and_cons":{"Product 1":{"pros":[...],"cons":[...]},"Product 2":{"pros":[...],"cons":[...]}},"safety_note":"..."}.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-120b',
                temperature: 0.2,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: 'You are a careful skincare product comparison advisor.' },
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Groq fallback compare failed: ${response.status}`);
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (!content) return null;

        const parsed = JSON.parse(content);
        if (!parsed || typeof parsed !== 'object' || !parsed.summary || !parsed.best_choice_reason || !parsed.pros_and_cons || !parsed.safety_note) {
            return null;
        }

        return parsed;
    } catch (error) {
        console.warn('Groq fallback comparison unavailable:', error.message || error);
        return null;
    }
}

// Helper function to generate comparison table
function generateComparisonTable(products) {
    const categories = ['Price', 'Price Tier', 'Brand', 'Product Type', 'Size', 'Skin Types', 'Concerns', 'Ingredients', 'Effectiveness', 'Availability'];
    const table = {};
    
    categories.forEach(category => {
        table[category] = {};
        products.forEach(product => {
            switch(category) {
                case 'Price':
                    table[category][product.id] = `₹${Number(product.current_price).toLocaleString('en-IN')}`;
                    break;
                case 'Price Tier':
                    table[category][product.id] = product.price_tier;
                    break;
                case 'Brand':
                    table[category][product.id] = product.brand;
                    break;
                case 'Product Type':
                    table[category][product.id] = product.product_type || 'N/A';
                    break;
                case 'Size':
                    table[category][product.id] = product.size || 'N/A';
                    break;
                case 'Skin Types':
                    table[category][product.id] = product.skin_types?.join(', ') || 'All skin types';
                    break;
                case 'Concerns':
                    table[category][product.id] = product.concerns?.join(', ') || 'General';
                    break;
                case 'Ingredients':
                    table[category][product.id] = product.ingredients?.slice(0, 3).join(', ') || 'Not specified';
                    break;
                case 'Effectiveness':
                    // Calculate effectiveness score based on price tier and concerns
                    const effectivenessScore = calculateEffectivenessScore(product);
                    table[category][product.id] = `${effectivenessScore}/10 ⭐`;
                    break;
                case 'Availability':
                    table[category][product.id] = 'Amazon, Nykaa, Google Shopping';
                    break;
            }
        });
    });
    
    return table;
}

// Helper function to calculate effectiveness score
function calculateEffectivenessScore(product) {
    let score = 7; // Base score
    
    // Higher tier products tend to be more effective
    if (product.price_tier === 'luxury') score += 2;
    else if (product.price_tier === 'premium') score += 1;
    
    // More targeted concerns = higher effectiveness
    if (product.concerns && product.concerns.length > 0) {
        score += Math.min(product.concerns.length, 2);
    }
    
    // Cap at 10
    return Math.min(score, 10);
}

// Helper function to generate recommendations
function generateComparisonRecommendations(products, user_profile) {
    const recommendations = [];
    
    products.forEach(product => {
        let score = 0;
        let reasons = [];
        
        // Price score (lower is better)
        const minPrice = Math.min(...products.map(p => p.current_price));
        if (product.current_price === minPrice) {
            score += 2;
            reasons.push('Best value for money');
        }
        
        // Tier preference
        if (user_profile?.budget_tier === product.price_tier) {
            score += 3;
            reasons.push('Matches your budget preference');
        }
        
        // Skin type match
        if (user_profile?.skin_type && product.skin_types?.includes(user_profile.skin_type)) {
            score += 2;
            reasons.push('Suitable for your skin type');
        }
        
        // Concerns match
        if (user_profile?.skin_concerns && product.concerns) {
            const matchingConcerns = user_profile.skin_concerns.filter(concern => 
                product.concerns.includes(concern)
            );
            if (matchingConcerns.length > 0) {
                score += matchingConcerns.length;
                reasons.push(`Addresses ${matchingConcerns.length} of your concerns`);
            }
        }
        
        recommendations.push({
            product_id: product.id,
            product_name: product.product_name,
            score: score,
            reasons: reasons
        });
    });
    
    return recommendations.sort((a, b) => b.score - a.score);
}

// Helper function to find best product
function findBestProduct(products, user_profile) {
    const recommendations = generateComparisonRecommendations(products, user_profile);
    if (recommendations.length > 0) {
        const best = recommendations[0];
        const bestProduct = products.find(p => p.id === best.product_id);
        return {
            product: bestProduct,
            reasons: best.reasons,
            score: best.score
        };
    }
    return null;
}

module.exports = router;
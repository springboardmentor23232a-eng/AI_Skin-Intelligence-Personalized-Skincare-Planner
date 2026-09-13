-- ============================================================
-- AI Skin Intelligence — Products Database Migration
-- Adds comprehensive skincare products database
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================
DO $$ BEGIN
    CREATE TYPE price_tier AS ENUM ('budget', 'premium', 'luxury');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- TABLE: product_categories
-- ============================================================
CREATE TABLE IF NOT EXISTS product_categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon        VARCHAR(50),              -- emoji icon for UI
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id     UUID NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
    brand           VARCHAR(100) NOT NULL,
    product_name    VARCHAR(255) NOT NULL,
    description     TEXT,
    price_tier      price_tier NOT NULL,
    mrp_price       DECIMAL(10,2),         -- Maximum Retail Price
    current_price   DECIMAL(10,2),         -- Current selling price
    currency        VARCHAR(3) DEFAULT 'INR',
    ingredients     TEXT[],                -- Key ingredients
    skin_types      TEXT[],                -- Suitable skin types: {oily, dry, combination, normal, sensitive}
    concerns        TEXT[],                -- Targeted concerns: {acne, pigmentation, anti_aging, barrier_repair, brightening}
    product_type    VARCHAR(50),          -- cleanser, toner, serum, moisturizer, sunscreen, treatment, mask
    size            VARCHAR(50),           -- Product size (e.g., "50ml", "100g")
    amazon_link     TEXT,                  -- Amazon product link
    nykaa_link      TEXT,                  -- Nykaa product link
    google_shopping_link TEXT,            -- Google Shopping link
    other_links     JSONB,                 -- Other shopping links as JSON
    is_active       BOOLEAN DEFAULT TRUE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_tier ON products(price_tier);
CREATE INDEX IF NOT EXISTS idx_products_skin_types ON products USING GIN(skin_types);
CREATE INDEX IF NOT EXISTS idx_products_concerns ON products USING GIN(concerns);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

ALTER TABLE products ADD COLUMN IF NOT EXISTS amazon_link TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS nykaa_link TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS google_shopping_link TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS other_links JSONB;

TRUNCATE TABLE products;

-- ============================================================
-- SEED: Product Categories
-- ============================================================
INSERT INTO product_categories (name, description, icon, sort_order) VALUES
('Cleansing', 'Face cleansers and makeup removers', '🧼', 1),
('Exfoliation', 'Chemical exfoliants and toners', '✨', 2),
('Treatment', 'Targeted treatment serums', '🎯', 3),
('Moisturizing', 'Hydrating moisturizers and creams', '💧', 4),
('Sun Protection', 'Sunscreen and UV protection', '☀️', 5),
('Night Care', 'Night creams and overnight treatments', '🌙', 6),
('Retinoids', 'Retinol and retinoid products', '🔬', 7),
('Niacinamide', 'Niacinamide focused products', '💎', 8),
('Vitamin C', 'Vitamin C and antioxidant serums', '🍊', 9),
('Hyaluronic Acid', 'HA and hydration products', '💦', 10),
('Salicylic Acid', 'BHA and salicylic acid products', '🧪', 11),
('Ceramides', 'Ceramide and barrier repair products', '🧱', 12),
('Peptides', 'Peptide and anti-aging products', '🧬', 13),
('AHA BHA', 'Chemical exfoliants with AHAs and BHAs', '🧪', 14),
('Face Wash', 'Daily face washes and cleansers', '🧴', 15),
('Moisturizer', 'Daily moisturizers', '🧴', 16),
('Sunscreen', 'SPF and sun protection products', '🧴', 17),
('Serum', 'Treatment serums', '💧', 18),
('Toner', 'Face toners and essences', '💦', 19),
('Face Masks', 'Sheet masks and treatment masks', '😶‍🌫️', 20),
('Skin Intelligence', 'Personalized skincare services', '🧠', 21)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED: Products
-- ============================================================

-- Category: Cleansing
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'Cleansing'), 'Minimalist', '2% Salicylic + LHA Cleanser', 'budget', 299.00, 299.00, 'INR', 'cleanser', '100ml', 'https://www.amazon.in/s?k=minimalist+2%25+salicylic+lha+cleanser', 'https://www.nykaa.com/brands/minimalist', 'https://www.google.com/search?tbm=shop&q=minimalist+2%25+salicylic+lha+cleanser'),
((SELECT id FROM product_categories WHERE name = 'Cleansing'), 'CeraVe', 'Hydrating Cleanser', 'premium', 350.00, 323.00, 'INR', 'cleanser', '236ml', 'https://www.amazon.in/s?k=cerave+hydrating+cleanser', 'https://www.nykaa.com/brands/cerave', 'https://www.google.com/search?tbm=shop&q=cerave+hydrating+cleanser'),
((SELECT id FROM product_categories WHERE name = 'Cleansing'), 'La Mer', 'The Cleansing Foam', 'luxury', 12000.00, 10000.00, 'INR', 'cleanser', '50ml', 'https://www.amazon.in/s?k=la+mer+cleansing+foam', '', 'https://www.google.com/search?tbm=shop&q=la+mer+cleansing+foam');

-- Category: Exfoliation
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'Exfoliation'), 'Minimalist', '8% Glycolic Acid Toner', 'budget', 549.00, 499.00, 'INR', 'toner', '200ml', 'https://www.amazon.in/s?k=minimalist+8%25+glycolic+acid+toner', 'https://www.nykaa.com/brands/minimalist', 'https://www.google.com/search?tbm=shop&q=minimalist+8%25+glycolic+acid+toner'),
((SELECT id FROM product_categories WHERE name = 'Exfoliation'), 'Paula''s Choice', '2% BHA Liquid Exfoliant', 'premium', 2200.00, 2000.00, 'INR', 'treatment', '118ml', 'https://www.amazon.in/s?k=paula+choice+2%25+bha+liquid+exfoliant', 'https://www.nykaa.com/brands/paula-s-choice', 'https://www.google.com/search?tbm=shop&q=paula+choice+2%25+bha+liquid+exfoliant'),
((SELECT id FROM product_categories WHERE name = 'Exfoliation'), 'Sisley', 'Phyto-Gommage', 'luxury', 12000.00, 10000.00, 'INR', 'exfoliant', '50g', 'https://www.amazon.in/s?k=sisley+phyto+gommage', '', 'https://www.google.com/search?tbm=shop&q=sisley+phyto+gommage');

-- Category: Treatment
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'Treatment'), 'The Derma Co', '2% Salicylic Acid Serum', 'budget', 549.00, 499.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=the+derma+co+2%25+salicylic+acid+serum', 'https://www.nykaa.com/brands/the-derma-co', 'https://www.google.com/search?tbm=shop&q=the+derma+co+2%25+salicylic+acid+serum'),
((SELECT id FROM product_categories WHERE name = 'Treatment'), 'Eucerin', 'Anti-Pigment Dual Serum', 'premium', 3999.00, 3591.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=eucerin+anti+pigment+dual+serum', 'https://www.nykaa.com/brands/eucerin', 'https://www.google.com/search?tbm=shop&q=eucerin+anti+pigment+dual+serum'),
((SELECT id FROM product_categories WHERE name = 'Treatment'), 'SkinCeuticals', 'Discoloration Defense', 'luxury', 9000.00, 8000.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=skinceuticals+discoloration+defense', 'https://www.nykaa.com/brands/skinceuticals', 'https://www.google.com/search?tbm=shop&q=skinceuticals+discoloration+defense');

-- Category: Moisturizing
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'Moisturizing'), 'Minimalist', 'Vitamin B5 10% Moisturizer', 'budget', 399.00, 349.00, 'INR', 'moisturizer', '50g', 'https://www.amazon.in/s?k=minimalist+vitamin+b5+10%25+moisturizer', 'https://www.nykaa.com/brands/minimalist', 'https://www.google.com/search?tbm=shop&q=minimalist+vitamin+b5+10%25+moisturizer'),
((SELECT id FROM product_categories WHERE name = 'Moisturizing'), 'CeraVe', 'Moisturizing Cream', 'premium', 469.00, 422.00, 'INR', 'moisturizer', '453g', 'https://www.amazon.in/s?k=cerave+moisturizing+cream', 'https://www.nykaa.com/brands/cerave', 'https://www.google.com/search?tbm=shop&q=cerave+moisturizing+cream'),
((SELECT id FROM product_categories WHERE name = 'Moisturizing'), 'La Mer', 'Crème de la Mer', 'luxury', 35000.00, 30000.00, 'INR', 'moisturizer', '30ml', 'https://www.amazon.in/s?k=la+mer+creme+de+la+mer', '', 'https://www.google.com/search?tbm=shop&q=la+mer+creme+de+la+mer');

-- Category: Sun Protection
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'Sun Protection'), 'Minimalist', 'SPF 50 PA++++ Multi-Vitamin Sunscreen', 'budget', 449.00, 399.00, 'INR', 'sunscreen', '50g', 'https://www.amazon.in/s?k=minimalist+spf+50+pa+++++sunscreen', 'https://www.nykaa.com/brands/minimalist', 'https://www.google.com/search?tbm=shop&q=minimalist+spf+50+pa+++++sunscreen'),
((SELECT id FROM product_categories WHERE name = 'Sun Protection'), 'Beauty of Joseon', 'Relief Sun SPF50+', 'premium', 1400.00, 1200.00, 'INR', 'sunscreen', '50ml', 'https://www.amazon.in/s?k=beauty+of+joseon+relief+sun+spf50', 'https://www.nykaa.com/brands/beauty-of-joseon', 'https://www.google.com/search?tbm=shop&q=beauty+of+joseon+relief+sun+spf50'),
((SELECT id FROM product_categories WHERE name = 'Sun Protection'), 'La Mer', 'The Broad Spectrum SPF 50 UV Protecting Fluid', 'luxury', 12000.00, 10000.00, 'INR', 'sunscreen', '50ml', 'https://www.amazon.in/s?k=la+mer+spf+50+uv+protecting+fluid', '', 'https://www.google.com/search?tbm=shop&q=la+mer+spf+50+uv+protecting+fluid');

-- Category: Night Care
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'Night Care'), 'Plum', 'Green Tea Renewed Clarity Night Gel', 'budget', 599.00, 500.00, 'INR', 'moisturizer', '50g', 'https://www.amazon.in/s?k=plum+green+tea+night+gel', 'https://www.nykaa.com/brands/plum', 'https://www.google.com/search?tbm=shop&q=plum+green+tea+night+gel'),
((SELECT id FROM product_categories WHERE name = 'Night Care'), 'CeraVe', 'PM Facial Moisturizing Lotion', 'premium', 1400.00, 1170.00, 'INR', 'moisturizer', '89ml', 'https://www.amazon.in/s?k=cerave+pm+facial+moisturizing+lotion', 'https://www.nykaa.com/brands/cerave', 'https://www.google.com/search?tbm=shop&q=cerave+pm+facial+moisturizing+lotion'),
((SELECT id FROM product_categories WHERE name = 'Night Care'), 'La Mer', 'The Night Recovery Concentrate', 'luxury', 40000.00, 35000.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=la+mer+night+recovery+concentrate', '', 'https://www.google.com/search?tbm=shop&q=la+mer+night+recovery+concentrate');

-- Category: Retinoids
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'Retinoids'), 'Minimalist', 'Retinol 0.3% Face Serum', 'budget', 549.00, 499.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=minimalist+retinol+0.3%25+face+serum', 'https://www.nykaa.com/brands/minimalist', 'https://www.google.com/search?tbm=shop&q=minimalist+retinol+0.3%25+face+serum'),
((SELECT id FROM product_categories WHERE name = 'Retinoids'), 'CeraVe', 'Resurfacing Retinol Serum', 'premium', 1500.00, 1335.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=cerave+resurfacing+retinol+serum', 'https://www.nykaa.com/brands/cerave', 'https://www.google.com/search?tbm=shop&q=cerave+resurfacing+retinol+serum'),
((SELECT id FROM product_categories WHERE name = 'Retinoids'), 'SkinCeuticals', 'Retinol 1.0', 'luxury', 8000.00, 7000.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=skinceuticals+retinol+1.0', 'https://www.nykaa.com/brands/skinceuticals', 'https://www.google.com/search?tbm=shop&q=skinceuticals+retinol+1.0');

-- Category: Niacinamide
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'Niacinamide'), 'Minimalist', '10% Niacinamide Serum', 'budget', 649.00, 599.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=minimalist+10%25+niacinamide+serum', 'https://www.nykaa.com/brands/minimalist', 'https://www.google.com/search?tbm=shop&q=minimalist+10%25+niacinamide+serum'),
((SELECT id FROM product_categories WHERE name = 'Niacinamide'), 'The Ordinary', 'Niacinamide 10% + Zinc 1%', 'premium', 650.00, 600.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=the+ordinary+niacinamide+10%25+zinc+1%25', 'https://www.nykaa.com/brands/the-ordinary', 'https://www.google.com/search?tbm=shop&q=the+ordinary+niacinamide+10%25+zinc+1%25'),
((SELECT id FROM product_categories WHERE name = 'Niacinamide'), 'SkinCeuticals', 'Metacell Renewal B3', 'luxury', 12000.00, 10000.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=skinceuticals+metacell+renewal+b3', 'https://www.nykaa.com/brands/skinceuticals', 'https://www.google.com/search?tbm=shop&q=skinceuticals+metacell+renewal+b3');

-- Category: Vitamin C
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'Vitamin C'), 'Minimalist', '10% Vitamin C Serum', 'budget', 749.00, 699.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=minimalist+10%25+vitamin+c+serum', 'https://www.nykaa.com/brands/minimalist', 'https://www.google.com/search?tbm=shop&q=minimalist+10%25+vitamin+c+serum'),
((SELECT id FROM product_categories WHERE name = 'Vitamin C'), 'La Roche-Posay', 'Pure Vitamin C10 Serum', 'premium', 3500.00, 3000.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=la+roche+posay+vitamin+c10+serum', 'https://www.nykaa.com/brands/la-roche-posay', 'https://www.google.com/search?tbm=shop&q=la+roche+posay+vitamin+c10+serum'),
((SELECT id FROM product_categories WHERE name = 'Vitamin C'), 'SkinCeuticals', 'C E Ferulic', 'luxury', 18000.00, 15000.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=skinceuticals+c+e+ferulic', 'https://www.nykaa.com/brands/skinceuticals', 'https://www.google.com/search?tbm=shop&q=skinceuticals+c+e+ferulic');

-- Category: Hyaluronic Acid
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'Hyaluronic Acid'), 'Minimalist', 'Hyaluronic Acid 2% Serum', 'budget', 449.00, 399.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=minimalist+hyaluronic+acid+2%25+serum', 'https://www.nykaa.com/brands/minimalist', 'https://www.google.com/search?tbm=shop&q=minimalist+hyaluronic+acid+2%25+serum'),
((SELECT id FROM product_categories WHERE name = 'Hyaluronic Acid'), 'The Ordinary', 'Hyaluronic Acid 2% + B5', 'premium', 1200.00, 1000.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=the+ordinary+hyaluronic+acid+2%25+b5', 'https://www.nykaa.com/brands/the-ordinary', 'https://www.google.com/search?tbm=shop&q=the+ordinary+hyaluronic+acid+2%25+b5'),
((SELECT id FROM product_categories WHERE name = 'Hyaluronic Acid'), 'SkinCeuticals', 'HA Intensifier', 'luxury', 12000.00, 10000.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=skinceuticals+ha+intensifier', 'https://www.nykaa.com/brands/skinceuticals', 'https://www.google.com/search?tbm=shop&q=skinceuticals+ha+intensifier');

-- Category: Salicylic Acid
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'Salicylic Acid'), 'Minimalist', '2% Salicylic Acid Serum', 'budget', 549.00, 499.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=minimalist+2%25+salicylic+acid+serum', 'https://www.nykaa.com/brands/minimalist', 'https://www.google.com/search?tbm=shop&q=minimalist+2%25+salicylic+acid+serum'),
((SELECT id FROM product_categories WHERE name = 'Salicylic Acid'), 'CeraVe', 'Blemish Control Cleanser 2% SA', 'premium', 1250.00, 1125.00, 'INR', 'cleanser', '236ml', 'https://www.amazon.in/s?k=cerave+blemish+control+cleanser+2%25+sa', 'https://www.nykaa.com/brands/cerave', 'https://www.google.com/search?tbm=shop&q=cerave+blemish+control+cleanser+2%25+sa'),
((SELECT id FROM product_categories WHERE name = 'Salicylic Acid'), 'SkinCeuticals', 'Blemish + Age Defense', 'luxury', 9000.00, 8000.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=skinceuticals+blemish+age+defense', 'https://www.nykaa.com/brands/skinceuticals', 'https://www.google.com/search?tbm=shop&q=skinceuticals+blemish+age+defense');

-- Category: Ceramides
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'Ceramides'), 'Dot & Key', 'Ceramide + Hyaluronic Barrier Repair Cream', 'budget', 499.00, 449.00, 'INR', 'moisturizer', '50g', 'https://www.amazon.in/s?k=dot+key+ceramide+hyaluronic+barrier+repair', 'https://www.nykaa.com/brands/dot-key', 'https://www.google.com/search?tbm=shop&q=dot+key+ceramide+hyaluronic+barrier+repair'),
((SELECT id FROM product_categories WHERE name = 'Ceramides'), 'CeraVe', 'Moisturizing Cream', 'premium', 469.00, 422.00, 'INR', 'moisturizer', '453g', 'https://www.amazon.in/s?k=cerave+moisturizing+cream', 'https://www.nykaa.com/brands/cerave', 'https://www.google.com/search?tbm=shop&q=cerave+moisturizing+cream'),
((SELECT id FROM product_categories WHERE name = 'Ceramides'), 'La Mer', 'Crème de la Mer', 'luxury', 35000.00, 30000.00, 'INR', 'moisturizer', '30ml', 'https://www.amazon.in/s?k=la+mer+creme+de+la+mer', '', 'https://www.google.com/search?tbm=shop&q=la+mer+creme+de+la+mer');

-- Category: Peptides
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'Peptides'), 'Minimalist', 'Multi-Peptide Serum', 'budget', 749.00, 699.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=minimalist+multi+peptide+serum', 'https://www.nykaa.com/brands/minimalist', 'https://www.google.com/search?tbm=shop&q=minimalist+multi+peptide+serum'),
((SELECT id FROM product_categories WHERE name = 'Peptides'), 'The Ordinary', 'Multi-Peptide + HA Serum', 'premium', 1900.00, 1700.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=the+ordinary+multi+peptide+ha+serum', 'https://www.nykaa.com/brands/the-ordinary', 'https://www.google.com/search?tbm=shop&q=the+ordinary+multi+peptide+ha+serum'),
((SELECT id FROM product_categories WHERE name = 'Peptides'), 'SkinCeuticals', 'P-Tiox Anti-Wrinkle Serum', 'luxury', 12000.00, 10000.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=skinceuticals+p+tiox+anti+wrinkle+serum', 'https://www.nykaa.com/brands/skinceuticals', 'https://www.google.com/search?tbm=shop&q=skinceuticals+p+tiox+anti+wrinkle+serum');

-- Category: AHA BHA
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'AHA BHA'), 'Minimalist', 'AHA 25% + PHA 5% + BHA 2% Peel', 'budget', 749.00, 699.00, 'INR', 'treatment', '30ml', 'https://www.amazon.in/s?k=minimalist+aha+25%25+pha+5%25+bha+2%25+peel', 'https://www.nykaa.com/brands/minimalist', 'https://www.google.com/search?tbm=shop&q=minimalist+aha+25%25+pha+5%25+bha+2%25+peel'),
((SELECT id FROM product_categories WHERE name = 'AHA BHA'), 'Paula''s Choice', 'Skin Perfecting 2% BHA Liquid', 'premium', 2200.00, 2000.00, 'INR', 'treatment', '118ml', 'https://www.amazon.in/s?k=paula+choice+skin+perfecting+2%25+bha+liquid', 'https://www.nykaa.com/brands/paula-s-choice', 'https://www.google.com/search?tbm=shop&q=paula+choice+skin+perfecting+2%25+bha+liquid'),
((SELECT id FROM product_categories WHERE name = 'AHA BHA'), 'Dr. Dennis Gross', 'Alpha Beta Universal Daily Peel', 'luxury', 14000.00, 12000.00, 'INR', 'treatment', '30 pads', 'https://www.amazon.in/s?k=dr+dennis+gross+alpha+beta+universal+daily+peel', '', 'https://www.google.com/search?tbm=shop&q=dr+dennis+gross+alpha+beta+universal+daily+peel');

-- Category: Face Wash
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'Face Wash'), 'Cetaphil', 'Gentle Skin Cleanser', 'budget', 459.00, 409.00, 'INR', 'cleanser', '125ml', 'https://www.amazon.in/s?k=cetaphil+gentle+skin+cleanser', 'https://www.nykaa.com/brands/cetaphil', 'https://www.google.com/search?tbm=shop&q=cetaphil+gentle+skin+cleanser'),
((SELECT id FROM product_categories WHERE name = 'Face Wash'), 'CeraVe', 'Foaming Cleanser', 'premium', 553.00, 503.00, 'INR', 'cleanser', '236ml', 'https://www.amazon.in/s?k=cerave+foaming+cleanser', 'https://www.nykaa.com/brands/cerave', 'https://www.google.com/search?tbm=shop&q=cerave+foaming+cleanser'),
((SELECT id FROM product_categories WHERE name = 'Face Wash'), 'La Mer', 'The Cleansing Foam', 'luxury', 12000.00, 10000.00, 'INR', 'cleanser', '50ml', 'https://www.amazon.in/s?k=la+mer+cleansing+foam', '', 'https://www.google.com/search?tbm=shop&q=la+mer+cleansing+foam');

-- Category: Moisturizer
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'Moisturizer'), 'Minimalist', 'Vitamin B5 10% Moisturizer', 'budget', 399.00, 349.00, 'INR', 'moisturizer', '50g', 'https://www.amazon.in/s?k=minimalist+vitamin+b5+10%25+moisturizer', 'https://www.nykaa.com/brands/minimalist', 'https://www.google.com/search?tbm=shop&q=minimalist+vitamin+b5+10%25+moisturizer'),
((SELECT id FROM product_categories WHERE name = 'Moisturizer'), 'CeraVe', 'HA Water Gel', 'premium', 999.00, 899.00, 'INR', 'moisturizer', '50g', 'https://www.amazon.in/s?k=cerave+ha+water+gel', 'https://www.nykaa.com/brands/cerave', 'https://www.google.com/search?tbm=shop&q=cerave+ha+water+gel'),
((SELECT id FROM product_categories WHERE name = 'Moisturizer'), 'La Mer', 'Crème de la Mer', 'luxury', 35000.00, 30000.00, 'INR', 'moisturizer', '30ml', 'https://www.amazon.in/s?k=la+mer+creme+de+la+mer', '', 'https://www.google.com/search?tbm=shop&q=la+mer+creme+de+la+mer');

-- Category: Sunscreen
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'Sunscreen'), 'Minimalist', 'SPF 50 PA++++ Multi-Vitamin', 'budget', 449.00, 399.00, 'INR', 'sunscreen', '50g', 'https://www.amazon.in/s?k=minimalist+spf+50+pa+++++multi+vitamin', 'https://www.nykaa.com/brands/minimalist', 'https://www.google.com/search?tbm=shop&q=minimalist+spf+50+pa+++++multi+vitamin'),
((SELECT id FROM product_categories WHERE name = 'Sunscreen'), 'Beauty of Joseon', 'Relief Sun SPF50+', 'premium', 1400.00, 1200.00, 'INR', 'sunscreen', '50ml', 'https://www.amazon.in/s?k=beauty+of+joseon+relief+sun+spf50', 'https://www.nykaa.com/brands/beauty-of-joseon', 'https://www.google.com/search?tbm=shop&q=beauty+of+joseon+relief+sun+spf50'),
((SELECT id FROM product_categories WHERE name = 'Sunscreen'), 'RAS Luxury Oils', 'Solaris Daily Defence Mineral SPF 50', 'luxury', 1200.00, 1051.00, 'INR', 'sunscreen', '50g', 'https://www.amazon.in/s?k=ras+luxury+oils+solaris+daily+defence+mineral+spf+50', 'https://www.nykaa.com/brands/ras-luxury-oils', 'https://www.google.com/search?tbm=shop&q=ras+luxury+oils+solaris+daily+defence+mineral+spf+50');

-- Category: Serum
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'Serum'), 'Minimalist', '10% Niacinamide Serum', 'budget', 649.00, 599.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=minimalist+10%25+niacinamide+serum', 'https://www.nykaa.com/brands/minimalist', 'https://www.google.com/search?tbm=shop&q=minimalist+10%25+niacinamide+serum'),
((SELECT id FROM product_categories WHERE name = 'Serum'), 'SKIN1004', 'Madagascar Centella Ampoule', 'premium', 899.00, 799.00, 'INR', 'serum', '55ml', 'https://www.amazon.in/s?k=skin1004+madagascar+centella+ampoule', 'https://www.nykaa.com/brands/skin1004', 'https://www.google.com/search?tbm=shop&q=skin1004+madagascar+centella+ampoule'),
((SELECT id FROM product_categories WHERE name = 'Serum'), 'Estée Lauder', 'Advanced Night Repair Serum', 'luxury', 12000.00, 10000.00, 'INR', 'serum', '30ml', 'https://www.amazon.in/s?k=estee+lauder+advanced+night+repair+serum', 'https://www.nykaa.com/brands/estee-lauder', 'https://www.google.com/search?tbm=shop&q=estee+lauder+advanced+night+repair+serum');

-- Category: Toner
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'Toner'), 'Minimalist', 'Glycolic Acid 8% Toner', 'budget', 549.00, 499.00, 'INR', 'toner', '200ml', 'https://www.amazon.in/s?k=minimalist+glycolic+acid+8%25+toner', 'https://www.nykaa.com/brands/minimalist', 'https://www.google.com/search?tbm=shop&q=minimalist+glycolic+acid+8%25+toner'),
((SELECT id FROM product_categories WHERE name = 'Toner'), 'SKIN1004', 'Madagascar Centella Toning Toner', 'premium', 712.00, 612.00, 'INR', 'toner', '200ml', 'https://www.amazon.in/s?k=skin1004+madagascar+centella+toning+toner', 'https://www.nykaa.com/brands/skin1004', 'https://www.google.com/search?tbm=shop&q=skin1004+madagascar+centella+toning+toner'),
((SELECT id FROM product_categories WHERE name = 'Toner'), 'SK-II', 'Facial Treatment Essence', 'luxury', 18000.00, 15000.00, 'INR', 'toner', '230ml', 'https://www.amazon.in/s?k=sk-ii+facial+treatment+essence', 'https://www.nykaa.com/brands/sk-ii', 'https://www.google.com/search?tbm=shop&q=sk-ii+facial+treatment+essence');

-- Category: Face Masks
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'Face Masks'), 'Dot & Key', 'Cica Calming Skin Renewing Night Gel Mask', 'budget', 545.00, 495.00, 'INR', 'mask', '100g', 'https://www.amazon.in/s?k=dot+key+cica+calming+skin+renewing+night+gel+mask', 'https://www.nykaa.com/brands/dot-key', 'https://www.google.com/search?tbm=shop&q=dot+key+cica+calming+skin+renewing+night+gel+mask'),
((SELECT id FROM product_categories WHERE name = 'Face Masks'), 'ClayCo', 'Rice & Ceramide Collagen Sheet Mask', 'premium', 548.00, 498.00, 'INR', 'mask', '1 sheet', 'https://www.amazon.in/s?k=clayco+rice+ceramide+collagen+sheet+mask', 'https://www.nykaa.com/brands/clayco', 'https://www.google.com/search?tbm=shop&q=clayco+rice+ceramide+collagen+sheet+mask'),
((SELECT id FROM product_categories WHERE name = 'Face Masks'), 'La Mer', 'The Treatment Lotion Mask', 'luxury', 12000.00, 10000.00, 'INR', 'mask', '1 sheet', 'https://www.amazon.in/s?k=la+mer+treatment+lotion+mask', '', 'https://www.google.com/search?tbm=shop&q=la+mer+treatment+lotion+mask');

-- Category: Skin Intelligence
INSERT INTO products (category_id, brand, product_name, price_tier, mrp_price, current_price, currency, product_type, size, amazon_link, nykaa_link, google_shopping_link) VALUES
((SELECT id FROM product_categories WHERE name = 'Skin Intelligence'), 'Minimalist', 'Personalized Skincare / Routine', 'budget', 2000.00, 500.00, 'INR', 'service', 'Custom', '', '', ''),
((SELECT id FROM product_categories WHERE name = 'Skin Intelligence'), 'Curology', 'Personalized Dermatology', 'premium', 3000.00, 2000.00, 'INR', 'service', 'Custom', '', '', ''),
((SELECT id FROM product_categories WHERE name = 'Skin Intelligence'), 'SkinCeuticals', 'Custom/Professional Skin Consultation', 'luxury', 6000.00, 5000.00, 'INR', 'service', 'Custom', '', '', '');

-- ============================================================
-- TRIGGER: auto-update updated_at on products
-- ============================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        DROP TRIGGER IF EXISTS set_products_updated_at ON products;
        CREATE TRIGGER set_products_updated_at
            BEFORE UPDATE ON products
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================================
-- VERIFY: show created tables
-- ============================================================
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('product_categories', 'products')
ORDER BY table_name;

-- ============================================================
-- VERIFY: show product counts by category
-- ============================================================
SELECT 
    pc.name as category,
    COUNT(p.id) as product_count
FROM product_categories pc
LEFT JOIN products p ON pc.id = p.category_id
GROUP BY pc.name, pc.sort_order
ORDER BY pc.sort_order;
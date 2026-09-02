/*
# Module 6 — Product Catalog Enhancement

1. Modified Tables
- `products` — added columns to support the Module 6 Product Recommendation Engine:
  - `image_url` (text): Product image URL for card display
  - `rating` (numeric): Product rating 0-5 (NULL = unknown, not fabricated)
  - `amazon_url` (text): Direct Amazon purchase link
  - `nykaa_url` (text): Direct Nykaa purchase link
  - `tags` (text[]): Product tags (e.g., "bestseller", "budget_pick", "highly_rated")
  - `price_numeric` (integer): Numeric price for budget filtering (in INR)
  - `benefits` (text[]): Key benefits of the product
  - `allergens` (text[]): Known allergens/irritants in the product
  - `how_to_use` (text): Usage instructions
2. Security
- No RLS policy changes — existing read policies remain.
3. Notes
- All new columns are nullable so existing rows are unaffected.
- Price values are in INR (Indian Rupees).
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating numeric(3,1);
ALTER TABLE products ADD COLUMN IF NOT EXISTS amazon_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS nykaa_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_numeric integer;
ALTER TABLE products ADD COLUMN IF NOT EXISTS benefits text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS allergens text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS how_to_use text;

-- Seed product catalog with real skincare products (INR pricing)
-- Only insert if table is empty to avoid duplicates
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM products) = 0 THEN
    INSERT INTO products (name, brand, category, key_ingredients, description, suitable_skin_types, suitable_concerns, price_range, price_numeric, popularity, image_url, rating, tags, benefits, allergens, how_to_use, amazon_url, nykaa_url) VALUES
      -- Face Wash
      ('CeraVe Hydrating Facial Cleanser', 'CeraVe', 'Face Wash', ARRAY['Ceramides','Hyaluronic Acid','Glycerin'], 'Gentle non-foaming cleanser for dry and sensitive skin.', ARRAY['Dry','Sensitive','Normal'], ARRAY['Dryness','Sensitivity'], '₹800-1,200', 1000, 95, 'https://images.unsplash.com/photo-1608248543803-ba4f208c93cb?w=400&q=80', 4.5, ARRAY['bestseller','highly_rated'], ARRAY['Gentle cleansing','Barrier support','Non-stripping'], ARRAY[], 'Massage onto damp skin in circular motions. Rinse with lukewarm water.', 'https://www.amazon.in/s?k=CeraVe+Hydrating+Cleanser', 'https://www.nykaa.com/search?q=CeraVe+Hydrating+Cleanser'),
      ('La Roche-Posay Effaclar Purifying Foaming Gel', 'La Roche-Posay', 'Face Wash', ARRAY['Zinc PCA','Salicylic Acid'], 'Foaming cleanser for oily and acne-prone skin.', ARRAY['Oily','Combination'], ARRAY['Acne','Oiliness'], '₹1,200-1,600', 1400, 88, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80', 4.3, ARRAY['bestseller'], ARRAY['Oil control','Deep clean','Non-comedogenic'], ARRAY['Salicylic Acid'], 'Massage onto damp skin morning and evening. Rinse thoroughly.', 'https://www.amazon.in/s?k=La+Roche+Posay+Effaclar', 'https://www.nykaa.com/search?q=La+Roche+Posay+Effaclar'),
      ('Cetaphil Gentle Skin Cleanser', 'Cetaphil', 'Face Wash', ARRAY['Glycerin','Cetyl Alcohol'], 'Soap-free gentle cleanser for all skin types.', ARRAY['All'], ARRAY['Sensitivity','Dryness'], '₹500-700', 600, 91, 'https://images.unsplash.com/photo-1608248543803-ba4f208c93cb?w=400&q=80', 4.4, ARRAY['budget_pick','highly_rated'], ARRAY['Gentle','Non-irritating','Soap-free'], ARRAY[], 'Apply to skin and gently massage. Rinse or wipe off.', 'https://www.amazon.in/s?k=Cetaphil+Gentle+Cleanser', 'https://www.nykaa.com/search?q=Cetaphil+Gentle+Cleanser'),
      -- Moisturizer
      ('CeraVe Moisturizing Cream', 'CeraVe', 'Moisturizer', ARRAY['Ceramides','Hyaluronic Acid'], 'Barrier-restoring moisturizer with ceramides.', ARRAY['Dry','Sensitive','Normal'], ARRAY['Dryness','Barrier damage'], '₹1,200-1,800', 1500, 93, 'https://images.unsplash.com/photo-1608248543803-ba4f208c93cb?w=400&q=80', 4.5, ARRAY['bestseller','highly_rated'], ARRAY['Barrier repair','Deep hydration','Long-lasting'], ARRAY[], 'Apply evenly to face and neck after serums. Use morning and evening.', 'https://www.amazon.in/s?k=CeraVe+Moisturizing+Cream', 'https://www.nykaa.com/search?q=CeraVe+Moisturizing+Cream'),
      ('Neutrogena Hydro Boost Water Gel', 'Neutrogena', 'Moisturizer', ARRAY['Hyaluronic Acid'], 'Lightweight water gel moisturizer for oily and combination skin.', ARRAY['Oily','Combination','Normal'], ARRAY['Dryness','Dehydration'], '₹700-900', 800, 89, 'https://images.unsplash.com/photo-1556228852-80b2e1c3b814?w=400&q=80', 4.2, ARRAY['budget_pick'], ARRAY['Lightweight hydration','Non-greasy','Fast-absorbing'], ARRAY[], 'Apply to clean skin morning and evening.', 'https://www.amazon.in/s?k=Neutrogena+Hydro+Boost', 'https://www.nykaa.com/search?q=Neutrogena+Hydro+Boost'),
      ('Minimalist 10% Vitamin B5 Gel Moisturizer', 'Minimalist', 'Moisturizer', ARRAY['Vitamin B5','Glycerin'], 'Lightweight gel moisturizer with panthenol.', ARRAY['Oily','Combination','Sensitive'], ARRAY['Dryness','Sensitivity'], '₹299-399', 350, 85, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80', 4.1, ARRAY['budget_pick'], ARRAY['Lightweight','Soothing','Non-comedogenic'], ARRAY[], 'Apply a small amount to face and neck. Use twice daily.', 'https://www.amazon.in/s?k=Minimalist+Vitamin+B5+Moisturizer', 'https://www.nykaa.com/search?q=Minimalist+Vitamin+B5'),
      -- Sunscreen
      ('EltaMD UV Clear Broad-Spectrum SPF 46', 'EltaMD', 'Sunscreen', ARRAY['Niacinamide','Zinc Oxide'], 'Lightweight non-comedogenic sunscreen for acne-prone skin.', ARRAY['All'], ARRAY['Sun damage','Acne'], '₹2,200-3,000', 2600, 87, 'https://images.unsplash.com/photo-1556228852-80b2e1c3b814?w=400&q=80', 4.4, ARRAY['highly_rated'], ARRAY['Broad-spectrum','Non-comedogenic','Lightweight'], ARRAY[], 'Apply generously as the last step of morning routine. Reapply every 2 hours outdoors.', 'https://www.amazon.in/s?k=EltaMD+UV+Clear', 'https://www.nykaa.com/search?q=EltaMD+UV+Clear'),
      ('Minimalist SPF 50 Sunscreen', 'Minimalist', 'Sunscreen', ARRAY['UV Filters'], 'Lightweight matte finish sunscreen with SPF 50.', ARRAY['Oily','Combination','Normal'], ARRAY['Sun damage'], '₹299-499', 400, 86, 'https://images.unsplash.com/photo-1556228852-80b2e1c3b814?w=400&q=80', 4.0, ARRAY['budget_pick'], ARRAY['SPF 50','Matte finish','Non-greasy'], ARRAY[], 'Apply generously 15 minutes before sun exposure. Reapply every 2 hours.', 'https://www.amazon.in/s?k=Minimalist+SPF+50', 'https://www.nykaa.com/search?q=Minimalist+SPF+50'),
      ('La Roche-Posay Anthelios SPF 50+', 'La Roche-Posay', 'Sunscreen', ARRAY['UV Filters','Antioxidants'], 'High protection sunscreen for sensitive skin.', ARRAY['Sensitive','All'], ARRAY['Sun damage','Sensitivity'], '₹1,800-2,200', 2000, 84, 'https://images.unsplash.com/photo-1556228852-80b2e1c3b814?w=400&q=80', 4.3, ARRAY['highly_rated'], ARRAY['High SPF','Sensitive-safe','Non-greasy'], ARRAY[], 'Apply generously to face and neck before sun exposure.', 'https://www.amazon.in/s?k=La+Roche+Posay+Anthelios', 'https://www.nykaa.com/search?q=La+Roche+Posay+Anthelios'),
      -- Serum
      ('The Ordinary Niacinamide 10% + Zinc 1%', 'The Ordinary', 'Serum', ARRAY['Niacinamide','Zinc'], 'Regulates oil and minimizes pores.', ARRAY['Oily','Combination'], ARRAY['Oiliness','Pores','Redness'], '₹550-750', 650, 90, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80', 4.2, ARRAY['bestseller','budget_pick'], ARRAY['Oil control','Pore minimization','Redness reduction'], ARRAY[], 'Apply a thin layer morning and/or evening before heavier creams.', 'https://www.amazon.in/s?k=Ordinary+Niacinamide', 'https://www.nykaa.com/search?q=Ordinary+Niacinamide'),
      ('Mad Hippie Vitamin C Serum', 'Mad Hippie', 'Serum', ARRAY['Vitamin C','Ferulic Acid'], 'Antioxidant serum for brightening and protection.', ARRAY['Normal','Mature','Combination'], ARRAY['Dullness','Hyperpigmentation'], '₹2,000-2,800', 2400, 85, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80', 4.3, ARRAY['highly_rated'], ARRAY['Brightening','Antioxidant','Fades spots'], ARRAY['Vitamin C'], 'Apply 3-4 drops to clean dry skin in the morning before moisturizer.', 'https://www.amazon.in/s?k=Mad+Hippie+Vitamin+C', 'https://www.nykaa.com/search?q=Mad+Hippie+Vitamin+C'),
      ('The Ordinary Hyaluronic Acid 2% + B5', 'The Ordinary', 'Serum', ARRAY['Hyaluronic Acid','Vitamin B5'], 'Multi-depth hydration serum.', ARRAY['All'], ARRAY['Dryness','Dehydration','Fine Lines'], '₹550-750', 650, 92, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80', 4.3, ARRAY['bestseller','budget_pick'], ARRAY['Deep hydration','Plumping','Non-irritating'], ARRAY[], 'Apply to damp skin before moisturizer, morning and/or evening.', 'https://www.amazon.in/s?k=Ordinary+Hyaluronic+Acid', 'https://www.nykaa.com/search?q=Ordinary+Hyaluronic+Acid'),
      -- Treatment
      ('Paula''s Choice 2% BHA Liquid Exfoliant', 'Paula''s Choice', 'Treatment', ARRAY['Salicylic Acid'], 'Gentle BHA exfoliant for pore clearing.', ARRAY['Oily','Combination','Normal'], ARRAY['Acne','Blackheads','Pores'], '₹1,800-2,500', 2100, 87, 'https://images.unsplash.com/photo-1556228578-8c89e6adf853?w=400&q=80', 4.4, ARRAY['bestseller','highly_rated'], ARRAY['Exfoliates pores','Clears acne','Smooths skin'], ARRAY['Salicylic Acid'], 'Apply with cotton pad after cleansing. Start 2x per week and increase gradually.', 'https://www.amazon.in/s?k=Paula+Choice+BHA', 'https://www.nykaa.com/search?q=Paula+Choice+BHA'),
      ('Minimalist 0.3% Retinol Serum', 'Minimalist', 'Treatment', ARRAY['Retinoids'], 'Anti-aging retinol treatment.', ARRAY['Normal','Mature'], ARRAY['Aging','Fine Lines'], '₹599-799', 700, 83, 'https://images.unsplash.com/photo-1591251770167-8c8f8b8d5b8e?w=400&q=80', 4.1, ARRAY['budget_pick'], ARRAY['Anti-aging','Smooths texture'], ARRAY['Retinoids'], 'Apply pea-sized amount 2-3 nights per week. Always follow with moisturizer.', 'https://www.amazon.in/s?k=Minimalist+Retinol', 'https://www.nykaa.com/search?q=Minimalist+Retinol'),
      -- Toner
      ('Paula''s Choice Enriched Calming Toner', 'Paula''s Choice', 'Toner', ARRAY['Ceramides','Glycerin'], 'Hydrating toner for dry and sensitive skin.', ARRAY['Dry','Sensitive'], ARRAY['Dryness','Sensitivity'], '₹1,500-2,000', 1750, 80, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80', 4.2, ARRAY[], ARRAY['Hydrating','Soothing','Alcohol-free'], ARRAY[], 'Apply after cleansing with a cotton pad or hands. Follow with serum.', 'https://www.amazon.in/s?k=Paula+Choice+Calming+Toner', 'https://www.nykaa.com/search?q=Paula+Choice+Toner'),
      ('Plum Green Tea Alcohol-Free Toner', 'Plum', 'Toner', ARRAY['Green Tea','Glycerin'], 'Alcohol-free toner for oily and combination skin.', ARRAY['Oily','Combination'], ARRAY['Oiliness','Acne'], '₹290-390', 340, 82, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80', 4.0, ARRAY['budget_pick'], ARRAY['Oil control','Refreshing','Alcohol-free'], ARRAY[], 'Apply after cleansing with a cotton pad. Use twice daily.', 'https://www.amazon.in/s?k=Plum+Green+Tea+Toner', 'https://www.nykaa.com/search?q=Plum+Green+Tea+Toner'),
      -- Face Mask
      ('The Ordinary Salicylic Acid 2% Masque', 'The Ordinary', 'Face Mask', ARRAY['Salicylic Acid','Charcoal'], 'Clarifying mask for congested and oily skin.', ARRAY['Oily','Combination'], ARRAY['Acne','Blackheads','Oiliness'], '₹750-950', 850, 84, 'https://images.unsplash.com/photo-1556228578-8c89e6adf853?w=400&q=80', 4.1, ARRAY[], ARRAY['Deep clean','Pore clearing','Oil control'], ARRAY['Salicylic Acid'], 'Apply thin layer to clean skin. Leave 10 minutes. Rinse. Use 1-2x per week.', 'https://www.amazon.in/s?k=Ordinary+Salicylic+Masque', 'https://www.nykaa.com/search?q=Ordinary+Salicylic+Masque'),
      ('Cetaphil Pro Dermacontrol Purifying Clay Mask', 'Cetaphil', 'Face Mask', ARRAY['Clay','Niacinamide'], 'Purifying clay mask for oily skin.', ARRAY['Oily','Combination'], ARRAY['Oiliness','Pores'], '₹600-800', 700, 81, 'https://images.unsplash.com/photo-1556228578-8c89e6adf853?w=400&q=80', 4.0, ARRAY['budget_pick'], ARRAY['Oil absorption','Pore refining','Gentle'], ARRAY[], 'Apply to clean skin. Leave 10-15 minutes. Rinse. Use 1-2x per week.', 'https://www.amazon.in/s?k=Cetaphil+Clay+Mask', 'https://www.nykaa.com/search?q=Cetaphil+Clay+Mask');
  END IF;
END $$;
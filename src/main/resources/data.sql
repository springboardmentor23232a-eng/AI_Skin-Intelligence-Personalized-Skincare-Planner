-- Seed Data for AI Skin Intelligence & Personalized Skincare Planner

-- Insert Default Users (Passwords encrypted using BCrypt for 'Password@123')
INSERT INTO users (name, email, password, role, provider, bio)
VALUES
('Admin System', 'admin@wellness.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymY0V820L5i23G/K16eS3m', 'ADMIN', 'LOCAL', 'Platform Overseer & Skincare Analytics Admin.'),
('Dr. Marcus Vance', 'dermatologist@skincare.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymY0V820L5i23G/K16eS3m', 'DERMATOLOGIST', 'LOCAL', 'Board Certified Clinical Dermatologist & Skin Health Researcher.'),
('Consultant Sarah', 'consultant@skincare.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymY0V820L5i23G/K16eS3m', 'SKINCARE_CONSULTANT', 'LOCAL', 'Certified Skincare Strategist & Cosmetic Formulator.'),
('John Doe', 'john@gmail.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymY0V820L5i23G/K16eS3m', 'USER', 'LOCAL', 'User tracking skincare progress and ingredient safety.');

-- Insert Ingredients
INSERT INTO ingredients (name, category, description, suitable_skin_types, conflicting_ingredients, benefits)
VALUES
('Niacinamide (Vitamin B3)', 'Niacinamide', 'Potent antioxidant that reduces redness, minimizes pores, and regulates sebum.', 'Oily, Combination, Sensitive, Normal', 'Pure Vitamin C (L-Ascorbic Acid in high concentration)', 'Brightening, Pore Reduction, Barrier Repair'),
('Hyaluronic Acid', 'Hyaluronic Acid', 'Humectant capable of holding 1000x its weight in water.', 'Dry, Sensitive, Combination, Normal, Oily', 'None', 'Deep Hydration, Plumping, Fine Line Reduction'),
('Salicylic Acid (BHA)', 'AHAs/BHAs', 'Lipophilic acid that penetrates oil to deep clean pores.', 'Oily, Combination, Acne-Prone', 'Retinoids, Strong AHAs', 'Exfoliation, Blackhead Removal, Acne Control'),
('Retinol (Vitamin A)', 'Retinoids', 'Cell-turnover accelerator promoting collagen synthesis.', 'Normal, Combination, Mature', 'Salicylic Acid, Vitamin C, Benzoyl Peroxide', 'Anti-Aging, Wrinkle Reduction, Texture Smoothing'),
('Ceramides NP/AP/EOP', 'Ceramides', 'Essential lipids strengthening the cutaneous skin barrier.', 'Dry, Sensitive, Damaged Barrier', 'None', 'Barrier Restoration, Moisture Retention');

-- Insert Skincare Products
INSERT INTO skincare_products (name, brand, category, key_ingredients, price, rating, suitable_skin_types, target_concerns, product_url)
VALUES
('Gentle Hydrating Cleanser', 'CeraVe', 'Face Wash', 'Ceramides, Hyaluronic Acid', 14.99, 4.8, 'Dry, Sensitive, Normal', 'Dryness, Sensitive Barrier', 'https://www.cerave.com'),
('2% BHA Liquid Exfoliant', 'Paulas Choice', 'Toner', 'Salicylic Acid, Green Tea', 34.00, 4.7, 'Oily, Combination, Acne-Prone', 'Blackheads, Enlarged Pores, Acne', 'https://www.paulaschoice.com'),
('10% Niacinamide + 1% Zinc Serum', 'The Ordinary', 'Serum', 'Niacinamide, Zinc PCA', 6.50, 4.6, 'Oily, Combination', 'Uneven Tone, Blemishes, Redness', 'https://theordinary.com'),
('Hydro Boost Water Gel Moisturizer', 'Neutrogena', 'Moisturizer', 'Hyaluronic Acid', 19.99, 4.5, 'All Skin Types', 'Dehydration, Dullness', 'https://www.neutrogena.com'),
('UV Clear Broad-Spectrum SPF 46', 'EltaMD', 'Sunscreen', 'Zinc Oxide, Niacinamide, Hyaluronic Acid', 41.00, 4.9, 'Sensitive, Acne-Prone, Normal', 'UV Protection, Hyperpigmentation', 'https://eltamd.com');

-- Insert Initial Skin Profile for John Doe
INSERT INTO skin_profiles (user_id, skin_type, age_group, skin_concerns, allergies, sensitivities, lifestyle_habits, sleep_quality, water_intake_ml, environmental_exposure)
VALUES
(4, 'Combination', '25-34', 'Acne, Hyperpigmentation, Uneven Tone', 'Fragrance, Essential Oils', 'High UV Sensitivity', 'Desk Work, High Screen Time', 'Good', 2500, 'Urban Pollution & AC');

-- Insert Initial Skin Assessment for John Doe
-- Weighted Scoring: Condition 35%, Lifestyle 20%, Sleep 15%, Routine 20%, Hydration 10%
INSERT INTO skin_assessments (user_id, skin_condition_score, lifestyle_score, sleep_score, routine_consistency_score, hydration_score, overall_skin_health_score, primary_concern, ai_diagnosis)
VALUES
(4, 75, 80, 85, 70, 90, 78, 'Acne & Hyperpigmentation', 'AI Skincare Intelligence Diagnosis:\n• Overall Skin Health Index: 78/100.\n• Barrier Integrity: Stable with mild T-zone sebum elevation.\n• Hydration Cadence: 2500ml/day (Optimal).\n• Recommended Focus: Incorporate Niacinamide and morning SPF 46 to mitigate post-inflammatory hyperpigmentation.');

-- Insert Initial Routines for John Doe
INSERT INTO personalized_routines (user_id, time_of_day, step_number, category, step_name, instructions, recommended_ingredient)
VALUES
(4, 'MORNING', 1, 'CLEANSING', 'Gentle Water-Based Foam Cleanser', 'Massage over damp face for 60s with lukewarm water.', 'Ceramides'),
(4, 'MORNING', 2, 'TREATMENT', '10% Niacinamide Serum', 'Apply 3-4 drops to brighten skin tone and control sebum.', 'Niacinamide'),
(4, 'MORNING', 3, 'MOISTURIZING', 'Lightweight Gel Cream', 'Lock in moisture without clogging pores.', 'Hyaluronic Acid'),
(4, 'MORNING', 4, 'SUN_PROTECTION', 'Broad-Spectrum SPF 50+ Sunscreen', 'Apply generously 15 minutes before UV exposure.', 'Zinc Oxide'),
(4, 'EVENING', 1, 'CLEANSING', 'Double Cleansing (Micellar Water + Cleanser)', 'Remove sunscreen and urban pollutants thoroughly.', 'Micellar Tech'),
(4, 'EVENING', 2, 'TREATMENT', '2% BHA Salicylic Acid Treatment (3x Weekly)', 'Apply evenly to target pores and acne breakouts.', 'Salicylic Acid'),
(4, 'EVENING', 3, 'NIGHT_CARE', 'Barrier Recovery Cream', 'Apply nourishing night moisturizer to support cell renewal.', 'Ceramides');

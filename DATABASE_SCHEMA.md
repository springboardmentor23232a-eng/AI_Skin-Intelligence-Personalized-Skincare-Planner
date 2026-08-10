# 🗄️ PostgreSQL Database Schema Reference

The platform database consists of **13 relational tables** managed via SQLAlchemy ORM and Alembic migrations.

---

## 📐 Entity Relationship Model Overview

```
                      +-------------------+
                      |       users       |
                      +-------------------+
                                |
       +------------------------+------------------------+
       |                        |                        |
       v                        v                        v
+--------------+       +------------------+     +-------------------+
| skin_profiles|       | skin_assessments |     | skincare_routines |
+--------------+       +------------------+     +-------------------+
                                |
                                v
                   +-------------------------+
                   | product_recommendations |
                   +-------------------------+
                                |
                                v
                   +-------------------------+
                   |    clinical_reviews     |
                   +-------------------------+
```

---

## 📋 Table Definitions Summary

### 1. `users`
- `id` (INT, PK, Autoincrement)
- `full_name` (VARCHAR(255))
- `email` (VARCHAR(255), UNIQUE, Indexed)
- `hashed_password` (VARCHAR(255))
- `role` (VARCHAR(50), Enum: `USER`, `SKINCARE_CONSULTANT`, `DERMATOLOGIST`, `ADMIN`)
- `provider` (VARCHAR(50), Enum: `LOCAL`, `GOOGLE`)
- `created_at`, `updated_at` (TIMESTAMP)

### 2. `skin_profiles`
- `id` (INT, PK)
- `user_id` (INT, FK -> `users.id` ON DELETE CASCADE)
- `age`, `gender`, `skin_type`, `skin_tone`, `allergies`, `water_intake`
- `concerns` (JSON list of strings)

### 3. `skin_assessments`
- `id` (INT, PK)
- `user_id` (INT, FK -> `users.id` ON DELETE CASCADE)
- `overall_score` (INT), `risk_level` (VARCHAR), `concern_priority` (VARCHAR)
- Sub-scores: `acne`, `hyperpigmentation`, `dryness`, `oiliness`, `redness`, `sensitivity` (INT 0-100)

### 4. `skincare_routines`
- `id` (INT, PK)
- `user_id` (INT, FK -> `users.id`)
- `routine_type` (VARCHAR: `MORNING`, `EVENING`, `WEEKLY`, `MONTHLY`, `SEASONAL`)
- `title`, `description`, `steps` (JSON array of protocol steps)

### 5. `ingredients`
- `id` (INT, PK)
- `name` (VARCHAR, UNIQUE, Indexed)
- `category`, `comedogenic_rating`, `active_function`, `safety_score`

### 6. `ingredient_compatibility_checks`
- `id` (INT, PK)
- `user_id` (INT, FK -> `users.id`)
- `ingredient_a`, `ingredient_b`, `is_safe` (BOOLEAN), `conflicts_json` (JSON)

### 7. `products`
- `id` (INT, PK)
- `name`, `brand`, `category`, `price`, `rating`, `skin_types` (JSON), `active_ingredients` (JSON)

### 8. `product_recommendations`
- `id` (INT, PK)
- `user_id` (INT, FK -> `users.id`)
- `budget_tier`, `recommended_products` (JSON list of products with match scores)

### 9. `skincare_logs`
- `id` (INT, PK)
- `user_id` (INT, FK -> `users.id`)
- `routine_type`, `logged_date`, `completed` (INT 0/1), `notes`

### 10. `skin_progress_photos`
- `id` (INT, PK)
- `user_id` (INT, FK -> `users.id`)
- `photo_url`, `notes`, `associated_assessment_id` (FK -> `skin_assessments.id`)

### 11. `consultations`
- `id` (INT, PK)
- `patient_id` (FK -> `users.id`), `consultant_id` (FK -> `users.id`)
- `scheduled_at`, `status` (`PENDING`, `COMPLETED`, `CANCELLED`), `notes`, `treatment_recommendations`

### 12. `clinical_reviews`
- `id` (INT, PK)
- `patient_id` (FK -> `users.id`), `reviewer_id` (FK -> `users.id`), `recommendation_id` (FK -> `product_recommendations.id`)
- `status` (`APPROVED`, `REJECTED`, `MODIFIED`), `custom_routine` (JSON), `clinical_notes`

### 13. `notifications` & `reminder_settings`
- `id` (INT, PK)
- `user_id` (FK -> `users.id`), `category`, `priority`, `title`, `message`, `is_read`, `reminder_type`, `time_of_day`

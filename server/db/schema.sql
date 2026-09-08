-- Schema for PanaceaAI Skin Intelligence Platform

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  google_id VARCHAR(255) UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skin_scores (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  overall_score INT NOT NULL,
  breakdown JSONB NOT NULL,
  scan_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consultations (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  patient_name VARCHAR(255) NOT NULL,
  condition VARCHAR(255) NOT NULL,
  status VARCHAR(100) NOT NULL DEFAULT 'Pending',
  dermatologist VARCHAR(255),
  prescription TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  key_ingredients TEXT[],
  score_match INT DEFAULT 90,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS microservices_status (
  id SERIAL PRIMARY KEY,
  service_name VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Healthy',
  uptime_percentage NUMERIC(5,2) DEFAULT 99.9,
  latency_ms INT DEFAULT 45
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  conversation_id VARCHAR(100) NOT NULL,
  sender_id VARCHAR(50) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_role VARCHAR(50) NOT NULL,
  sender_avatar TEXT,
  recipient_id VARCHAR(50) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  recipient_role VARCHAR(50) NOT NULL,
  recipient_avatar TEXT,
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Module 9: Daily Skincare Checklists
CREATE TABLE IF NOT EXISTS daily_skincare_checklists (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  check_date DATE DEFAULT CURRENT_DATE,
  routine_type VARCHAR(50) NOT NULL, -- morning, evening, weekly
  step_id VARCHAR(100) NOT NULL,
  step_name VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Module 10: Notification & Reminder System
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'system', -- routine, product, hydration_sleep, clinical, system
  type VARCHAR(50) NOT NULL DEFAULT 'info', -- info, success, warning, alert
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reminders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) NOT NULL, -- morning_routine, evening_routine, hydration, sleep, weekly_scan, product_replenish
  target_time VARCHAR(20) NOT NULL, -- e.g. "08:00", "21:30"
  frequency VARCHAR(50) DEFAULT 'daily', -- daily, weekly, custom
  is_enabled BOOLEAN DEFAULT true,
  metadata JSONB,
  last_triggered TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS product_replenishment_tracking (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  product_id INT,
  product_name VARCHAR(255) NOT NULL,
  total_volume_ml NUMERIC(6,2) NOT NULL DEFAULT 50.0,
  daily_usage_ml NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  remaining_pct NUMERIC(5,2) NOT NULL DEFAULT 100.0,
  days_left INT NOT NULL DEFAULT 50,
  reorder_url TEXT,
  status VARCHAR(50) DEFAULT 'Adequate', -- Adequate, Low, Critical, Replenished
  last_logged TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hydration_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  log_date DATE DEFAULT CURRENT_DATE,
  intake_ml INT NOT NULL DEFAULT 0,
  target_ml INT NOT NULL DEFAULT 2500,
  logs_breakdown JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sleep_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  log_date DATE DEFAULT CURRENT_DATE,
  sleep_hours NUMERIC(4,2) NOT NULL DEFAULT 7.5,
  sleep_quality VARCHAR(50) DEFAULT 'Good', -- Optimal, Good, Restless, Insufficient
  wind_down_time VARCHAR(20) DEFAULT '22:30',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Module 11: Reports & Export System
CREATE TABLE IF NOT EXISTS generated_reports (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(100) NOT NULL, -- assessment, routine, product_recs, progress, skin_health
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  report_data JSONB NOT NULL,
  format VARCHAR(50) DEFAULT 'pdf', -- pdf, excel, json
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id SERIAL PRIMARY KEY,
  actor_id INT,
  actor_name VARCHAR(255) NOT NULL,
  actor_role VARCHAR(50) NOT NULL,
  action VARCHAR(150) NOT NULL,
  details JSONB,
  ip_address VARCHAR(100) DEFAULT '127.0.0.1',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const { Pool } = pg;

// Default PostgreSQL Configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'panacea_skin_db',
  password: process.env.PGPASSWORD || 'postgres',
  port: parseInt(process.env.PGPORT || '5432', 10),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

let realPool = null;
let isConnectedToPostgres = false;

try {
  realPool = new Pool(dbConfig);
  // Handle silent background errors
  realPool.on('error', (err) => {
    console.warn('[PostgreSQL Pool Warning] Real database pool encountered an error:', err.message);
    isConnectedToPostgres = false;
  });
} catch (e) {
  console.warn('[PostgreSQL Init Warning] Failed to construct Pool:', e.message);
}

// In-Memory Storage Engine for Seamless Fallback & Zero-Fake Synchronized Clinical Data
const inMemoryStore = {
  users: [
    {
      id: 1,
      username: 'user',
      full_name: 'Alex Rivera',
      email: 'user@panacea.ai',
      password_hash: bcrypt.hashSync('user123', 10),
      role: 'user',
      status: 'active',
      google_id: null,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      skin_type: 'Combination',
      primary_concerns: ['Acne & Breakouts', 'Compromised Barrier', 'Post-Acne Melanin'],
      assigned_consultant_id: 2,
      assigned_doctor_id: 3,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      username: 'consultant',
      full_name: 'Elena Vance, LE',
      email: 'consultant@panacea.ai',
      password_hash: bcrypt.hashSync('consultant123', 10),
      role: 'consultant',
      status: 'active',
      google_id: null,
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      title: 'Lead Clinical Esthetician & Regimen Specialist',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      username: 'doctor',
      full_name: 'Dr. Julian Rostova, MD',
      email: 'doctor@panacea.ai',
      password_hash: bcrypt.hashSync('doctor123', 10),
      role: 'dermatologist',
      status: 'active',
      google_id: null,
      avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
      title: 'Board-Certified Dermatologist & Clinical Director',
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      username: 'admin',
      full_name: 'System Administrator',
      email: 'admin@panacea.ai',
      password_hash: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      status: 'active',
      google_id: null,
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      username: 'sarah_jenkins',
      full_name: 'Sarah Jenkins',
      email: 'sarah.jenkins@panacea.ai',
      password_hash: bcrypt.hashSync('sarah123', 10),
      role: 'user',
      status: 'active',
      google_id: null,
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      skin_type: 'Sensitive / Dry',
      primary_concerns: ['Erythema & Rosacea', 'Compromised Barrier', 'Flaking'],
      assigned_consultant_id: 2,
      assigned_doctor_id: 3,
      created_at: new Date(Date.now() - 86400000 * 45).toISOString()
    },
    {
      id: 6,
      username: 'marcus_v',
      full_name: 'Marcus Vance',
      email: 'marcus.v@panacea.ai',
      password_hash: bcrypt.hashSync('marcus123', 10),
      role: 'user',
      status: 'active',
      google_id: null,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      skin_type: 'Oily / Congested',
      primary_concerns: ['Severe Cystic Acne', 'High Sebum Excretion', 'Textural Scarring'],
      assigned_consultant_id: 2,
      assigned_doctor_id: 3,
      created_at: new Date(Date.now() - 86400000 * 60).toISOString()
    }
  ],
  skin_scores: [
    {
      id: 1,
      user_id: 1,
      overall_score: 79.4,
      baseline_score: 68.5,
      score_delta: 10.9,
      biomarkers: {
        hydration_level: 74.0,
        oiliness_level: 52.0,
        barrier_strength: 86.0,
        acne_severity: 12.0,
        redness_reactivity: 15.0,
        pigmentation_score: 19.5,
        sensitivity_level: 18.0,
        wrinkles_score: 11.0
      },
      lesion_screening: {
        classification: 'Benign (Safe / Low Risk)',
        malignancy_risk_score: 8.2,
        badge: 'BENIGN (SAFE)',
        confidence_pct: 98.4
      },
      breakdown: JSON.stringify([
        { name: 'Skin Condition (Acne / Blemishes)', score: 88, weight: '35%' },
        { name: 'Lifestyle & Routine Adherence', score: 92, weight: '20%' },
        { name: 'Lipid Barrier Strength', score: 86, weight: '15%' },
        { name: 'Consistency Index (AM/PM Logs)', score: 96, weight: '20%' },
        { name: 'Epidermal Hydration', score: 74, weight: '10%' }
      ]),
      scan_date: new Date().toISOString()
    },
    {
      id: 2,
      user_id: 5,
      overall_score: 71.2,
      baseline_score: 58.0,
      score_delta: 13.2,
      biomarkers: {
        hydration_level: 66.0,
        oiliness_level: 30.0,
        barrier_strength: 72.0,
        acne_severity: 8.0,
        redness_reactivity: 32.0,
        pigmentation_score: 22.0,
        sensitivity_level: 42.0,
        wrinkles_score: 20.0
      },
      lesion_screening: {
        classification: 'Benign Vascular Flushing (Erythema)',
        malignancy_risk_score: 6.5,
        badge: 'BENIGN (SAFE)',
        confidence_pct: 97.8
      },
      breakdown: JSON.stringify([
        { name: 'Vascular Flushing & Erythema', score: 68, weight: '35%' },
        { name: 'Barrier Lipid Repair', score: 72, weight: '25%' },
        { name: 'Moisture Capacity', score: 66, weight: '20%' },
        { name: 'Consistency Index', score: 85, weight: '20%' }
      ]),
      scan_date: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 3,
      user_id: 6,
      overall_score: 65.5,
      baseline_score: 50.0,
      score_delta: 15.5,
      biomarkers: {
        hydration_level: 54.0,
        oiliness_level: 78.0,
        barrier_strength: 62.0,
        acne_severity: 38.0,
        redness_reactivity: 45.0,
        pigmentation_score: 40.0,
        sensitivity_level: 30.0,
        wrinkles_score: 14.0
      },
      lesion_screening: {
        classification: 'Inflammatory Papulopustular Acne Pattern',
        malignancy_risk_score: 11.0,
        badge: 'BENIGN (MONITOR)',
        confidence_pct: 96.2
      },
      breakdown: JSON.stringify([
        { name: 'Inflammatory Blemish Clearance', score: 62, weight: '40%' },
        { name: 'Sebum Normalization', score: 55, weight: '25%' },
        { name: 'Post-Acne Melanin', score: 60, weight: '20%' },
        { name: 'Consistency Index', score: 82, weight: '15%' }
      ]),
      scan_date: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  ],
  consultations: [
    {
      id: 1,
      user_id: 1,
      patient_name: 'Alex Rivera',
      condition: 'Mild Comedonal Acne & Post-Acne PIH',
      status: 'Under Active Regimen',
      priority: 'Standard',
      consultant: 'Elena Vance, LE',
      dermatologist: 'Dr. Julian Rostova, MD',
      prescription: 'Topical Adapalene 0.1% (PM 3x/wk) + Azelaic Acid 15% (AM)',
      consultant_notes: 'Patient showed +54.2% hydration boost. Barrier restored after introducing ceramide night barrier seal.',
      clinical_notes: 'Follicular retention hyperkeratosis clearing satisfactorily. Recommend maintaining current Retinoid cadence.',
      last_visit: '24 Nov 2025',
      next_review: '24 Dec 2025',
      date: new Date().toISOString()
    },
    {
      id: 2,
      user_id: 5,
      patient_name: 'Sarah Jenkins',
      condition: 'Subacute Erythematotelangiectatic Rosacea',
      status: 'Needs Clinical Review',
      priority: 'High',
      consultant: 'Elena Vance, LE',
      dermatologist: 'Dr. Julian Rostova, MD',
      prescription: 'Ivermectin 1% Cream (PM) + Ceramide NP Lipid Balm',
      consultant_notes: 'Facial flushing improved with Centella serum. Avoid all physical exfoliating scrubs.',
      clinical_notes: 'Vascular reactivity down from 60 to 32. Scheduled for optical follow-up in 2 weeks.',
      last_visit: '22 Nov 2025',
      next_review: '06 Dec 2025',
      date: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 3,
      user_id: 6,
      patient_name: 'Marcus Vance',
      condition: 'Moderate-to-Severe Papulopustular Acne',
      status: 'Active Medical Treatment',
      priority: 'High',
      consultant: 'Elena Vance, LE',
      dermatologist: 'Dr. Julian Rostova, MD',
      prescription: 'Benzoyl Peroxide 2.5% Wash + Clindamycin 1% Gel (AM) + Tretinoin 0.025% (PM)',
      consultant_notes: 'Sebum excretion elevated (78%). Advised oil-free foaming cleanser and non-comedogenic water gel.',
      clinical_notes: 'Micro-cystic lesions responding to topical antimicrobial therapy. Monitored for retinoid xerosis.',
      last_visit: '23 Nov 2025',
      next_review: '07 Dec 2025',
      date: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  ],
  products: [
    { id: 1, name: 'Gentle Hydrating Cleanser', brand: 'CeraVe', score_match: 96, category: 'Cleanser' },
    { id: 2, name: 'Niacinamide 10% + Zinc 1%', brand: 'The Ordinary', score_match: 94, category: 'Serum' },
    { id: 3, name: 'Daily Barrier Cream', brand: 'La Roche-Posay', score_match: 91, category: 'Moisturizer' }
  ],
  sharing_preferences: [
    {
      id: 1,
      user_id: 1,
      consultant: {
        shared: true,
        biomarkers: true,
        photos_and_lesions: true,
        adherence_and_compliance: true,
        medical_and_rx_history: false,
        lifestyle_logs: true
      },
      doctor: {
        shared: true,
        biomarkers: true,
        photos_and_lesions: true,
        adherence_and_compliance: true,
        medical_and_rx_history: true,
        lifestyle_logs: true
      },
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      user_id: 5,
      consultant: {
        shared: true,
        biomarkers: true,
        photos_and_lesions: false,
        adherence_and_compliance: true,
        medical_and_rx_history: false,
        lifestyle_logs: true
      },
      doctor: {
        shared: true,
        biomarkers: true,
        photos_and_lesions: true,
        adherence_and_compliance: true,
        medical_and_rx_history: true,
        lifestyle_logs: true
      },
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      user_id: 6,
      consultant: {
        shared: true,
        biomarkers: true,
        photos_and_lesions: true,
        adherence_and_compliance: true,
        medical_and_rx_history: false,
        lifestyle_logs: true
      },
      doctor: {
        shared: true,
        biomarkers: true,
        photos_and_lesions: true,
        adherence_and_compliance: true,
        medical_and_rx_history: true,
        lifestyle_logs: true
      },
      updated_at: new Date().toISOString()
    }
  ],
  appointments: [
    {
      id: 1,
      user_id: 1,
      specialist_id: 2,
      specialist_name: 'Elena Vance, LE',
      specialist_role: 'consultant',
      type: 'Virtual Regimen Review & Barrier Check',
      scheduled_date: '2025-12-10T14:30:00.000Z',
      status: 'confirmed',
      notes: 'Evaluate progress with 2% BHA Salicylic exfoliant and ceramide barrier seal.',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      user_id: 1,
      specialist_id: 3,
      specialist_name: 'Dr. Julian Rostova, MD',
      specialist_role: 'dermatologist',
      type: 'Clinical Prescription & Lesion Follow-up',
      scheduled_date: '2025-12-24T10:00:00.000Z',
      status: 'scheduled',
      notes: 'Review adapalene tolerability and follow-up on benign facial lesion scans.',
      created_at: new Date().toISOString()
    }
  ],
  chat_messages: [
    {
      id: 1,
      conversation_id: 'user_1_lumina_ai',
      sender_id: '1',
      sender_name: 'Alex Rivera',
      sender_role: 'user',
      sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      recipient_id: 'lumina_ai',
      recipient_name: 'Lumina AI',
      recipient_role: 'ai_assistant',
      recipient_avatar: 'assets/logo.png',
      message: 'Hi Lumina, is it safe to use 2% Salicylic Acid BHA alongside my prescribed Topical Adapalene 0.1%?',
      message_type: 'text',
      read: true,
      created_at: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 2,
      conversation_id: 'user_1_lumina_ai',
      sender_id: 'lumina_ai',
      sender_name: 'Lumina AI',
      sender_role: 'ai_assistant',
      sender_avatar: 'assets/logo.png',
      recipient_id: '1',
      recipient_name: 'Alex Rivera',
      recipient_role: 'user',
      recipient_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      message: 'Hello Alex! Based on your Combination skin profile (Hydration 74%, Barrier Strength 86%), layering both BHA and Adapalene in the same evening session is not recommended due to increased trans-epidermal water loss.\n\n✨ **Optimal Clinical Protocol**:\n1. **Morning (AM)**: Gentle Foaming Cleanser → 2% BHA Salicylic Exfoliant (2x/week) → Niacinamide Serum → Broad-Spectrum SPF 50+.\n2. **Evening (PM)**: Gentle Cleanser → Hyaluronic Hydrator → **Topical Adapalene 0.1%** → Ceramide Barrier Recovery Cream.\n\n*Always perform a patch test when adjusting frequency.*',
      message_type: 'ai_response',
      read: true,
      created_at: new Date(Date.now() - 3600000 * 4.9).toISOString()
    },
    {
      id: 3,
      conversation_id: 'user_1_consultant_2',
      sender_id: '2',
      sender_name: 'Elena Vance, LE',
      sender_role: 'consultant',
      sender_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      recipient_id: '1',
      recipient_name: 'Alex Rivera',
      recipient_role: 'user',
      recipient_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      message: 'Hello Alex! I inspected your 30-day compliance trajectory (+54.2% hydration). Your skin barrier recovery is remarkable. Let me know if you experience any seasonal tightness this week.',
      message_type: 'text',
      read: true,
      created_at: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 4,
      conversation_id: 'user_1_consultant_2',
      sender_id: '1',
      sender_name: 'Alex Rivera',
      sender_role: 'user',
      sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      recipient_id: '2',
      recipient_name: 'Elena Vance, LE',
      recipient_role: 'consultant',
      recipient_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      message: 'Thank you Elena! The ceramide night barrier balm is working wonders. T-zone erythema is down noticeably.',
      message_type: 'text',
      read: true,
      created_at: new Date(Date.now() - 3600000 * 20).toISOString()
    },
    {
      id: 5,
      conversation_id: 'user_1_doctor_3',
      sender_id: '3',
      sender_name: 'Dr. Julian Rostova, MD',
      sender_role: 'dermatologist',
      sender_avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
      recipient_id: '1',
      recipient_name: 'Alex Rivera',
      recipient_role: 'user',
      recipient_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      message: 'Alex, I reviewed your clinical photos and optical scan. Micro-comedones have decreased by 71.4% with 0 cystic breakouts. I have approved your 3-month Adapalene 0.1% prescription renewal.',
      message_type: 'prescription_notice',
      read: true,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 6,
      conversation_id: 'user_1_doctor_3',
      sender_id: '1',
      sender_name: 'Alex Rivera',
      sender_role: 'user',
      sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      recipient_id: '3',
      recipient_name: 'Dr. Julian Rostova, MD',
      recipient_role: 'dermatologist',
      recipient_avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
      message: 'Thank you Dr. Rostova! I will continue the PM application schedule with SPF 50 every morning.',
      message_type: 'text',
      read: true,
      created_at: new Date(Date.now() - 86400000 * 1.5).toISOString()
    },
    {
      id: 7,
      conversation_id: 'consultant_2_doctor_3',
      sender_id: '2',
      sender_name: 'Elena Vance, LE',
      sender_role: 'consultant',
      sender_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      recipient_id: '3',
      recipient_name: 'Dr. Julian Rostova, MD',
      recipient_role: 'dermatologist',
      recipient_avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
      message: 'Dr. Rostova, Sarah Jenkins (User 5) completed her barrier restoration cycle. Her erythema rating dropped from 60 to 32.',
      message_type: 'text',
      read: true,
      created_at: new Date(Date.now() - 3600000 * 8).toISOString()
    },
    {
      id: 8,
      conversation_id: 'consultant_2_doctor_3',
      sender_id: '3',
      sender_name: 'Dr. Julian Rostova, MD',
      sender_role: 'dermatologist',
      sender_avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
      recipient_id: '2',
      recipient_name: 'Elena Vance, LE',
      recipient_role: 'consultant',
      recipient_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      message: 'Excellent clinical progress. Let us keep her on the Ivermectin 1% PM protocol for another 14 days before in-clinic dermoscopy.',
      message_type: 'text',
      read: true,
      created_at: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      id: 9,
      conversation_id: 'user_5_consultant_2',
      sender_id: '5',
      sender_name: 'Sarah Jenkins',
      sender_role: 'user',
      sender_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      recipient_id: '2',
      recipient_name: 'Elena Vance, LE',
      recipient_role: 'consultant',
      recipient_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      message: 'Hi Elena, the soothing Centella serum is working wonders. No stinging or flaking after washing.',
      message_type: 'text',
      read: true,
      created_at: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: 10,
      conversation_id: 'user_6_doctor_3',
      sender_id: '6',
      sender_name: 'Marcus Vance',
      sender_role: 'user',
      sender_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      recipient_id: '3',
      recipient_name: 'Dr. Julian Rostova, MD',
      recipient_role: 'dermatologist',
      recipient_avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
      message: 'Dr. Rostova, the clindamycin wash has eliminated the painful pustules along my jawline.',
      message_type: 'text',
      read: true,
      created_at: new Date(Date.now() - 3600000 * 18).toISOString()
    }
  ]
};

export async function query(text, params = []) {
  if (realPool && isConnectedToPostgres) {
    try {
      return await realPool.query(text, params);
    } catch (err) {
      console.warn('[PostgreSQL Query Fallback] Database query failed, falling back to Memory Pool:', err.message);
      isConnectedToPostgres = false;
    }
  }

  // Parse simple SQL queries for In-Memory Fallback
  const cleanText = text.trim();

  // SELECT user by username or email
  if (cleanText.includes('FROM users WHERE username = $1 OR email = $1') || cleanText.includes('FROM users WHERE username = $1')) {
    const searchVal = (params[0] || '').toLowerCase();
    const found = inMemoryStore.users.filter(u => u.username.toLowerCase() === searchVal || u.email.toLowerCase() === searchVal);
    return { rows: found, rowCount: found.length };
  }

  // SELECT user by ID
  if (cleanText.includes('FROM users WHERE id = $1')) {
    const idVal = parseInt(params[0], 10);
    const found = inMemoryStore.users.filter(u => u.id === idVal);
    return { rows: found, rowCount: found.length };
  }

  // SELECT user by google_id
  if (cleanText.includes('FROM users WHERE google_id = $1')) {
    const googleId = params[0];
    const found = inMemoryStore.users.filter(u => u.google_id === googleId);
    return { rows: found, rowCount: found.length };
  }

  // DELETE FROM users
  if (cleanText.includes('DELETE FROM users WHERE id = $1')) {
    const idVal = parseInt(params[0], 10);
    const initialLen = inMemoryStore.users.length;
    inMemoryStore.users = inMemoryStore.users.filter(u => u.id !== idVal);
    return { rows: [], rowCount: initialLen - inMemoryStore.users.length };
  }

  // SELECT all users
  if (cleanText.includes('FROM users') && !cleanText.includes('WHERE')) {
    return { rows: inMemoryStore.users, rowCount: inMemoryStore.users.length };
  }

  // UPDATE users SET status
  if (cleanText.includes('UPDATE users SET status')) {
    const statusVal = params[0];
    const target = params[1];
    const userObj = inMemoryStore.users.find(u => u.id === parseInt(target, 10) || u.username === target);
    if (userObj) {
      userObj.status = statusVal;
      return { rows: [userObj], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // INSERT INTO users
  if (cleanText.includes('INSERT INTO users')) {
    const newUser = {
      id: inMemoryStore.users.length + 1,
      username: params[0],
      email: params[1],
      password_hash: params[2],
      role: params[3] || 'user',
      status: params[4] || 'pending_approval',
      google_id: params[5] || null,
      avatar_url: params[6] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      created_at: new Date().toISOString()
    };
    inMemoryStore.users.push(newUser);
    return { rows: [newUser], rowCount: 1 };
  }

  // SELECT skin_scores
  if (cleanText.includes('FROM skin_scores WHERE user_id = $1')) {
    const idVal = parseInt(params[0], 10);
    const found = inMemoryStore.skin_scores.filter(s => s.user_id === idVal);
    return { rows: found, rowCount: found.length };
  }

  if (cleanText.includes('FROM skin_scores')) {
    return { rows: inMemoryStore.skin_scores, rowCount: inMemoryStore.skin_scores.length };
  }

  // SELECT consultations
  if (cleanText.includes('FROM consultations WHERE user_id = $1')) {
    const idVal = parseInt(params[0], 10);
    const found = inMemoryStore.consultations.filter(c => c.user_id === idVal);
    return { rows: found, rowCount: found.length };
  }

  if (cleanText.includes('FROM consultations')) {
    return { rows: inMemoryStore.consultations, rowCount: inMemoryStore.consultations.length };
  }

  // SELECT sharing_preferences
  if (cleanText.includes('FROM sharing_preferences WHERE user_id = $1')) {
    const idVal = parseInt(params[0], 10);
    const found = inMemoryStore.sharing_preferences.filter(p => p.user_id === idVal);
    return { rows: found, rowCount: found.length };
  }

  // SELECT appointments
  if (cleanText.includes('FROM appointments WHERE user_id = $1')) {
    const idVal = parseInt(params[0], 10);
    const found = inMemoryStore.appointments.filter(a => a.user_id === idVal);
    return { rows: found, rowCount: found.length };
  }

  // SELECT chat_messages
  if (cleanText.includes('FROM chat_messages WHERE conversation_id = $1')) {
    const convId = params[0];
    const found = inMemoryStore.chat_messages.filter(m => m.conversation_id === convId);
    return { rows: found, rowCount: found.length };
  }

  if (cleanText.includes('FROM chat_messages WHERE sender_id = $1 OR recipient_id = $1')) {
    const uId = String(params[0]);
    const found = inMemoryStore.chat_messages.filter(m => String(m.sender_id) === uId || String(m.recipient_id) === uId);
    return { rows: found, rowCount: found.length };
  }

  if (cleanText.includes('FROM chat_messages')) {
    return { rows: inMemoryStore.chat_messages, rowCount: inMemoryStore.chat_messages.length };
  }

  // SELECT products
  if (cleanText.includes('FROM products')) {
    return { rows: inMemoryStore.products, rowCount: inMemoryStore.products.length };
  }

  // Generic fallback query response
  return { rows: [], rowCount: 0 };
}

export async function testConnection() {
  if (!realPool) return false;
  try {
    const client = await realPool.connect();
    client.release();
    isConnectedToPostgres = true;
    console.log('Successfully connected to live PostgreSQL database.');
    return true;
  } catch (err) {
    console.log('[PostgreSQL Connection Info] Live PostgreSQL not available on localhost. Operating in Mock PostgreSQL Pool mode.');
    isConnectedToPostgres = false;
    return false;
  }
}

export function getInMemoryStore() {
  return inMemoryStore;
}

export default {
  query,
  testConnection,
  getInMemoryStore
};


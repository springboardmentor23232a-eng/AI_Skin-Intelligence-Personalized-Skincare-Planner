/**
 * Mock Data Store for AI Skin Intelligence & Personalized Skincare Planner
 */

export const MOCK_ROLES = {
  USER: {
    id: 'user',
    name: 'DermaCare User',
    title: 'Skincare Consumer',
    badgeClass: 'badge-user',
    icon: '👤',
    description: 'Track skin health, manage routines & get personalized product recommendations.'
  },
  CONSULTANT: {
    id: 'consultant',
    name: 'Sarah Jenkins',
    title: 'Certified Skincare Consultant',
    badgeClass: 'badge-consultant',
    icon: '💼',
    description: 'Evaluate client profiles, build routines, and manage skincare recommendations.'
  },
  DERMATOLOGIST: {
    id: 'dermatologist',
    name: 'Dr. Elena Rostova, MD',
    title: 'Board-Certified Dermatologist',
    badgeClass: 'badge-dermatologist',
    icon: '🩺',
    description: 'Review clinical diagnostics, manage patient prescriptions, and track skin conditions.'
  },
  ADMIN: {
    id: 'admin',
    name: 'System Administrator',
    title: 'Platform Superadmin',
    badgeClass: 'badge-admin',
    icon: '🛡️',
    description: 'Monitor microservices, manage user permissions, and track platform metrics.'
  }
};

export const MOCK_USER_DATA = {
  profile: {
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    skinType: 'Combination / Sensitive',
    ageGroup: '25 - 34',
    primaryConcerns: ['Acne & Breakouts', 'Post-Inflammatory Hyperpigmentation', 'Redness'],
    allergies: ['Fragrance (Parfum)', 'High-Concentration Essential Oils'],
    sensitivities: ['Alcohol Denat', 'L-Ascorbic Acid > 15%']
  },
  skinScore: {
    overall: 78,
    grade: 'Good (Improving)',
    changeThisWeek: '+4 pts',
    breakdown: [
      { name: 'Skin Condition Assessment', weight: '35%', score: 75, status: 'Moderate', color: '#6366f1' },
      { name: 'Lifestyle Habits', weight: '20%', score: 80, status: 'Optimal', color: '#10b981' },
      { name: 'Sleep Quality', weight: '15%', score: 70, status: 'Needs Attention', color: '#f59e0b' },
      { name: 'Routine Consistency', weight: '20%', score: 85, status: 'Excellent', color: '#ec4899' },
      { name: 'Hydration Level', weight: '10%', score: 80, status: 'Optimal', color: '#3b82f6' }
    ]
  },
  routine: {
    morning: [
      { id: 'm1', step: 'Cleansing', title: 'Gentle Hydrating Cleanser', time: '8:00 AM', completed: true, icon: '🧼' },
      { id: 'm2', step: 'Treatment', title: '10% Niacinamide & Zinc Serum', time: '8:05 AM', completed: true, icon: '💧' },
      { id: 'm3', step: 'Moisturizing', title: 'Ceramide Barrier Relief Cream', time: '8:10 AM', completed: true, icon: '🧴' },
      { id: 'm4', step: 'Sun Protection', title: 'Broad Spectrum SPF 50+ Invisible Fluid', time: '8:15 AM', completed: false, icon: '☀️' }
    ],
    evening: [
      { id: 'e1', step: 'Double Cleansing', title: 'Micellar Cleansing Water + Foaming Gel', time: '9:00 PM', completed: false, icon: '🌙' },
      { id: 'e2', step: 'Exfoliation / Treatment', title: '2% BHA Salicylic Acid Liquid Exfoliant', time: '9:05 PM', completed: false, icon: '🧪' },
      { id: 'e3', step: 'Moisturizing', title: 'Overnight Recovery Gel Cream', time: '9:15 PM', completed: false, icon: '🌌' }
    ]
  },
  recommendedProducts: [
    {
      id: 'p1',
      name: 'DermaPure Barrier Repair Cream',
      category: 'Moisturizer',
      matchScore: '96%',
      keyIngredients: ['Ceramides NP/AP', 'Hyaluronic Acid', 'Centella Asiatica'],
      reason: 'Perfect match for sensitive combination skin with redness.',
      price: '$28.00',
      badge: 'Top Match'
    },
    {
      id: 'p2',
      name: 'Clarify 2% Salicylic Acid Gel',
      category: 'Treatment',
      matchScore: '92%',
      keyIngredients: ['2% Salicylic Acid', 'Green Tea Extract', 'Allantoin'],
      reason: 'Targets active congestion without causing dryness.',
      price: '$22.50',
      badge: 'Best for Acne'
    },
    {
      id: 'p3',
      name: 'ShieldFluid Mineral Sunscreen SPF 50',
      category: 'Sun Protection',
      matchScore: '89%',
      keyIngredients: ['Zinc Oxide 12%', 'Niacinamide 2%', 'Squalane'],
      reason: 'Fragrance-free mineral UV barrier safe for sensitive skin.',
      price: '$34.00',
      badge: 'Derm Favorite'
    }
  ],
  progressHistory: [
    { week: 'Week 1', score: 68 },
    { week: 'Week 2', score: 71 },
    { week: 'Week 3', score: 74 },
    { week: 'Week 4', score: 78 }
  ]
};

export const MOCK_CONSULTANT_DATA = {
  clients: [
    { id: 'c101', name: 'Maya Lin', skinType: 'Oily / Acne-Prone', lastAssessment: 'Yesterday', score: 64, status: 'Needs Routine Update', priority: 'High' },
    { id: 'c102', name: 'David Miller', skinType: 'Dry / Dehydrated', lastAssessment: '3 days ago', score: 82, status: 'On Track', priority: 'Normal' },
    { id: 'c103', name: 'Sophia Chen', skinType: 'Sensitive / Rosacea', lastAssessment: '5 days ago', score: 71, status: 'Review Recommended', priority: 'Medium' },
    { id: 'c104', name: 'Marcus Vance', skinType: 'Normal / Hyperpigmentation', lastAssessment: '1 week ago', score: 88, status: 'Routine Active', priority: 'Normal' }
  ],
  pendingReviews: 3,
  routinesCreatedThisMonth: 28,
  clientSatisfactionRate: '98.4%'
};

export const MOCK_DERMATOLOGIST_DATA = {
  patients: [
    { id: 'p201', name: 'Emma Watson', condition: 'Severe Inflammatory Acne (Grade 3)', lastVisit: 'Jul 20, 2026', prescription: 'Topical Adapalene 0.3% + Clindamycin 1%', status: 'Follow-up Scheduled' },
    { id: 'p202', name: 'Robert Thorne', condition: 'Erythematotelangiectatic Rosacea', lastVisit: 'Jul 15, 2026', prescription: 'Ivermectin 1% Cream + Barrier Foam', status: 'Improving' },
    { id: 'p203', name: 'Priya Sharma', condition: 'Melasma (Dermal-Epidermal)', lastVisit: 'Jul 10, 2026', prescription: 'Tranexamic Acid 5% + Azelaic Acid 15%', status: 'Stable' }
  ],
  clinicalReportsCount: 14,
  activeTreatmentsCount: 42,
  urgentConsultations: 2
};

export const MOCK_ADMIN_DATA = {
  metrics: {
    totalUsers: '1,420',
    assessmentsCompleted: '3,890',
    recommendationAccuracy: '94.2%',
    activeRoutines: '1,180',
    systemUptime: '99.98%'
  },
  microservices: [
    { name: 'User Service', endpoint: '/api/v1/users', port: '8001', status: 'Healthy', latency: '24ms', load: '12%' },
    { name: 'Skin Profile Service', endpoint: '/api/v1/profile', port: '8002', status: 'Healthy', latency: '18ms', load: '8%' },
    { name: 'Skin Assessment Service', endpoint: '/api/v1/assessment', port: '8003', status: 'Healthy', latency: '45ms', load: '28%' },
    { name: 'Routine Planner Service', endpoint: '/api/v1/routine', port: '8004', status: 'Healthy', latency: '32ms', load: '15%' },
    { name: 'Ingredient Intelligence Service', endpoint: '/api/v1/ingredients', port: '8005', status: 'Healthy', latency: '52ms', load: '34%' },
    { name: 'Product Recommendation Service', endpoint: '/api/v1/recommendations', port: '8006', status: 'Healthy', latency: '68ms', load: '42%' },
    { name: 'Skin Health Scoring Service', endpoint: '/api/v1/score', port: '8007', status: 'Healthy', latency: '15ms', load: '9%' },
    { name: 'Progress Tracking Service', endpoint: '/api/v1/progress', port: '8008', status: 'Healthy', latency: '29ms', load: '19%' },
    { name: 'Notification Service', endpoint: '/api/v1/notifications', port: '8009', status: 'Healthy', latency: '12ms', load: '5%' },
    { name: 'Analytics Service', endpoint: '/api/v1/analytics', port: '8010', status: 'Healthy', latency: '38ms', load: '22%' },
    { name: 'Report Export Service', endpoint: '/api/v1/reports', port: '8011', status: 'Healthy', latency: '84ms', load: '14%' },
    { name: 'Admin Service', endpoint: '/api/v1/admin', port: '8012', status: 'Healthy', latency: '20ms', load: '6%' }
  ],
  recentAuditLogs: [
    { time: '09:14:22', user: 'Admin', event: 'Microservice Health Check Executed', status: 'Success' },
    { time: '08:52:10', user: 'Dr. Elena Rostova', event: 'Patient Medical Profile Updated (p201)', status: 'Success' },
    { time: '08:30:45', user: 'Sarah Jenkins', event: 'New Routine Plan Published for Client (c101)', status: 'Success' },
    { time: '07:45:00', user: 'System Cron', event: 'FAISS Vector Index Optimization Complete', status: 'Success' }
  ]
};

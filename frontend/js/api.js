/* ==================== GLOWSENSE AI — API LAYER ==================== */
/* Centralized API client using Supabase for auth + data */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

/* ==================== DEMO MODE ==================== */
/* When Supabase auth fails or for demo purposes, we use a local fallback
   so the app remains fully functional for demonstration without requiring
   email verification. */

const DEMO_USERS_KEY = 'glowsense_demo_users';
const DEMO_DATA_KEY = 'glowsense_demo_data';

function getDemoUsers() {
  const raw = localStorage.getItem(DEMO_USERS_KEY);
  if (raw) return JSON.parse(raw);
  // Seed demo users
  const seeded = [
    { id: 'demo-admin', email: 'admin@glowsense.ai', password: 'admin123', name: 'Admin User', role: 'admin', provider: 'email', status: 'active', created_at: new Date().toISOString() },
    { id: 'demo-derm', email: 'derm@glowsense.ai', password: 'derm123', name: 'Dr. Sarah Chen', role: 'dermatologist', provider: 'email', status: 'active', created_at: new Date().toISOString() },
    { id: 'demo-consult', email: 'consultant@glowsense.ai', password: 'consult123', name: 'Maya Roberts', role: 'consultant', provider: 'email', status: 'active', created_at: new Date().toISOString() },
    { id: 'demo-user', email: 'user@glowsense.ai', password: 'user123', name: 'Demo User', role: 'user', provider: 'email', status: 'active', created_at: new Date().toISOString() },
  ];
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(seeded));
  return seeded;
}

function getDemoData() {
  const raw = localStorage.getItem(DEMO_DATA_KEY);
  if (raw) return JSON.parse(raw);
  return { profiles: {}, assessments: [], concerns: [], risks: [], recommendations: [], consultations: [], consultationRequests: [] };
}

function saveDemoData(data) {
  localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(data));
}

/* ==================== AUTH API ==================== */

export const authAPI = {
  async register(name, email, password) {
    if (!hasSupabaseConfig) return demoRegister(name, email, password);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;
      // Create profile entry
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name,
          role: 'user',
          provider: 'email',
          status: 'active',
        });
      }
      return { user: data.user, session: data.session, demo: false };
    } catch (err) {
      // Fallback to demo mode
      return demoRegister(name, email, password);
    }
  },

  async login(email, password) {
    const demoUser = getDemoUsers().find(user => user.email === email.toLowerCase() && user.password === password);
    if (demoUser) return demoLogin(email, password);
    if (!hasSupabaseConfig) return demoLogin(email, password);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { user: data.user, session: data.session, demo: false };
    } catch (err) {
      // Fallback to demo mode
      return demoLogin(email, password);
    }
  },

  async logout() {
    const isDemo = sessionStorage.getItem('glowsense_demo_session');
    if (isDemo) {
      sessionStorage.removeItem('glowsense_demo_session');
    } else if (supabase) {
      await supabase.auth.signOut();
    }
  },

  async getCurrentUser() {
    // Check demo session first
    const demoSession = sessionStorage.getItem('glowsense_demo_session');
    if (demoSession) {
      const session = JSON.parse(demoSession);
      const users = getDemoUsers();
      const user = users.find(u => u.id === session.userId);
      if (user) {
        return { user: { id: user.id, email: user.email, user_metadata: { name: user.name } }, demo: true };
      }
    }

    if (!supabase) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return { user, demo: false };
  },

  async getCurrentProfile() {
    const current = await this.getCurrentUser();
    if (!current) return null;

    if (current.demo) {
      const users = getDemoUsers();
      return users.find(u => u.id === current.user.id);
    }

    if (!supabase) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', current.user.id).maybeSingle();
    return data;
  },

  isDemoMode() {
    return !!sessionStorage.getItem('glowsense_demo_session');
  },
};

/* ==================== DEMO AUTH FUNCTIONS ==================== */

function demoRegister(name, email, password) {
  const users = getDemoUsers();
  if (users.find(u => u.email === email)) {
    throw new Error('An account with this email already exists.');
  }
  const newUser = {
    id: 'demo-' + Date.now(),
    email,
    password,
    name,
    role: 'user',
    provider: 'email',
    status: 'active',
    created_at: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));

  sessionStorage.setItem('glowsense_demo_session', JSON.stringify({ userId: newUser.id }));
  return { user: { id: newUser.id, email: newUser.email, user_metadata: { name: newUser.name } }, session: null, demo: true };
}

function demoLogin(email, password) {
  const users = getDemoUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    throw new Error('Invalid email or password.');
  }
  sessionStorage.setItem('glowsense_demo_session', JSON.stringify({ userId: user.id }));
  return { user: { id: user.id, email: user.email, user_metadata: { name: user.name } }, session: null, demo: true };
}

/* ==================== DATA API ==================== */

export const dataAPI = {
  /* ---- User Profile ---- */
  async getUserProfile(userId) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      return data.profiles[userId] || null;
    }
    const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    return data;
  },

  async upsertUserProfile(userId, profileData) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      data.profiles[userId] = { ...data.profiles[userId], ...profileData, user_id: userId, updated_at: new Date().toISOString() };
      saveDemoData(data);
      return data.profiles[userId];
    }
    const { data, error } = await supabase.from('user_profiles').upsert({ user_id: userId, ...profileData }).select().single();
    if (error) throw error;
    return data;
  },

  /* ---- Assessments ---- */
  async createAssessment(assessment) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const newAssessment = {
        id: 'demo-assess-' + Date.now(),
        ...assessment,
        assessment_date: new Date().toISOString(),
        status: 'completed',
        created_at: new Date().toISOString(),
      };
      data.assessments.push(newAssessment);
      saveDemoData(data);
      return newAssessment;
    }
    const { data, error } = await supabase.from('skin_assessments').insert(assessment).select().single();
    if (error) throw error;
    return data;
  },

  async getAssessments(userId) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      let assessments = data.assessments;
      if (userId) assessments = assessments.filter(a => a.user_id === userId);
      return assessments.sort((a, b) => new Date(b.assessment_date) - new Date(a.assessment_date));
    }
    let query = supabase.from('skin_assessments').select('*').order('assessment_date', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getAssessmentById(id) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      return data.assessments.find(a => a.id === id);
    }
    const { data, error } = await supabase.from('skin_assessments').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async updateAssessment(id, updates) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const idx = data.assessments.findIndex(a => a.id === id);
      if (idx >= 0) {
        data.assessments[idx] = { ...data.assessments[idx], ...updates };
        saveDemoData(data);
        return data.assessments[idx];
      }
      return null;
    }
    const { data, error } = await supabase.from('skin_assessments').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteAssessment(id) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      data.assessments = data.assessments.filter(a => a.id !== id);
      data.concerns = data.concerns.filter(c => c.assessment_id !== id);
      data.risks = data.risks.filter(r => r.assessment_id !== id);
      data.recommendations = data.recommendations.filter(r => r.assessment_id !== id);
      saveDemoData(data);
      return true;
    }
    const { error } = await supabase.from('skin_assessments').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  /* ---- Concerns ---- */
  async addConcerns(assessmentId, concerns) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const newConcerns = concerns.map((c, i) => ({
        id: 'demo-concern-' + Date.now() + '-' + i,
        assessment_id: assessmentId,
        ...c,
        created_at: new Date().toISOString(),
      }));
      data.concerns.push(...newConcerns);
      saveDemoData(data);
      return newConcerns;
    }
    const rows = concerns.map(c => ({ assessment_id: assessmentId, ...c }));
    const { data, error } = await supabase.from('assessment_concerns').insert(rows).select();
    if (error) throw error;
    return data;
  },

  async getConcerns(assessmentId) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      return data.concerns.filter(c => c.assessment_id === assessmentId);
    }
    const { data, error } = await supabase.from('assessment_concerns').select('*').eq('assessment_id', assessmentId);
    if (error) throw error;
    return data || [];
  },

  async getAllConcerns(userAssessmentIds) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      if (userAssessmentIds && userAssessmentIds.length > 0) {
        return data.concerns.filter(c => userAssessmentIds.includes(c.assessment_id));
      }
      return data.concerns;
    }
    let query = supabase.from('assessment_concerns').select('*');
    if (userAssessmentIds && userAssessmentIds.length > 0) {
      query = query.in('assessment_id', userAssessmentIds);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /* ---- Risks ---- */
  async addRisks(assessmentId, risks) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const newRisks = risks.map((r, i) => ({
        id: 'demo-risk-' + Date.now() + '-' + i,
        assessment_id: assessmentId,
        ...r,
        created_at: new Date().toISOString(),
      }));
      data.risks.push(...newRisks);
      saveDemoData(data);
      return newRisks;
    }
    const rows = risks.map(r => ({ assessment_id: assessmentId, ...r }));
    const { data, error } = await supabase.from('assessment_risks').insert(rows).select();
    if (error) throw error;
    return data;
  },

  async getRisks(assessmentId) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      return data.risks.filter(r => r.assessment_id === assessmentId);
    }
    const { data, error } = await supabase.from('assessment_risks').select('*').eq('assessment_id', assessmentId);
    if (error) throw error;
    return data || [];
  },

  async getAllRisks(userAssessmentIds) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      if (userAssessmentIds && userAssessmentIds.length > 0) {
        return data.risks.filter(r => userAssessmentIds.includes(r.assessment_id));
      }
      return data.risks;
    }
    let query = supabase.from('assessment_risks').select('*');
    if (userAssessmentIds && userAssessmentIds.length > 0) {
      query = query.in('assessment_id', userAssessmentIds);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /* ---- Recommendations ---- */
  async addRecommendations(assessmentId, recs) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const newRecs = recs.map((r, i) => ({
        id: 'demo-rec-' + Date.now() + '-' + i,
        assessment_id: assessmentId,
        ...r,
        created_at: new Date().toISOString(),
      }));
      data.recommendations.push(...newRecs);
      saveDemoData(data);
      return newRecs;
    }
    const rows = recs.map(r => ({ assessment_id: assessmentId, ...r }));
    const { data, error } = await supabase.from('recommendations').insert(rows).select();
    if (error) throw error;
    return data;
  },

  async getRecommendations(assessmentId) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      return data.recommendations.filter(r => r.assessment_id === assessmentId);
    }
    const { data, error } = await supabase.from('recommendations').select('*').eq('assessment_id', assessmentId);
    if (error) throw error;
    return data || [];
  },

  /* ---- Consultation Requests ---- */
  async createConsultationRequest(request) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const newReq = {
        id: 'demo-consultreq-' + Date.now(),
        ...request,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      data.consultationRequests.push(newReq);
      saveDemoData(data);
      return newReq;
    }
    const { data, error } = await supabase.from('consultation_requests').insert(request).select().single();
    if (error) throw error;
    return data;
  },

  async getConsultationRequests(userId, role) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      let reqs = data.consultationRequests;
      if (role === 'user' && userId) {
        reqs = reqs.filter(r => r.user_id === userId);
      }
      return reqs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    let query = supabase.from('consultation_requests').select('*').order('created_at', { ascending: false });
    if (role === 'user' && userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async updateConsultationRequest(id, updates) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const idx = data.consultationRequests.findIndex(r => r.id === id);
      if (idx >= 0) {
        data.consultationRequests[idx] = { ...data.consultationRequests[idx], ...updates, updated_at: new Date().toISOString() };
        saveDemoData(data);
        return data.consultationRequests[idx];
      }
      return null;
    }
    const { data, error } = await supabase.from('consultation_requests').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  /* ---- All Users (admin/staff) ---- */
  async getAllProfiles() {
    if (authAPI.isDemoMode()) {
      return getDemoUsers().map(u => ({ ...u, password: undefined }));
    }
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async updateProfile(id, updates) {
    if (authAPI.isDemoMode()) {
      const users = getDemoUsers();
      const idx = users.findIndex(u => u.id === id);
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
        return users[idx];
      }
      return null;
    }
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  /* ---- Routines ---- */
  async createRoutine(routine) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const newRoutine = { id: 'demo-routine-' + Date.now(), ...routine, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      if (!data.routines) data.routines = [];
      data.routines.push(newRoutine);
      saveDemoData(data);
      return newRoutine;
    }
    const { data, error } = await supabase.from('routines').insert(routine).select().single();
    if (error) throw error;
    return data;
  },

  async getRoutines(userId) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      let routines = data.routines || [];
      if (userId) routines = routines.filter(r => r.user_id === userId);
      return routines.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    let query = supabase.from('routines').select('*').order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getLatestRoutine(userId) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const routines = (data.routines || []).filter(r => r.user_id === userId);
      return routines.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;
    }
    const { data, error } = await supabase.from('routines').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    return data;
  },

  async deleteRoutine(id) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      data.routines = (data.routines || []).filter(r => r.id !== id);
      saveDemoData(data);
      return true;
    }
    const { error } = await supabase.from('routines').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  /* ---- Routine Feedback ---- */
  async createFeedback(feedback) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const newFeedback = { id: 'demo-feedback-' + Date.now(), ...feedback, created_at: new Date().toISOString() };
      if (!data.feedback) data.feedback = [];
      data.feedback.push(newFeedback);
      saveDemoData(data);
      return newFeedback;
    }
    const { data, error } = await supabase.from('routine_feedback').insert(feedback).select().single();
    if (error) throw error;
    return data;
  },

  async getFeedback(userId) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      let feedback = data.feedback || [];
      if (userId) feedback = feedback.filter(f => f.user_id === userId);
      return feedback.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    let query = supabase.from('routine_feedback').select('*').order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async updateFeedbackReviewStatus(feedbackId, status) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const feedback = (data.feedback || []).find(f => f.id === feedbackId);
      if (feedback) {
        feedback.review_status = status;
        saveDemoData(data);
      }
      return feedback;
    }
    const { data, error } = await supabase.from('routine_feedback')
      .update({ review_status: status, reviewed_at: new Date().toISOString() })
      .eq('id', feedbackId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /* ---- Adaptive Updates ---- */
  async createAdaptiveUpdate(update) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const newUpdate = { id: 'demo-adaptive-' + Date.now(), ...update, created_at: new Date().toISOString() };
      if (!data.adaptiveUpdates) data.adaptiveUpdates = [];
      data.adaptiveUpdates.push(newUpdate);
      saveDemoData(data);
      return newUpdate;
    }
    const { data, error } = await supabase.from('adaptive_updates').insert(update).select().single();
    if (error) throw error;
    return data;
  },

  async getAdaptiveUpdates(userId) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      let updates = data.adaptiveUpdates || [];
      if (userId) updates = updates.filter(u => u.user_id === userId);
      return updates.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    let query = supabase.from('adaptive_updates').select('*').order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /* ---- Module 7: Skin Health Scores ---- */
  async createSkinHealthScore(record) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const newRecord = { id: 'demo-score-' + Date.now(), ...record, score_date: record.score_date || new Date().toISOString(), created_at: new Date().toISOString() };
      if (!data.skinHealthScores) data.skinHealthScores = [];
      data.skinHealthScores.push(newRecord);
      saveDemoData(data);
      return newRecord;
    }
    const { data, error } = await supabase.from('skin_health_scores').insert(record).select().single();
    if (error) throw error;
    return data;
  },

  async getSkinHealthScores(userId) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      let scores = data.skinHealthScores || [];
      if (userId) scores = scores.filter(s => s.user_id === userId);
      return scores.sort((a, b) => new Date(b.score_date) - new Date(a.score_date));
    }
    let query = supabase.from('skin_health_scores').select('*').order('score_date', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getLatestSkinHealthScore(userId) {
    const scores = await this.getSkinHealthScores(userId);
    return scores[0] || null;
  },

  /* ---- Products ---- */
  async getProducts(category) {
    if (authAPI.isDemoMode()) {
      return getDemoProducts().filter(p => !category || p.category === category);
    }
    let query = supabase.from('products').select('*').order('popularity', { ascending: false });
    if (category) query = query.eq('category', category);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getPopularProducts() {
    if (authAPI.isDemoMode()) {
      return getDemoProducts().sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 6);
    }
    const { data, error } = await supabase.from('products').select('*').order('popularity', { ascending: false }).limit(6);
    if (error) throw error;
    return data || [];
  },

  /* ---- Product Recommendations ---- */
  async createProductRecommendations(recs) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      if (!data.productRecs) data.productRecs = [];
      const newRecs = recs.map((r, i) => ({ id: 'demo-prodrec-' + Date.now() + '-' + i, ...r, created_at: new Date().toISOString() }));
      data.productRecs.push(...newRecs);
      saveDemoData(data);
      return newRecs;
    }
    const { data, error } = await supabase.from('product_recommendations').insert(recs).select();
    if (error) throw error;
    return data;
  },

  async getProductRecommendations(userId) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      let recs = data.productRecs || [];
      if (userId) recs = recs.filter(r => r.user_id === userId);
      return recs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    let query = supabase.from('product_recommendations').select('*').order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /* ---- Ingredients ---- */
  async getIngredients() {
    if (authAPI.isDemoMode()) {
      return getDemoIngredients();
    }
    const { data, error } = await supabase.from('ingredients').select('*').order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getIngredientByName(name) {
    if (authAPI.isDemoMode()) {
      return getDemoIngredients().find(i => i.name === name) || null;
    }
    const { data, error } = await supabase.from('ingredients').select('*').eq('name', name).maybeSingle();
    if (error) throw error;
    return data;
  },

  /* ---- Ingredient Interactions ---- */
  async getIngredientInteractions(ingredients) {
    if (authAPI.isDemoMode()) {
      return getDemoInteractions().filter(i =>
        ingredients.includes(i.ingredient_a) && ingredients.includes(i.ingredient_b)
      );
    }
    const { data, error } = await supabase.from('ingredient_interactions')
      .select('*')
      .in('ingredient_a', ingredients)
      .in('ingredient_b', ingredients);
    if (error) throw error;
    return data || [];
  },

  /* ---- Ingredient Analyses ---- */
  async createIngredientAnalysis(analysis) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const newAnalysis = { id: 'demo-analysis-' + Date.now(), ...analysis, created_at: new Date().toISOString() };
      if (!data.ingredientAnalyses) data.ingredientAnalyses = [];
      data.ingredientAnalyses.push(newAnalysis);
      saveDemoData(data);
      return newAnalysis;
    }
    const { data, error } = await supabase.from('ingredient_analyses').insert(analysis).select().single();
    if (error) throw error;
    return data;
  },

  async getIngredientAnalyses(userId) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      let analyses = data.ingredientAnalyses || [];
      if (userId) analyses = analyses.filter(a => a.user_id === userId);
      return analyses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    let query = supabase.from('ingredient_analyses').select('*').order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /* ---- Stats ---- */
  async getStats() {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const users = getDemoUsers();
      const assessments = data.assessments;
      const highRisk = assessments.filter(a => a.risk_level === 'High' || a.risk_level === 'Very High');
      const scores = assessments.filter(a => a.skin_health_score != null).map(a => a.skin_health_score);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;

      return {
        totalUsers: users.filter(u => u.role === 'user').length,
        totalConsultants: users.filter(u => u.role === 'consultant').length,
        totalDermatologists: users.filter(u => u.role === 'dermatologist').length,
        totalAssessments: assessments.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        pendingConsultations: data.consultationRequests.filter(r => r.status === 'pending').length,
        highRiskAssessments: highRisk.length,
        averageScore: avgScore,
      };
    }

    const [profiles, assessments, consultReqs] = await Promise.all([
      supabase.from('profiles').select('role, status'),
      supabase.from('skin_assessments').select('skin_health_score, risk_level'),
      supabase.from('consultation_requests').select('status'),
    ]);

    const allProfiles = profiles.data || [];
    const allAssessments = assessments.data || [];
    const allReqs = consultReqs.data || [];

    const scores = allAssessments.filter(a => a.skin_health_score != null).map(a => a.skin_health_score);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;

    return {
      totalUsers: allProfiles.filter(p => p.role === 'user').length,
      totalConsultants: allProfiles.filter(p => p.role === 'consultant').length,
      totalDermatologists: allProfiles.filter(p => p.role === 'dermatologist').length,
      totalAssessments: allAssessments.length,
      activeUsers: allProfiles.filter(p => p.status === 'active').length,
      pendingConsultations: allReqs.filter(r => r.status === 'pending').length,
      highRiskAssessments: allAssessments.filter(a => a.risk_level === 'High' || a.risk_level === 'Very High').length,
      averageScore: avgScore,
    };
  },
};

/* ==================== GEMINI API (Edge Functions) ==================== */

export const geminiAPI = {
  async generateRoutine(assessment, userProfile, concerns, feedback, previousAssessments) {
    if (authAPI.isDemoMode() || !hasSupabaseConfig) {
      return this._fallbackRoutine(assessment, userProfile, concerns, feedback);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return this._fallbackRoutine(assessment, userProfile, concerns, feedback);

      const response = await fetch(`${supabaseUrl}/functions/v1/gemini-routine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ assessment, userProfile, concerns, feedback, previousAssessments }),
      });

      if (!response.ok) throw new Error(`Edge function error: ${response.status}`);
      const data = await response.json();
      if (data.error && !data.routine) throw new Error(data.error);
      return data;
    } catch (err) {
      return this._fallbackRoutine(assessment, userProfile, concerns, feedback);
    }
  },

  async generateAdaptiveUpdates(previousAssessment, latestAssessment, userProfile, previousConcerns, latestConcerns, feedback) {
    if (authAPI.isDemoMode() || !hasSupabaseConfig) {
      return this._fallbackAdaptive(previousAssessment, latestAssessment, previousConcerns, latestConcerns, feedback);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return this._fallbackAdaptive(previousAssessment, latestAssessment, previousConcerns, latestConcerns, feedback);

      const response = await fetch(`${supabaseUrl}/functions/v1/gemini-adaptive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ previousAssessment, latestAssessment, userProfile, previousConcerns, latestConcerns, feedback }),
      });

      if (!response.ok) throw new Error(`Edge function error: ${response.status}`);
      const data = await response.json();
      if (data.error && !data.score_trend) throw new Error(data.error);
      return data;
    } catch (err) {
      return this._fallbackAdaptive(previousAssessment, latestAssessment, previousConcerns, latestConcerns, feedback);
    }
  },

  async analyzeIngredient(ingredientName, userProfile, assessment, concerns, feedback, routineIngredients) {
    if (authAPI.isDemoMode() || !hasSupabaseConfig) {
      return this._fallbackIngredientAnalysis(ingredientName, userProfile, assessment, concerns, feedback);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return this._fallbackIngredientAnalysis(ingredientName, userProfile, assessment, concerns, feedback);

      const response = await fetch(`${supabaseUrl}/functions/v1/gemini-ingredient`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ ingredientName, userProfile, assessment, concerns, feedback, routineIngredients }),
      });

      if (!response.ok) throw new Error(`Edge function error: ${response.status}`);
      const data = await response.json();
      if (data.error && !data.ingredient) throw new Error(data.error);
      return data;
    } catch (err) {
      return this._fallbackIngredientAnalysis(ingredientName, userProfile, assessment, concerns, feedback);
    }
  },

  async generateProducts(assessment, userProfile, concerns, feedback, routine) {
    if (authAPI.isDemoMode() || !hasSupabaseConfig) {
      return this._fallbackProducts(assessment, userProfile, concerns, feedback, routine);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return this._fallbackProducts(assessment, userProfile, concerns, feedback, routine);

      const response = await fetch(`${supabaseUrl}/functions/v1/gemini-products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ assessment, userProfile, concerns, feedback, routine }),
      });

      if (!response.ok) throw new Error(`Edge function error: ${response.status}`);
      const data = await response.json();
      if (data.error && !data.products) throw new Error(data.error);
      return data;
    } catch (err) {
      return this._fallbackProducts(assessment, userProfile, concerns, feedback, routine);
    }
  },

  _fallbackProducts(assessment, userProfile, concerns, feedback, routine) {
    const skinType = assessment?.skin_type || userProfile?.skin_type || 'Combination';
    const sensitivity = userProfile?.skin_sensitivity || 'Normal';
    const allergies = (userProfile?.allergies || '').toLowerCase();
    const hasAllergy = (ing) => allergies.includes(ing.toLowerCase());
    const hasFeedbackIrritation = feedback?.some(f => f.experienced_irritation || f.experienced_burning);
    const concernNames = (concerns || []).map(c => c.concern_name);
    const hasAcne = concernNames.includes('Acne');
    const hasDryness = concernNames.includes('Dryness');

    const products = [];

    if (hasAcne || concernNames.includes('Oiliness')) {
      products.push({
        name: 'La Roche-Posay Effaclar Medicated Gel Cleanser', brand: 'La Roche-Posay', category: 'Cleanser',
        key_ingredients: ['Salicylic Acid'],
        why_recommended: `Targets acne and excess oil with salicylic acid${hasFeedbackIrritation ? '. Use every other day if irritation was previously reported.' : '.'}`,
        suitable_skin_types: ['Oily', 'Combination'], suitable_concerns: ['Acne', 'Oiliness'],
        how_to_use: 'Massage onto damp skin morning and evening. Rinse thoroughly.', price_range: '₹1,200-1,600', image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80', is_popular_pick: true,
      });
    } else {
      products.push({
        name: 'CeraVe Hydrating Facial Cleanser', brand: 'CeraVe', category: 'Cleanser',
        key_ingredients: ['Ceramides', 'Hyaluronic Acid'],
        why_recommended: `Gentle non-foaming cleanser ideal for ${skinType} skin.`,
        suitable_skin_types: ['Dry', 'Sensitive', 'Normal'], suitable_concerns: ['Dryness', 'Sensitivity'],
        how_to_use: 'Massage onto damp skin in circular motions. Rinse with lukewarm water.', price_range: '₹800-1,200', image_url: 'https://images.unsplash.com/photo-1608248543803-ba4f208c93cb?w=400&q=80', is_popular_pick: true,
      });
    }

    if (!hasAllergy('niacinamide')) {
      products.push({
        name: 'The Ordinary Niacinamide 10% + Zinc 1%', brand: 'The Ordinary', category: 'Serum',
        key_ingredients: ['Niacinamide'],
        why_recommended: `Helps regulate oil and minimize pores.`,
        suitable_skin_types: ['Oily', 'Combination', 'Sensitive'], suitable_concerns: ['Oiliness', 'Pores', 'Redness'],
        how_to_use: 'Apply a thin layer morning and/or evening before heavier creams.', price_range: '₹550-750', image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80', is_popular_pick: true,
      });
    }

    if (!hasAllergy('retinoid') && sensitivity !== 'Very High' && !hasFeedbackIrritation) {
      products.push({
        name: "Paula's Choice Clinical 0.3% Retinol Treatment", brand: "Paula's Choice", category: 'Treatment',
        key_ingredients: ['Retinoids'],
        why_recommended: `Anti-aging treatment targeting fine lines. Start slow if new to retinoids.`,
        suitable_skin_types: ['Normal', 'Mature'], suitable_concerns: ['Aging', 'Fine Lines'],
        how_to_use: 'Apply a pea-sized amount 2-3 nights per week. Always follow with moisturizer.', price_range: '₹2,500-3,200', image_url: 'https://images.unsplash.com/photo-1591251770167-8c8f8b8d5b8e?w=400&q=80', is_popular_pick: false,
      });
    }

    if (!hasFeedbackIrritation && !hasAllergy('salicylic acid')) {
      products.push({
        name: "Paula's Choice 2% BHA Liquid Exfoliant", brand: "Paula's Choice", category: 'Exfoliant',
        key_ingredients: ['Salicylic Acid'],
        why_recommended: `Gentle BHA exfoliant for pore clearing. Use 2-3 times per week.`,
        suitable_skin_types: ['Oily', 'Combination', 'Normal'], suitable_concerns: ['Acne', 'Blackheads', 'Pores'],
        how_to_use: 'Apply with a cotton pad after cleansing. Start 2x per week and increase gradually.', price_range: '₹1,800-2,500', image_url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf853?w=400&q=80', is_popular_pick: false,
      });
    }

    products.push({
      name: 'CeraVe Moisturizing Cream', brand: 'CeraVe', category: 'Moisturizer',
      key_ingredients: ['Ceramides', 'Hyaluronic Acid'],
      why_recommended: `Barrier-restoring moisturizer for daily hydration.`,
      suitable_skin_types: ['Dry', 'Sensitive', 'Normal', 'Combination'], suitable_concerns: ['Dryness', 'Barrier damage'],
      how_to_use: 'Apply evenly to face and neck after serums. Use morning and evening.', price_range: '₹1,200-1,800', image_url: 'https://images.unsplash.com/photo-1608248543803-ba4f208c93cb?w=400&q=80', is_popular_pick: true,
    });

    products.push({
      name: 'EltaMD UV Clear Broad-Spectrum SPF 46', brand: 'EltaMD', category: 'Sunscreen',
      key_ingredients: ['Niacinamide'],
      why_recommended: `Lightweight, non-comedogenic sunscreen. Essential daily protection.`,
      suitable_skin_types: ['All'], suitable_concerns: ['Sun damage'],
      how_to_use: 'Apply generously as the last step of your morning routine. Reapply every 2 hours when outdoors.', price_range: '₹2,200-3,000', image_url: 'https://images.unsplash.com/photo-1556228852-80b2e1c3b814?w=400&q=80', is_popular_pick: false,
    });

    if (!hasAllergy('hyaluronic acid')) {
      products.push({
        name: 'The Ordinary Hyaluronic Acid 2% + B5', brand: 'The Ordinary', category: 'Night care',
        key_ingredients: ['Hyaluronic Acid'],
        why_recommended: `Multi-depth hydration for plumping fine lines. Apply before moisturizer.`,
        suitable_skin_types: ['All'], suitable_concerns: ['Dryness', 'Dehydration', 'Fine Lines'],
        how_to_use: 'Apply to damp skin before moisturizer, morning and/or evening.', price_range: '₹550-750', image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80', is_popular_pick: false,
      });
    }

    return { products, source: 'rule_based' };
  },

  async analyzeInteractions(ingredients, userProfile, feedback) {
    if (authAPI.isDemoMode() || !hasSupabaseConfig) {
      return this._fallbackInteractions(ingredients, userProfile, feedback);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return this._fallbackInteractions(ingredients, userProfile, feedback);

      const response = await fetch(`${supabaseUrl}/functions/v1/gemini-ingredient`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ mode: 'interaction', ingredients, userProfile, feedback }),
      });

      if (!response.ok) throw new Error(`Edge function error: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (err) {
      return this._fallbackInteractions(ingredients, userProfile, feedback);
    }
  },

  _fallbackRoutine(assessment, userProfile, concerns, feedback) {
    const skinType = assessment?.skin_type || userProfile?.skin_type || 'Combination';
    const morning = [
      { category: 'Cleansing', step: 1, product_type: 'Gentle cleanser', ingredient: 'Glycerin', instructions: 'Cleanse with lukewarm water.' },
      { category: 'Treatment', step: 2, product_type: 'Antioxidant serum', ingredient: 'Vitamin C', instructions: 'Apply to dry skin.' },
      { category: 'Moisturizing', step: 3, product_type: 'Moisturizer', ingredient: 'Ceramides', instructions: 'Apply evenly.' },
      { category: 'Sun Protection', step: 4, product_type: 'Sunscreen SPF 30+', ingredient: 'SPF 30+', instructions: 'Apply generously.' },
    ];
    const evening = [
      { category: 'Cleansing', step: 1, product_type: 'Cleanser', ingredient: 'Glycerin', instructions: 'Double cleanse.' },
      { category: 'Treatment', step: 2, product_type: 'Treatment serum', ingredient: 'Niacinamide', instructions: 'Apply thin layer.' },
      { category: 'Moisturizing', step: 3, product_type: 'Night moisturizer', ingredient: 'Ceramides', instructions: 'Apply evenly.' },
      { category: 'Night Care', step: 4, product_type: 'Sleeping mask', ingredient: 'Hyaluronic Acid', instructions: 'Apply thin layer.' },
    ];
    return {
      routine: {
        morning_routine: morning,
        evening_routine: evening,
        weekly_plan: [
          { day: 'Monday', activity: 'Chemical exfoliation', ingredient: 'AHAs/BHAs', reason: 'Weekly exfoliation.' },
          { day: 'Wednesday', activity: 'Hydrating mask', ingredient: 'Hyaluronic Acid', reason: 'Deep hydration.' },
          { day: 'Friday', activity: 'Purifying mask', ingredient: 'Kaolin Clay', reason: 'Draw out impurities.' },
        ],
        seasonal_recommendations: [
          { season: 'Summer', adjustments: 'Use lighter moisturizer and reapply SPF.' },
          { season: 'Winter', adjustments: 'Use richer moisturizer and humidifier.' },
          { season: 'Monsoon', adjustments: 'Keep skin clean and use non-comedogenic products.' },
          { season: 'Dry weather', adjustments: 'Layer hydration and reduce active frequency.' },
        ],
        summary: `Rule-based routine for ${skinType} skin.`,
        key_ingredients: ['Glycerin', 'Vitamin C', 'Ceramides', 'Niacinamide', 'Hyaluronic Acid'],
      },
      source: 'rule_based',
    };
  },

  _fallbackAdaptive(prev, latest, prevConcerns, latestConcerns, feedback) {
    const prevScore = prev?.skin_health_score || 0;
    const latestScore = latest?.skin_health_score || 0;
    const diff = latestScore - prevScore;
    let trend = 'stable';
    if (diff >= 5) trend = 'improved';
    else if (diff <= -5) trend = 'declined';

    return {
      overall_progress: `Score ${trend} from ${prevScore} to ${latestScore}.`,
      score_trend: trend,
      concern_changes: [],
      routine_adjustments: [],
      source: 'rule_based',
    };
  },

  _fallbackIngredientAnalysis(name, profile, assessment, concerns, feedback) {
    const allergies = (profile?.allergies || '').toLowerCase();
    if (allergies && allergies !== 'none' && allergies.includes(name.toLowerCase())) {
      return {
        ingredient: name, suitability: 'not_recommended', score: 10,
        reason: `Allergy conflict: ${name} matches your recorded allergy.`,
        benefits_for_user: [], cautions_for_user: ['Allergy conflict detected.'],
        recommended_usage: 'Do not use.', alternative_ingredients: [],
        allergy_conflict: true, allergy_conflict_details: `Allergy conflict with ${name}.`,
        source: 'rule_based',
      };
    }
    return {
      ingredient: name, suitability: 'good_match', score: 70,
      reason: `${name} is generally suitable for your skin profile.`,
      benefits_for_user: ['Supports general skin health'],
      cautions_for_user: ['Patch test before full use.'],
      recommended_usage: 'Use as directed.',
      alternative_ingredients: [],
      allergy_conflict: false, allergy_conflict_details: '',
      source: 'rule_based',
    };
  },

  _fallbackInteractions(ingredients, profile, feedback) {
    return {
      overall_risk: 'low', ingredients,
      interactions: [],
      recommended_schedule: 'No known interactions. Use as directed.',
      user_specific_warning: '', source: 'rule_based',
    };
  },
};

/* ==================== GOOGLE OAUTH ==================== */

export const googleAPI = {
  async signInWithGoogle() {
    if (!hasSupabaseConfig) {
      return { error: 'Google sign-in requires Supabase configuration.' };
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/user/dashboard.html` },
    });
    return { data, error };
  },
};

/* ==================== MODULE 6 — PRODUCT INTELLIGENCE ==================== */
/* Transparent, rule-based suitability scoring shared by the AI-generated
   product cards and the full product catalog. Kept deterministic (not an
   LLM call) so every product in the catalog can be scored instantly and the
   reasoning stays auditable. */

const STRONG_ACTIVES = ['retinoid', 'retinol', 'salicylic acid', 'glycolic acid', 'aha', 'bha', 'vitamin c', 'benzoyl peroxide'];

function normalizeList(list) {
  return (Array.isArray(list) ? list : []).map(v => String(v).toLowerCase().trim()).filter(Boolean);
}

function textIncludesAny(haystack, needles) {
  const h = (haystack || '').toLowerCase();
  return needles.some(n => n && h.includes(n));
}

export const productIntelligence = {
  /**
   * Computes a transparent 0-100 suitability score for a single product
   * against the current user's profile, concerns, and feedback history.
   * Returns { score, label, reasons[], conflict, allergyConflict }.
   */
  computeSuitability(product, context = {}) {
    const {
      skinType = '',
      sensitivity = '',
      allergiesText = '',
      concernNames = [],
      previousIngredientIssues = '',
      hasReportedIrritation = false,
    } = context;

    const reasons = [];
    let score = 55;
    let allergyConflict = false;
    let softConflict = false;

    const productSkinTypes = normalizeList(product.suitable_skin_types);
    const productConcerns = normalizeList(product.suitable_concerns);
    const productIngredients = normalizeList(product.key_ingredients);
    const productAllergens = normalizeList(product.allergens);

    // --- Skin type compatibility ---
    if (skinType) {
      const st = skinType.toLowerCase();
      if (productSkinTypes.includes('all') || productSkinTypes.includes(st)) {
        score += 18;
        reasons.push(`Formulated for ${skinType.toLowerCase()} skin`);
      } else if (productSkinTypes.length > 0) {
        reasons.push(`Not specifically formulated for ${skinType.toLowerCase()} skin`);
      }
    }

    // --- Concern compatibility (fuzzy match, e.g. "Visible Pores" ~ "Pores") ---
    const matchedConcerns = concernNames.filter(c => {
      const cl = c.toLowerCase();
      return productConcerns.some(pc => pc.includes(cl) || cl.includes(pc));
    });
    if (matchedConcerns.length > 0) {
      score += Math.min(matchedConcerns.length * 8, 24);
      reasons.push(`Targets your ${matchedConcerns.join(', ').toLowerCase()} concern${matchedConcerns.length > 1 ? 's' : ''}`);
    }

    // --- Allergy conflict (hard negative) ---
    const allergyTerms = (allergiesText || '')
      .split(/[,;]/)
      .map(a => a.trim().toLowerCase())
      .filter(a => a && a !== 'none' && a !== 'n/a');

    for (const term of allergyTerms) {
      const hit = productAllergens.some(a => a.includes(term) || term.includes(a))
        || productIngredients.some(i => i.includes(term) || term.includes(i));
      if (hit) {
        allergyConflict = true;
        reasons.push(`Contains an ingredient matching your recorded allergy ("${term}")`);
        break;
      }
    }

    // --- Previous ingredient issues (soft negative) ---
    if (previousIngredientIssues) {
      const issueTerms = previousIngredientIssues.split(/[,;]/).map(t => t.trim().toLowerCase()).filter(Boolean);
      const hit = issueTerms.some(term => productIngredients.some(i => i.includes(term) || term.includes(i)));
      if (hit) {
        softConflict = true;
        score -= 20;
        reasons.push('Contains an ingredient that previously caused you issues');
      }
    }

    // --- Sensitivity / irritation risk from strong actives ---
    const hasStrongActive = productIngredients.some(i => STRONG_ACTIVES.some(a => i.includes(a)));
    const isHighSensitivity = ['high', 'very high'].includes((sensitivity || '').toLowerCase());
    if (hasStrongActive && (isHighSensitivity || hasReportedIrritation) && !productSkinTypes.includes('sensitive') && !productSkinTypes.includes('all')) {
      score -= 15;
      softConflict = true;
      reasons.push('Contains active ingredients that may increase irritation risk for sensitive skin');
    }

    // --- Clamp and finalize ---
    score = Math.max(5, Math.min(score, 96));
    if (allergyConflict) score = Math.min(score, 15);

    let label = 'not_recommended';
    if (!allergyConflict) {
      if (score >= 82) label = 'excellent_match';
      else if (score >= 62) label = 'good_match';
      else if (score >= 40) label = 'use_with_caution';
    }

    if (reasons.length === 0) {
      reasons.push('General suitability based on your available profile data');
    }

    return {
      score: Math.round(score),
      label,
      reasons,
      conflict: allergyConflict || softConflict,
      allergyConflict,
    };
  },

  /** Builds the shared scoring context from raw records already fetched elsewhere in the app. */
  buildContext(userProfile, concerns, feedback) {
    const concernNames = (concerns || []).map(c => c.concern_name).filter(Boolean);
    const hasReportedIrritation = (feedback || []).some(f => f.experienced_irritation || f.experienced_burning || f.experienced_redness);
    return {
      skinType: userProfile?.skin_type || '',
      sensitivity: userProfile?.skin_sensitivity || '',
      allergiesText: userProfile?.allergies || '',
      previousIngredientIssues: userProfile?.previous_ingredient_issues || '',
      concernNames,
      hasReportedIrritation,
    };
  },

  /**
   * Scores an entire catalog and organizes it into top picks per category,
   * a flat list of conflicting products, and safe alternatives for each
   * conflict (same category, no conflict, highest score).
   */
  organizeCatalog(products, context) {
    const scored = (products || []).map(p => ({ product: p, result: this.computeSuitability(p, context) }));

    const byCategory = {};
    scored.forEach(entry => {
      const cat = entry.product.category || 'Other';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(entry);
    });

    Object.values(byCategory).forEach(list => list.sort((a, b) => b.result.score - a.result.score));

    const conflicts = scored.filter(e => e.result.conflict);
    const alternatives = [];
    conflicts.forEach(({ product }) => {
      const cat = product.category || 'Other';
      const best = (byCategory[cat] || []).find(e => !e.result.conflict && e.product.id !== product.id);
      if (best && !alternatives.some(a => a.alternative.product.id === best.product.id && a.for.id === product.id)) {
        alternatives.push({ for: product, alternative: best });
      }
    });

    return { scored, byCategory, conflicts, alternatives };
  },
};

/* ==================== DEMO DATA HELPERS ==================== */

function getDemoProducts() {
  // Mirrors the real seeded catalog (supabase/migrations/*_module6_product_catalog.sql)
  // so demo mode (no Supabase config) exercises the same Module 6 features.
  return [
    { id: 'demo-prod-1', name: 'CeraVe Hydrating Facial Cleanser', brand: 'CeraVe', category: 'Face Wash', key_ingredients: ['Ceramides', 'Hyaluronic Acid', 'Glycerin'], description: 'Gentle non-foaming cleanser for dry and sensitive skin.', suitable_skin_types: ['Dry', 'Sensitive', 'Normal'], suitable_concerns: ['Dryness', 'Sensitivity'], price_range: '₹800-1,200', price_numeric: 1000, popularity: 95, image_url: 'https://images.unsplash.com/photo-1608248543803-ba4f208c93cb?w=400&q=80', rating: 4.5, tags: ['bestseller', 'highly_rated'], benefits: ['Gentle cleansing', 'Barrier support', 'Non-stripping'], allergens: [], how_to_use: 'Massage onto damp skin in circular motions. Rinse with lukewarm water.', amazon_url: 'https://www.amazon.in/s?k=CeraVe+Hydrating+Cleanser', nykaa_url: 'https://www.nykaa.com/search?q=CeraVe+Hydrating+Cleanser' },
    { id: 'demo-prod-2', name: 'La Roche-Posay Effaclar Purifying Foaming Gel', brand: 'La Roche-Posay', category: 'Face Wash', key_ingredients: ['Zinc PCA', 'Salicylic Acid'], description: 'Foaming cleanser for oily and acne-prone skin.', suitable_skin_types: ['Oily', 'Combination'], suitable_concerns: ['Acne', 'Oiliness'], price_range: '₹1,200-1,600', price_numeric: 1400, popularity: 88, image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80', rating: 4.3, tags: ['bestseller'], benefits: ['Oil control', 'Deep clean', 'Non-comedogenic'], allergens: ['Salicylic Acid'], how_to_use: 'Massage onto damp skin morning and evening. Rinse thoroughly.', amazon_url: 'https://www.amazon.in/s?k=La+Roche+Posay+Effaclar', nykaa_url: 'https://www.nykaa.com/search?q=La+Roche+Posay+Effaclar' },
    { id: 'demo-prod-3', name: 'Cetaphil Gentle Skin Cleanser', brand: 'Cetaphil', category: 'Face Wash', key_ingredients: ['Glycerin', 'Cetyl Alcohol'], description: 'Soap-free gentle cleanser for all skin types.', suitable_skin_types: ['All'], suitable_concerns: ['Sensitivity', 'Dryness'], price_range: '₹500-700', price_numeric: 600, popularity: 91, image_url: 'https://images.unsplash.com/photo-1608248543803-ba4f208c93cb?w=400&q=80', rating: 4.4, tags: ['budget_pick', 'highly_rated'], benefits: ['Gentle', 'Non-irritating', 'Soap-free'], allergens: [], how_to_use: 'Apply to skin and gently massage. Rinse or wipe off.', amazon_url: 'https://www.amazon.in/s?k=Cetaphil+Gentle+Cleanser', nykaa_url: 'https://www.nykaa.com/search?q=Cetaphil+Gentle+Cleanser' },
    { id: 'demo-prod-4', name: 'CeraVe Moisturizing Cream', brand: 'CeraVe', category: 'Moisturizer', key_ingredients: ['Ceramides', 'Hyaluronic Acid'], description: 'Barrier-restoring moisturizer with ceramides.', suitable_skin_types: ['Dry', 'Sensitive', 'Normal'], suitable_concerns: ['Dryness', 'Barrier damage'], price_range: '₹1,200-1,800', price_numeric: 1500, popularity: 93, image_url: 'https://images.unsplash.com/photo-1608248543803-ba4f208c93cb?w=400&q=80', rating: 4.5, tags: ['bestseller', 'highly_rated'], benefits: ['Barrier repair', 'Deep hydration', 'Long-lasting'], allergens: [], how_to_use: 'Apply evenly to face and neck after serums. Use morning and evening.', amazon_url: 'https://www.amazon.in/s?k=CeraVe+Moisturizing+Cream', nykaa_url: 'https://www.nykaa.com/search?q=CeraVe+Moisturizing+Cream' },
    { id: 'demo-prod-5', name: 'Neutrogena Hydro Boost Water Gel', brand: 'Neutrogena', category: 'Moisturizer', key_ingredients: ['Hyaluronic Acid'], description: 'Lightweight water gel moisturizer for oily and combination skin.', suitable_skin_types: ['Oily', 'Combination', 'Normal'], suitable_concerns: ['Dryness', 'Dehydration'], price_range: '₹700-900', price_numeric: 800, popularity: 89, image_url: 'https://images.unsplash.com/photo-1556228852-80b2e1c3b814?w=400&q=80', rating: 4.2, tags: ['budget_pick'], benefits: ['Lightweight hydration', 'Non-greasy', 'Fast-absorbing'], allergens: [], how_to_use: 'Apply to clean skin morning and evening.', amazon_url: 'https://www.amazon.in/s?k=Neutrogena+Hydro+Boost', nykaa_url: 'https://www.nykaa.com/search?q=Neutrogena+Hydro+Boost' },
    { id: 'demo-prod-6', name: 'Minimalist 10% Vitamin B5 Gel Moisturizer', brand: 'Minimalist', category: 'Moisturizer', key_ingredients: ['Vitamin B5', 'Glycerin'], description: 'Lightweight gel moisturizer with panthenol.', suitable_skin_types: ['Oily', 'Combination', 'Sensitive'], suitable_concerns: ['Dryness', 'Sensitivity'], price_range: '₹299-399', price_numeric: 350, popularity: 85, image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80', rating: 4.1, tags: ['budget_pick'], benefits: ['Lightweight', 'Soothing', 'Non-comedogenic'], allergens: [], how_to_use: 'Apply a small amount to face and neck. Use twice daily.', amazon_url: 'https://www.amazon.in/s?k=Minimalist+Vitamin+B5+Moisturizer', nykaa_url: 'https://www.nykaa.com/search?q=Minimalist+Vitamin+B5' },
    { id: 'demo-prod-7', name: 'EltaMD UV Clear Broad-Spectrum SPF 46', brand: 'EltaMD', category: 'Sunscreen', key_ingredients: ['Niacinamide', 'Zinc Oxide'], description: 'Lightweight non-comedogenic sunscreen for acne-prone skin.', suitable_skin_types: ['All'], suitable_concerns: ['Sun damage', 'Acne'], price_range: '₹2,200-3,000', price_numeric: 2600, popularity: 87, image_url: 'https://images.unsplash.com/photo-1556228852-80b2e1c3b814?w=400&q=80', rating: 4.4, tags: ['highly_rated'], benefits: ['Broad-spectrum', 'Non-comedogenic', 'Lightweight'], allergens: [], how_to_use: 'Apply generously as the last step of morning routine. Reapply every 2 hours outdoors.', amazon_url: 'https://www.amazon.in/s?k=EltaMD+UV+Clear', nykaa_url: 'https://www.nykaa.com/search?q=EltaMD+UV+Clear' },
    { id: 'demo-prod-8', name: 'Minimalist SPF 50 Sunscreen', brand: 'Minimalist', category: 'Sunscreen', key_ingredients: ['UV Filters'], description: 'Lightweight matte finish sunscreen with SPF 50.', suitable_skin_types: ['Oily', 'Combination', 'Normal'], suitable_concerns: ['Sun damage'], price_range: '₹299-499', price_numeric: 400, popularity: 86, image_url: 'https://images.unsplash.com/photo-1556228852-80b2e1c3b814?w=400&q=80', rating: 4.0, tags: ['budget_pick'], benefits: ['SPF 50', 'Matte finish', 'Non-greasy'], allergens: [], how_to_use: 'Apply generously 15 minutes before sun exposure. Reapply every 2 hours.', amazon_url: 'https://www.amazon.in/s?k=Minimalist+SPF+50', nykaa_url: 'https://www.nykaa.com/search?q=Minimalist+SPF+50' },
    { id: 'demo-prod-9', name: 'The Ordinary Niacinamide 10% + Zinc 1%', brand: 'The Ordinary', category: 'Serum', key_ingredients: ['Niacinamide', 'Zinc'], description: 'Regulates oil and minimizes pores.', suitable_skin_types: ['Oily', 'Combination'], suitable_concerns: ['Oiliness', 'Pores', 'Redness'], price_range: '₹550-750', price_numeric: 650, popularity: 90, image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80', rating: 4.2, tags: ['bestseller', 'budget_pick'], benefits: ['Oil control', 'Pore minimization', 'Redness reduction'], allergens: [], how_to_use: 'Apply a thin layer morning and/or evening before heavier creams.', amazon_url: 'https://www.amazon.in/s?k=Ordinary+Niacinamide', nykaa_url: 'https://www.nykaa.com/search?q=Ordinary+Niacinamide' },
    { id: 'demo-prod-10', name: 'Mad Hippie Vitamin C Serum', brand: 'Mad Hippie', category: 'Serum', key_ingredients: ['Vitamin C', 'Ferulic Acid'], description: 'Antioxidant serum for brightening and protection.', suitable_skin_types: ['Normal', 'Mature', 'Combination'], suitable_concerns: ['Dullness', 'Pigmentation'], price_range: '₹2,000-2,800', price_numeric: 2400, popularity: 85, image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80', rating: 4.3, tags: ['highly_rated'], benefits: ['Brightening', 'Antioxidant', 'Fades spots'], allergens: ['Vitamin C'], how_to_use: 'Apply 3-4 drops to clean dry skin in the morning before moisturizer.', amazon_url: 'https://www.amazon.in/s?k=Mad+Hippie+Vitamin+C', nykaa_url: 'https://www.nykaa.com/search?q=Mad+Hippie+Vitamin+C' },
    { id: 'demo-prod-11', name: 'The Ordinary Hyaluronic Acid 2% + B5', brand: 'The Ordinary', category: 'Serum', key_ingredients: ['Hyaluronic Acid', 'Vitamin B5'], description: 'Multi-depth hydration serum.', suitable_skin_types: ['All'], suitable_concerns: ['Dryness', 'Dehydration', 'Fine Lines'], price_range: '₹550-750', price_numeric: 650, popularity: 92, image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80', rating: 4.3, tags: ['bestseller', 'budget_pick'], benefits: ['Deep hydration', 'Plumping', 'Non-irritating'], allergens: [], how_to_use: 'Apply to damp skin before moisturizer, morning and/or evening.', amazon_url: 'https://www.amazon.in/s?k=Ordinary+Hyaluronic+Acid', nykaa_url: 'https://www.nykaa.com/search?q=Ordinary+Hyaluronic+Acid' },
    { id: 'demo-prod-12', name: "Paula's Choice 2% BHA Liquid Exfoliant", brand: "Paula's Choice", category: 'Treatment', key_ingredients: ['Salicylic Acid'], description: 'Gentle BHA exfoliant for pore clearing.', suitable_skin_types: ['Oily', 'Combination', 'Normal'], suitable_concerns: ['Acne', 'Pores'], price_range: '₹1,800-2,500', price_numeric: 2100, popularity: 87, image_url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf853?w=400&q=80', rating: 4.4, tags: ['bestseller', 'highly_rated'], benefits: ['Exfoliates pores', 'Clears acne', 'Smooths skin'], allergens: ['Salicylic Acid'], how_to_use: 'Apply with cotton pad after cleansing. Start 2x per week and increase gradually.', amazon_url: 'https://www.amazon.in/s?k=Paula+Choice+BHA', nykaa_url: 'https://www.nykaa.com/search?q=Paula+Choice+BHA' },
    { id: 'demo-prod-13', name: 'Minimalist 0.3% Retinol Serum', brand: 'Minimalist', category: 'Treatment', key_ingredients: ['Retinoids'], description: 'Anti-aging retinol treatment.', suitable_skin_types: ['Normal', 'Mature'], suitable_concerns: ['Aging', 'Fine Lines'], price_range: '₹599-799', price_numeric: 700, popularity: 83, image_url: 'https://images.unsplash.com/photo-1591251770167-8c8f8b8d5b8e?w=400&q=80', rating: 4.1, tags: ['budget_pick'], benefits: ['Anti-aging', 'Smooths texture'], allergens: ['Retinoids'], how_to_use: 'Apply pea-sized amount 2-3 nights per week. Always follow with moisturizer.', amazon_url: 'https://www.amazon.in/s?k=Minimalist+Retinol', nykaa_url: 'https://www.nykaa.com/search?q=Minimalist+Retinol' },
    { id: 'demo-prod-14', name: "Paula's Choice Enriched Calming Toner", brand: "Paula's Choice", category: 'Toner', key_ingredients: ['Ceramides', 'Glycerin'], description: 'Hydrating toner for dry and sensitive skin.', suitable_skin_types: ['Dry', 'Sensitive'], suitable_concerns: ['Dryness', 'Sensitivity'], price_range: '₹1,500-2,000', price_numeric: 1750, popularity: 80, image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80', rating: 4.2, tags: [], benefits: ['Hydrating', 'Soothing', 'Alcohol-free'], allergens: [], how_to_use: 'Apply after cleansing with a cotton pad or hands. Follow with serum.', amazon_url: 'https://www.amazon.in/s?k=Paula+Choice+Calming+Toner', nykaa_url: 'https://www.nykaa.com/search?q=Paula+Choice+Toner' },
    { id: 'demo-prod-15', name: 'Plum Green Tea Alcohol-Free Toner', brand: 'Plum', category: 'Toner', key_ingredients: ['Green Tea', 'Glycerin'], description: 'Alcohol-free toner for oily and combination skin.', suitable_skin_types: ['Oily', 'Combination'], suitable_concerns: ['Oiliness', 'Acne'], price_range: '₹290-390', price_numeric: 340, popularity: 82, image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80', rating: 4.0, tags: ['budget_pick'], benefits: ['Oil control', 'Refreshing', 'Alcohol-free'], allergens: [], how_to_use: 'Apply after cleansing with a cotton pad. Use twice daily.', amazon_url: 'https://www.amazon.in/s?k=Plum+Green+Tea+Toner', nykaa_url: 'https://www.nykaa.com/search?q=Plum+Green+Tea+Toner' },
    { id: 'demo-prod-16', name: 'The Ordinary Salicylic Acid 2% Masque', brand: 'The Ordinary', category: 'Face Mask', key_ingredients: ['Salicylic Acid', 'Charcoal'], description: 'Clarifying mask for congested and oily skin.', suitable_skin_types: ['Oily', 'Combination'], suitable_concerns: ['Acne', 'Oiliness'], price_range: '₹750-950', price_numeric: 850, popularity: 84, image_url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf853?w=400&q=80', rating: 4.1, tags: [], benefits: ['Deep clean', 'Pore clearing', 'Oil control'], allergens: ['Salicylic Acid'], how_to_use: 'Apply thin layer to clean skin. Leave 10 minutes. Rinse. Use 1-2x per week.', amazon_url: 'https://www.amazon.in/s?k=Ordinary+Salicylic+Masque', nykaa_url: 'https://www.nykaa.com/search?q=Ordinary+Salicylic+Masque' },
    { id: 'demo-prod-17', name: 'Cetaphil Pro Dermacontrol Purifying Clay Mask', brand: 'Cetaphil', category: 'Face Mask', key_ingredients: ['Clay', 'Niacinamide'], description: 'Purifying clay mask for oily skin.', suitable_skin_types: ['Oily', 'Combination'], suitable_concerns: ['Oiliness', 'Pores'], price_range: '₹600-800', price_numeric: 700, popularity: 81, image_url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf853?w=400&q=80', rating: 4.0, tags: ['budget_pick'], benefits: ['Oil absorption', 'Pore refining', 'Gentle'], allergens: [], how_to_use: 'Apply to clean skin. Leave 10-15 minutes. Rinse. Use 1-2x per week.', amazon_url: 'https://www.amazon.in/s?k=Cetaphil+Clay+Mask', nykaa_url: 'https://www.nykaa.com/search?q=Cetaphil+Clay+Mask' },
    { id: 'demo-prod-18', name: 'La Roche-Posay Anthelios SPF 50+', brand: 'La Roche-Posay', category: 'Sunscreen', key_ingredients: ['UV Filters', 'Antioxidants'], description: 'High protection sunscreen for sensitive skin.', suitable_skin_types: ['Sensitive', 'All'], suitable_concerns: ['Sun damage', 'Sensitivity'], price_range: '₹1,800-2,200', price_numeric: 2000, popularity: 84, image_url: 'https://images.unsplash.com/photo-1556228852-80b2e1c3b814?w=400&q=80', rating: 4.3, tags: ['highly_rated'], benefits: ['High SPF', 'Sensitive-safe', 'Non-greasy'], allergens: [], how_to_use: 'Apply generously to face and neck before sun exposure.', amazon_url: 'https://www.amazon.in/s?k=La+Roche+Posay+Anthelios', nykaa_url: 'https://www.nykaa.com/search?q=La+Roche+Posay+Anthelios' },
  ];
}

function getDemoIngredients() {
  return [
    { id: 'demo-ing-1', name: 'Retinoids', category: 'Retinoid', description: 'Vitamin A derivatives for anti-aging.', benefits: ['Reduces fine lines', 'Improves texture', 'Clears acne'], suitable_skin_types: ['Oily', 'Combination', 'Mature'], common_concerns: ['Aging', 'Acne'], cautions: ['Can cause dryness', 'Use SPF'], common_interactions: ['AHAs/BHAs', 'Vitamin C'], education: 'Start low and go slow.' },
    { id: 'demo-ing-2', name: 'Niacinamide', category: 'Vitamin B3', description: 'Vitamin B3 for barrier and oil control.', benefits: ['Strengthens barrier', 'Regulates oil', 'Reduces redness'], suitable_skin_types: ['Oily', 'Dry', 'Sensitive'], common_concerns: ['Oiliness', 'Redness', 'Pores'], cautions: ['Rare flushing'], common_interactions: [], education: 'Versatile and well-tolerated.' },
    { id: 'demo-ing-3', name: 'Vitamin C', category: 'Antioxidant', description: 'Antioxidant for brightening.', benefits: ['Brightens', 'Antioxidant', 'Fades spots'], suitable_skin_types: ['Normal', 'Mature'], common_concerns: ['Dullness', 'Hyperpigmentation'], cautions: ['Can oxidize', 'May irritate'], common_interactions: ['Retinoids'], education: 'Use in the morning.' },
    { id: 'demo-ing-4', name: 'Hyaluronic Acid', category: 'Hydrator', description: 'Humectant for hydration.', benefits: ['Intense hydration', 'Plumps fine lines'], suitable_skin_types: ['All'], common_concerns: ['Dryness', 'Dehydration'], cautions: [], common_interactions: [], education: 'Apply to damp skin.' },
    { id: 'demo-ing-5', name: 'Salicylic Acid', category: 'BHA', description: 'BHA for pore clearing.', benefits: ['Exfoliates pores', 'Clears acne', 'Reduces blackheads'], suitable_skin_types: ['Oily', 'Combination'], common_concerns: ['Acne', 'Blackheads'], cautions: ['Can dry skin', 'Start slow'], common_interactions: ['Retinoids', 'Vitamin C'], education: 'Start 2-3x per week.' },
    { id: 'demo-ing-6', name: 'Ceramides', category: 'Barrier Repair', description: 'Lipids for barrier repair.', benefits: ['Repairs barrier', 'Locks in moisture'], suitable_skin_types: ['All'], common_concerns: ['Dryness', 'Sensitivity'], cautions: [], common_interactions: [], education: 'Safe for all skin types.' },
    { id: 'demo-ing-7', name: 'Peptides', category: 'Anti-aging', description: 'Amino acids for collagen.', benefits: ['Boosts collagen', 'Improves firmness'], suitable_skin_types: ['Normal', 'Mature'], common_concerns: ['Aging', 'Fine Lines'], cautions: [], common_interactions: ['AHAs/BHAs'], education: 'Use consistently for months.' },
    { id: 'demo-ing-8', name: 'AHAs/BHAs', category: 'Chemical Exfoliant', description: 'Acids for exfoliation.', benefits: ['Exfoliates', 'Improves radiance'], suitable_skin_types: ['Normal', 'Oily', 'Mature'], common_concerns: ['Dullness', 'Hyperpigmentation'], cautions: ['Start slow', 'Use SPF'], common_interactions: ['Retinoids', 'Vitamin C'], education: 'Never combine with retinoids.' },
  ];
}

function getDemoInteractions() {
  return [
    { id: 'demo-int-1', ingredient_a: 'Retinoids', ingredient_b: 'AHAs/BHAs', risk_level: 'high', description: 'High irritation risk.', recommended_schedule: 'Alternate nights.' },
    { id: 'demo-int-2', ingredient_a: 'Retinoids', ingredient_b: 'Vitamin C', risk_level: 'moderate', description: 'pH incompatibility.', recommended_schedule: 'Vitamin C morning, retinoids night.' },
    { id: 'demo-int-3', ingredient_a: 'Retinoids', ingredient_b: 'Salicylic Acid', risk_level: 'high', description: 'High irritation risk.', recommended_schedule: 'Alternate nights.' },
    { id: 'demo-int-4', ingredient_a: 'Vitamin C', ingredient_b: 'AHAs/BHAs', risk_level: 'moderate', description: 'Low pH conflict.', recommended_schedule: 'Separate AM/PM.' },
    { id: 'demo-int-5', ingredient_a: 'Salicylic Acid', ingredient_b: 'AHAs/BHAs', risk_level: 'moderate', description: 'Over-exfoliation risk.', recommended_schedule: 'Alternate days.' },
    { id: 'demo-int-6', ingredient_a: 'Peptides', ingredient_b: 'AHAs/BHAs', risk_level: 'moderate', description: 'Acids may degrade peptides.', recommended_schedule: 'Separate AM/PM.' },
  ];
}

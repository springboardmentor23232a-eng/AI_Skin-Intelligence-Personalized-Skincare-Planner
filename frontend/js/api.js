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

/* ==================== DEMO DATA HELPERS ==================== */

function getDemoProducts() {
  return [
    { id: 'demo-prod-1', name: 'Gentle Skin Cleanser', brand: 'CeraVe', category: 'Cleanser', key_ingredients: ['Ceramides', 'Hyaluronic Acid'], description: 'Gentle non-foaming cleanser.', suitable_skin_types: ['Dry', 'Sensitive', 'Normal'], suitable_concerns: ['Dryness', 'Sensitivity'], price_range: '₹800-1,200', popularity: 95 },
    { id: 'demo-prod-2', name: 'Salicylic Acid Cleanser', brand: 'La Roche-Posay', category: 'Cleanser', key_ingredients: ['Salicylic Acid'], description: 'Daily cleanser for acne-prone skin.', suitable_skin_types: ['Oily', 'Combination'], suitable_concerns: ['Acne', 'Oiliness'], price_range: '₹1,200-1,600', popularity: 88 },
    { id: 'demo-prod-3', name: 'Hyaluronic Acid Serum', brand: 'The Ordinary', category: 'Serum', key_ingredients: ['Hyaluronic Acid'], description: 'Multi-depth hydration serum.', suitable_skin_types: ['Dry', 'Oily', 'Normal', 'Sensitive'], suitable_concerns: ['Dryness', 'Dehydration'], price_range: '₹550-750', popularity: 92 },
    { id: 'demo-prod-4', name: 'Niacinamide 10% + Zinc 1%', brand: 'The Ordinary', category: 'Serum', key_ingredients: ['Niacinamide'], description: 'Blemish formula.', suitable_skin_types: ['Oily', 'Combination'], suitable_concerns: ['Oiliness', 'Pores'], price_range: '₹550-750', popularity: 90 },
    { id: 'demo-prod-5', name: 'Vitamin C Serum 15%', brand: 'Mad Hippie', category: 'Serum', key_ingredients: ['Vitamin C'], description: 'Brightening serum.', suitable_skin_types: ['Normal', 'Mature'], suitable_concerns: ['Dullness', 'Hyperpigmentation'], price_range: '₹2,000-2,800', popularity: 85 },
    { id: 'demo-prod-6', name: 'Retinol 0.3% Serum', brand: 'Paulas Choice', category: 'Treatment', key_ingredients: ['Retinoids'], description: 'Anti-aging retinol.', suitable_skin_types: ['Normal', 'Mature'], suitable_concerns: ['Aging', 'Fine Lines'], price_range: '₹2,500-3,200', popularity: 87 },
    { id: 'demo-prod-7', name: 'Moisturizing Cream', brand: 'CeraVe', category: 'Moisturizer', key_ingredients: ['Ceramides', 'Hyaluronic Acid'], description: 'Barrier-restoring moisturizer.', suitable_skin_types: ['Dry', 'Sensitive'], suitable_concerns: ['Dryness', 'Barrier damage'], price_range: '₹1,200-1,800', popularity: 93 },
    { id: 'demo-prod-8', name: 'Daily Sunscreen SPF 50', brand: 'EltaMD', category: 'Sunscreen', key_ingredients: ['Niacinamide'], description: 'Broad-spectrum SPF 50.', suitable_skin_types: ['All'], suitable_concerns: ['Sun damage'], price_range: '₹2,200-3,000', popularity: 89 },
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

import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/auth", "") : "http://127.0.0.1:8000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("skin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Module 2: Skin Profile APIs
  getProfile: async () => {
    const res = await apiClient.get("/profile");
    return res.data;
  },

  createProfile: async (data) => {
    const res = await apiClient.post("/profile", data);
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await apiClient.put("/profile", data);
    return res.data;
  },

  deleteProfile: async () => {
    const res = await apiClient.delete("/profile");
    return res.data;
  },

  // Module 3: Skin Assessment APIs
  createAssessment: async (data) => {
    const res = await apiClient.post("/assessment", data);
    return res.data;
  },

  getAssessmentHistory: async () => {
    const res = await apiClient.get("/assessment/history");
    return res.data;
  },

  getAssessmentDetail: async (id) => {
    const res = await apiClient.get(`/assessment/${id}`);
    return res.data;
  },

  // Module 4: Routine Generator APIs
  generateRoutines: async () => {
    const res = await apiClient.post("/routines/generate");
    return res.data;
  },

  getRoutines: async () => {
    const res = await apiClient.get("/routines");
    return res.data;
  },

  getRoutineByType: async (routineType) => {
    const res = await apiClient.get(`/routines/${routineType}`);
    return res.data;
  },

  deleteRoutine: async (id) => {
    const res = await apiClient.delete(`/routines/${id}`);
    return res.data;
  },

  // Module 5: Ingredient Intelligence APIs
  getIngredients: async () => {
    const res = await apiClient.get("/ingredients");
    return res.data;
  },

  getIngredientDetail: async (id) => {
    const res = await apiClient.get(`/ingredients/${id}`);
    return res.data;
  },

  checkIngredientCompatibility: async (selected_ingredients) => {
    const res = await apiClient.post("/ingredients/check-compatibility", { selected_ingredients });
    return res.data;
  },

  // Module 6: Product Database APIs
  getProducts: async (params = {}) => {
    const res = await apiClient.get("/products", { params });
    return res.data;
  },

  getProductDetail: async (id) => {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  },

  seedProducts: async () => {
    const res = await apiClient.post("/products/seed");
    return res.data;
  },

  createProduct: async (data) => {
    const res = await apiClient.post("/products", data);
    return res.data;
  },

  // Module 7: AI Product Recommendation Engine APIs
  generateRecommendations: async (budget_tier = "ALL") => {
    const res = await apiClient.post("/recommendations/generate", { budget_tier });
    return res.data;
  },

  getRecommendationHistory: async () => {
    const res = await apiClient.get("/recommendations/history");
    return res.data;
  },

  compareProducts: async (product_ids) => {
    const res = await apiClient.post("/recommendations/compare", { product_ids });
    return res.data;
  },

  getProductAlternatives: async (product_id) => {
    const res = await apiClient.get(`/recommendations/alternatives/${product_id}`);
    return res.data;
  },

  // Module 8: Phase 5 Skin Health Analytics & Progress Tracking
  getSkinHealthTrends: async () => {
    const res = await apiClient.get("/analytics/history");
    return res.data;
  },

  getRoutineLogs: async (start_date, end_date) => {
    const params = {};
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;
    const res = await apiClient.get("/analytics/routines/logs", { params });
    return res.data;
  },

  logRoutine: async (data) => {
    const res = await apiClient.post("/analytics/routines/logs", data);
    return res.data;
  },

  getProgressEntries: async () => {
    const res = await apiClient.get("/analytics/progress");
    return res.data;
  },

  createProgressEntry: async (data) => {
    const res = await apiClient.post("/analytics/progress", data);
    return res.data;
  },

  // Module 9: Phase 6 Clinical Workspace APIs
  getClinicalStats: async () => {
    const res = await apiClient.get("/clinical/stats");
    return res.data;
  },

  getPatients: async (params = {}) => {
    const res = await apiClient.get("/clinical/patients", { params });
    return res.data;
  },

  getPatientDetail: async (patientId) => {
    const res = await apiClient.get(`/clinical/patients/${patientId}`);
    return res.data;
  },

  getConsultations: async (params = {}) => {
    const res = await apiClient.get("/clinical/consultations", { params });
    return res.data;
  },

  scheduleConsultation: async (data) => {
    const res = await apiClient.post("/clinical/consultations", data);
    return res.data;
  },

  updateConsultation: async (id, data) => {
    const res = await apiClient.put(`/clinical/consultations/${id}`, data);
    return res.data;
  },

  submitClinicalReview: async (data) => {
    const res = await apiClient.post("/clinical/reviews", data);
    return res.data;
  },

  // Module 10: Phase 7 Notifications, Reminders & Export APIs
  getNotifications: async () => {
    const res = await apiClient.get("/notifications");
    return res.data;
  },

  markNotificationRead: async (id) => {
    const res = await apiClient.put(`/notifications/${id}/read`);
    return res.data;
  },

  markAllNotificationsRead: async () => {
    const res = await apiClient.post("/notifications/read-all");
    return res.data;
  },

  deleteNotification: async (id) => {
    const res = await apiClient.delete(`/notifications/${id}`);
    return res.data;
  },

  getReminderSettings: async () => {
    const res = await apiClient.get("/reminders/settings");
    return res.data;
  },

  updateReminderSettings: async (data) => {
    const res = await apiClient.post("/reminders/settings", data);
    return res.data;
  },

  triggerReminders: async () => {
    const res = await apiClient.post("/reminders/trigger");
    return res.data;
  },

  getReportSummary: async () => {
    const res = await apiClient.get("/reports/summary");
    return res.data;
  },

  downloadReport: async (format) => {
    const res = await apiClient.get(`/reports/export?format=${format}`, {
      responseType: 'blob'
    });
    const blob = new Blob([res.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `skin_intelligence_report.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};


export default apiService;


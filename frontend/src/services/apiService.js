import axios from "axios";

const getBaseApiUrl = () => {
  if (import.meta.env.PROD) {
    const custom = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
    if (custom && !custom.includes("localhost") && !custom.includes("127.0.0.1")) {
      return custom.replace(/\/auth\/?$/, "").replace(/\/+$/, "");
    }
    return "/api";
  }
  const devUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "/api";
  return devUrl.replace(/\/auth\/?$/, "").replace(/\/+$/, "");
};
const API_BASE_URL = getBaseApiUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && typeof error.response?.data?.detail === "string" && error.response.data.detail.toLowerCase().includes("suspended")) {
      localStorage.removeItem("skin_token");
      localStorage.removeItem("skin_refresh_token");
      localStorage.removeItem("skin_user");
    }
    return Promise.reject(error);
  }
);

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

  // Module 3: Skin Assessment & Vision Analysis APIs
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

  // Phase 7: Skin Health Scoring Engine
  getSkinHealthScore: async () => {
    const res = await apiClient.get("/scoring/skin-health");
    return res.data;
  },

  uploadImageAnalysis: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post("/image-analysis/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },

  webcamImageAnalysis: async (base64Image, filename = "webcam_capture.png") => {
    const formData = new FormData();
    formData.append("image_data", base64Image);
    formData.append("filename", filename);
    const res = await apiClient.post("/image-analysis/webcam", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },

  getImageAnalysisHistory: async () => {
    const res = await apiClient.get("/image-analysis/history");
    return res.data;
  },

  getImageAnalysisDetail: async (id) => {
    const res = await apiClient.get(`/image-analysis/${id}`);
    return res.data;
  },

  deleteImageAnalysis: async (id) => {
    const res = await apiClient.delete(`/image-analysis/${id}`);
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

  updateRoutine: async (id, routineData) => {
    const res = await apiClient.put(`/routines/${id}`, routineData);
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

  uploadProgressPhoto: async (formData) => {
    const res = await apiClient.post("/analytics/progress/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
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
    // 1. Request report as blob with status validation
    const res = await apiClient.get(`/reports/export?format=${format}`, {
      responseType: 'blob',
      validateStatus: (status) => status < 500
    });

    const contentType = (res.headers['content-type'] || '').toLowerCase();

    // 2. Handle HTTP errors >= 400
    if (res.status >= 400) {
      let errorMsg = `Failed to generate ${format.toUpperCase()} report (HTTP ${res.status})`;
      if (res.status === 401) {
        errorMsg = "Your session has expired. Please sign in again.";
      } else if (res.status === 403) {
        errorMsg = "Access denied: You do not have permission to export this report.";
      } else {
        try {
          const text = await res.data.text();
          const json = JSON.parse(text);
          if (json.detail) errorMsg = json.detail;
        } catch {}
      }
      throw new Error(errorMsg);
    }

    // 3. Reject JSON or HTML error responses masquerading as report files
    if (contentType.includes('application/json') || contentType.includes('text/html')) {
      let errorMsg = "Server returned an error instead of a report file.";
      try {
        const text = await res.data.text();
        const json = JSON.parse(text);
        if (json.detail) errorMsg = json.detail;
      } catch {}
      throw new Error(errorMsg);
    }

    // 4. Validate binary magic bytes before triggering download
    const arrayBuffer = await res.data.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    if (bytes.length === 0) {
      throw new Error(`The generated ${format.toUpperCase()} file is empty.`);
    }

    if (format === 'pdf') {
      // Must start with '%PDF-' (0x25, 0x50, 0x44, 0x46, 0x2D)
      const header = String.fromCharCode(...bytes.slice(0, 5));
      if (!header.startsWith('%PDF-')) {
        let errorDetail = "Invalid PDF binary structure received from server.";
        try {
          const text = new TextDecoder().decode(bytes.slice(0, 250));
          if (text.includes('detail')) {
            const json = JSON.parse(text);
            errorDetail = json.detail || errorDetail;
          }
        } catch {}
        throw new Error(errorDetail);
      }
    } else if (format === 'xlsx') {
      // Must start with ZIP magic bytes 'PK' (0x50, 0x4B)
      if (bytes.length < 4 || bytes[0] !== 0x50 || bytes[1] !== 0x4B) {
        let errorDetail = "Invalid Excel workbook binary received from server.";
        try {
          const text = new TextDecoder().decode(bytes.slice(0, 250));
          if (text.includes('detail')) {
            const json = JSON.parse(text);
            errorDetail = json.detail || errorDetail;
          }
        } catch {}
        throw new Error(errorDetail);
      }
    } else if (format === 'csv') {
      const preview = new TextDecoder().decode(bytes.slice(0, 100));
      if (preview.startsWith('<!DOCTYPE') || preview.startsWith('<html') || preview.startsWith('{"detail"')) {
        throw new Error("Invalid CSV stream: Server returned an HTML or JSON error document.");
      }
    }

    // 5. Extract exact filename from Content-Disposition header
    let filename = `skin-health-report.${format}`;
    const disposition = res.headers['content-disposition'];
    if (disposition) {
      const utf8Match = disposition.match(/filename\*=UTF-8''([^;\s]+)/i);
      if (utf8Match && utf8Match[1]) {
        filename = decodeURIComponent(utf8Match[1]);
      } else {
        // Match filename= and strip any surrounding quotes from the captured value
        const match = disposition.match(/filename=["']?([^"';\r\n]+)["']?/i);
        if (match && match[1]) {
          filename = match[1].trim().replace(/^["']+|["']+$/g, '');
        }
      }
    }
    // Ensure the filename always has the correct extension as a safety net
    if (!filename.endsWith(`.${format}`)) {
      filename = `skin-health-report.${format}`;
    }

    // 6. Authoritative MIME type
    let mimeType = contentType;
    if (format === 'pdf') mimeType = 'application/pdf';
    else if (format === 'xlsx') mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    else if (format === 'csv') mimeType = 'text/csv; charset=utf-8';

    // Construct a native File object with explicit filename and authoritative MIME type
    let downloadSource;
    try {
      downloadSource = new File([arrayBuffer], filename, { type: mimeType });
    } catch {
      // Fallback to Blob if File constructor is not supported
      downloadSource = new Blob([arrayBuffer], { type: mimeType });
    }

    // 7. Standard robust browser download:
    // Create object URL from File/Blob
    const blobUrl = window.URL.createObjectURL(downloadSource);
    const anchor = document.createElement('a');
    anchor.style.display = 'none';
    anchor.href = blobUrl;
    anchor.download = filename;
    anchor.setAttribute('download', filename);
    // Note: Do NOT set anchor.rel = 'noopener noreferrer'. In Chromium, rel="noreferrer"
    // on a blob URL strips origin context, causing Chromium to ignore the download attribute
    // and fall back to the blob's internal UUID without an extension.
    document.body.appendChild(anchor);

    // Call native anchor.click() to invoke Chromium's default download action
    anchor.click();

    // Do NOT remove anchor immediately or synchronously — delay removal by 2000ms
    // so Chromium's asynchronous download coordinator has access to the DOM node and attributes
    window.setTimeout(() => {
      if (document.body.contains(anchor)) {
        document.body.removeChild(anchor);
      }
    }, 2000);

    // Revoke object URL after a generous timeout (60,000ms) to ensure file streaming to disk finishes
    window.setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 60000);

    return { success: true, filename, size: bytes.length };
  },

  // Module 11: Progress Analytics & Adherence APIs
  getAdherenceAnalytics: async () => {
    const res = await apiClient.get("/analytics/adherence");
    return res.data;
  },

  getImprovementAnalysis: async () => {
    const res = await apiClient.get("/analytics/improvements");
    return res.data;
  },

  deleteProgressPhoto: async (photoId) => {
    const res = await apiClient.delete(`/analytics/progress/${photoId}`);
    return res.data;
  },

  // Module 12: Admin Management & System Telemetry APIs
  getAdminStats: async () => {
    const res = await apiClient.get("/admin/stats");
    return res.data;
  },

  getAdminSummaryReport: async () => {
    const res = await apiClient.get("/reports/admin/summary");
    return res.data;
  },

  getAdminUsers: async (params = {}) => {
    const res = await apiClient.get("/admin/users", { params });
    return res.data;
  },

  getAdminUserDetail: async (userId) => {
    const res = await apiClient.get(`/admin/users/${userId}`);
    return res.data;
  },

  updateUserStatus: async (userId, status, reason = "") => {
    const res = await apiClient.patch(`/admin/users/${userId}/status`, { status, reason });
    return res.data;
  },

  updateUserRole: async (userId, role) => {
    const res = await apiClient.patch(`/admin/users/${userId}/role`, { role });
    return res.data;
  },

  deleteUser: async (userId) => {
    const res = await apiClient.delete(`/admin/users/${userId}`);
    return res.data;
  },

  getAdminAuditLogs: async (params = {}) => {
    const res = await apiClient.get("/admin/audit-logs", { params });
    return res.data;
  },

  // Aliases for admin methods
  getAdminUserDetails: async (userId) => {
    const res = await apiClient.get(`/admin/users/${userId}`);
    return res.data;
  },
  updateAdminUserStatus: async (userId, status, reason = "") => {
    const res = await apiClient.patch(`/admin/users/${userId}/status`, { status, reason });
    return res.data;
  },
  updateAdminUserRole: async (userId, role) => {
    const res = await apiClient.patch(`/admin/users/${userId}/role`, { role });
    return res.data;
  }
};


export default apiService;


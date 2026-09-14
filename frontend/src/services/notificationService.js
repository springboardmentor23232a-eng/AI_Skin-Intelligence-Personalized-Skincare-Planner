import api from './api';

/**
 * Retrieves paginated notifications with optional type and unread filters.
 */
export const getNotifications = async (page = 1, limit = 20, type = 'ALL', unreadOnly = false) => {
  let url = `/api/notifications?page=${page}&limit=${limit}`;
  if (type && type !== 'ALL') {
    url += `&type=${type}`;
  }
  if (unreadOnly) {
    url += `&unread_only=true`;
  }
  const response = await api.get(url);
  return response.data;
};

/**
 * Retrieves live unread notifications counter for header bell.
 */
export const getUnreadCount = async () => {
  const response = await api.get('/api/notifications/unread-count');
  return response.data;
};

/**
 * Marks a single notification as read.
 */
export const markAsRead = async (id) => {
  const response = await api.put(`/api/notifications/${id}/read`);
  return response.data;
};

/**
 * Marks all notifications for current user as read.
 */
export const markAllAsRead = async () => {
  const response = await api.put('/api/notifications/read-all');
  return response.data;
};

/**
 * Deletes a notification from user's inbox.
 */
export const deleteNotification = async (id) => {
  const response = await api.delete(`/api/notifications/${id}`);
  return response.data;
};

/**
 * Retrieves user notification preferences and reminder timings.
 */
export const getPreferences = async () => {
  const response = await api.get('/api/notifications/preferences');
  return response.data;
};

/**
 * Updates user notification preferences.
 */
export const updatePreferences = async (preferencesData) => {
  const response = await api.put('/api/notifications/preferences', preferencesData);
  return response.data;
};

/**
 * Retrieves active product replenishment trackers.
 */
export const getProductTrackers = async () => {
  const response = await api.get('/api/notifications/trackers');
  return response.data;
};

/**
 * Creates a new product replenishment tracking entry.
 */
export const createProductTracker = async (trackerData) => {
  const response = await api.post('/api/notifications/trackers', trackerData);
  return response.data;
};

/**
 * Deletes a product replenishment tracking entry.
 */
export const deleteProductTracker = async (id) => {
  const response = await api.delete(`/api/notifications/trackers/${id}`);
  return response.data;
};

/**
 * Admin broadcast platform announcement.
 */
export const broadcastAnnouncement = async (broadcastData) => {
  const response = await api.post('/api/admin/notifications/broadcast', broadcastData);
  return response.data;
};

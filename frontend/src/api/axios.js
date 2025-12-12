// -------------------------------------------------------------
// Why: This file configures the Axios instance for making API requests.
//
// Why this design?
// Centralizes API base URL and headers for maintainability.
// Makes it easy to update API endpoints or add interceptors 
// Follows best practices for scalable frontend-backend communication.

import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000/api';
// Axios instance
const api = axios.create({ baseURL: API_BASE, withCredentials: true });
let isRefreshing = false;
let queue = [];
function processQueue(error, token = null){
  queue.forEach(p => error ? p.reject(error) : p.resolve(token));
  queue = [];
}
// --- Auth Handling with Token Refresh ---
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
//-- Response Interceptor for 401 Handling ---
api.interceptors.response.use(res => res, async err => {
  const original = err.config;
  if (err.response?.status === 401 && !original._retry){
    original._retry = true;
    if (isRefreshing){
      return new Promise((resolve, reject) => {
        queue.push({resolve, reject});
      }).then(token => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }
    isRefreshing = true;
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) throw new Error('No refresh token');
      const r = await axios.post(`${API_BASE}/auth/refresh`, { refresh_token: refresh });
      const access = r.data.access_token;
      const refresh_new = r.data.refresh_token;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh_new);
      api.defaults.headers.common.Authorization = `Bearer ${access}`;
      processQueue(null, access);
      return api(original);
    } catch (e){
      processQueue(e, null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
  return Promise.reject(err);
});

// --- Collaborative Study Groups API ---
// Why: These functions enable the frontend to interact with backend endpoints for group collaboration, invites, and shared plans.

// Study Groups
export const getGroups = () => api.get('/groups');
export const createGroup = (data) => api.post('/groups', data);
export const joinGroup = (groupId) => api.post(`/groups/${groupId}/join`);
export const leaveGroup = (groupId) => api.post(`/groups/${groupId}/leave`);
export const getGroupMembers = (groupId) => api.get(`/groups/${groupId}/members`);

// In-app Invites
export const sendGroupInvite = (group_id, identifier) => api.post('/invites/send', { group_id, identifier });
export const getPendingInvites = () => api.get('/invites/pending');
export const respondToInvite = (invite_id, action) => api.post(`/invites/${invite_id}/respond`, { action });

// Group Plans
export const createGroupPlan = (group_id, data) => api.post(`/group-plans/${group_id}`, data);
export const getGroupPlans = (group_id, params) => api.get(`/group-plans/${group_id}`, { params });
export const viewGroupPlan = (plan_id) => api.get(`/group-plans/view/${plan_id}`);
export const deleteGroupPlan = (plan_id) => api.delete(`/group-plans/${plan_id}`);
export const joinGroupPlan = (plan_id) => api.post(`/group-plans/${plan_id}/join`);
export const updateGroupPlan = (plan_id, data) => api.put(`/group-plans/${plan_id}`, data);
export const getGroupPlanParticipants = (plan_id) => api.get(`/group-plans/${plan_id}/participants`);


// Group Plan Tasks (normalized)
export const getGroupPlanTasks = (plan_id) => api.get(`/group-plans/${plan_id}/tasks`);
export const createGroupPlanTask = (plan_id, data) => api.post(`/group-plans/${plan_id}/tasks`, data);
export const updateGroupPlanTask = (plan_id, task_id, data) => api.put(`/group-plans/${plan_id}/tasks/${task_id}`, data);
export const deleteGroupPlanTask = (plan_id, task_id) => api.delete(`/group-plans/${plan_id}/tasks/${task_id}`);


// --- Notifications API ---
// Why: These functions allow the frontend to fetch and mark notifications as read.
export const getNotifications = (params) => api.get('/notifications', { params });
export const markNotificationRead = (id) => api.post(`/notifications/${id}/read`);
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

export default api;

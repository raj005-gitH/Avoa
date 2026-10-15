import axios from 'axios';

// In dev, Vite proxy forwards /api → http://localhost:8080/api
// In production, set VITE_API_BASE to your deployed backend URL
const BASE = import.meta.env.VITE_API_BASE || '';

const api = axios.create({
  baseURL: BASE,
  withCredentials: true, // send session cookie on every request
});

/* ─────────────── AUTH ─────────────── */
export const getMe = () => api.get('/api/auth/me');
export const signup = (data) => api.post('/api/auth/signup', data);
export const login = (data) => api.post('/api/auth/login', data);
export const logout = () => api.get('/api/auth/logout');

/* ─────────────── LISTINGS ─────────────── */
export const getListings = (params) => api.get('/api/listings', { params });
export const getListing = (id) => api.get(`/api/listings/${id}`);
export const createListing = (formData) =>
  api.post('/api/listings', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateListing = (id, formData) =>
  api.put(`/api/listings/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteListing = (id) => api.delete(`/api/listings/${id}`);

/* ─────────────── REVIEWS ─────────────── */
export const createReview = (listingId, data) =>
  api.post(`/api/listings/${listingId}/reviews`, data);
export const deleteReview = (listingId, reviewId) =>
  api.delete(`/api/listings/${listingId}/reviews/${reviewId}`);

/* ─────────────── PAYMENTS & BOOKINGS ─────────────── */
export const createOrder = (data) => api.post('/api/payment/create-order', data);
export const verifyPayment = (data) => api.post('/api/payment/verify', data);
export const getMyBookings = () => api.get('/api/payment/my-bookings');

export default api;

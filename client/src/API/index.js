import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000' });

// Attach JWT from localStorage on every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('idToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ── Auth ────────────────────────────────────────────────── */
export const register      = (data) => API.post('/auth/register', data);
export const confirm       = (data) => API.post('/auth/confirm', data);
export const login         = (data) => API.post('/auth/login', data);
export const logout        = ()     => API.post('/auth/logout');
export const getProfile    = (sub)  => API.get(`/auth/profile/${sub}`);
export const updateProfile = (data) => API.patch('/auth/profile', data);

/* ── Posts ───────────────────────────────────────────────── */
export const fetchPosts    = ()          => API.get('/posts');
export const searchPosts   = (q)         => API.get(`/posts/search?q=${encodeURIComponent(q)}`);
export const createPost    = (post)      => API.post('/posts', post);
export const updatePost    = (id, post)  => API.patch(`/posts/${id}`, post);
export const deletePost    = (id)        => API.delete(`/posts/${id}`);
export const likePost      = (id)        => API.patch(`/posts/${id}/likepost`);
export const getUploadUrl  = (data)      => API.post('/posts/upload-url', data);

/* ── Comments ────────────────────────────────────────────── */
export const fetchComments = (postId)          => API.get(`/posts/${postId}/comments`);
export const addComment    = (postId, body)    => API.post(`/posts/${postId}/comments`, { body });
export const deleteComment = (postId, cId)     => API.delete(`/posts/${postId}/comments/${cId}`);

import { AUTH_LOGIN, AUTH_LOGOUT } from '../constants/actionTypes';
import * as api from '../API';

export const loginAction = (formData, navigate) => async (dispatch) => {
  try {
    const { data } = await api.login(formData);
    localStorage.setItem('idToken',      data.idToken);
    localStorage.setItem('accessToken',  data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('profile',      JSON.stringify(data.profile));
    dispatch({ type: AUTH_LOGIN, payload: data });
    navigate('/');
  } catch (e) {
    const msg = e.response?.data?.message || 'Login failed';
    throw new Error(msg);
  }
};

export const registerAction = (formData) => async () => {
  try {
    const { data } = await api.register(formData);
    return data;
  } catch (e) {
    const msg = e.response?.data?.message || 'Registration failed';
    throw new Error(msg);
  }
};

export const confirmAction = (formData) => async () => {
  try {
    const { data } = await api.confirm(formData);
    return data;
  } catch (e) {
    throw new Error(e.response?.data?.message || 'Confirmation failed');
  }
};

export const logoutAction = (navigate) => async (dispatch) => {
  try { await api.logout(); } catch (_) {}
  localStorage.removeItem('idToken');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('profile');
  dispatch({ type: AUTH_LOGOUT });
  navigate('/auth');
};

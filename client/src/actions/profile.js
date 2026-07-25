import { FETCH_PROFILE, UPDATE_PROFILE } from '../constants/actionTypes';
import * as api from '../API';

export const fetchProfile = (sub) => async (dispatch) => {
  try {
    const { data } = await api.getProfile(sub);
    dispatch({ type: FETCH_PROFILE, payload: data });
  } catch (e) { console.error(e); }
};

export const updateProfileAction = (profileData) => async (dispatch) => {
  try {
    const { data } = await api.updateProfile(profileData);
    const stored = JSON.parse(localStorage.getItem('profile') || '{}');
    localStorage.setItem('profile', JSON.stringify({ ...stored, ...data }));
    dispatch({ type: UPDATE_PROFILE, payload: data });
  } catch (e) { console.error(e); }
};

import { AUTH_LOGIN, AUTH_LOGOUT } from '../constants/actionTypes';

const stored = () => {
  try { return JSON.parse(localStorage.getItem('profile')); } catch { return null; }
};

const authReducer = (state = { profile: stored(), idToken: localStorage.getItem('idToken') }, action) => {
  switch (action.type) {
    case AUTH_LOGIN:  return { profile: action.payload.profile, idToken: action.payload.idToken };
    case AUTH_LOGOUT: return { profile: null, idToken: null };
    default:          return state;
  }
};
export default authReducer;

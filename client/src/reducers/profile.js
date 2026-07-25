import { FETCH_PROFILE, UPDATE_PROFILE } from '../constants/actionTypes';

const profileReducer = (state = { data: null, posts: [] }, action) => {
  switch (action.type) {
    case FETCH_PROFILE:  return { data: action.payload.profile, posts: action.payload.posts };
    case UPDATE_PROFILE: return { ...state, data: action.payload };
    default:             return state;
  }
};
export default profileReducer;

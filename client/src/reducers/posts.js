import { FETCH_ALL, SEARCH, CREATE, UPDATE, DELETE } from '../constants/actionTypes';

const postsReducer = (posts = [], action) => {
  switch (action.type) {
    case FETCH_ALL: return action.payload;
    case SEARCH:    return action.payload;
    case CREATE:    return [action.payload, ...posts];
    case UPDATE:    return posts.map((p) => (p._id === action.payload._id ? action.payload : p));
    case DELETE:    return posts.filter((p) => p._id !== action.payload);
    default:        return posts;
  }
};
export default postsReducer;

import { FETCH_ALL, SEARCH, CREATE, UPDATE, DELETE } from '../constants/actionTypes';
import * as api from '../API';

export const getPosts = () => async (dispatch) => {
  try {
    const { data } = await api.fetchPosts();
    dispatch({ type: FETCH_ALL, payload: data });
  } catch (e) { console.error(e); }
};

export const searchPostsAction = (q) => async (dispatch) => {
  try {
    const { data } = await api.searchPosts(q);
    dispatch({ type: SEARCH, payload: data });
  } catch (e) { console.error(e); }
};

export const createPost = (post, imageFile) => async (dispatch) => {
  try {
    let imageUrl = null;
    let thumbUrl = null;

    // Upload image to S3 via presigned URL if provided
    if (imageFile) {
      const { data: urlData } = await api.getUploadUrl({
        filename:    imageFile.name,
        contentType: imageFile.type,
      });
      await fetch(urlData.uploadUrl, {
        method:  'PUT',
        headers: { 'Content-Type': imageFile.type },
        body:    imageFile,
      });
      imageUrl = urlData.publicUrl;
      thumbUrl = urlData.thumbUrl;
    }

    const { data } = await api.createPost({ ...post, imageUrl, thumbUrl });
    dispatch({ type: CREATE, payload: data });
  } catch (e) { console.error(e); }
};

export const updatePost = (id, post) => async (dispatch) => {
  try {
    const { data } = await api.updatePost(id, post);
    dispatch({ type: UPDATE, payload: data });
  } catch (e) { console.error(e); }
};

export const deletePost = (id) => async (dispatch) => {
  try {
    await api.deletePost(id);
    dispatch({ type: DELETE, payload: id });
  } catch (e) { console.error(e); }
};

export const likePost = (id) => async (dispatch) => {
  try {
    const { data } = await api.likePost(id);
    dispatch({ type: UPDATE, payload: data });
  } catch (e) { console.error(e); }
};

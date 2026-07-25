import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Typography, Paper, CircularProgress, Chip } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { useDispatch, useSelector } from 'react-redux';
import { createPost, updatePost } from '../../actions/posts';
import useStyles from './styles';

const INIT = { posted_by: '', post_title: '', post_message: '', post_tags: '' };

const Form = ({ currentID, setCurrentID }) => {
  const classes    = useStyles();
  const dispatch   = useDispatch();
  const fileRef    = useRef();
  const { profile } = useSelector((s) => s.auth);
  const post        = useSelector((s) => currentID ? s.posts.find((p) => p._id === currentID) : null);

  const [postData,   setData]     = useState(INIT);
  const [imageFile,  setFile]     = useState(null);
  const [preview,    setPreview]  = useState('');
  const [loading,    setLoading]  = useState(false);

  useEffect(() => {
    if (post) {
      setData({
        posted_by:    post.posted_by,
        post_title:   post.post_title,
        post_message: post.post_message,
        post_tags:    (post.post_tags || []).join(','),
      });
      if (post.thumbUrl || post.imageUrl) setPreview(post.thumbUrl || post.imageUrl);
    }
  }, [post]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return alert('Please sign in to post');
    setLoading(true);
    const payload = {
      ...postData,
      post_tags: postData.post_tags.split(',').map((t) => t.trim()).filter(Boolean),
      posted_by: profile.username || profile.email,
    };
    try {
      if (currentID) {
        await dispatch(updatePost(currentID, payload));
      } else {
        await dispatch(createPost(payload, imageFile));
      }
      clear();
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setCurrentID(null);
    setData(INIT);
    setFile(null);
    setPreview('');
  };

  return (
    <Paper className={classes.paper} elevation={3}>
      <form autoComplete="off" noValidate className={`${classes.root} ${classes.form}`} onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          {currentID ? '✏️ Edit Post' : '✨ Create Post'}
        </Typography>

        <TextField name="post_title" variant="outlined" label="Title" fullWidth required
          value={postData.post_title} onChange={(e) => setData({ ...postData, post_title: e.target.value })} />
        <TextField name="post_message" variant="outlined" label="Message" fullWidth multiline minRows={3}
          value={postData.post_message} onChange={(e) => setData({ ...postData, post_message: e.target.value })} />
        <TextField name="post_tags" variant="outlined" label="Tags (comma separated)" fullWidth
          value={postData.post_tags} onChange={(e) => setData({ ...postData, post_tags: e.target.value })}
          helperText="e.g. travel, food, aws" />

        {/* Image upload */}
        <div className={classes.fileInput}>
          <Button
            variant="outlined" color="default" startIcon={<CloudUploadIcon />}
            onClick={() => fileRef.current.click()} size="small" style={{ marginBottom: 8 }}>
            {imageFile ? imageFile.name : 'Choose Image (S3 Upload)'}
          </Button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          {preview && (
            <img src={preview} alt="preview"
              style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, marginTop: 6 }} />
          )}
          {imageFile && (
            <Chip label="⚡ Will be uploaded to AWS S3" size="small"
              style={{ marginTop: 6, backgroundColor: '#e3f2fd', color: '#1565c0' }} />
          )}
        </div>

        <Button className={classes.buttonSubmit} variant="contained" color="primary"
          size="large" type="submit" fullWidth disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : (currentID ? 'Update' : 'Post')}
        </Button>
        <Button variant="outlined" color="secondary" size="small" onClick={clear} fullWidth>
          Clear
        </Button>
      </form>
    </Paper>
  );
};

export default Form;

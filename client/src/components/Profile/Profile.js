import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Avatar, Grid, Divider,
  TextField, Button, CircularProgress, Chip,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { fetchProfile, updateProfileAction } from '../../actions/profile';
import * as api from '../../API';

const Profile = () => {
  const { sub }    = useParams();
  const dispatch   = useDispatch();
  const { data: profileData, posts } = useSelector((s) => s.profile);
  const { profile: myProfile }       = useSelector((s) => s.auth);

  const [editing, setEditing] = useState(false);
  const [bio,     setBio]     = useState('');
  const [saving,  setSaving]  = useState(false);

  const isMe = myProfile?.sub === sub;

  useEffect(() => { dispatch(fetchProfile(sub)); }, [sub]);
  useEffect(() => { if (profileData) setBio(profileData.bio || ''); }, [profileData]);

  const saveBio = async () => {
    setSaving(true);
    await dispatch(updateProfileAction({ bio }));
    setSaving(false);
    setEditing(false);
  };

  if (!profileData) return <CircularProgress style={{ display: 'block', margin: '60px auto' }} />;

  return (
    <Paper elevation={2} style={{ maxWidth: 800, margin: '20px auto', padding: 24, borderRadius: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
        <Avatar src={profileData.avatarUrl || ''} style={{ width: 72, height: 72, fontSize: 28, backgroundColor: '#3f51b5' }}>
          {(profileData.username || '?')[0].toUpperCase()}
        </Avatar>
        <div>
          <Typography variant="h5" style={{ fontWeight: 700 }}>{profileData.username}</Typography>
          <Typography variant="body2" color="textSecondary">{profileData.email}</Typography>
          <Typography variant="caption" color="textSecondary">
            Joined {moment(profileData.createdAt).format('MMMM YYYY')}
          </Typography>
        </div>
      </div>

      {/* Bio */}
      <div style={{ marginBottom: 20 }}>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>About</Typography>
        {editing ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <TextField variant="outlined" size="small" fullWidth multiline minRows={2}
              value={bio} onChange={(e) => setBio(e.target.value)} />
            <Button variant="contained" color="primary" size="small"
              onClick={saveBio} disabled={saving} startIcon={saving ? <CircularProgress size={14} /> : <SaveIcon />}>
              Save
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Typography variant="body1">{profileData.bio || 'No bio yet.'}</Typography>
            {isMe && (
              <Button size="small" startIcon={<EditIcon />} onClick={() => setEditing(true)}>Edit</Button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <Typography variant="h6" style={{ fontWeight: 700 }}>{posts.length}</Typography>
          <Typography variant="caption" color="textSecondary">Posts</Typography>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Typography variant="h6" style={{ fontWeight: 700 }}>
            {posts.reduce((acc, p) => acc + (p.post_likes || 0), 0)}
          </Typography>
          <Typography variant="caption" color="textSecondary">Total Likes</Typography>
        </div>
      </div>

      <Divider style={{ marginBottom: 16 }} />

      <Typography variant="subtitle1" style={{ fontWeight: 700, marginBottom: 12 }}>
        📸 Posts ({posts.length})
      </Typography>

      {posts.length === 0 && (
        <Typography variant="body2" color="textSecondary">No posts yet.</Typography>
      )}

      <Grid container spacing={2}>
        {posts.map((post) => (
          <Grid item xs={12} sm={6} key={post._id}>
            <Paper variant="outlined" style={{ borderRadius: 8, overflow: 'hidden' }}>
              {(post.thumbUrl || post.imageUrl) && (
                <img src={post.thumbUrl || post.imageUrl} alt={post.post_title}
                  style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
              )}
              <div style={{ padding: 10 }}>
                <Typography variant="subtitle2" style={{ fontWeight: 700 }}>{post.post_title}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {moment(post.createdAt).fromNow()} · 👍 {post.post_likes}
                </Typography>
                <div style={{ marginTop: 4 }}>
                  {(post.post_tags || []).map((t) => (
                    <Chip key={t} label={`#${t}`} size="small" style={{ marginRight: 4, fontSize: 10 }} />
                  ))}
                </div>
              </div>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default Profile;

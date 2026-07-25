import React, { useState, useEffect } from 'react';
import {
  Typography, TextField, Button, Divider,
  List, ListItem, ListItemText, ListItemAvatar, Avatar,
  IconButton, CircularProgress,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { useSelector } from 'react-redux';
import * as api from '../../API';
import moment from 'moment';

const Comments = ({ postId }) => {
  const { profile } = useSelector((s) => s.auth);
  const [comments, setComments] = useState([]);
  const [body,     setBody]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [open,     setOpen]     = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.fetchComments(postId);
      setComments(data);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { if (open) load(); }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    try {
      const { data } = await api.addComment(postId, body.trim());
      setComments((prev) => [...prev, data]);
      setBody('');
    } catch (_) {}
  };

  const remove = async (cId) => {
    try {
      await api.deleteComment(postId, cId);
      setComments((prev) => prev.filter((c) => c.id !== cId));
    } catch (_) {}
  };

  return (
    <div style={{ padding: '0 12px 12px' }}>
      <Button size="small" color="primary" onClick={() => setOpen(!open)} style={{ marginTop: 4 }}>
        💬 {open ? 'Hide' : 'Show'} Comments {comments.length > 0 ? `(${comments.length})` : ''}
      </Button>

      {open && (
        <>
          <Divider style={{ margin: '8px 0' }} />
          {loading ? (
            <CircularProgress size={20} />
          ) : (
            <List dense disablePadding>
              {comments.length === 0 && (
                <Typography variant="caption" color="textSecondary">No comments yet. Be the first!</Typography>
              )}
              {comments.map((c) => (
                <ListItem key={c.id} alignItems="flex-start" disableGutters>
                  <ListItemAvatar>
                    <Avatar style={{ width: 28, height: 28, fontSize: 13, backgroundColor: '#3f51b5' }}>
                      {(c.author || '?')[0].toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<><strong>{c.author}</strong> &nbsp;<span style={{ fontSize: 12, color: '#888' }}>{moment(c.createdAt).fromNow()}</span></>}
                    secondary={c.body}
                  />
                  {profile?.sub === c.author_sub && (
                    <IconButton size="small" onClick={() => remove(c.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </ListItem>
              ))}
            </List>
          )}

          {profile ? (
            <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <TextField
                variant="outlined" size="small" placeholder="Write a comment…"
                value={body} onChange={(e) => setBody(e.target.value)}
                style={{ flex: 1 }} inputProps={{ maxLength: 500 }}
              />
              <Button type="submit" variant="contained" color="primary" size="small">Post</Button>
            </form>
          ) : (
            <Typography variant="caption" color="textSecondary">Sign in to comment.</Typography>
          )}
        </>
      )}
    </div>
  );
};

export default Comments;

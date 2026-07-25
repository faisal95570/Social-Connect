import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, TextField,
  List, ListItem, ListItemText, ListItemAvatar,
  Avatar, Typography, CircularProgress, Chip, IconButton,
} from '@material-ui/core';
import SearchIcon  from '@material-ui/icons/Search';
import CloseIcon   from '@material-ui/icons/Close';
import ImageIcon   from '@material-ui/icons/Image';
import { useDispatch } from 'react-redux';
import { searchPostsAction } from '../../actions/posts';
import { useSelector } from 'react-redux';

const Search = ({ open, onClose }) => {
  const dispatch   = useDispatch();
  const posts      = useSelector((s) => s.posts);
  const [query,    setQuery]   = useState('');
  const [results,  setResults] = useState([]);
  const [loading,  setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data } = await import('../../API').then((m) => m.searchPosts(query));
      setResults(data);
    } catch (_) {}
    setSearched(true);
    setLoading(false);
  };

  const handleClose = () => { onClose(); setQuery(''); setResults([]); setSearched(false); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>🔍 Search Posts</span>
          <IconButton size="small" onClick={handleClose}><CloseIcon /></IconButton>
        </div>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <TextField
            autoFocus variant="outlined" size="small" placeholder="Search by title, message, or tag…"
            value={query} onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <IconButton type="submit" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : <SearchIcon />}
          </IconButton>
        </form>

        {searched && results.length === 0 && (
          <Typography color="textSecondary" style={{ textAlign: 'center', padding: 20 }}>
            No posts found for &ldquo;{query}&rdquo;
          </Typography>
        )}

        <List disablePadding>
          {results.map((post) => (
            <ListItem key={post._id} alignItems="flex-start" divider
              style={{ borderRadius: 8, marginBottom: 4 }}>
              <ListItemAvatar>
                <Avatar variant="rounded" src={post.thumbUrl || post.imageUrl || ''} style={{ backgroundColor: '#e3f2fd' }}>
                  {!(post.thumbUrl || post.imageUrl) && <ImageIcon color="disabled" />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={<strong>{post.post_title}</strong>}
                secondary={
                  <>
                    <span style={{ color: '#555' }}>{post.post_message?.substring(0, 80)}{post.post_message?.length > 80 ? '…' : ''}</span>
                    <br />
                    {(post.post_tags || []).map((t) => (
                      <Chip key={t} label={`#${t}`} size="small"
                        style={{ marginRight: 4, marginTop: 4, fontSize: 11 }} />
                    ))}
                    <span style={{ fontSize: 11, color: '#999', marginLeft: 6 }}>
                      by {post.posted_by} · 👍 {post.post_likes}
                    </span>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default Search;

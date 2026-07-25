import React from 'react';
import { Grid, CircularProgress, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import Post from './Post/Post';
import useStyles from './styles';

const Posts = ({ setCurrentID }) => {
  const classes = useStyles();
  const posts   = useSelector((s) => s.posts);

  if (!posts.length) return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <CircularProgress />
      <Typography variant="body1" color="textSecondary" style={{ marginTop: 12 }}>
        Loading posts…
      </Typography>
    </div>
  );

  return (
    <Grid className={classes.mainContainer} container alignItems="stretch" spacing={3}>
      {posts.map((post) => (
        <Grid key={post._id} item xs={12} sm={6} md={6}>
          <Post post={post} setCurrentID={setCurrentID} />
        </Grid>
      ))}
    </Grid>
  );
};

export default Posts;

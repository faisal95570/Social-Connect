import React, { useEffect, useState } from 'react';
import { Container, Grow, Grid, Paper, Typography, Chip } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { getPosts } from '../../actions/posts';
import Posts  from '../Posts/Posts';
import Form   from '../Form/Form';

const Home = () => {
  const dispatch    = useDispatch();
  const [currentID, setCurrentID] = useState(null);

  useEffect(() => { dispatch(getPosts()); }, []);

  return (
    <Grow in>
      <Container maxWidth="lg">
        <div style={{ marginBottom: 20 }}>
          <Typography variant="h4" align="center" style={{ fontWeight: 700, color: '#3f51b5', marginBottom: 6 }}>
            📸 Social Feed
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Chip label="☁ EC2" size="small" style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }} />
            <Chip label="🗄 RDS MySQL" size="small" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }} />
            <Chip label="🪣 S3 Images" size="small" style={{ backgroundColor: '#fff3e0', color: '#e65100' }} />
            <Chip label="🔐 Cognito Auth" size="small" style={{ backgroundColor: '#f3e5f5', color: '#6a1b9a' }} />
            <Chip label="⚡ Lambda Thumbnails" size="small" style={{ backgroundColor: '#fce4ec', color: '#880e4f' }} />
          </div>
        </div>

        <Grid container justifyContent="space-between" alignItems="flex-start" spacing={3}>
          <Grid item xs={12} sm={7}>
            <Posts setCurrentID={setCurrentID} />
          </Grid>
          <Grid item xs={12} sm={5}>
            <Form currentID={currentID} setCurrentID={setCurrentID} />
          </Grid>
        </Grid>
      </Container>
    </Grow>
  );
};

export default Home;

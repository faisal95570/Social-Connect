import React, { useState } from 'react';
import {
  Avatar, Button, Paper, Grid, Typography, Container,
  TextField, CircularProgress, Alert, Collapse,
} from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginAction, registerAction, confirmAction } from '../../actions/auth';
import useStyles from './styles';

const INIT_FORM = { username: '', email: '', password: '', confirmPassword: '', code: '' };

const Auth = () => {
  const classes  = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [mode,     setMode]    = useState('signin');   // signin | signup | confirm
  const [formData, setForm]    = useState(INIT_FORM);
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState('');
  const [success,  setSuccess] = useState('');

  const onChange = (e) => setForm({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'signin') {
        await dispatch(loginAction({ email: formData.email, password: formData.password }, navigate));
      } else if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) throw new Error('Passwords do not match');
        const res = await dispatch(registerAction({
          username: formData.username,
          email:    formData.email,
          password: formData.password,
        }));
        setSuccess(res.message || 'Check your email for a confirmation code.');
        setMode('confirm');
      } else if (mode === 'confirm') {
        const res = await dispatch(confirmAction({ email: formData.email, code: formData.code }));
        setSuccess(res.message || 'Email confirmed! You can now sign in.');
        setMode('signin');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper className={classes.paper} elevation={3}>
        <Avatar className={classes.avatar}><LockOutlinedIcon /></Avatar>
        <Typography variant="h5">
          {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Confirm Email'}
        </Typography>

        <Collapse in={!!error}>
          <Alert severity="error" style={{ marginTop: 12, width: '100%' }}>{error}</Alert>
        </Collapse>
        <Collapse in={!!success}>
          <Alert severity="success" style={{ marginTop: 12, width: '100%' }}>{success}</Alert>
        </Collapse>

        <form className={classes.form} onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {mode === 'signup' && (
              <Grid item xs={12}>
                <TextField name="username" label="Username" variant="outlined"
                  fullWidth required value={formData.username} onChange={onChange} />
              </Grid>
            )}
            {mode !== 'confirm' && (
              <Grid item xs={12}>
                <TextField name="email" label="Email Address" variant="outlined"
                  fullWidth required type="email" value={formData.email} onChange={onChange} />
              </Grid>
            )}
            {mode !== 'confirm' && (
              <Grid item xs={12}>
                <TextField name="password" label="Password" variant="outlined"
                  fullWidth required type="password" value={formData.password} onChange={onChange} />
              </Grid>
            )}
            {mode === 'signup' && (
              <Grid item xs={12}>
                <TextField name="confirmPassword" label="Confirm Password" variant="outlined"
                  fullWidth required type="password" value={formData.confirmPassword} onChange={onChange} />
              </Grid>
            )}
            {mode === 'confirm' && (
              <>
                <Grid item xs={12}>
                  <TextField name="email" label="Email Address" variant="outlined"
                    fullWidth required type="email" value={formData.email} onChange={onChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField name="code" label="Confirmation Code" variant="outlined"
                    fullWidth required value={formData.code} onChange={onChange}
                    helperText="Check your email for the 6-digit code from AWS Cognito" />
                </Grid>
              </>
            )}
          </Grid>

          <Button type="submit" fullWidth variant="contained" color="primary"
            className={classes.submit} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> :
              mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Confirm Email'}
          </Button>

          <Grid container justifyContent="flex-end">
            {mode === 'signin' && (
              <Grid item>
                <Button onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}>
                  Don&apos;t have an account? Sign Up
                </Button>
              </Grid>
            )}
            {mode === 'signup' && (
              <Grid item>
                <Button onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}>
                  Already have an account? Sign In
                </Button>
              </Grid>
            )}
            {mode === 'confirm' && (
              <Grid item>
                <Button onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}>
                  Back to Sign In
                </Button>
              </Grid>
            )}
          </Grid>
        </form>

        <Typography variant="caption" color="textSecondary" style={{ marginTop: 16, display: 'block', textAlign: 'center' }}>
          🔒 Secured by AWS Cognito
        </Typography>
      </Paper>
    </Container>
  );
};

export default Auth;

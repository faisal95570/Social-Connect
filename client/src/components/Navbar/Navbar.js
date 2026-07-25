import React from 'react';
import { AppBar, Avatar, Toolbar, Typography, Button, IconButton, Tooltip } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutAction } from '../../actions/auth';
import useStyles from './styles';

const Navbar = ({ onSearchOpen }) => {
  const classes  = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile } = useSelector((state) => state.auth);

  const handleLogout = () => dispatch(logoutAction(navigate));

  return (
    <AppBar className={classes.appBar} position="sticky" color="inherit" elevation={2}>
      <div className={classes.brandContainer}>
        <Typography component={Link} to="/" className={classes.heading} variant="h5">
          📸 SocialApp
        </Typography>
      </div>
      <Toolbar className={classes.toolbar}>
        <Tooltip title="Search posts">
          <IconButton onClick={onSearchOpen} color="primary">
            <SearchIcon />
          </IconButton>
        </Tooltip>
        {profile ? (
          <div className={classes.profile}>
            <Avatar
              className={classes.purple}
              src={profile.avatarUrl || ''}
              component={Link}
              to={`/profile/${profile.sub}`}
              style={{ cursor: 'pointer', textDecoration: 'none' }}
            >
              {(profile.username || profile.email || '?')[0].toUpperCase()}
            </Avatar>
            <Typography
              className={classes.userName}
              variant="subtitle1"
              component={Link}
              to={`/profile/${profile.sub}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {profile.username || profile.email}
            </Typography>
            <Button variant="contained" className={classes.logout} color="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        ) : (
          <Button component={Link} to="/auth" variant="contained" color="primary">
            Sign In
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

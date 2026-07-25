import {
  cognitoSignUp, cognitoSignIn, cognitoSignOut,
  cognitoGetUser, cognitoConfirm,
} from '../config/cognito.js';
import Profile from '../models/profile.js';

/* ── POST /auth/register ─────────────────────────────────── */
export const register = async (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username)
    return res.status(400).json({ message: 'email, password, and username are required' });
  try {
    const result = await cognitoSignUp(email, password, username);
    res.status(201).json({
      message: 'Registration successful! Check your email for a confirmation code.',
      userSub: result.UserSub,
    });
  } catch (e) {
    if (e.name === 'UsernameExistsException')
      return res.status(409).json({ message: 'Email already registered' });
    res.status(500).json({ message: e.message });
  }
};

/* ── POST /auth/confirm ──────────────────────────────────── */
export const confirm = async (req, res) => {
  const { email, code } = req.body;
  try {
    await cognitoConfirm(email, code);
    res.json({ message: 'Email confirmed! You can now log in.' });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

/* ── POST /auth/login ────────────────────────────────────── */
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'email and password required' });
  try {
    const result = await cognitoSignIn(email, password);
    const auth   = result.AuthenticationResult;

    // Decode sub & username from IdToken (no verify needed here – server just issued it)
    const [, payload] = auth.IdToken.split('.');
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());

    // Upsert profile row
    const profile = await Profile.upsert({
      sub:      decoded.sub,
      username: decoded['cognito:username'] || decoded.preferred_username || email,
      email:    decoded.email,
    });

    res.json({
      idToken:      auth.IdToken,
      accessToken:  auth.AccessToken,
      refreshToken: auth.RefreshToken,
      expiresIn:    auth.ExpiresIn,
      profile,
    });
  } catch (e) {
    if (['NotAuthorizedException','UserNotFoundException'].includes(e.name))
      return res.status(401).json({ message: 'Invalid email or password' });
    if (e.name === 'UserNotConfirmedException')
      return res.status(403).json({ message: 'Please confirm your email before logging in' });
    res.status(500).json({ message: e.message });
  }
};

/* ── POST /auth/logout ───────────────────────────────────── */
export const logout = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(400).json({ message: 'Access token required' });
  try {
    await cognitoSignOut(token);
    res.json({ message: 'Logged out successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* ── GET /auth/profile/:sub ─────────────────────────────── */
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findBySub(req.params.sub);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    const posts = await Profile.postsByUser(req.params.sub);
    res.json({ profile, posts });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* ── PATCH /auth/profile ─────────────────────────────────── */
export const updateProfile = async (req, res) => {
  try {
    const { bio, avatarUrl } = req.body;
    const profile = await Profile.upsert({
      sub:      req.user.sub,
      username: req.user.username,
      email:    req.user.email,
      bio,
      avatarUrl,
    });
    res.json(profile);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

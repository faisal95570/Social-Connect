import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import dotenv from 'dotenv';
dotenv.config();

const REGION  = process.env.COGNITO_REGION    || 'us-east-1';
const POOL_ID = process.env.COGNITO_USER_POOL_ID;
const JWKS_URI = `https://cognito-idp.${REGION}.amazonaws.com/${POOL_ID}/.well-known/jwks.json`;

const client = jwksClient({ jwksUri: JWKS_URI, cache: true, cacheMaxAge: 600000 });

const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
};

/**
 * Middleware: verifies the Cognito JWT in Authorization header.
 * Attaches decoded payload to req.user.
 */
export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid or expired token' });
    req.user = {
      sub:      decoded.sub,
      email:    decoded.email,
      username: decoded['cognito:username'] || decoded.preferred_username || decoded.email,
    };
    next();
  });
};

/**
 * Optional auth — attaches user if token present, doesn't block if missing.
 */
export const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next();
  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (!err) {
      req.user = {
        sub:      decoded.sub,
        email:    decoded.email,
        username: decoded['cognito:username'] || decoded.preferred_username || decoded.email,
      };
    }
    next();
  });
};

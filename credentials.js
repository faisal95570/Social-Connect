// ⚠️  This file is kept for compatibility only.
// All credentials are now loaded from server/.env (server side)
// and client/.env (client side).
// DO NOT commit real credentials here.
export const DB_HOST     = process.env.DB_HOST     || '';
export const DB_USER     = process.env.DB_USER     || '';
export const DB_PASSWORD = process.env.DB_PASSWORD || '';
export const DB_NAME     = process.env.DB_NAME     || '';
export const EC2_URL     = process.env.REACT_APP_API_URL || 'http://localhost:5000';

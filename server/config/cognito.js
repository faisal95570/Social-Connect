import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  GlobalSignOutCommand,
  GetUserCommand,
  ConfirmSignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import dotenv from 'dotenv';
dotenv.config();

export const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION || 'us-east-1',
});

export const POOL_ID      = process.env.COGNITO_USER_POOL_ID;
export const CLIENT_ID    = process.env.COGNITO_APP_CLIENT_ID;

/* ── Register ────────────────────────────────────────────── */
export const cognitoSignUp = (email, password, username) =>
  cognitoClient.send(new SignUpCommand({
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: 'email',              Value: email },
      { Name: 'preferred_username', Value: username },
    ],
  }));

/* ── Login → returns AuthenticationResult ─────────────────── */
export const cognitoSignIn = (email, password) =>
  cognitoClient.send(new InitiateAuthCommand({
    ClientId:  CLIENT_ID,
    AuthFlow:  'USER_PASSWORD_AUTH',
    AuthParameters: { USERNAME: email, PASSWORD: password },
  }));

/* ── Logout (invalidates all tokens) ──────────────────────── */
export const cognitoSignOut = (accessToken) =>
  cognitoClient.send(new GlobalSignOutCommand({ AccessToken: accessToken }));

/* ── Get user info from Access Token ──────────────────────── */
export const cognitoGetUser = (accessToken) =>
  cognitoClient.send(new GetUserCommand({ AccessToken: accessToken }));

/* ── Confirm signup (email code) ──────────────────────────── */
export const cognitoConfirm = (email, code) =>
  cognitoClient.send(new ConfirmSignUpCommand({
    ClientId:         CLIENT_ID,
    Username:         email,
    ConfirmationCode: code,
  }));

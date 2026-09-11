import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { config } from '../config/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateToken } from '../utils/token.js';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
const GOOGLE_SCOPES = 'openid email profile';

const isConfigured = () => Boolean(config.googleClientId && config.googleClientSecret);

const safeRedirect = (res, path, extra = '') => {
  res.redirect(`${config.clientUrl}${path}${extra}`);
};

const readCookie = (req, name) => {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
};

export const googleAuthStatus = asyncHandler(async (req, res) => {
  res.json({ success: true, enabled: isConfigured() });
});

export const googleAuth = (req, res) => {
  if (!isConfigured()) {
    return res.status(500).json({
      success: false,
      message: 'Google OAuth is not configured on the server.',
    });
  }

  const state = crypto.randomBytes(16).toString('hex');
  res.cookie('google_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 10 * 60 * 1000,
  });

  const params = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: config.googleRedirectUri,
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    state,
    prompt: 'select_account',
    include_granted_scopes: 'true',
  });

  res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
};

export const googleAuthCallback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;

  try {
    if (error) {
      return safeRedirect(res, '/auth/google', `?error=${encodeURIComponent(error)}`);
    }
    if (!isConfigured()) {
      return safeRedirect(res, '/auth/google', '?error=not_configured');
    }
    if (!code) {
      return safeRedirect(res, '/auth/google', '?error=missing_code');
    }

    const expectedState = readCookie(req, 'google_oauth_state');
    if (!expectedState || state !== expectedState) {
      return safeRedirect(res, '/auth/google', '?error=state_mismatch');
    }
    res.clearCookie('google_oauth_state', { path: '/' });

    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.googleClientId,
        client_secret: config.googleClientSecret,
        redirect_uri: config.googleRedirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokenRes.ok || tokens.error) {
      return safeRedirect(res, '/auth/google', '?error=token_exchange');
    }

    const infoRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await infoRes.json();
    if (!infoRes.ok || !profile.email) {
      return safeRedirect(res, '/auth/google', '?error=userinfo');
    }

    const email = profile.email.toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);
      user = await User.create({
        name: profile.name || email.split('@')[0],
        email,
        password: randomPassword,
        googleId: profile.sub,
      });
    } else if (!user.googleId) {
      user.googleId = profile.sub;
      await user.save({ validateBeforeSave: false });
    }

    const token = generateToken(user._id);
    const userPayload = encodeURIComponent(
      JSON.stringify({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        address: user.address,
      })
    );

    safeRedirect(res, '/auth/google', `?token=${token}&user=${userPayload}`);
  } catch (err) {
    safeRedirect(res, '/auth/google', '?error=server');
  }
});
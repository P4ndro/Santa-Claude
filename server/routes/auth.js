import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function generateTokens(userId) {
  const accessToken = jwt.sign({ userId }, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
  
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// Helper to format user response based on role
function formatUserResponse(user) {
  const base = {
    id: user._id,
    email: user.email,
    role: user.role,
    profile: user.profile,
    createdAt: user.createdAt,
  };

  if (user.role === 'company') {
    return {
      ...base,
      companyProfile: user.companyProfile,
    };
  } else {
    return {
      ...base,
      candidateProfile: user.candidateProfile,
    };
  }
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, role, companyName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Validate role
    const validRoles = ['candidate', 'company'];
    const userRole = validRoles.includes(role) ? role : 'candidate';

    // Company registration requires company name
    if (userRole === 'company' && !companyName) {
      return res.status(400).json({ error: 'Company name is required for company accounts' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Build user object
    const userData = {
      email: email.toLowerCase(),
      passwordHash: password, // Will be hashed by pre-save hook
      role: userRole,
    };

    // Add company-specific data
    if (userRole === 'company') {
      userData.companyProfile = {
        companyName: companyName.trim(),
      };
    }

    const user = new User(userData);
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      accessToken,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    setRefreshCookie(res, refreshToken);

    res.json({
      accessToken,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });
  res.json({ message: 'Logged out successfully' });
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const tokens = generateTokens(user._id);
    setRefreshCookie(res, tokens.refreshToken);

    res.json({
      accessToken: tokens.accessToken,
      user: formatUserResponse(user),
    });
  } catch (error) {
    res.clearCookie('refreshToken');
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token expired' });
    }
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: formatUserResponse(req.user),
  });
});

export default router;

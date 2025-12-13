import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/protected
router.get('/', requireAuth, (req, res) => {
  res.json({
    ok: true,
    user: { email: req.user.email },
  });
});

export default router;


import express from 'express';
import { authenticateSupabase, optionalSupabaseAuth } from '../middleware/supabaseAuth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import fetch from 'node-fetch';

const router = express.Router();

/**
 * Get current user profile (using Supabase auth)
 */
router.get('/profile',
  authenticateSupabase,
  asyncHandler(async (req, res) => {
    try {
      const user = req.user;
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.supabaseUser.user_metadata?.first_name || '',
          lastName: user.supabaseUser.user_metadata?.last_name || '',
          role: user.role,
          specialty: user.supabaseUser.user_metadata?.specialty || '',
          institution: user.supabaseUser.user_metadata?.institution || '',
          licenseNumber: user.supabaseUser.user_metadata?.license_number || '',
          yearsExperience: user.supabaseUser.user_metadata?.years_experience || 0,
          preferences: user.supabaseUser.user_metadata?.preferences || {
            theme: 'light',
            language: 'en',
            notifications: {
              email: true,
              push: true,
              criticalAlerts: true,
              weeklyReports: true,
            },
            dashboard: {
              defaultView: 'overview',
              refreshInterval: 5000,
              compactMode: false,
            },
            clinical: {
              showGenomicsByDefault: user.role === 'oncologist' || user.role === 'pharmacist',
              autoCalculateDosing: user.role === 'oncologist' || user.role === 'pharmacist',
              requireInteractionAck: true,
              showPatientPhotos: false,
            },
          },
          persona: user.supabaseUser.user_metadata?.persona || {
            id: `persona-${Date.now()}`,
            name: getDefaultPersonaName(user.role),
            description: getDefaultPersonaDescription(user.role),
            role: user.role,
            experienceLevel: 'intermediate',
            specialties: getDefaultSpecialties(user.role),
            preferences: {
              riskTolerance: 'moderate',
              alertSensitivity: 'medium',
              workflowStyle: 'thorough',
              decisionSupport: 'consultative',
            },
            customSettings: {},
          },
          createdAt: user.supabaseUser.created_at,
          lastLogin: new Date().toISOString(),
          isActive: true,
        }
      });

    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  })
);

/**
 * Verify authentication status
 */
router.get('/verify',
  optionalSupabaseAuth,
  (req, res) => {
    if (req.user) {
      res.json({
        authenticated: true,
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role
        }
      });
    } else {
      res.json({
        authenticated: false
      });
    }
  }
);

/**
 * Health check for Supabase auth
 */
router.get('/health',
  (req, res) => {
    res.json({
      status: 'healthy',
      authType: 'supabase',
      timestamp: new Date().toISOString()
    });
  }
);

/**
 * Server-side proxy login to Supabase (fallback for environments blocking direct auth)
 * Body: { email, password }
 */
router.post('/proxy/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return res.status(500).json({ error: 'Supabase not configured on server' });
  }

  const endpoint = `${url}/auth/v1/token?grant_type=password`;
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': anon,
      'Authorization': `Bearer ${anon}`
    },
    body: JSON.stringify({ email, password })
  });

  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    return res.status(resp.status).json({ error: body?.error_description || body?.error || 'Login failed' });
  }

  // Return only the fields needed to set the session client-side
  return res.json({
    access_token: body.access_token,
    refresh_token: body.refresh_token,
    expires_in: body.expires_in,
    token_type: body.token_type,
    user: body.user
  });
}));

// Helper functions for default persona data
function getDefaultPersonaName(role) {
  const names = {
    oncologist: 'Medical Oncologist',
    pharmacist: 'Clinical Pharmacist',
    nurse: 'Oncology Nurse',
    researcher: 'Clinical Researcher',
    student: 'Healthcare Student',
    user: 'Healthcare Professional'
  };
  return names[role] || 'Healthcare Professional';
}

function getDefaultPersonaDescription(role) {
  const descriptions = {
    oncologist: 'Comprehensive cancer care specialist',
    pharmacist: 'Medication therapy management specialist',
    nurse: 'Direct patient care and medication administration',
    researcher: 'Cancer research and data analysis specialist',
    student: 'Learning healthcare professional',
    user: 'Healthcare team member'
  };
  return descriptions[role] || 'Healthcare team member';
}

function getDefaultSpecialties(role) {
  const specialties = {
    oncologist: ['solid tumors', 'precision medicine'],
    pharmacist: ['oncology pharmacy', 'drug interactions'],
    nurse: ['patient care', 'medication administration'],
    researcher: ['clinical trials', 'genomics research'],
    student: ['general medicine'],
    user: ['healthcare']
  };
  return specialties[role] || ['healthcare'];
}

export default router;

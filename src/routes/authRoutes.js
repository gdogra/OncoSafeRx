import express from 'express';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import { generateToken, authenticateToken, optionalAuth, requireAdmin } from '../middleware/auth.js';
import supabaseService from '../config/supabase.js';
import { validate } from '../utils/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Registration schema
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'Password is required'
  }),
  full_name: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Full name must be at least 2 characters',
    'string.max': 'Full name cannot exceed 255 characters',
    'any.required': 'Full name is required'
  }),
  role: Joi.string().valid('user', 'physician', 'pharmacist', 'resident', 'nurse', 'admin').default('user').messages({
    'any.only': 'Role must be one of: user, physician, pharmacist, resident, nurse, admin'
  }),
  institution: Joi.string().max(255).optional().messages({
    'string.max': 'Institution name cannot exceed 255 characters'
  }),
  specialty: Joi.string().max(255).optional().messages({
    'string.max': 'Specialty cannot exceed 255 characters'
  }),
  license_number: Joi.string().max(100).optional().messages({
    'string.max': 'License number cannot exceed 100 characters'
  })
});

// Login schema
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(1).required().messages({
    'string.min': 'Password is required',
    'any.required': 'Password is required'
  })
});

// User registration
router.post('/register', 
  validate(registerSchema, 'body'),
  asyncHandler(async (req, res) => {
    const { email, password, full_name, role = 'user', institution, specialty, license_number } = req.body;

    // Check if user already exists (only enforce when real Supabase is enabled)
    const existingUser = await supabaseService.getUserByEmail(email);
    if (existingUser && supabaseService.enabled) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password (for custom JWT flow)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      // If Supabase is enabled, create a Supabase Auth user as source of truth
      let authUserId = null;
      const autoConfirm = (process.env.SUPABASE_AUTH_EMAIL_CONFIRM || 'true').toLowerCase() !== 'false';
      if (supabaseService.enabled && supabaseService.client?.auth?.admin) {
        try {
          const authUser = await supabaseService.createAuthUser({
            email,
            password,
            metadata: { full_name, role, institution, specialty, license_number },
            email_confirm: autoConfirm
          });
          authUserId = authUser?.id || null;
        } catch (e) {
          console.warn('Auth user creation skipped/failed:', e?.message || e);
        }
      }

      // Create application user profile (mirrors auth user when present)
      const userData = {
        id: authUserId || undefined,
        email,
        password_hash: hashedPassword,
        full_name,
        role,
        institution,
        specialty,
        license_number,
        is_active: true
      };

      const user = await supabaseService.createUser(userData);
      
      // Generate JWT token
      const token = generateToken(user);

      // Return user info (without password)
      const { password_hash, ...userResponse } = user;
      
      res.status(201).json({
        message: 'User registered successfully',
        user: userResponse,
        token,
        expiresIn: '24h'
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to create user account' });
    }
  })
);

// User login
router.post('/login',
  validate(loginSchema, 'body'),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
      // Get user from database
      const user = await supabaseService.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (!user.is_active) {
        return res.status(401).json({ error: 'Account is deactivated' });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Update last login
      await supabaseService.updateUser(user.id, { last_login: new Date() });

      // Generate JWT token
      const token = generateToken(user);

      // Return user info (without password)
      const { password_hash, ...userResponse } = user;

      res.json({
        message: 'Login successful',
        user: userResponse,
        token,
        expiresIn: '24h'
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  })
);

// Get current user profile
router.get('/profile',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const user = await supabaseService.getUserByEmail(req.user.email);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return user info (without password)
      const { password_hash, ...userResponse } = user;
      
      res.json({
        user: userResponse
      });

    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  })
);

// Update user profile
router.put('/profile',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { full_name, institution, specialty, license_number, preferences } = req.body;

    try {
      const updates = {};
      if (full_name) updates.full_name = full_name;
      if (institution) updates.institution = institution;
      if (specialty) updates.specialty = specialty;
      if (license_number) updates.license_number = license_number;
      if (preferences) updates.preferences = preferences;

      const updatedUser = await supabaseService.updateUser(req.user.id, updates);
      
      // Return updated user info (without password)
      const { password_hash, ...userResponse } = updatedUser;
      
      res.json({
        message: 'Profile updated successfully',
        user: userResponse
      });

    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  })
);

// Change password validation schema
const changePasswordSchema = Joi.object({
  current_password: Joi.string().min(1).required().messages({
    'string.min': 'Current password is required',
    'any.required': 'Current password is required'
  }),
  new_password: Joi.string().min(8).required().messages({
    'string.min': 'New password must be at least 8 characters',
    'any.required': 'New password is required'
  })
});

// Change password
router.post('/change-password',
  authenticateToken,
  validate(changePasswordSchema, 'body'),
  asyncHandler(async (req, res) => {
    const { current_password, new_password } = req.body;

    try {
      // Get current user
      const user = await supabaseService.getUserByEmail(req.user.email);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const validPassword = await bcrypt.compare(current_password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const saltRounds = 12;
      const newHashedPassword = await bcrypt.hash(new_password, saltRounds);

      // Update password
      await supabaseService.updateUser(user.id, { 
        password_hash: newHashedPassword,
        updated_at: new Date()
      });

      res.json({
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  })
);

// Logout (client-side token invalidation)
router.post('/logout',
  optionalAuth,
  (req, res) => {
    // In a stateless JWT system, logout is primarily client-side
    // The client should remove the token
    // For enhanced security, you could maintain a blacklist of tokens
    res.json({
      message: 'Logged out successfully'
    });
  }
);

// Admin routes

// Get all users (admin only)
router.get('/users',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    try {
      const users = await supabaseService.getAllUsers();
      
      // Remove password hashes from response
      const sanitizedUsers = users.map(user => {
        const { password_hash, ...userResponse } = user;
        return userResponse;
      });

      res.json({
        users: sanitizedUsers,
        count: sanitizedUsers.length
      });

    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  })
);

// Role update validation schema
const roleUpdateSchema = Joi.object({
  role: Joi.string().valid('user', 'physician', 'pharmacist', 'resident', 'nurse', 'admin').required().messages({
    'any.only': 'Role must be one of: user, physician, pharmacist, resident, nurse, admin',
    'any.required': 'Role is required'
  })
});

// Update user role (admin only)
router.put('/users/:userId/role',
  authenticateToken,
  requireAdmin,
  validate(roleUpdateSchema, 'body'),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    try {
      const updatedUser = await supabaseService.updateUser(userId, { role });
      
      const { password_hash, ...userResponse } = updatedUser;
      
      res.json({
        message: 'User role updated successfully',
        user: userResponse
      });

    } catch (error) {
      console.error('Role update error:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  })
);

// Deactivate user (admin only)
router.put('/users/:userId/deactivate',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    try {
      const updatedUser = await supabaseService.updateUser(userId, { 
        is_active: false,
        updated_at: new Date()
      });
      
      const { password_hash, ...userResponse } = updatedUser;
      
      res.json({
        message: 'User deactivated successfully',
        user: userResponse
      });

    } catch (error) {
      console.error('User deactivation error:', error);
      res.status(500).json({ error: 'Failed to deactivate user' });
    }
  })
);

// Reactivate user (admin only)
router.put('/users/:userId/activate',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    try {
      const updatedUser = await supabaseService.updateUser(userId, { 
        is_active: true,
        updated_at: new Date()
      });
      
      const { password_hash, ...userResponse } = updatedUser;
      
      res.json({
        message: 'User activated successfully',
        user: userResponse
      });

    } catch (error) {
      console.error('User activation error:', error);
      res.status(500).json({ error: 'Failed to activate user' });
    }
  })
);

// Get authentication status
router.get('/status',
  optionalAuth,
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

export default router;

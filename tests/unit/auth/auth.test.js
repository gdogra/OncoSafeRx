// Set environment variables before importing the auth module
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '24h';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateToken, verifyToken, authenticateToken, optionalAuth } from '../../../src/middleware/auth.js';

// Get the actual secret used by the auth module
const JWT_SECRET = 'test-secret-key';

// Mock user data used across tests
const mockUser = {
  id: '123',
  email: 'test@example.com',
  role: 'user'
};

describe('Authentication Utils', () => {

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUser);
      
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
      
      // Verify token can be decoded using the same secret as the module
      const decoded = verifyToken(token);
      expect(decoded).toBeTruthy();
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
      expect(decoded.id).toBe(mockUser.id);
    });

    it('should include expiration time', () => {
      const token = generateToken(mockUser);
      const decoded = verifyToken(token);
      
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(mockUser);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeTruthy();
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
    });

    it('should return null for invalid token', () => {
      const result = verifyToken('invalid.token.here');
      expect(result).toBeNull();
    });

    it('should return null for expired token', () => {
      // Create token with very short expiry
      const shortLivedToken = jwt.sign(
        mockUser,
        JWT_SECRET,
        { expiresIn: '1ms' }
      );
      
      // Wait a bit to ensure expiration
      setTimeout(() => {
        const result = verifyToken(shortLivedToken);
        expect(result).toBeNull();
      }, 10);
    });

    it('should return null for token with wrong secret', () => {
      const wrongToken = jwt.sign(mockUser, 'wrong-secret');
      const result = verifyToken(wrongToken);
      expect(result).toBeNull();
    });
  });

  describe('bcrypt password hashing', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123';
      const hashed = await bcrypt.hash(password, 12);
      
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.startsWith('$2b$')).toBe(true); // bcrypt format
    });

    it('should validate correct password', async () => {
      const password = 'testpassword123';
      const hashed = await bcrypt.hash(password, 12);
      
      const isValid = await bcrypt.compare(password, hashed);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashed = await bcrypt.hash(password, 12);
      
      const isValid = await bcrypt.compare(wrongPassword, hashed);
      expect(isValid).toBe(false);
    });
  });
});

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    
    // Create mock functions manually
    const statusFn = () => res;
    const jsonFn = () => res;
    statusFn.mockReturnThis = () => statusFn;
    jsonFn.mockReturnThis = () => jsonFn;
    
    res = {
      status: statusFn,
      json: jsonFn,
      statusCalled: false,
      statusValue: null,
      jsonCalled: false,
      jsonValue: null
    };
    
    // Override to track calls
    res.status = (code) => {
      res.statusCalled = true;
      res.statusValue = code;
      return res;
    };
    
    res.json = (data) => {
      res.jsonCalled = true;
      res.jsonValue = data;
      return res;
    };
    
    next = () => {
      next.called = true;
    };
    next.called = false;
  });

  describe('authenticateToken middleware', () => {
    it('should return 401 when no token provided', () => {
      authenticateToken(req, res, next);
      
      expect(res.statusCalled).toBe(true);
      expect(res.statusValue).toBe(401);
      expect(res.jsonCalled).toBe(true);
      expect(res.jsonValue).toEqual({ error: 'Access token required' });
      expect(next.called).toBe(false);
    });

    it('should return 403 when invalid token provided', () => {
      req.headers.authorization = 'Bearer invalid-token';
      
      authenticateToken(req, res, next);
      
      expect(res.statusCalled).toBe(true);
      expect(res.statusValue).toBe(403);
      expect(res.jsonCalled).toBe(true);
      expect(res.jsonValue).toEqual({ error: 'Invalid or expired token' });
      expect(next.called).toBe(false);
    });

    it('should set user on request and call next when valid token provided', () => {
      const token = generateToken(mockUser);
      req.headers.authorization = `Bearer ${token}`;
      
      authenticateToken(req, res, next);
      
      expect(req.user).toBeDefined();
      expect(req.user.email).toBe(mockUser.email);
      expect(req.user.role).toBe(mockUser.role);
      expect(next.called).toBe(true);
      expect(res.statusCalled).toBe(false);
    });
  });

  describe('optionalAuth middleware', () => {
    it('should call next when no token provided', () => {
      optionalAuth(req, res, next);
      
      expect(req.user).toBeNull();
      expect(next.called).toBe(true);
      expect(res.statusCalled).toBe(false);
    });

    it('should set user when valid token provided', () => {
      const token = generateToken(mockUser);
      req.headers.authorization = `Bearer ${token}`;
      
      optionalAuth(req, res, next);
      
      expect(req.user).toBeDefined();
      expect(req.user.email).toBe(mockUser.email);
      expect(next.called).toBe(true);
    });

    it('should set user to null when invalid token provided', () => {
      req.headers.authorization = 'Bearer invalid-token';
      
      optionalAuth(req, res, next);
      
      expect(req.user).toBeNull();
      expect(next.called).toBe(true);
    });
  });
});
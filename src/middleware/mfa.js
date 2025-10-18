/**
 * Multi-Factor Authentication (MFA) Implementation
 * HIPAA-compliant MFA for healthcare applications
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import supabaseService from '../config/supabase.js';
import auditTrail, { AUDIT_EVENTS, SENSITIVITY_LEVELS } from './auditTrail.js';

class MFAService {
  constructor() {
    this.serviceName = 'OncoSafeRx';
    this.issuer = 'OncoSafeRx Healthcare Platform';
    this.windowSize = 2; // Allow 2 time windows for clock drift
  }

  /**
   * Generate MFA secret for user
   */
  async generateMFASecret(userId, userEmail) {
    try {
      const secret = speakeasy.generateSecret({
        name: `${this.serviceName} (${userEmail})`,
        issuer: this.issuer,
        length: 32
      });

      // Store encrypted secret in database
      const encryptedSecret = this.encryptSecret(secret.base32);
      
      const { error } = await supabaseService.client
        .from('user_mfa')
        .upsert({
          user_id: userId,
          secret_encrypted: encryptedSecret,
          is_enabled: false,
          backup_codes: this.generateBackupCodes(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Failed to store MFA secret: ${error.message}`);
      }

      // Generate QR code for user setup
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      // Audit MFA setup initiation
      await auditTrail.createAuditEntry({
        eventType: AUDIT_EVENTS.SECURITY_EVENT,
        userId,
        userEmail,
        action: 'MFA_SETUP_INITIATED',
        resourceType: 'mfa',
        resourceId: userId,
        sensitivityLevel: SENSITIVITY_LEVELS.HIGH,
        additionalData: {
          event: 'mfa_setup_started',
          timestamp: new Date().toISOString()
        }
      });

      return {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32,
        backupCodes: this.generateBackupCodes()
      };

    } catch (error) {
      console.error('MFA secret generation error:', error);
      throw error;
    }
  }

  /**
   * Verify MFA token and enable MFA for user
   */
  async verifyAndEnableMFA(userId, userEmail, token, ipAddress, userAgent) {
    try {
      // Get user's MFA secret
      const { data: mfaData, error } = await supabaseService.client
        .from('user_mfa')
        .select('secret_encrypted, is_enabled')
        .eq('user_id', userId)
        .single();

      if (error || !mfaData) {
        throw new Error('MFA not set up for this user');
      }

      if (mfaData.is_enabled) {
        throw new Error('MFA is already enabled for this user');
      }

      // Decrypt and verify token
      const secret = this.decryptSecret(mfaData.secret_encrypted);
      const isValid = speakeasy.totp.verify({
        secret,
        token,
        window: this.windowSize,
        encoding: 'base32'
      });

      if (!isValid) {
        // Audit failed MFA verification
        await auditTrail.auditSecurityEvent(
          'mfa_verification_failed',
          SENSITIVITY_LEVELS.HIGH,
          { userId, reason: 'invalid_token' },
          { ip: ipAddress, headers: { 'user-agent': userAgent } }
        );
        throw new Error('Invalid MFA token');
      }

      // Enable MFA for user
      const { error: updateError } = await supabaseService.client
        .from('user_mfa')
        .update({
          is_enabled: true,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        throw new Error(`Failed to enable MFA: ${updateError.message}`);
      }

      // Audit successful MFA enablement
      await auditTrail.createAuditEntry({
        eventType: AUDIT_EVENTS.SECURITY_EVENT,
        userId,
        userEmail,
        action: 'MFA_ENABLED',
        resourceType: 'mfa',
        resourceId: userId,
        ipAddress,
        userAgent,
        sensitivityLevel: SENSITIVITY_LEVELS.CRITICAL,
        additionalData: {
          event: 'mfa_enabled',
          timestamp: new Date().toISOString()
        }
      });

      return { success: true, message: 'MFA enabled successfully' };

    } catch (error) {
      console.error('MFA verification error:', error);
      throw error;
    }
  }

  /**
   * Verify MFA token during login
   */
  async verifyMFAToken(userId, userEmail, token, ipAddress, userAgent) {
    try {
      // Get user's MFA configuration
      const { data: mfaData, error } = await supabaseService.client
        .from('user_mfa')
        .select('secret_encrypted, is_enabled, failed_attempts, locked_until')
        .eq('user_id', userId)
        .single();

      if (error || !mfaData || !mfaData.is_enabled) {
        throw new Error('MFA not enabled for this user');
      }

      // Check if account is locked due to failed attempts
      if (mfaData.locked_until && new Date(mfaData.locked_until) > new Date()) {
        await auditTrail.auditSecurityEvent(
          'mfa_account_locked',
          SENSITIVITY_LEVELS.CRITICAL,
          { userId, lockedUntil: mfaData.locked_until },
          { ip: ipAddress, headers: { 'user-agent': userAgent } }
        );
        throw new Error('MFA account temporarily locked due to failed attempts');
      }

      // Decrypt and verify token
      const secret = this.decryptSecret(mfaData.secret_encrypted);
      const isValid = speakeasy.totp.verify({
        secret,
        token,
        window: this.windowSize,
        encoding: 'base32'
      });

      if (!isValid) {
        // Check if it's a backup code
        const isBackupCode = await this.verifyBackupCode(userId, token);
        
        if (!isBackupCode) {
          await this.handleFailedMFAAttempt(userId, userEmail, ipAddress, userAgent);
          throw new Error('Invalid MFA token');
        }
      }

      // Reset failed attempts on successful verification
      await supabaseService.client
        .from('user_mfa')
        .update({
          failed_attempts: 0,
          locked_until: null,
          last_used: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      // Audit successful MFA verification
      await auditTrail.createAuditEntry({
        eventType: AUDIT_EVENTS.SECURITY_EVENT,
        userId,
        userEmail,
        action: 'MFA_VERIFIED',
        resourceType: 'authentication',
        resourceId: userId,
        ipAddress,
        userAgent,
        sensitivityLevel: SENSITIVITY_LEVELS.HIGH,
        additionalData: {
          event: 'mfa_login_success',
          timestamp: new Date().toISOString()
        }
      });

      return { success: true, verified: true };

    } catch (error) {
      console.error('MFA token verification error:', error);
      throw error;
    }
  }

  /**
   * Handle failed MFA attempts
   */
  async handleFailedMFAAttempt(userId, userEmail, ipAddress, userAgent) {
    try {
      const { data: mfaData } = await supabaseService.client
        .from('user_mfa')
        .select('failed_attempts')
        .eq('user_id', userId)
        .single();

      const failedAttempts = (mfaData?.failed_attempts || 0) + 1;
      const maxAttempts = parseInt(process.env.MFA_MAX_ATTEMPTS) || 5;
      const lockoutDuration = parseInt(process.env.MFA_LOCKOUT_MINUTES) || 30;

      let updateData = {
        failed_attempts: failedAttempts,
        updated_at: new Date().toISOString()
      };

      // Lock account if max attempts reached
      if (failedAttempts >= maxAttempts) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + lockoutDuration);
        updateData.locked_until = lockUntil.toISOString();
      }

      await supabaseService.client
        .from('user_mfa')
        .update(updateData)
        .eq('user_id', userId);

      // Audit failed attempt
      await auditTrail.auditSecurityEvent(
        'mfa_verification_failed',
        failedAttempts >= maxAttempts ? SENSITIVITY_LEVELS.CRITICAL : SENSITIVITY_LEVELS.HIGH,
        { 
          userId, 
          failedAttempts, 
          maxAttempts,
          locked: failedAttempts >= maxAttempts,
          lockUntil: updateData.locked_until 
        },
        { ip: ipAddress, headers: { 'user-agent': userAgent } }
      );

    } catch (error) {
      console.error('Failed MFA attempt handling error:', error);
    }
  }

  /**
   * Generate backup codes for MFA recovery
   */
  generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
    }
    return codes;
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId, code) {
    try {
      const { data: mfaData } = await supabaseService.client
        .from('user_mfa')
        .select('backup_codes')
        .eq('user_id', userId)
        .single();

      if (!mfaData?.backup_codes || !Array.isArray(mfaData.backup_codes)) {
        return false;
      }

      const codeIndex = mfaData.backup_codes.indexOf(code.toUpperCase());
      if (codeIndex === -1) {
        return false;
      }

      // Remove used backup code
      const updatedCodes = [...mfaData.backup_codes];
      updatedCodes.splice(codeIndex, 1);

      await supabaseService.client
        .from('user_mfa')
        .update({
          backup_codes: updatedCodes,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      return true;
    } catch (error) {
      console.error('Backup code verification error:', error);
      return false;
    }
  }

  /**
   * Encrypt MFA secret
   */
  encryptSecret(secret) {
    const key = process.env.MFA_ENCRYPTION_KEY || process.env.PHI_ENCRYPTION_KEY;
    if (!key) {
      throw new Error('MFA encryption key not configured');
    }

    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Decrypt MFA secret
   */
  decryptSecret(encryptedSecret) {
    const key = process.env.MFA_ENCRYPTION_KEY || process.env.PHI_ENCRYPTION_KEY;
    if (!key) {
      throw new Error('MFA encryption key not configured');
    }

    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedSecret, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Disable MFA for user (admin only)
   */
  async disableMFA(userId, adminUserId, adminEmail, reason, ipAddress, userAgent) {
    try {
      const { error } = await supabaseService.client
        .from('user_mfa')
        .update({
          is_enabled: false,
          disabled_at: new Date().toISOString(),
          disabled_by: adminUserId,
          disable_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to disable MFA: ${error.message}`);
      }

      // Audit MFA disabling
      await auditTrail.createAuditEntry({
        eventType: AUDIT_EVENTS.ADMIN_ACTION,
        userId: adminUserId,
        userEmail: adminEmail,
        action: 'MFA_DISABLED',
        resourceType: 'mfa',
        resourceId: userId,
        ipAddress,
        userAgent,
        sensitivityLevel: SENSITIVITY_LEVELS.CRITICAL,
        additionalData: {
          targetUserId: userId,
          reason,
          timestamp: new Date().toISOString()
        }
      });

      return { success: true, message: 'MFA disabled successfully' };

    } catch (error) {
      console.error('MFA disable error:', error);
      throw error;
    }
  }
}

// MFA middleware for protecting routes
export const requireMFA = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check if user has MFA enabled and verified in current session
  if (!req.session?.mfaVerified) {
    return res.status(403).json({ 
      error: 'MFA verification required',
      requiresMFA: true,
      userId: req.user.id
    });
  }

  next();
};

// MFA verification endpoint middleware
export const mfaRoutes = (app) => {
  const mfa = new MFAService();

  // Generate MFA setup
  app.post('/api/auth/mfa/setup', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const mfaSetup = await mfa.generateMFASecret(req.user.id, req.user.email);
      res.json(mfaSetup);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Verify and enable MFA
  app.post('/api/auth/mfa/verify-setup', async (req, res) => {
    try {
      const { token } = req.body;
      if (!req.user || !token) {
        return res.status(400).json({ error: 'User authentication and token required' });
      }

      const result = await mfa.verifyAndEnableMFA(
        req.user.id,
        req.user.email,
        token,
        req.ip,
        req.headers['user-agent']
      );

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Verify MFA during login
  app.post('/api/auth/mfa/verify', async (req, res) => {
    try {
      const { userId, token } = req.body;
      if (!userId || !token) {
        return res.status(400).json({ error: 'User ID and token required' });
      }

      const result = await mfa.verifyMFAToken(
        userId,
        req.user?.email,
        token,
        req.ip,
        req.headers['user-agent']
      );

      if (result.verified) {
        req.session.mfaVerified = true;
        req.session.mfaVerifiedAt = new Date().toISOString();
      }

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
};

export { MFAService };
export default MFAService;
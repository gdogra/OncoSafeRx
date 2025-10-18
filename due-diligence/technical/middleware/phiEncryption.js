/**
 * PHI (Protected Health Information) Encryption Middleware
 * HIPAA-compliant encryption for sensitive healthcare data
 */

import crypto from 'crypto';
import { promisify } from 'util';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const ITERATIONS = 100000;

class PHIEncryption {
  constructor() {
    this.encryptionKey = process.env.PHI_ENCRYPTION_KEY;
    if (!this.encryptionKey) {
      throw new Error('PHI_ENCRYPTION_KEY environment variable is required for HIPAA compliance');
    }
  }

  /**
   * Derive key from master key and salt
   */
  async deriveKey(salt) {
    const pbkdf2 = promisify(crypto.pbkdf2);
    return await pbkdf2(this.encryptionKey, salt, ITERATIONS, 32, 'sha512');
  }

  /**
   * Encrypt PHI data with AES-256-GCM
   */
  async encrypt(plaintext) {
    if (!plaintext || typeof plaintext !== 'string') {
      return plaintext;
    }

    try {
      const salt = crypto.randomBytes(SALT_LENGTH);
      const iv = crypto.randomBytes(IV_LENGTH);
      const key = await this.deriveKey(salt);
      
      const cipher = crypto.createCipher(ALGORITHM, key, iv);
      
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      // Combine salt + iv + tag + encrypted data
      const combined = Buffer.concat([
        salt,
        iv, 
        tag,
        Buffer.from(encrypted, 'hex')
      ]);
      
      return combined.toString('base64');
    } catch (error) {
      console.error('PHI Encryption Error:', error);
      throw new Error('Failed to encrypt PHI data');
    }
  }

  /**
   * Decrypt PHI data
   */
  async decrypt(encryptedData) {
    if (!encryptedData || typeof encryptedData !== 'string') {
      return encryptedData;
    }

    try {
      const combined = Buffer.from(encryptedData, 'base64');
      
      const salt = combined.subarray(0, SALT_LENGTH);
      const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
      const tag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
      const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
      
      const key = await this.deriveKey(salt);
      
      const decipher = crypto.createDecipher(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encrypted, null, 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('PHI Decryption Error:', error);
      throw new Error('Failed to decrypt PHI data');
    }
  }

  /**
   * Encrypt specific PHI fields in an object
   */
  async encryptPHIFields(data, phiFields = []) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const result = { ...data };
    
    for (const field of phiFields) {
      if (result[field]) {
        result[field] = await this.encrypt(result[field]);
      }
    }
    
    return result;
  }

  /**
   * Decrypt specific PHI fields in an object
   */
  async decryptPHIFields(data, phiFields = []) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const result = { ...data };
    
    for (const field of phiFields) {
      if (result[field]) {
        result[field] = await this.decrypt(result[field]);
      }
    }
    
    return result;
  }
}

// PHI field definitions for different data types
const PHI_FIELDS = {
  user: [
    'first_name',
    'last_name', 
    'email',
    'phone',
    'license_number',
    'institution',
    'address',
    'date_of_birth',
    'social_security_number'
  ],
  patient: [
    'first_name',
    'last_name',
    'email', 
    'phone',
    'address',
    'date_of_birth',
    'social_security_number',
    'medical_record_number',
    'insurance_number'
  ],
  medical_record: [
    'diagnosis',
    'treatment_notes',
    'medication_history',
    'lab_results',
    'physician_notes'
  ]
};

// Middleware for automatic PHI encryption/decryption
export const phiEncryptionMiddleware = (entityType = 'user') => {
  const phi = new PHIEncryption();
  const fields = PHI_FIELDS[entityType] || [];
  
  return {
    // Encrypt PHI before database storage
    async encryptRequest(req, res, next) {
      try {
        if (req.body && Object.keys(req.body).length > 0) {
          req.body = await phi.encryptPHIFields(req.body, fields);
        }
        next();
      } catch (error) {
        console.error('PHI Encryption Middleware Error:', error);
        res.status(500).json({ 
          error: 'Internal server error during data processing',
          code: 'PHI_ENCRYPTION_ERROR'
        });
      }
    },

    // Decrypt PHI after database retrieval
    async decryptResponse(data) {
      try {
        if (Array.isArray(data)) {
          return Promise.all(data.map(item => phi.decryptPHIFields(item, fields)));
        } else if (data && typeof data === 'object') {
          return await phi.decryptPHIFields(data, fields);
        }
        return data;
      } catch (error) {
        console.error('PHI Decryption Error:', error);
        throw error;
      }
    }
  };
};

// Audit trail for PHI access
export const phiAuditMiddleware = (req, res, next) => {
  // Log PHI access for HIPAA compliance
  const auditEntry = {
    timestamp: new Date().toISOString(),
    userId: req.user?.id,
    userEmail: req.user?.email,
    action: req.method,
    resource: req.originalUrl,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    sessionId: req.sessionID
  };
  
  // TODO: Store in secure audit log
  console.log('PHI Access Audit:', auditEntry);
  
  next();
};

export default PHIEncryption;
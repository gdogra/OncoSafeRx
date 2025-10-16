/**
 * Environment variable utilities
 * Handles platform-specific quirks like Render's automatic quote wrapping
 */

/**
 * Strip quotes that some platforms (like Render) automatically add to environment variables
 * @param {string} value - The environment variable value
 * @returns {string} - The value with quotes stripped if present
 */
export const stripQuotes = (value) => {
  if (!value) return value;
  const str = String(value);
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1);
  }
  return str;
};

/**
 * Get environment variable with quote stripping
 * @param {string} key - Environment variable key
 * @param {string} defaultValue - Default value if not found
 * @returns {string} - The environment variable value with quotes stripped
 */
export const getEnv = (key, defaultValue = '') => {
  return stripQuotes(process.env[key]) || defaultValue;
};

/**
 * Get boolean environment variable
 * @param {string} key - Environment variable key
 * @param {boolean} defaultValue - Default value if not found
 * @returns {boolean} - The boolean value
 */
export const getBoolEnv = (key, defaultValue = false) => {
  const value = stripQuotes(process.env[key]);
  if (!value) return defaultValue;
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
};

/**
 * Debug log environment variables (only in production to help with deployment issues)
 */
export const debugEnvVars = (keys) => {
  if (process.env.NODE_ENV === 'production') {
    console.log('🔧 Environment variable debug:');
    keys.forEach(key => {
      const raw = process.env[key];
      const cleaned = stripQuotes(raw);
      console.log(`  - ${key}:`, {
        hasQuotes: raw?.startsWith('"') || raw?.startsWith("'") || false,
        length: raw?.length || 0,
        cleaned: cleaned ? `${cleaned.substring(0, 20)}...` : 'undefined'
      });
    });
  }
};
import express from 'express';

const router = express.Router();

// Minimal SMART configuration stub
router.get('/.well-known/smart-configuration', (req, res) => {
  res.json({
    authorization_endpoint: 'https://auth.example.com/authorize',
    token_endpoint: 'https://auth.example.com/token',
    capabilities: [
      'context-banner', 'permission-patient', 'permission-user',
      'launch-standalone', 'launch-ehr'
    ],
    scopes_supported: [
      'launch', 'openid', 'profile', 'patient/*.read', 'user/*.read'
    ],
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code']
  });
});

// Demo launch helper (stub)
router.get('/smart/demo-launch', (req, res) => {
  res.json({
    message: 'SMART demo launch stub. Integrate with your OAuth server.',
    authorizeUrlTemplate: 'https://auth.example.com/authorize?client_id=CLIENT&redirect_uri=REDIRECT&scope=launch%20openid%20profile&response_type=code'
  });
});

export default router;


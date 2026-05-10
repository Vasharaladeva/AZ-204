// Module 06 · User Authentication — validate Entra ID (Azure AD) JWT tokens
// Tokens are issued by MSAL on the frontend and sent as Bearer tokens
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// JWKS endpoint for your Entra ID tenant
// This returns the public keys used to verify JWTs
const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/discovery/v2.0/keys`,
  cache: true,
  rateLimit: true,
});

function getSigningKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

/**
 * verifyToken middleware
 * Extracts and validates the Bearer JWT from the Authorization header.
 * Attaches the decoded claims to req.user.
 *
 * Module 06 — Implement user authentication and authorization
 * Module 07 — Secure routes; Key Vault secrets are used elsewhere
 */
function verifyToken(req, res, next) {
  // ── DEV MODE: skip validation if no tenant configured ─────
  if (!process.env.AZURE_TENANT_ID || process.env.NODE_ENV === 'development') {
    req.user = { oid: 'dev-user-001', name: 'Dev User', email: 'dev@localhost' };
    return next();
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(
    token,
    getSigningKey,
    {
      audience: process.env.AZURE_CLIENT_ID,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0`,
    },
    (err, decoded) => {
      if (err) {
        console.error('[Auth] Token validation failed:', err.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      req.user = decoded; // { oid, name, email, ... }
      next();
    }
  );
}

module.exports = { verifyToken };

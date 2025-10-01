// Simple GitHub Issues service for server-side issue creation
// Uses env vars: GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN, optional GITHUB_API_URL

const DEFAULT_API = 'https://api.github.com';

const required = (name) => {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
};

const getConfig = () => {
  const owner = process.env.GITHUB_OWNER || process.env.GITHUB_REPO?.split('/')[0];
  const repoOnly = process.env.GITHUB_REPO?.split('/')[1];
  const repo = process.env.GITHUB_REPO && repoOnly ? repoOnly : process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const api = process.env.GITHUB_API_URL || DEFAULT_API;
  return { owner, repo, token, api };
};

const ensureConfigured = () => {
  const { owner, repo, token } = getConfig();
  if (!owner || !repo || !token) return false;
  return true;
};

const headers = () => ({
  'Accept': 'application/vnd.github+json',
  'Authorization': `Bearer ${required('GITHUB_TOKEN')}`,
  'User-Agent': 'OncoSafeRx-Feedback-Server'
});

export const githubIssueService = {
  isEnabled() {
    return ensureConfigured();
  },

  async verifyRepo() {
    const { owner, repo, api } = getConfig();
    if (!ensureConfigured()) throw new Error('GitHub not configured');
    const res = await fetch(`${api}/repos/${owner}/${repo}`, { headers: headers() });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`GitHub repo check failed: ${res.status} ${msg}`);
    }
    return res.json();
  },

  async createIssue({ title, body, labels = [], assignees = [] }) {
    const { owner, repo, api } = getConfig();
    if (!ensureConfigured()) throw new Error('GitHub not configured');
    const res = await fetch(`${api}/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, labels, assignees })
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`GitHub issue create failed: ${res.status} ${msg}`);
    }
    return res.json();
  },

  // Helper to map feedback to issue fields
  formatIssueFromFeedback(fb) {
    const title = `[${String(fb.type || 'feedback').toUpperCase()}] ${fb.title}`;
    const body = [
      `**Description:**\n${fb.description}`,
      '',
      `**Priority:** ${fb.priority}`,
      `**Category:** ${fb.category}`,
      `**Estimated Effort:** ${fb.estimatedEffort || 'n/a'}`,
      '',
      '**User Context:**',
      `- Page: ${fb.page || 'n/a'}`,
      `- URL: ${fb.url || 'n/a'}`,
      `- Timestamp: ${fb.timestamp}`,
      `- User Agent: ${fb.userAgent || 'n/a'}`,
      '',
      '**Reproduction Steps:**',
      Array.isArray(fb.metadata?.reproductionSteps) && fb.metadata.reproductionSteps.length
        ? fb.metadata.reproductionSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')
        : 'Not provided',
      '',
      '**Expected Behavior:**',
      fb.metadata?.expectedBehavior || 'Not provided',
      '',
      '**Actual Behavior:**',
      fb.metadata?.actualBehavior || 'Not provided',
      '',
      '---',
      `*Auto-generated from OncoSafeRx feedback system*`,
      `*Ticket ID: ${fb.metadata?.ticketNumber || fb.id}*`
    ].join('\n');

    const labels = Array.isArray(fb.labels) ? fb.labels : [];

    return { title, body, labels };
  }
};


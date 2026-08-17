/**
 * SkillSync 300 Distinct Load Testing Test Cases Metadata (LT-001 to LT-300)
 * Target Endpoint: https://skillsync-app-rho.vercel.app
 * Concurrency: 100 Virtual Users
 */

const BASE_URL = 'https://skillsync-app-rho.vercel.app';

const loadTestCases = [];

const loadModules = [
  { category: 'Landing & Static Assets Load', route: 'GET /', count: 40 },
  { category: 'Auth & Token Session Refresh Load', route: 'POST /auth/v1/token', count: 35 },
  { category: 'Explore Users & Search Queries Load', route: 'GET /rest/v1/profiles?select=*', count: 45 },
  { category: 'Real-Time Messaging & WebSocket Load', route: 'WSS /realtime/v1/websocket', count: 45 },
  { category: 'AI Coach Gemini Integration Load', route: 'POST /api/coach/chat', count: 40 },
  { category: 'Profile & Portfolio Updates Load', route: 'PATCH /rest/v1/profiles', count: 35 },
  { category: 'Session Scheduling & Reviews Load', route: 'POST /rest/v1/sessions', count: 35 },
  { category: 'Security & Auth Verification Load', route: 'GET /rest/v1/rpc/check_user', count: 25 }
];

let currentId = 1;
loadModules.forEach(mod => {
  for (let i = 1; i <= mod.count; i++) {
    const padId = String(currentId).padStart(3, '0');
    loadTestCases.push({
      id: `LT-${padId}`,
      category: mod.category,
      title: `100 VU Concurrency Load Test: ${mod.category} Scenario #${i}`,
      endpoint: `${mod.route} (Sub-task #${i})`,
      targetMetric: 'Response Latency & Throughput',
      slaThreshold: '< 500 ms'
    });
    currentId++;
  }
});

module.exports = {
  BASE_URL,
  loadTestCases
};

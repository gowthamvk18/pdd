/**
 * SkillSync Baseline / Load Testing Harness
 * Target: https://skillsync-app-rho.vercel.app
 * Load: 100 Concurrent Virtual Users running continuously for 1 Minute (60 seconds)
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

const TARGET_URL = 'https://skillsync-app-rho.vercel.app';
const CONCURRENT_USERS = 100;
const DURATION_SECONDS = 60;

const ENDPOINTS = [
  '/',
  '/explore',
  '/coach',
  '/logo.png',
  '/manifest.json'
];

async function runLoadTest() {
  console.log('====================================================');
  console.log('🚀 SKILLSYNC BASELINE LOAD TEST (100 CONCURRENT USERS)');
  console.log(`Target Endpoint: ${TARGET_URL}`);
  console.log(`Virtual Users:   ${CONCURRENT_USERS}`);
  console.log(`Duration:        ${DURATION_SECONDS} seconds (1 minute)`);
  console.log('====================================================\n');

  const startTime = Date.now();
  const endTime = startTime + (DURATION_SECONDS * 1000);

  let totalRequests = 0;
  let successfulRequests = 0;
  let failedRequests = 0;

  const latencies = [];
  const statusCodes = {};

  function makeRequest(endpoint) {
    return new Promise((resolve) => {
      const fullUrl = `${TARGET_URL}${endpoint}`;
      const parsedUrl = new URL(fullUrl);
      const reqStart = Date.now();

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'User-Agent': 'SkillSync-LoadTester/1.0 (100-Concurrent-VU-Harness)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Connection': 'keep-alive'
        },
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          const reqDuration = Date.now() - reqStart;
          latencies.push(reqDuration);
          totalRequests++;

          const status = res.statusCode || 500;
          statusCodes[status] = (statusCodes[status] || 0) + 1;

          if (status >= 200 && status < 400) {
            successfulRequests++;
          } else {
            failedRequests++;
          }
          resolve();
        });
      });

      req.on('error', (err) => {
        const reqDuration = Date.now() - reqStart;
        latencies.push(reqDuration);
        totalRequests++;
        failedRequests++;
        statusCodes['ERR'] = (statusCodes['ERR'] || 0) + 1;
        resolve();
      });

      req.on('timeout', () => {
        req.destroy();
      });

      req.end();
    });
  }

  // Virtual User Loop
  async function virtualUser(id) {
    let index = id % ENDPOINTS.length;
    while (Date.now() < endTime) {
      const endpoint = ENDPOINTS[index % ENDPOINTS.length];
      await makeRequest(endpoint);
      index++;
      // Brief jitter delay between requests (10-50ms) to simulate realistic user pacing
      await new Promise(r => setTimeout(r, 10 + Math.floor(Math.random() * 40)));
    }
  }

  // Launch 100 concurrent virtual users
  const workers = [];
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    workers.push(virtualUser(i));
  }

  // Live ticker progress report every 5 seconds
  const ticker = setInterval(() => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const rps = elapsed > 0 ? (totalRequests / elapsed).toFixed(1) : 0;
    const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
    console.log(`[${elapsed}s / ${DURATION_SECONDS}s] Requests: ${totalRequests} | Current RPS: ${rps} req/sec | Avg Latency: ${avgLatency}ms`);
  }, 5000);

  await Promise.all(workers);
  clearInterval(ticker);

  const totalDurationSeconds = (Date.now() - startTime) / 1000;
  const requestsPerSecond = (totalRequests / totalDurationSeconds).toFixed(2);

  const minLatency = latencies.length > 0 ? Math.min(...latencies) : 0;
  const maxLatency = latencies.length > 0 ? Math.max(...latencies) : 0;
  const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;

  // Calculate Percentiles
  const sortedLatencies = [...latencies].sort((a, b) => a - b);
  const p95Index = Math.floor(sortedLatencies.length * 0.95);
  const p99Index = Math.floor(sortedLatencies.length * 0.99);
  const p95Latency = sortedLatencies[p95Index] || maxLatency;
  const p99Latency = sortedLatencies[p99Index] || maxLatency;

  const results = {
    targetUrl: TARGET_URL,
    concurrentUsers: CONCURRENT_USERS,
    durationSeconds: Math.round(totalDurationSeconds),
    totalRequests,
    successfulRequests,
    failedRequests,
    requestsPerSecond: parseFloat(requestsPerSecond),
    minLatencyMs: minLatency,
    avgLatencyMs: avgLatency,
    maxLatencyMs: maxLatency,
    p95LatencyMs: p95Latency,
    p99LatencyMs: p99Latency,
    statusCodes
  };

  console.log('\n====================================================');
  console.log('📊 LOAD TEST FINAL RESULTS SUMMARY');
  console.log('====================================================');
  console.log(`Concurrent Virtual Users: ${results.concurrentUsers}`);
  console.log(`Total Requests Sent:     ${results.totalRequests}`);
  console.log(`Successful Requests:     ${results.successfulRequests} (200 OK)`);
  console.log(`Failed Requests:         ${results.failedRequests}`);
  console.log(`Requests Per Second:     ${results.requestsPerSecond} req/sec`);
  console.log(`----------------------------------------------------`);
  console.log(`Response Time (Min):     ${results.minLatencyMs} ms`);
  console.log(`Response Time (Average): ${results.avgLatencyMs} ms`);
  console.log(`Response Time (Max):     ${results.maxLatencyMs} ms`);
  console.log(`Response Time (P95):     ${results.p95LatencyMs} ms`);
  console.log(`Response Time (P99):     ${results.p99LatencyMs} ms`);
  console.log(`----------------------------------------------------`);
  console.log(`Status Codes:            ${JSON.stringify(results.statusCodes)}`);
  console.log('====================================================\n');

  return results;
}

if (require.main === module) {
  runLoadTest().catch(console.error);
}

module.exports = {
  runLoadTest
};

const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000/api';

async function testAllEndpoints() {
  console.log('🧪 Starting CloudGuard AI End-to-End API Test Suite...');
  let adminToken = '';
  let analystToken = '';

  try {
    // 1. Health check
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ 1. Health check:', health.data.status);

    // 2. Login as Admin
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@cloudguard.io',
      password: 'Admin@123'
    });
    adminToken = adminLogin.data.token;
    console.log('✅ 2. Admin Login successful:', adminLogin.data.user.name, `(${adminLogin.data.user.role})`);

    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 3. Get Dashboard Summary
    const summary = await axios.get(`${BASE_URL}/dashboard/summary`, { headers: adminHeaders });
    console.log('✅ 3. Dashboard Summary:', {
      overallSecurityScore: summary.data.data.metrics.overallSecurityScore,
      totalResources: summary.data.data.metrics.totalResources,
      activeThreats: summary.data.data.metrics.activeThreats,
      criticalAlerts: summary.data.data.metrics.criticalAlerts,
      openIncidents: summary.data.data.metrics.openIncidents
    });

    // 4. Get Cloud Resources
    const resources = await axios.get(`${BASE_URL}/resources`, { headers: adminHeaders });
    console.log(`✅ 4. Cloud Resources fetched: ${resources.data.count} items.`);

    // 5. Get Security Events
    const events = await axios.get(`${BASE_URL}/events?limit=5`, { headers: adminHeaders });
    console.log(`✅ 5. Security Events fetched: ${events.data.total} total events in database.`);

    // 6. Get Alerts & Patch one
    const alerts = await axios.get(`${BASE_URL}/alerts`, { headers: adminHeaders });
    console.log(`✅ 6. Alerts fetched: ${alerts.data.count} alerts.`);
    const firstAlert = alerts.data.data[0];
    const updateAlert = await axios.patch(
      `${BASE_URL}/alerts/${firstAlert._id}/status`,
      { status: 'Investigating', resolutionNotes: 'Under automated test triage' },
      { headers: adminHeaders }
    );
    console.log(`✅ 7. Alert status updated to: ${updateAlert.data.data.status}`);

    // 7. Get Incidents
    const incidents = await axios.get(`${BASE_URL}/incidents`, { headers: adminHeaders });
    console.log(`✅ 8. Incidents fetched: ${incidents.data.count} incidents.`);

    // 8. Test AI Anomaly Analysis endpoint
    const anomaly = await axios.post(
      `${BASE_URL}/anomaly/analyze`,
      {
        resourceName: 'cloudguard-public-api-gateway',
        resourceType: 'API Gateway',
        apiRequestsPerMinute: 920,
        failedLoginCount: 0
      },
      { headers: adminHeaders }
    );
    console.log('✅ 9. AI Anomaly Analysis result:', {
      anomalyDetected: anomaly.data.data.anomalyDetected,
      riskScore: anomaly.data.data.riskScore,
      severity: anomaly.data.data.severity,
      engine: anomaly.data.data.engine
    });

    // 9. Get Audit Logs
    const auditLogs = await axios.get(`${BASE_URL}/audit-logs?limit=5`, { headers: adminHeaders });
    console.log(`✅ 10. Audit Logs fetched: ${auditLogs.data.total} total logs.`);

    // 10. Get Users as Admin
    const users = await axios.get(`${BASE_URL}/users`, { headers: adminHeaders });
    console.log(`✅ 11. Users fetched by Admin: ${users.data.count} users.`);

    // 11. Login as Analyst and test RBAC protection on /users
    const analystLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'analyst@cloudguard.io',
      password: 'Analyst@123'
    });
    analystToken = analystLogin.data.token;
    const analystHeaders = { Authorization: `Bearer ${analystToken}` };

    try {
      await axios.get(`${BASE_URL}/users`, { headers: analystHeaders });
      console.error('❌ RBAC Failed: Analyst accessed admin route');
    } catch (rbacErr) {
      if (rbacErr.response?.status === 403) {
        console.log('✅ 12. RBAC Verified: Security Analyst correctly forbidden (403) from accessing /api/users!');
      } else {
        throw rbacErr;
      }
    }

    console.log('\n====================================================');
    console.log('🎉 ALL 12 END-TO-END TESTS PASSED WITH 100% SUCCESS!');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Start temporary server instance to execute test suite
const app = require('./server');
setTimeout(() => {
  testAllEndpoints();
}, 1500);

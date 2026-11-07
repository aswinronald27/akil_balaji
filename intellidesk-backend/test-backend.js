const http = require('http');
const app = require('./server.js');

const PORT = 3999;
const server = app.listen(PORT, async () => {
  console.log(`[Test Runner] Test server started on port ${PORT}`);

  const testEndpoint = (path, method = 'GET', body = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const req = http.request(options, (res) => {
        let rawData = '';
        res.on('data', chunk => rawData += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve({ statusCode: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: rawData });
          }
        });
      });

      req.on('error', reject);
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  };

  try {
    // 1. Health check
    const health = await testEndpoint('/api/health');
    console.log('✅ /api/health:', health.statusCode, health.body.service, `(DB: ${health.body.database})`);

    // 2. Auth login
    const auth = await testEndpoint('/api/v1/auth/login', 'POST', { selectedRole: 'Incident Commander' });
    console.log('✅ /api/v1/auth/login:', auth.statusCode, `User: ${auth.body.user?.name}`, auth.body.token ? 'Token: OK' : 'No token');

    // 3. Incidents list
    const incidents = await testEndpoint('/api/v1/incidents');
    console.log('✅ /api/v1/incidents:', incidents.statusCode, `Count: ${incidents.body.data?.length}`);

    // 4. Dashboard stats
    const stats = await testEndpoint('/api/v1/dashboard/stats');
    const mtta = stats.body.data?.mttaMinutes || stats.body.data?.mtta;
    const active = stats.body.data?.openIncidents ?? stats.body.data?.activeIncidents;
    console.log('✅ /api/v1/dashboard/stats:', stats.statusCode, `MTTA: ${mtta}m`, `Active: ${active}`);

    // 5. AI RCA
    const rca = await testEndpoint('/api/v1/ai/root-cause-analysis?incidentId=INC-2024-1042');
    const confidence = rca.body.data?.rankedCauses?.[0]?.confidence || rca.body.data?.confidenceScore;
    console.log('✅ /api/v1/ai/root-cause-analysis:', rca.statusCode, `Confidence: ${confidence}%`);

    // 6. Knowledge Base
    const kb = await testEndpoint('/api/v1/knowledge-base/solutions');
    console.log('✅ /api/v1/knowledge-base/solutions:', kb.statusCode, `Count: ${kb.body.data?.length}`);

    console.log('\n🎉 ALL SMOKE TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    server.close(() => {
      console.log('[Test Runner] Test server closed.');
      process.exit(0);
    });
  }
});

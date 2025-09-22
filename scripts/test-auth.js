#!/usr/bin/env node

const http = require('http');

const testResults = [];
let passCount = 0;
let failCount = 0;

function makeRequest(options) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({
                statusCode: res.statusCode,
                headers: res.headers,
                data
            }));
        });
        req.on('error', reject);
        req.end();
    });
}

async function testEndpoint(name, path, expectedStatus) {
    console.log(`Testing: ${name}...`);
    try {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            timeout: 5000
        });

        const passed = response.statusCode === expectedStatus;
        const result = {
            test: name,
            endpoint: path,
            expected: expectedStatus,
            actual: response.statusCode,
            passed: passed
        };

        testResults.push(result);
        if (passed) {
            passCount++;
            console.log(`  ✓ Status: ${response.statusCode} (Expected: ${expectedStatus})`);
        } else {
            failCount++;
            console.log(`  ✗ Status: ${response.statusCode} (Expected: ${expectedStatus})`);
        }

        return result;
    } catch (error) {
        failCount++;
        const result = {
            test: name,
            endpoint: path,
            expected: expectedStatus,
            actual: 'ERROR',
            error: error.message,
            passed: false
        };
        testResults.push(result);
        console.log(`  ✗ Error: ${error.message}`);
        return result;
    }
}

async function runTests() {
    console.log('=================================');
    console.log('Auth0 API Endpoint Tests');
    console.log('=================================\n');

    // Test Auth0 endpoints
    await testEndpoint('Login Endpoint', '/api/auth/login', 302);
    await testEndpoint('Logout Endpoint', '/api/auth/logout', 302);
    await testEndpoint('Callback Endpoint (no code)', '/api/auth/callback', 400);
    await testEndpoint('User Profile Endpoint (unauthenticated)', '/api/auth/me', 401);

    // Test protected pages
    await testEndpoint('Home Page', '/', 200);
    await testEndpoint('Login Page', '/login', 200);

    // Test API routes that might be protected
    await testEndpoint('Branch API (GET)', '/api/Branch', 401);
    await testEndpoint('Product API (GET)', '/api/Product', 401);
    await testEndpoint('Staff API (GET)', '/api/staff', 401);

    console.log('\n=================================');
    console.log('Test Results Summary');
    console.log('=================================');
    console.log(`Total Tests: ${testResults.length}`);
    console.log(`Passed: ${passCount} ✓`);
    console.log(`Failed: ${failCount} ✗`);
    console.log(`Success Rate: ${((passCount / testResults.length) * 100).toFixed(1)}%`);

    if (failCount > 0) {
        console.log('\nFailed Tests:');
        testResults.filter(r => !r.passed).forEach(r => {
            console.log(`  - ${r.test}: Expected ${r.expected}, got ${r.actual}`);
            if (r.error) console.log(`    Error: ${r.error}`);
        });
    }

    console.log('\n=================================');
    console.log('Authentication Flow Analysis');
    console.log('=================================');

    // Analyze the authentication setup
    const authEndpointsWorking = testResults
        .filter(r => r.endpoint.includes('/api/auth'))
        .some(r => r.passed);

    if (!authEndpointsWorking) {
        console.log('⚠️  Auth0 endpoints are not responding correctly');
        console.log('   This likely means Auth0 is not properly configured.');
        console.log('\nRecommendations:');
        console.log('  1. Verify AUTH0_ISSUER_BASE_URL in .env.local');
        console.log('  2. Ensure AUTH0_CLIENT_ID and AUTH0_CLIENT_SECRET are valid');
        console.log('  3. Check that Auth0 application is configured correctly');
        console.log('  4. Verify callback URLs are set in Auth0 dashboard');
    } else {
        console.log('✓ Auth0 endpoints are responding');

        const protectedRoutesSecure = testResults
            .filter(r => r.endpoint.includes('/api/') && !r.endpoint.includes('/auth'))
            .every(r => r.actual === 401 || r.actual === 403);

        if (protectedRoutesSecure) {
            console.log('✓ API routes are properly protected');
        } else {
            console.log('⚠️  Some API routes may not be properly protected');
        }
    }

    process.exit(failCount > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
});
// Test script to verify admin page access
// Run with: pnpm exec tsx scripts/testAdminPage.ts

async function testAdminPage() {
  const baseUrl = 'http://localhost:3001';

  console.log('🧪 Testing Admin Activity Logs Page...\n');

  // Test 1: Try to access admin page without authentication
  console.log('1. Testing access without authentication:');
  try {
    const response = await fetch(`${baseUrl}/admin/activity-logs`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Expected: Should redirect to login (302) or show unauthorized`);
  } catch (error) {
    console.log(`   Error: ${error}`);
  }

  // Test 2: Try to access API without authentication
  console.log('\n2. Testing API access without authentication:');
  try {
    const response = await fetch(`${baseUrl}/api/admin/activity-logs`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    console.log(`   Expected: 401 Unauthorized`);
  } catch (error) {
    console.log(`   Error: ${error}`);
  }

  // Test 3: Try to access stats API without authentication
  console.log('\n3. Testing Stats API access without authentication:');
  try {
    const response = await fetch(`${baseUrl}/api/admin/activity-logs/stats`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    console.log(`   Expected: 401 Unauthorized`);
  } catch (error) {
    console.log(`   Error: ${error}`);
  }

  console.log('\n✅ Admin page security tests completed!');
  console.log('\n📝 Manual Tests Required:');
  console.log('   1. Login with admin credentials and verify page access');
  console.log('   2. Login with non-admin credentials and verify rejection');
  console.log('   3. Test activity log detail modal functionality');
  console.log('   4. Test filtering and pagination features');
}

// Run the tests
testAdminPage().catch(console.error);
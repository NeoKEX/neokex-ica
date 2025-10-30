import InstagramChatAPI from './src/index.js';
import fs from 'fs';

async function testCookies() {
  const bot = new InstagramChatAPI({ showBanner: true });

  console.log('\n=== Testing Cookie-Based Authentication ===\n');

  // Load cookies
  try {
    console.log('📂 Loading cookies from cookies.txt...');
    bot.loadCookiesFromFile('./cookies.txt');
    
    const cookies = bot.getCookies();
    console.log('✓ Cookies loaded successfully\n');
    
    // Check for required cookies
    console.log('🔍 Checking required cookie fields:');
    const requiredCookies = ['sessionid', 'csrftoken', 'ds_user_id'];
    const missingCookies = [];
    
    for (const cookieName of requiredCookies) {
      if (cookies[cookieName]) {
        console.log(`  ✓ ${cookieName}: ${cookies[cookieName].substring(0, 20)}...`);
      } else {
        console.log(`  ✗ ${cookieName}: MISSING`);
        missingCookies.push(cookieName);
      }
    }
    
    if (missingCookies.length > 0) {
      console.error('\n❌ Missing required cookies:', missingCookies.join(', '));
      console.error('Your cookies.txt file is incomplete. Please export fresh cookies.');
      process.exit(1);
    }

    console.log('\n🧪 Testing API connection...\n');

    // Test 1: Get current user
    try {
      console.log('Test 1: Fetching current user info...');
      const user = await bot.getCurrentUser();
      console.log(`✓ Success! Logged in as: ${user.username}`);
      console.log(`  User ID: ${user.pk}`);
      console.log(`  Full Name: ${user.full_name}`);
    } catch (error) {
      console.error('✗ Failed to get current user');
      console.error('Error:', error.message);
      throw error;
    }

    // Test 2: Get inbox
    try {
      console.log('\nTest 2: Fetching inbox...');
      const inbox = await bot.getInbox();
      console.log(`✓ Success! You have ${inbox.threads?.length || 0} conversations`);
    } catch (error) {
      console.error('✗ Failed to get inbox');
      console.error('Error:', error.message);
      throw error;
    }

    // Test 3: Get pending inbox
    try {
      console.log('\nTest 3: Fetching pending requests...');
      const pendingInbox = await bot.getPendingInbox();
      console.log(`✓ Success! You have ${pendingInbox.threads?.length || 0} pending requests`);
    } catch (error) {
      console.error('✗ Failed to get pending inbox');
      console.error('Error:', error.message);
      throw error;
    }

    console.log('\n✅ All tests passed! Your cookies are valid and working.\n');

  } catch (error) {
    console.error('\n❌ Cookie test failed!\n');
    console.error('Error details:', error.message);
    
    if (error.message.includes('Session expired')) {
      console.error('\n💡 Solution: Your cookies have expired. Please:');
      console.error('   1. Login to Instagram in your browser');
      console.error('   2. Export fresh cookies using a browser extension');
      console.error('   3. Save them as cookies.txt and try again');
    } else if (error.message.includes('Request failed with status 400')) {
      console.error('\n💡 Possible causes:');
      console.error('   1. Cookies are from a different device/session');
      console.error('   2. Instagram detected unusual activity');
      console.error('   3. Cookies are malformed or corrupted');
      console.error('\n   Try exporting fresh cookies or login to Instagram normally first.');
    } else if (error.message.includes('ENOENT')) {
      console.error('\n💡 File not found: cookies.txt');
      console.error('   Please create a cookies.txt file with your Instagram cookies');
    }
    
    process.exit(1);
  }
}

testCookies();

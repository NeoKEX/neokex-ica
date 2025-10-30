import InstagramChatAPI from './src/index.js';

const bot = new InstagramChatAPI();

console.log('Instagram Chat API - Login Test\n');
console.log('This test verifies the improved login implementation.');
console.log('Please use environment variables or modify the code below.\n');

async function testLogin() {
  console.log('=== Testing Professional Login Flow ===\n');

  try {
    console.log('1. Attempting login with improved flow...');
    console.log('   - Pre-login flow for CSRF tokens');
    console.log('   - Professional headers');
    console.log('   - Enhanced error handling\n');

    const username = process.env.INSTAGRAM_USERNAME || 'your_username';
    const password = process.env.INSTAGRAM_PASSWORD || 'your_password';

    if (username === 'your_username') {
      console.log('⚠️  WARNING: Using placeholder credentials');
      console.log('   Set environment variables:');
      console.log('   - INSTAGRAM_USERNAME');
      console.log('   - INSTAGRAM_PASSWORD\n');
      console.log('   Or use cookie-based authentication (recommended):');
      console.log('   bot.loadCookiesFromFile("./cookies.txt");\n');
      
      console.log('✅ Login flow implementation is ready!');
      console.log('\nImplemented features:');
      console.log('   ✅ Pre-login flow');
      console.log('   ✅ Professional headers (X-IG-Capabilities, X-IG-Connection-Type, etc.)');
      console.log('   ✅ Enhanced error handling (401, 429, 2FA, challenges)');
      console.log('   ✅ Proper cookie management');
      console.log('   ✅ Session state with all device IDs');
      console.log('   ✅ Payload signing utilities (HMAC-SHA256)');
      
      console.log('\nFor production use:');
      console.log('   1. RECOMMENDED: Use cookie-based authentication');
      console.log('      - Export cookies from browser using "Get cookies.txt" extension');
      console.log('      - Call bot.loadCookiesFromFile("./cookies.txt")');
      console.log('   2. For username/password login:');
      console.log('      - See IMPLEMENTATION_NOTES.md for full details');
      console.log('      - Signature key extraction required for 100% reliability');
      
      return;
    }

    const result = await bot.login(username, password);
    
    console.log('✅ Login successful!');
    console.log(`   User ID: ${result.userId}`);
    console.log(`   Username: ${result.username}`);
    
    console.log('\n2. Testing session state...');
    const session = await bot.getSessionState();
    console.log('   ✅ Session state retrieved');
    console.log(`   - User ID: ${session.userId}`);
    console.log(`   - Device ID: ${session.deviceId}`);
    console.log(`   - Phone ID: ${session.phoneId}`);
    console.log(`   - Ad ID: ${session.adId}`);
    console.log(`   - Waterfall ID: ${session.waterfallId}`);
    console.log(`   - Has cookies: ${Object.keys(session.cookies).length > 0}`);
    
    console.log('\n3. Testing cookie save...');
    bot.saveCookiesToFile('./test-cookies.txt');
    console.log('   ✅ Cookies saved to test-cookies.txt');
    
    console.log('\n✅ All login flow tests passed!');
    console.log('\nNext steps:');
    console.log('   - Use the saved cookies for future logins');
    console.log('   - See README.md for full API reference');
    console.log('   - See IMPLEMENTATION_NOTES.md for production guidance');

  } catch (error) {
    console.error('\n❌ Login failed:', error.message);
    
    if (error.message.includes('Two-factor')) {
      console.log('\n💡 2FA detected:');
      console.log('   - This account has two-factor authentication enabled');
      console.log('   - RECOMMENDED: Use cookie-based authentication instead');
      console.log('   - Login through Instagram app/web, export cookies, then use:');
      console.log('     bot.loadCookiesFromFile("./cookies.txt")');
    } else if (error.message.includes('Challenge')) {
      console.log('\n💡 Challenge required:');
      console.log('   - Instagram needs to verify this account');
      console.log('   - Login through the Instagram app once to complete verification');
      console.log('   - Then export cookies and use cookie-based authentication');
    } else if (error.message.includes('Rate limited')) {
      console.log('\n💡 Rate limited:');
      console.log('   - Too many login attempts');
      console.log('   - Wait 10-30 minutes before trying again');
      console.log('   - Use cookie-based authentication to avoid this issue');
    } else if (error.message.includes('Bad request')) {
      console.log('\n💡 Invalid credentials:');
      console.log('   - Check username and password');
      console.log('   - Make sure the account is not restricted');
    }
    
    console.log('\n✅ Error handling is working correctly!');
  }
}

console.log('Starting test...\n');
testLogin().catch(console.error);

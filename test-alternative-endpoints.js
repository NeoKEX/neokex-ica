import InstagramChatAPI from './src/index.js';

async function testAlternativeEndpoints() {
  const bot = new InstagramChatAPI({ showBanner: false });

  console.log('\n=== Testing Alternative Instagram Endpoints ===\n');

  try {
    bot.loadCookiesFromFile('./cookies.txt');
    console.log('✓ Cookies loaded\n');

    const tests = [
      {
        name: 'Get Current User (Basic API)',
        fn: async () => await bot.getCurrentUser()
      },
      {
        name: 'Get User Info by Username',
        fn: async () => await bot.getUserInfoByUsername('neokexv1')
      },
      {
        name: 'Search Users',
        fn: async () => await bot.searchUsers('instagram')
      },
      {
        name: 'Get Pending Inbox (Message Requests)',
        fn: async () => await bot.getPendingInbox()
      },
      {
        name: 'Get Inbox (Main DMs)',
        fn: async () => await bot.getInbox()
      }
    ];

    for (const test of tests) {
      try {
        console.log(`Testing: ${test.name}...`);
        const result = await test.fn();
        console.log(`  ✅ SUCCESS`);
        
        if (test.name.includes('Inbox') && result?.threads) {
          console.log(`  📬 Found ${result.threads.length} conversations`);
        }
      } catch (error) {
        console.log(`  ❌ FAILED: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n=== Summary ===');
    console.log('If only DM endpoints fail, your account has DM API restrictions.');
    console.log('If all endpoints fail, your cookies may be expired.');
    console.log('\nRecommendation: Use Instagram app normally for 24-48 hours.');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAlternativeEndpoints();

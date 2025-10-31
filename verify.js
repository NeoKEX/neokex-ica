import InstagramChatAPI from './src/index.js';
import banner from './src/Banner.js';

async function testLibrary() {
  console.log('🧪 Testing neokex-ica library with cookies...\n');
  
  try {
    const bot = new InstagramChatAPI({ showBanner: false });
    
    console.log('📂 Loading cookies from cookies.txt...');
    await bot.loadCookiesFromFile('./cookies.txt');
    console.log('✅ Cookies loaded successfully!\n');
    
    console.log('🔍 Checking authentication...');
    const userId = bot.getCurrentUserID();
    const username = bot.getCurrentUsername();
    
    if (userId) {
      console.log(`Authentication status: ✅ Authenticated`);
      console.log(`  User ID: ${userId}`);
      console.log(`  Username: ${username || 'N/A'}\n`);
      
      console.log('👤 Fetching detailed user information...');
      const userInfo = await bot.getUserInfo(userId);
      console.log('User Info:');
      console.log(`  Username: ${userInfo.username || 'N/A'}`);
      console.log(`  Full Name: ${userInfo.full_name || 'N/A'}`);
      console.log(`  Follower Count: ${userInfo.follower_count || 'N/A'}`);
      console.log(`  Following Count: ${userInfo.following_count || 'N/A'}\n`);
      
      console.log('📨 Testing inbox access...');
      const inbox = await bot.getInbox();
      console.log(`  Inbox threads: ${inbox.threads ? inbox.threads.length : 0}`);
      console.log(`  Pending requests: ${inbox.pending_requests_total || 0}`);
      
      if (inbox.threads && inbox.threads.length > 0) {
        console.log('\n  Recent conversations:');
        inbox.threads.slice(0, 3).forEach((thread, index) => {
          const threadName = thread.thread_title || thread.users?.[0]?.username || 'Unknown';
          console.log(`    ${index + 1}. ${threadName}`);
        });
      }
      
      console.log('\n✅ All tests passed! Library is working correctly with your cookies.');
    } else {
      console.log('❌ Not authenticated. Your cookies may have expired.');
      console.log('   Please export fresh cookies from your browser.');
    }
    
    console.log('\n📋 Available methods:');
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(bot))
      .filter(m => m !== 'constructor' && typeof bot[m] === 'function');
    banner.showVerification('neokex-ica', '1.0.0', methods);
    
  } catch (error) {
    console.error('❌ Error testing library:', error.message);
    console.error('Full error:', error);
  }
}

testLibrary();

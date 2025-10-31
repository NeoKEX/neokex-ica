import InstagramChatAPI from './src/index.js';
import { existsSync } from 'fs';

console.log('🌐 Testing Instagram API - Send Photo & Video from URLs\n');
console.log('═'.repeat(70));

async function testSendFromUrl() {
  try {
    // Get recipient username from command line
    const recipientUsername = process.argv[2];
    
    if (!recipientUsername) {
      console.error('\n❌ Please provide a recipient username!');
      console.log('\nUsage: node test-send-from-url.js <username>');
      console.log('Example: node test-send-from-url.js instagram\n');
      process.exit(1);
    }
    
    // Initialize the API
    const bot = new InstagramChatAPI({ showBanner: false });
    
    console.log('\n1️⃣ AUTHENTICATION');
    console.log('─'.repeat(70));
    
    if (!existsSync('./cookies.txt')) {
      console.error('❌ cookies.txt not found!');
      process.exit(1);
    }
    
    await bot.loadCookiesFromFile('./cookies.txt');
    const username = bot.getCurrentUsername();
    const userId = bot.getCurrentUserID();
    console.log(`✅ Authenticated as: @${username} (ID: ${userId})`);
    
    console.log('\n2️⃣ FINDING RECIPIENT');
    console.log('─'.repeat(70));
    console.log(`🔍 Searching for @${recipientUsername}...`);
    
    let userInfo = null;
    const searchResults = await bot.searchUsers(recipientUsername);
    if (searchResults && searchResults.length > 0) {
      userInfo = searchResults.find(u => u.username.toLowerCase() === recipientUsername.toLowerCase());
      if (!userInfo) {
        userInfo = searchResults[0];
        console.log(`   ℹ️  Exact match not found, using closest match`);
      }
    }
    
    if (!userInfo) {
      console.error(`❌ User @${recipientUsername} not found!`);
      process.exit(1);
    }
    
    const recipientUserId = userInfo.pk.toString();
    console.log(`✅ Found: @${userInfo.username}`);
    console.log(`   User ID: ${recipientUserId}`);
    
    console.log('\n3️⃣ FINDING THREAD');
    console.log('─'.repeat(70));
    
    const inbox = await bot.getInbox();
    let threadId = null;
    
    for (const thread of inbox.threads) {
      const threadUsers = thread.users || [];
      if (threadUsers.some(u => u.pk.toString() === recipientUserId)) {
        threadId = thread.thread_id;
        break;
      }
    }
    
    if (!threadId) {
      console.log('   No existing thread, creating...');
      await bot.dm.sendMessageToUser(recipientUserId, '🌐 Testing URL streaming...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newInbox = await bot.getInbox();
      for (const thread of newInbox.threads) {
        const threadUsers = thread.users || [];
        if (threadUsers.some(u => u.pk.toString() === recipientUserId)) {
          threadId = thread.thread_id;
          break;
        }
      }
    }
    
    if (!threadId) {
      console.error('❌ Could not find or create thread');
      process.exit(1);
    }
    
    console.log(`✅ Using thread: ${threadId}`);
    
    console.log('\n4️⃣ SENDING PHOTO FROM URL');
    console.log('─'.repeat(70));
    
    // Use a publicly accessible test image URL
    const photoUrl = 'https://picsum.photos/800/600';
    console.log(`📤 Sending photo from URL: ${photoUrl}`);
    
    try {
      await bot.dm.sendPhotoFromUrl(threadId, photoUrl);
      console.log('✅ Photo from URL sent successfully!');
    } catch (error) {
      console.error(`❌ Failed to send photo: ${error.message}`);
    }
    
    console.log('\n5️⃣ SENDING VIDEO FROM URL');
    console.log('─'.repeat(70));
    
    // Use a publicly accessible test video URL
    const videoUrl = 'https://sample-videos.com/video321/mp4/240/big_buck_bunny_240p_1mb.mp4';
    console.log(`📤 Attempting to send video from URL: ${videoUrl}`);
    console.log(`   ⚠️  Note: Instagram has disabled video DMs, this will likely fail`);
    
    try {
      await bot.dm.sendVideoFromUrl(threadId, videoUrl);
      console.log('✅ Video from URL sent successfully!');
    } catch (error) {
      console.error(`❌ Failed to send video: ${error.message}`);
      if (error.message.includes('no longer supported')) {
        console.log('   ℹ️  As expected, Instagram has disabled video DMs');
      }
    }
    
    console.log('\n6️⃣ VERIFICATION');
    console.log('─'.repeat(70));
    console.log('✅ Test completed!');
    console.log(`\n📱 Check your Instagram DM with @${userInfo.username} to verify:`);
    console.log('   ✅ Photo from URL should be visible');
    console.log('   ❌ Video likely failed (Instagram disabled this feature)');
    
    console.log('\n═'.repeat(70));
    console.log('🎉 URL streaming test completed!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testSendFromUrl();

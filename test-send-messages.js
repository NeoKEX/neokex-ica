import InstagramChatAPI from './src/index.js';
import { existsSync } from 'fs';

console.log('🧪 Testing Instagram API - Send Messages & Photos\n');
console.log('═'.repeat(70));

async function testSendMessages() {
  try {
    // Get recipient username from command line
    const recipientUsername = process.argv[2];
    
    if (!recipientUsername) {
      console.error('\n❌ Please provide a recipient username!');
      console.log('\nUsage: node test-send-messages.js <username>');
      console.log('Example: node test-send-messages.js instagram\n');
      process.exit(1);
    }
    
    // Initialize the API
    const bot = new InstagramChatAPI({ showBanner: false });
    
    console.log('\n1️⃣ AUTHENTICATION');
    console.log('─'.repeat(70));
    
    // Check if cookies.txt exists
    if (!existsSync('./cookies.txt')) {
      console.error('❌ cookies.txt not found!');
      console.log('\n📝 Please create cookies.txt with your Instagram cookies.');
      console.log('   You can export them using a browser extension like "Get cookies.txt"');
      process.exit(1);
    }
    
    await bot.loadCookiesFromFile('./cookies.txt');
    const username = bot.getCurrentUsername();
    const userId = bot.getCurrentUserID();
    console.log(`✅ Authenticated as: @${username} (ID: ${userId})`);
    
    console.log('\n2️⃣ FINDING RECIPIENT');
    console.log('─'.repeat(70));
    console.log(`🔍 Searching for @${recipientUsername}...`);
    
    const userInfo = await bot.getUserInfoByUsername(recipientUsername);
    if (!userInfo) {
      console.error(`❌ User @${recipientUsername} not found!`);
      process.exit(1);
    }
    
    const recipientUserId = userInfo.pk.toString();
    console.log(`✅ Found: @${userInfo.username}`);
    console.log(`   Name: ${userInfo.full_name || 'N/A'}`);
    console.log(`   User ID: ${recipientUserId}`);
    console.log(`   Followers: ${userInfo.follower_count || 'N/A'}`);
    
    console.log('\n3️⃣ SENDING TEST TEXT MESSAGE');
    console.log('─'.repeat(70));
    
    const testMessage = `🤖 Test message from neokex-ica API! Sent at ${new Date().toLocaleTimeString()}`;
    console.log(`📤 Sending: "${testMessage}"`);
    
    try {
      await bot.dm.sendMessageToUser(recipientUserId, testMessage);
      console.log('✅ Text message sent successfully!');
    } catch (error) {
      console.error(`❌ Failed to send text: ${error.message}`);
    }
    
    console.log('\n4️⃣ SENDING TEST PHOTO');
    console.log('─'.repeat(70));
    
    const testImagePath = './test-image.png';
    
    if (!existsSync(testImagePath)) {
      console.error(`❌ Test image not found at: ${testImagePath}`);
      console.log('   Please ensure the test image exists.');
    } else {
      console.log(`📤 Sending photo: ${testImagePath}`);
      
      try {
        // First get or create thread with the user
        const inbox = await bot.getInbox();
        let threadId = null;
        
        // Look for existing thread with this user
        for (const thread of inbox.threads) {
          const threadUsers = thread.users || [];
          if (threadUsers.some(u => u.pk.toString() === recipientUserId)) {
            threadId = thread.thread_id;
            break;
          }
        }
        
        if (threadId) {
          console.log(`   Using existing thread: ${threadId}`);
          await bot.dm.sendPhoto(threadId, testImagePath);
          console.log('✅ Photo sent successfully!');
        } else {
          console.log('   No existing thread found, creating new conversation...');
          // Send a message first to create the thread
          await bot.dm.sendMessageToUser(recipientUserId, '📸 Sending you a test image...');
          
          // Wait a moment then get the new thread
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const newInbox = await bot.getInbox();
          for (const thread of newInbox.threads) {
            const threadUsers = thread.users || [];
            if (threadUsers.some(u => u.pk.toString() === recipientUserId)) {
              threadId = thread.thread_id;
              break;
            }
          }
          
          if (threadId) {
            console.log(`   Created thread: ${threadId}`);
            await bot.dm.sendPhoto(threadId, testImagePath);
            console.log('✅ Photo sent successfully!');
          } else {
            console.error('❌ Could not create thread');
          }
        }
      } catch (error) {
        console.error(`❌ Failed to send photo: ${error.message}`);
      }
    }
    
    console.log('\n5️⃣ VERIFICATION');
    console.log('─'.repeat(70));
    console.log('✅ Test completed!');
    console.log(`\n📱 Check your Instagram DM with @${recipientUsername} to verify:`);
    console.log('   1. You should see the test text message');
    console.log('   2. You should see the test photo');
    
    console.log('\n═'.repeat(70));
    console.log('🎉 All tests completed!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testSendMessages();

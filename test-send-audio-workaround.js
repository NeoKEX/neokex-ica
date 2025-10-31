import InstagramChatAPI from './src/index.js';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

console.log('🎵 Testing Instagram API - Send Audio (Video Workaround)\n');
console.log('═'.repeat(70));
console.log('ℹ️  Note: Instagram disabled voice notes, using video with audio instead\n');

async function testSendAudio() {
  try {
    // Get recipient username from command line
    const recipientUsername = process.argv[2];
    
    if (!recipientUsername) {
      console.error('\n❌ Please provide a recipient username!');
      console.log('\nUsage: node test-send-audio-workaround.js <username>');
      console.log('Example: node test-send-audio-workaround.js instagram\n');
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
      process.exit(1);
    }
    
    await bot.loadCookiesFromFile('./cookies.txt');
    const username = bot.getCurrentUsername();
    const userId = bot.getCurrentUserID();
    console.log(`✅ Authenticated as: @${username} (ID: ${userId})`);
    
    console.log('\n2️⃣ FINDING RECIPIENT');
    console.log('─'.repeat(70));
    console.log(`🔍 Searching for @${recipientUsername}...`);
    
    // Try search first (more flexible)
    let userInfo = null;
    let recipientUserId = null;
    
    try {
      const searchResults = await bot.searchUsers(recipientUsername);
      if (searchResults && searchResults.length > 0) {
        // Look for exact match first
        userInfo = searchResults.find(u => u.username.toLowerCase() === recipientUsername.toLowerCase());
        
        // If no exact match, use the first result
        if (!userInfo) {
          userInfo = searchResults[0];
          console.log(`   ℹ️  Exact match not found, using closest match`);
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Search failed: ${error.message}`);
    }
    
    if (!userInfo) {
      console.error(`❌ User @${recipientUsername} not found!`);
      process.exit(1);
    }
    
    recipientUserId = userInfo.pk.toString();
    console.log(`✅ Found: @${userInfo.username}`);
    console.log(`   Name: ${userInfo.full_name || 'N/A'}`);
    console.log(`   User ID: ${recipientUserId}`);
    
    console.log('\n3️⃣ FINDING/CREATING THREAD');
    console.log('─'.repeat(70));
    
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
    
    if (!threadId) {
      console.log('   No existing thread found, creating new conversation...');
      await bot.dm.sendMessageToUser(recipientUserId, '🎵 Sending you a test audio...');
      
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
    
    console.log('\n4️⃣ CREATING TEST AUDIO AS VIDEO');
    console.log('─'.repeat(70));
    
    // Create a video with audio and a static image
    const testVideoPath = './test-audio-video.mp4';
    
    if (!existsSync(testVideoPath)) {
      console.log('⚠️  Creating video with audio (workaround for disabled voice notes)...');
      console.log('   Creating a 5-second video with beep sound...');
      
      try {
        // Create a simple video with a beep tone
        // Generate a sine wave tone at 440Hz (A4 note) for 5 seconds with a black screen
        execSync(
          `ffmpeg -f lavfi -i color=c=black:s=640x640:d=5 ` +
          `-f lavfi -i "sine=frequency=440:duration=5" ` +
          `-c:v libx264 -preset ultrafast -pix_fmt yuv420p ` +
          `-c:a aac -b:a 128k -shortest ${testVideoPath} -y 2>&1`,
          { stdio: 'pipe' }
        );
        console.log(`   ✅ Created test video with audio: ${testVideoPath}`);
      } catch (error) {
        console.error('   ❌ Could not create video file');
        console.error('   Error:', error.message);
        process.exit(1);
      }
    } else {
      console.log(`✅ Found test video: ${testVideoPath}`);
    }
    
    console.log('\n5️⃣ SENDING AUDIO AS VIDEO MESSAGE');
    console.log('─'.repeat(70));
    console.log(`📤 Sending video with audio: ${testVideoPath}`);
    console.log('   (Instagram will display this as a video message)');
    
    try {
      await bot.dm.sendVideo(threadId, testVideoPath);
      console.log('✅ Audio (as video) sent successfully!');
    } catch (error) {
      console.error(`❌ Failed to send video: ${error.message}`);
      throw error;
    }
    
    console.log('\n6️⃣ VERIFICATION');
    console.log('─'.repeat(70));
    console.log('✅ Test completed!');
    console.log(`\n📱 Check your Instagram DM with @${userInfo.username} to verify:`);
    console.log('   You should see a video message with audio');
    console.log('   ℹ️  This is a workaround since Instagram disabled voice notes');
    
    console.log('\n═'.repeat(70));
    console.log('🎉 Audio test completed!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testSendAudio();

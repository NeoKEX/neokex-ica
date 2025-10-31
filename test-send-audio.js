import InstagramChatAPI from './src/index.js';
import { existsSync } from 'fs';

console.log('🎵 Testing Instagram API - Send Audio/Voice Note\n');
console.log('═'.repeat(70));

async function testSendAudio() {
  try {
    // Get recipient username from command line
    const recipientUsername = process.argv[2];
    
    if (!recipientUsername) {
      console.error('\n❌ Please provide a recipient username!');
      console.log('\nUsage: node test-send-audio.js <username>');
      console.log('Example: node test-send-audio.js instagram\n');
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
      // Send a message first to create the thread
      await bot.dm.sendMessageToUser(recipientUserId, '🎵 Sending you a test audio...');
      
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
    }
    
    if (!threadId) {
      console.error('❌ Could not find or create thread');
      process.exit(1);
    }
    
    console.log(`✅ Using thread: ${threadId}`);
    
    console.log('\n4️⃣ CREATING TEST AUDIO FILE');
    console.log('─'.repeat(70));
    
    // Check if we have a test audio file
    const testAudioPath = './test-audio.m4a';
    
    if (!existsSync(testAudioPath)) {
      console.log('⚠️  Test audio file not found, creating one...');
      console.log('   Note: Instagram voice notes should be in M4A/AAC format');
      
      // Try to create a simple test audio file using ffmpeg
      const { execSync } = await import('child_process');
      try {
        // Create a 3-second silent audio file in M4A format
        execSync(`ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 3 -c:a aac -b:a 128k ${testAudioPath} -y 2>&1`, { 
          stdio: 'pipe' 
        });
        console.log(`   ✅ Created test audio file: ${testAudioPath}`);
      } catch (error) {
        console.error('   ❌ Could not create audio file with ffmpeg');
        console.error('   Please provide a test-audio.m4a file manually');
        process.exit(1);
      }
    } else {
      console.log(`✅ Found test audio: ${testAudioPath}`);
    }
    
    console.log('\n5️⃣ SENDING AUDIO/VOICE NOTE');
    console.log('─'.repeat(70));
    console.log(`📤 Sending audio: ${testAudioPath}`);
    
    try {
      await bot.dm.sendVoiceNote(threadId, testAudioPath);
      console.log('✅ Audio/voice note sent successfully!');
    } catch (error) {
      console.error(`❌ Failed to send audio: ${error.message}`);
      throw error;
    }
    
    console.log('\n6️⃣ VERIFICATION');
    console.log('─'.repeat(70));
    console.log('✅ Test completed!');
    console.log(`\n📱 Check your Instagram DM with @${userInfo.username} to verify:`);
    console.log('   You should see the voice note message');
    
    console.log('\n═'.repeat(70));
    console.log('🎉 Audio test completed!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testSendAudio();

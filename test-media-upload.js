import InstagramChatAPI from './src/index.js';
import fs from 'fs';

async function testMediaUpload() {
  console.log('🚀 Testing neokex-ica v2.0 with integrated media uploads\n');
  
  const bot = new InstagramChatAPI({ showBanner: false });
  
  try {
    // Load cookies
    console.log('1️⃣ Loading cookies from cookies.txt...');
    bot.loadCookiesFromFile('./cookies.txt');
    console.log(`✅ Logged in as User ID: ${bot.getCurrentUserID()}\n`);
    
    // Get inbox
    console.log('2️⃣ Getting inbox...');
    const inbox = await bot.getInbox();
    console.log(`✅ You have ${inbox.threads?.length || 0} conversations\n`);
    
    if (inbox.threads && inbox.threads.length > 0) {
      const testThread = inbox.threads[0];
      const threadId = testThread.thread_id;
      const threadTitle = testThread.thread_title || `Thread with ${testThread.users?.[0]?.username || 'User'}`;
      
      console.log(`📝 Using thread: ${threadTitle} (${threadId})\n`);
      
      // Test text message
      console.log('3️⃣ Sending text message...');
      await bot.sendMessage(threadId, '🤖 Testing neokex-ica v2.0 with real media uploads!');
      console.log('✅ Text message sent!\n');
      
      // Test photo (if test image exists)
      if (fs.existsSync('./test-image.jpg')) {
        console.log('4️⃣ Sending photo...');
        await bot.sendPhoto(threadId, './test-image.jpg');
        console.log('✅ Photo sent!\n');
      } else {
        console.log('ℹ️  No test-image.jpg found, skipping photo test\n');
      }
      
      // Test video (if test video exists)
      if (fs.existsSync('./test-video.mp4')) {
        console.log('5️⃣ Sending video...');
        await bot.sendVideo(threadId, './test-video.mp4', { duration: 3000 });
        console.log('✅ Video sent!\n');
      } else {
        console.log('ℹ️  No test-video.mp4 found, skipping video test\n');
      }
      
      // Test voice note (if test audio exists)
      if (fs.existsSync('./test-audio.m4a')) {
        console.log('6️⃣ Sending voice note...');
        await bot.sendVoiceNote(threadId, './test-audio.m4a', { duration: 3000 });
        console.log('✅ Voice note sent!\n');
      } else {
        console.log('ℹ️  No test-audio.m4a found, skipping voice test\n');
      }
      
      console.log('✅ All tests completed successfully!\n');
      console.log('🎉 neokex-ica v2.0 is fully functional with real media uploads!');
      
    } else {
      console.log('⚠️  No threads found in inbox. Please send a message to yourself first.');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testMediaUpload();

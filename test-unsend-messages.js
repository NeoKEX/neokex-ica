import InstagramChatAPI from './src/index.js';
import { existsSync } from 'fs';

console.log('🗑️  Testing Instagram API - Unsend Messages\n');
console.log('═'.repeat(70));

async function testUnsendMessages() {
  try {
    // Get recipient username from command line
    const recipientUsername = process.argv[2];
    
    if (!recipientUsername) {
      console.error('\n❌ Please provide a recipient username!');
      console.log('\nUsage: node test-unsend-messages.js <username>');
      console.log('Example: node test-unsend-messages.js instagram\n');
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
    console.log(`   User ID: ${recipientUserId}`);
    
    console.log('\n3️⃣ FETCHING THREAD');
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
      console.error('❌ No conversation found with this user!');
      process.exit(1);
    }
    
    console.log(`✅ Found thread: ${threadId}`);
    
    console.log('\n4️⃣ GETTING RECENT MESSAGES');
    console.log('─'.repeat(70));
    
    const thread = await bot.dm.getThread(threadId);
    const messages = thread.items || [];
    
    console.log(`✅ Found ${messages.length} messages in thread`);
    
    // Find messages sent by me (the authenticated user)
    const myMessages = messages.filter(item => {
      return item.user_id && item.user_id.toString() === userId;
    });
    
    console.log(`📤 You sent ${myMessages.length} messages in this thread`);
    
    if (myMessages.length === 0) {
      console.log('ℹ️  No messages to unsend!');
      process.exit(0);
    }
    
    // Show the recent messages
    console.log('\n   Recent messages from you:');
    const recentMessages = myMessages.slice(0, 5);
    recentMessages.forEach((msg, i) => {
      const text = msg.text || '(photo/media)';
      const time = msg.timestamp ? new Date(parseInt(msg.timestamp) / 1000).toLocaleString() : 'unknown';
      console.log(`   ${i + 1}. [${time}] "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`);
    });
    
    console.log('\n5️⃣ UNSENDING MESSAGES');
    console.log('─'.repeat(70));
    
    // Unsend the most recent messages (up to 5)
    let unsendCount = 0;
    const maxUnsend = Math.min(5, myMessages.length);
    
    for (let i = 0; i < maxUnsend; i++) {
      const msg = myMessages[i];
      const itemId = msg.item_id;
      const text = msg.text || '(photo/media)';
      
      try {
        console.log(`🗑️  Unsending message ${i + 1}/${maxUnsend}: "${text.substring(0, 40)}..."`);
        await bot.dm.unsendMessage(threadId, itemId);
        unsendCount++;
        
        // Small delay between unsends to avoid rate limiting
        if (i < maxUnsend - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`   ❌ Failed to unsend: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Successfully unsent ${unsendCount} out of ${maxUnsend} messages!`);
    
    console.log('\n═'.repeat(70));
    console.log('🎉 Unsend operation completed!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testUnsendMessages();

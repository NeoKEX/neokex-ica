import InstagramChatAPI from '../src/index.js';

const bot = new InstagramChatAPI();

const INSTAGRAM_USERNAME = process.env.INSTAGRAM_USERNAME || '';
const INSTAGRAM_PASSWORD = process.env.INSTAGRAM_PASSWORD || '';

console.log('===========================================');
console.log('  Neokex-ICA: Instagram Chat API Package  ');
console.log('===========================================\n');

if (!INSTAGRAM_USERNAME || !INSTAGRAM_PASSWORD) {
  console.log('⚠️  No Instagram credentials provided!\n');
  console.log('To use this package, set environment variables:');
  console.log('  - INSTAGRAM_USERNAME');
  console.log('  - INSTAGRAM_PASSWORD\n');
  console.log('Example usage:');
  console.log('  INSTAGRAM_USERNAME=your_username INSTAGRAM_PASSWORD=your_password npm start\n');
  console.log('===========================================\n');
  console.log('📦 Package Information:');
  console.log('  Name: neokex-ica');
  console.log('  Description: Unofficial Instagram chat API for building bots\n');
  console.log('🔧 Features:');
  console.log('  ✓ Login and session management');
  console.log('  ✓ Send/receive direct messages');
  console.log('  ✓ Event-based message listening');
  console.log('  ✓ Thread management');
  console.log('  ✓ Auto-reply functionality');
  console.log('  ✓ Rate limiting protection\n');
  console.log('📚 Example Bot Code:');
  console.log('```javascript');
  console.log('import InstagramChatAPI from "neokex-ica";');
  console.log('');
  console.log('const bot = new InstagramChatAPI();');
  console.log('');
  console.log('await bot.login("username", "password");');
  console.log('');
  console.log('bot.onMessage((msg) => {');
  console.log('  console.log(`New message: ${msg.text}`);');
  console.log('  bot.sendMessage(msg.threadId, "Auto reply!");');
  console.log('});');
  console.log('');
  console.log('await bot.startListening();');
  console.log('```\n');
  console.log('⚠️  DISCLAIMER:');
  console.log('This package uses reverse-engineered Instagram endpoints.');
  console.log('Use at your own risk. May violate Instagram ToS.\n');
  console.log('===========================================');
  process.exit(0);
}

async function main() {
  try {
    console.log('🔐 Logging in to Instagram...');
    await bot.login(INSTAGRAM_USERNAME, INSTAGRAM_PASSWORD);
    console.log('✅ Successfully logged in!\n');

    bot.onLogin((data) => {
      console.log(`👤 Logged in as: ${data.username} (ID: ${data.userId})`);
    });

    bot.onMessage(async (msg) => {
      console.log('\n📨 New message received!');
      console.log(`  Thread ID: ${msg.threadId}`);
      console.log(`  User ID: ${msg.userId}`);
      console.log(`  Text: ${msg.text}`);
      console.log(`  Timestamp: ${new Date(msg.timestamp / 1000)}`);

      if (msg.text && msg.text.toLowerCase().includes('hello')) {
        console.log('  🤖 Auto-replying with greeting...');
        await bot.sendMessage(msg.threadId, 'Hello! This is an automated response from neokex-ica bot.');
      }

      await bot.markAsSeen(msg.threadId, msg.itemId);
    });

    bot.onPendingRequest((data) => {
      console.log(`\n📬 ${data.threads.length} pending message request(s)`);
    });

    bot.onError((error) => {
      console.error('\n❌ Error:', error.message);
    });

    bot.onRateLimit((data) => {
      console.log(`\n⏳ Rate limited! Retry after: ${data.retryAfter} seconds`);
    });

    console.log('📥 Fetching recent messages...');
    const recentMessages = await bot.getRecentMessages(5);
    console.log(`✅ Found ${recentMessages.length} recent messages\n`);

    if (recentMessages.length > 0) {
      console.log('Recent messages:');
      recentMessages.forEach((msg, i) => {
        console.log(`  ${i + 1}. ${msg.text ? msg.text.substring(0, 50) : '[no text]'}`);
      });
      console.log('');
    }

    console.log('👂 Starting message listener...');
    console.log('🤖 Bot is now active and listening for messages!');
    console.log('💡 Try sending a message with "hello" to trigger auto-reply\n');
    
    await bot.startListening(5000);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();

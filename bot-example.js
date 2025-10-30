import InstagramChatAPI from './src/index.js';

const bot = new InstagramChatAPI();

async function startBot() {
  try {
    console.log('\n🤖 Starting Instagram Bot...\n');

    await bot.loadCookiesFromFile('./cookies.txt');
    
    bot.onMessage(async (message) => {
      const username = message.thread.users?.find(u => u.pk === message.userId)?.username || 'Unknown';
      
      if (message.text.toLowerCase() === 'hello') {
        await bot.sendMessage(message.threadId, `Hi ${username}! 👋 How can I help you?`);
      }
      else if (message.text.toLowerCase() === 'help') {
        await bot.sendMessage(message.threadId, 
          '🤖 Available commands:\n' +
          '• hello - Get a greeting\n' +
          '• help - Show this message\n' +
          '• time - Get current time\n' +
          '• joke - Get a random joke'
        );
      }
      else if (message.text.toLowerCase() === 'time') {
        const now = new Date().toLocaleString();
        await bot.sendMessage(message.threadId, `⏰ Current time: ${now}`);
      }
      else if (message.text.toLowerCase() === 'joke') {
        const jokes = [
          'Why do programmers prefer dark mode? Because light attracts bugs! 🐛',
          'Why did the developer go broke? Because he used up all his cache! 💸',
          'How many programmers does it take to change a light bulb? None, that\'s a hardware problem! 💡'
        ];
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        await bot.sendMessage(message.threadId, randomJoke);
      }
      else {
        await bot.sendReaction(message.threadId, message.itemId, '👍');
      }
    });

    bot.onTyping((data) => {
      console.log(`💬 User ${data.userId} is typing...`);
    });

    bot.onPendingRequest(async (data) => {
      console.log(`📬 You have ${data.threads.length} pending message request(s)`);
      
      for (const thread of data.threads) {
        console.log(`   - Approving thread: ${thread.thread_id}`);
        await bot.approveThread(thread.thread_id);
      }
    });

    bot.onError((error) => {
      console.error('❌ Bot error:', error.message);
    });

    bot.onRateLimit((data) => {
      console.log(`⏱️  Rate limited! Retry after: ${data.retryAfter}`);
    });

    await bot.startListening(5000);
    
    console.log('\n✅ Bot is now running and listening for messages!');
    console.log('💡 Send a message to your Instagram account to test it\n');
    
  } catch (error) {
    console.error('\n❌ Failed to start bot:', error.message);
    console.log('\n💡 Make sure you have a valid cookies.txt file');
    console.log('   You can export cookies using a browser extension\n');
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log('\n\n👋 Stopping bot...');
  bot.stopListening();
  process.exit(0);
});

startBot();

import InstagramChatAPI from './src/index.js';

const api = new InstagramChatAPI();

console.log('\n📝 Example: Professional Logging Demo');
console.log('─'.repeat(60));

api.onLogin((data) => {
  console.log('\n✅ Login event received:', data);
});

api.onMessage((message) => {
  console.log('\n📨 New message event:', {
    from: message.userId,
    text: message.text
  });
});

api.onError((error) => {
  console.log('\n❌ Error event:', error.message);
});

api.onRateLimit((data) => {
  console.log('\n⏱️  Rate limit event:', data);
});

console.log('\n🔐 Example usage:');
console.log('const api = new InstagramChatAPI();');
console.log('await api.login("username", "password");');
console.log('await api.loadCookiesFromFile("cookies.txt");');
console.log('await api.startListening();');
console.log('\nℹ️  All operations now show professional colored logs with timestamps!');
console.log('─'.repeat(60));

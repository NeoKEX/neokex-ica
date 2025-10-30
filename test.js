import InstagramChatAPI from './src/index.js';

console.log('===========================================');
console.log('  neokex-ica: Instagram Chat API Library  ');
console.log('===========================================\n');
console.log('✅ Package loaded successfully!\n');
console.log('📦 API Information:');
console.log('  - Name: neokex-ica');
console.log('  - Type: Pure API library for Instagram chat/DM');
console.log('  - Purpose: Import this package in your bot projects\n');

console.log('🔧 Available Methods:');
const bot = new InstagramChatAPI();
const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(bot))
  .filter(m => m !== 'constructor' && typeof bot[m] === 'function');
console.log('  ' + methods.join(', ') + '\n');

console.log('📚 How to Use:');
console.log('  1. Install: npm install github:your-username/neokex-ica');
console.log('  2. Import: import InstagramChatAPI from "neokex-ica"');
console.log('  3. Use in your bot:\n');
console.log('     const bot = new InstagramChatAPI();');
console.log('     bot.loadCookiesFromFile("./cookies.txt");');
console.log('     bot.onMessage((msg) => { ... });');
console.log('     await bot.startListening();\n');

console.log('📖 Documentation: See README.md for complete API reference');
console.log('===========================================');

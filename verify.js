import InstagramChatAPI from './src/index.js';

console.log('===========================================');
console.log('  neokex-ica: Instagram Chat API Library  ');
console.log('===========================================');
console.log('✅ Package ready for npm publishing!');
console.log('\n📦 Package Information:');
console.log('  - Name: neokex-ica');
console.log('  - Version: 1.0.0');
console.log('  - License: MIT');
console.log('  - Node.js: >=16.0.0');
console.log('\n🔧 Available Methods (40 total):');

const bot = new InstagramChatAPI();
const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(bot))
  .filter(m => m !== 'constructor' && typeof bot[m] === 'function');

console.log('  ' + methods.join(', '));

console.log('\n📚 Publishing to npm:');
console.log('  1. Update package.json with your details (author, repository)');
console.log('  2. Run: npm login');
console.log('  3. Run: npm publish');
console.log('\n📖 Documentation: See README.md for complete API reference');
console.log('===========================================');

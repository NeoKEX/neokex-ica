import InstagramChatAPI from './src/index.js';

const client = new InstagramChatAPI();

const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client))
  .filter(m => m !== 'constructor')
  .sort();

const status = client.getStatus();

console.log(`ica-neokex v1.0.0 — ${methods.length} methods loaded`);
console.log('');
console.log('Status:', JSON.stringify(status.pollingStats, null, 2));

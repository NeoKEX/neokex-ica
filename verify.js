import InstagramChatAPI from './src/index.js';
import banner from './src/Banner.js';

const bot = new InstagramChatAPI({ showBanner: false });
const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(bot))
  .filter(m => m !== 'constructor' && typeof bot[m] === 'function');

banner.showVerification('neokex-ica', '1.0.0', methods);

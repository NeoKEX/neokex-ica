import crypto from 'crypto';

export function generateDeviceId() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  return `android-${timestamp}${random}`.substring(0, 16);
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function generateRequestId() {
  return generateUUID();
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getUsernameFromUrl(url) {
  const match = url.match(/instagram\.com\/([^\/\?]+)/);
  return match ? match[1] : null;
}

export function generateSignature(data, key) {
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(data);
  return hmac.digest('hex');
}

export function signPayload(payload, key) {
  const jsonPayload = JSON.stringify(payload);
  const signature = generateSignature(jsonPayload, key);
  return {
    signed_body: `SIGNATURE.${jsonPayload}`,
    ig_sig_key_version: '4'
  };
}

export function generatePhoneId() {
  return generateUUID();
}

export function generateAdId() {
  return generateUUID();
}

export function generateWaterfallId() {
  return generateUUID();
}

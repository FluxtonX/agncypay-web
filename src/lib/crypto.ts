import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Encrypts a string using AES-256-GCM.
 * The output is a string in the format: iv.salt.authTag.encryptedData
 */
export function encryptToken(text: string): string {
  const keyStr = process.env.QUICKBOOKS_TOKEN_ENCRYPTION_KEY;
  if (!keyStr || keyStr.length !== 64) {
    throw new Error('Invalid or missing QUICKBOOKS_TOKEN_ENCRYPTION_KEY (must be 32 bytes hex)');
  }

  const key = Buffer.from(keyStr, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}.${salt.toString('hex')}.${tag.toString('hex')}.${encrypted.toString('hex')}`;
}

/**
 * Decrypts a string previously encrypted with encryptToken.
 */
export function decryptToken(encryptedText: string): string {
  const keyStr = process.env.QUICKBOOKS_TOKEN_ENCRYPTION_KEY;
  if (!keyStr || keyStr.length !== 64) {
    throw new Error('Invalid or missing QUICKBOOKS_TOKEN_ENCRYPTION_KEY (must be 32 bytes hex)');
  }

  const key = Buffer.from(keyStr, 'hex');
  const [ivHex, saltHex, tagHex, encryptedHex] = encryptedText.split('.');

  if (!ivHex || !saltHex || !tagHex || !encryptedHex) {
    throw new Error('Invalid encrypted token format');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

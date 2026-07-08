import { createHmac, timingSafeEqual } from 'node:crypto';

export function hashToken(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function verifyToken(value: string, storedHash: string, secret: string): boolean {
  const computedHash = hashToken(value, secret);
  const computedBuffer = Buffer.from(computedHash, 'hex');
  const storedBuffer = Buffer.from(storedHash, 'hex');

  if (computedBuffer.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(computedBuffer, storedBuffer);
}

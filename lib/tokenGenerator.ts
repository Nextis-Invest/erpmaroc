/**
 * Generates a secure random token for magic links
 * Compatible with both Node.js and Edge Runtime
 */
export function generateSecureToken(): string {
  // Use Web Crypto API which is available in both environments
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
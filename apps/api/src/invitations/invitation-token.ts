import { createHash, randomBytes } from 'node:crypto';

/**
 * Token d'invitation : 256 bits aléatoires (CSPRNG), encodés en base64url.
 * Seul son hash SHA-256 est stocké ; le token brut n'est renvoyé qu'une fois,
 * à la création. Un hash simple suffit ici car le token a une forte entropie.
 */
export function generateInvitationToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, tokenHash: hashInvitationToken(token) };
}

export function hashInvitationToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

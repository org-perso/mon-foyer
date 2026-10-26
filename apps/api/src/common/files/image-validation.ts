import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 Mo
export const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIME)[number];

/**
 * Valide une image d'après son contenu réel (signature binaire),
 * jamais d'après le nom de fichier ou le Content-Type déclaré par le client.
 * SVG volontairement exclu (risque XSS).
 */
export async function assertValidImage(
  buffer: Buffer,
): Promise<{ mime: AllowedImageMime; ext: string }> {
  if (buffer.length === 0) {
    throw new BadRequestException('Fichier vide.');
  }
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new PayloadTooLargeException('Image trop volumineuse (2 Mo maximum).');
  }
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !(ALLOWED_IMAGE_MIME as readonly string[]).includes(detected.mime)) {
    throw new BadRequestException('Format non pris en charge (JPEG, PNG ou WebP).');
  }
  return { mime: detected.mime as AllowedImageMime, ext: detected.ext };
}

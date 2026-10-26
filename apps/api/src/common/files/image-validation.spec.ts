import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import { assertValidImage, MAX_IMAGE_BYTES } from './image-validation.js';

// Signature PNG minimale (8 octets magiques + en-tête IHDR)
const PNG_HEADER = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489',
  'hex',
);

describe('assertValidImage', () => {
  it('accepte un PNG détecté par sa signature', async () => {
    await expect(assertValidImage(PNG_HEADER)).resolves.toMatchObject({ mime: 'image/png' });
  });

  it('refuse un fichier texte déguisé', async () => {
    await expect(assertValidImage(Buffer.from('<svg onload="alert(1)"/>'))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('refuse un fichier trop volumineux', async () => {
    await expect(assertValidImage(Buffer.alloc(MAX_IMAGE_BYTES + 1))).rejects.toBeInstanceOf(
      PayloadTooLargeException,
    );
  });
});

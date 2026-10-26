import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cloudinaryPkg from 'cloudinary';
import type { AllowedImageMime } from '../common/files/image-validation.js';
import type { EnvironmentVariables } from '../config/env.validation.js';

const { v2: cloudinary } = cloudinaryPkg;

export interface StoredImage {
  publicId: string;
  version: number;
}

export type ImagePreset = 'avatar';

const PRESETS: Record<ImagePreset, object[]> = {
  // Recadrage carré centré sur le sujet, format et qualité adaptés au navigateur
  avatar: [
    { width: 256, height: 256, crop: 'fill', gravity: 'auto' },
    { fetch_format: 'auto', quality: 'auto' },
  ],
};

/**
 * Stockage des images sur Cloudinary.
 * Les fichiers sont validés AVANT envoi (voir assertValidImage) ; seuls l'identifiant
 * public et la version sont conservés en base ; les URL sont construites ici.
 */
@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly folder: string;

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    cloudinary.config({
      cloud_name: config.get('CLOUDINARY_CLOUD_NAME', { infer: true }),
      api_key: config.get('CLOUDINARY_API_KEY', { infer: true }),
      api_secret: config.get('CLOUDINARY_API_SECRET', { infer: true }),
      secure: true,
    });
    this.folder = config.get('CLOUDINARY_FOLDER', { infer: true });
  }

  /** Envoie (ou remplace) une image à un emplacement déterministe. */
  async upload(path: string, buffer: Buffer, mime: AllowedImageMime): Promise<StoredImage> {
    try {
      const result = await cloudinary.uploader.upload(
        `data:${mime};base64,${buffer.toString('base64')}`,
        {
          public_id: `${this.folder}/${path}`,
          overwrite: true,
          invalidate: true, // purge le CDN de l'ancienne version
          resource_type: 'image',
          allowed_formats: ['jpg', 'png', 'webp'],
        },
      );
      return { publicId: result.public_id, version: result.version };
    } catch (e) {
      this.logger.error(`Échec de l'envoi Cloudinary : ${e instanceof Error ? e.message : JSON.stringify(e)}`);
      throw new ServiceUnavailableException("Le service d'images est indisponible. Réessayez plus tard.");
    }
  }

  async remove(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: 'image' });
    } catch (e) {
      // Une image orpheline n'est pas bloquante : on journalise sans échouer
      this.logger.warn(`Suppression Cloudinary échouée pour ${publicId} : ${String(e)}`);
    }
  }

  url(image: StoredImage, preset: ImagePreset): string {
    return cloudinary.url(image.publicId, {
      version: image.version,
      secure: true,
      transformation: PRESETS[preset],
    });
  }
}

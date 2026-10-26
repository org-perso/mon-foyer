import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ApiErrorResponse } from '@mon-foyer/shared';
import type { Request, Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';

/**
 * Format d'erreur unique pour toute l'API.
 * Les erreurs inattendues sont journalisées mais jamais détaillées au client.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message } = this.resolve(exception);
    if (status >= 500) {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    const body: ApiErrorResponse = {
      statusCode: status,
      error: HttpStatus[status] ?? 'Error',
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };
    response.status(status).json(body);
  }

  private resolve(exception: unknown): { status: number; message: string | string[] } {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      const message =
        typeof res === 'object' && res !== null && 'message' in res
          ? (res as { message: string | string[] }).message
          : exception.message;
      return { status: exception.getStatus(), message };
    }
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          return { status: HttpStatus.CONFLICT, message: 'Cette ressource existe déjà.' };
        case 'P2025':
          return { status: HttpStatus.NOT_FOUND, message: 'Ressource introuvable.' };
        case 'P2003':
          return { status: HttpStatus.CONFLICT, message: 'Ressource encore référencée.' };
      }
    }
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Erreur interne du serveur.' };
  }
}

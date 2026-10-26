import { Controller, Get, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { HealthResponse } from '@mon-foyer/shared';
import type { Response } from 'express';
import { Public } from '../auth/decorators.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Public()
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(@Res({ passthrough: true }) res: Response): Promise<HealthResponse> {
    const dbUp = await this.prisma.isHealthy();
    if (!dbUp) res.status(503);
    return {
      status: dbUp ? 'ok' : 'degraded',
      service: 'mon-foyer-api',
      version: process.env['npm_package_version'] ?? '0.1.0',
      timestamp: new Date().toISOString(),
      database: dbUp ? 'up' : 'down',
    };
  }
}

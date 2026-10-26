import type { Request as ExpressRequest } from 'express';

/** Convertit une requête Express en Request Web standard (attendue par les SDK Clerk). */
export function toWebRequest(req: ExpressRequest, body?: Buffer): Request {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
    else headers.set(key, value);
  }
  const url = `${req.protocol}://${req.get('host') ?? 'localhost'}${req.originalUrl}`;
  return new Request(url, {
    method: req.method,
    headers,
    body: body && req.method !== 'GET' && req.method !== 'HEAD' ? new Uint8Array(body) : undefined,
  });
}

import { z } from 'zod';
import { insertGuestSchema, guests, settings, insertSettingsSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  guests: {
    create: {
      method: 'POST' as const,
      path: '/api/guests',
      input: insertGuestSchema,
      responses: {
        201: z.custom<typeof guests.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/guests',
      responses: {
        200: z.array(z.custom<typeof guests.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    drawWinner: {
      method: 'POST' as const,
      path: '/api/guests/draw',
      responses: {
        200: z.custom<typeof guests.$inferSelect>(),
        404: errorSchemas.notFound, // No eligible participants
        401: errorSchemas.unauthorized,
      },
    },
    resetDraw: {
      method: 'POST' as const,
      path: '/api/guests/reset-draw',
      responses: {
        200: z.object({ message: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings',
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/settings',
      input: insertSettingsSchema,
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

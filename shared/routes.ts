import { z } from 'zod';
import { insertGuestSchema, guests, settings, insertSettingsSchema, programItems, insertProgramItemSchema, insertAdminUserSchema } from './schema';
import type { Guest, InsertGuest, Settings, InsertSettings, ProgramItem, InsertProgramItem, AdminUser, InsertAdminUser } from './schema';

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
        201: z.custom<Guest>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/guests',
      responses: {
        200: z.array(z.custom<Guest>()),
        401: errorSchemas.unauthorized,
      },
    },
    drawWinner: {
      method: 'POST' as const,
      path: '/api/guests/draw',
      responses: {
        200: z.custom<Guest>(),
        404: errorSchemas.notFound,
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
    delete: {
      method: 'DELETE' as const,
      path: '/api/guests/:id',
      responses: {
        200: z.object({ message: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
    bulkDelete: {
      method: 'POST' as const,
      path: '/api/guests/bulk-delete',
      input: z.object({ ids: z.array(z.number()) }),
      responses: {
        200: z.object({ message: z.string(), count: z.number() }),
        401: errorSchemas.unauthorized,
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings',
      responses: {
        200: z.custom<Settings>(),
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/settings',
      input: insertSettingsSchema,
      responses: {
        200: z.custom<Settings>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  program: {
    list: {
      method: 'GET' as const,
      path: '/api/program',
      responses: {
        200: z.array(z.custom<ProgramItem>()),
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/program',
      input: z.array(insertProgramItemSchema),
      responses: {
        200: z.array(z.custom<ProgramItem>()),
        401: errorSchemas.unauthorized,
      },
    },
  },
  admin: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/users',
      responses: {
        200: z.array(z.object({
          id: z.number(),
          username: z.string(),
          displayName: z.string().nullable(),
          createdAt: z.date().nullable(),
        })),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/users',
      input: z.object({
        username: z.string().min(3, "Username must be at least 3 characters"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        displayName: z.string().optional(),
      }),
      responses: {
        201: z.object({
          id: z.number(),
          username: z.string(),
          displayName: z.string().nullable(),
        }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/admin/users/:id',
      responses: {
        200: z.object({ message: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
    updatePassword: {
      method: 'POST' as const,
      path: '/api/admin/users/:id/password',
      input: z.object({
        password: z.string().min(6, "Password must be at least 6 characters"),
      }),
      responses: {
        200: z.object({ message: z.string() }),
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

export type { Guest, InsertGuest, Settings, InsertSettings, ProgramItem, InsertProgramItem };

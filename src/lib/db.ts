import { PrismaClient } from '@prisma/client';

// We export a Proxy object that mimics Prisma Client.
// Since the database is offline, this avoids PrismaClientInitializationError during module load
// and triggers the try/catch fallbacks in our API routes to serve mock data.
const prismaProxy = new Proxy({} as any, {
  get(target, prop) {
    if (prop === '$transaction') {
      return async (queries: any[]) => {
        return Promise.all(queries.map(q => q()));
      };
    }
    
    // Return a sub-proxy for model operations (e.g. prisma.user)
    return new Proxy({} as any, {
      get(modelTarget, method) {
        // Return an async function that throws a connection error
        return async () => {
          throw new Error('Database connection offline. Triggering mock fallback.');
        };
      }
    });
  }
});

const prisma = prismaProxy as unknown as PrismaClient;

export default prisma;

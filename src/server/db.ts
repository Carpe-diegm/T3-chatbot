import { env } from "~/env";
import { PrismaClient } from "../../generated/prisma";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/**
 * Enhanced DB client helper for Row Level Security (RLS) enforcement.
 * Use this to wrap your queries in a user-isolated context.
 * 
 * @example
 * const userDb = getScopedDb(session.user.id);
 * await userDb.chat.findMany();
 */
export const getScopedDb = (userId: string) => {
  return db.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          return db.$transaction(async (tx) => {
            // Set the RLS session variable before every query in the transaction
            await tx.$executeRawUnsafe(`SET LOCAL app.current_user_id = '${userId}';`);
            return query(args);
          });
        },
      },
    },
  });
};

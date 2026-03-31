import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const chatRouter = createTRPCRouter({
  createChat: protectedProcedure
    .input(z.object({ initialMessage: z.string().optional() }).optional())
    .mutation(async ({ ctx }) => {
      return ctx.db.chat.create({
        data: { userId: ctx.session.user.id },
      });
    }),

  getUserChats: protectedProcedure.query(({ ctx }) => {
    return ctx.db.chat.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { updatedAt: "desc" },
    });
  }),

  getMessages: protectedProcedure
    .input(z.object({
      chatId: z.string(),
      cursor: z.string().nullish(),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { chatId, cursor, limit } = input;
      const chat = await ctx.db.chat.findFirst({
        where: { id: chatId, userId: ctx.session.user.id },
      });

      if (!chat) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You do not have access to this chat",
        });
      }

      const items = await ctx.db.message.findMany({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        where: { chatId },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "asc" },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  deleteChat: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const chat = await ctx.db.chat.findFirst({
        where: { id: input.chatId, userId: ctx.session.user.id }
      });

      if (!chat) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db.chat.delete({
        where: { id: input.chatId }
      });
    }),

  renameChat: protectedProcedure
    .input(z.object({ chatId: z.string(), title: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const chat = await ctx.db.chat.findFirst({
        where: { id: input.chatId, userId: ctx.session.user.id }
      });

      if (!chat) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db.chat.update({
        where: { id: input.chatId },
        data: { title: input.title }
      });
    }),
});

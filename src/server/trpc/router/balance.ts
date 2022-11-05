import { z } from "zod";

import { publicProcedure, router } from "../trpc";

const TransactionSchema = z.object({
  type: z.enum(["DEBIT", "CREDIT"]),
  accountNumber: z.string(),
  amount: z.number(),
});

const RecordingSchema = z.object({
  date: z.date(),
  type: z.enum(["INVOICE", "WITHDRAWAL", "TRANSFER", "PAYMENT"]),
  transactions: z.array(TransactionSchema),
});

const createBalanceSchema = z.object({
  generalInfo: z.object({
    name: z.string(),
    description: z.string(),
    purpose: z.string(),
  }),
  recordings: z.array(RecordingSchema),
});

export const balanceRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.balance.findUnique({
        where: {
          id: input.id,
        },
        include: {
          recordings: {
            include: {
              transactions: true,
            },
          },
        },
      });
    }),
  create: publicProcedure
    .input(createBalanceSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await ctx.prisma.balance.create({
          data: {
            name: input.generalInfo.name,
            description: input.generalInfo.description,
            purpose: input.generalInfo.purpose,
            recordings: {
              create: input.recordings.map((recording) => ({
                ...recording,
                transactions: {
                  create: recording.transactions,
                },
              })),
            },
          },
        });
        console.log(result)
        return result;
      } catch (e) {
        console.log(e);
        throw e;
      }
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.balance.findMany({
      orderBy: {
        date: "asc",
      }
    })
  }),
});

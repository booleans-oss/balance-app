import { router } from "../trpc";
import { balanceRouter } from "./balance";

export const appRouter = router({
  balance: balanceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

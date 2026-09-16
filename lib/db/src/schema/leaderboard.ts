import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leaderboardTable = pgTable("leaderboard", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  xp: integer("xp").notNull().default(0),
  lastActive: timestamp("last_active", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLeaderboardSchema = createInsertSchema(leaderboardTable).omit({
  id: true,
  lastActive: true,
});

export type LeaderboardEntry = typeof leaderboardTable.$inferSelect;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardSchema>;

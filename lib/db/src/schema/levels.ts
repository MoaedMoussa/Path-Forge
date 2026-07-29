import { pgTable, text, integer, jsonb, timestamp, uuid, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const levelsTable = pgTable("levels", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  algorithm: text("algorithm").notNull(), // bsp | cellular_automata | maze
  config: jsonb("config").notNull().$type<Record<string, unknown>>(),
  gridData: jsonb("grid_data").notNull().$type<number[]>(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  seed: integer("seed").notNull(),
  ownerToken: text("owner_token").notNull(),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pathRunsTable = pgTable("path_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  levelId: uuid("level_id")
    .notNull()
    .references(() => levelsTable.id, { onDelete: "cascade" }),
  algorithm: text("algorithm").notNull(), // astar | dijkstra | bfs
  startPoint: jsonb("start_point").notNull().$type<{ x: number; y: number }>(),
  goalPoint: jsonb("goal_point").notNull().$type<{ x: number; y: number }>(),
  pathLength: integer("path_length").notNull(),
  nodesExplored: integer("nodes_explored").notNull(),
  executionTimeMs: real("execution_time_ms").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLevelSchema = createInsertSchema(levelsTable).omit({
  id: true,
  viewCount: true,
  createdAt: true,
});
export const insertPathRunSchema = createInsertSchema(pathRunsTable).omit({
  id: true,
  createdAt: true,
});

export type Level = typeof levelsTable.$inferSelect;
export type InsertLevel = z.infer<typeof insertLevelSchema>;
export type PathRun = typeof pathRunsTable.$inferSelect;
export type InsertPathRun = z.infer<typeof insertPathRunSchema>;
